/**
 * Test helper: an in-memory Postgres (PGlite + pgvector) that looks enough like
 * Supabase to test migrations, RLS policies, grants and functions. No Docker,
 * no local Supabase stack.
 *
 *   const db = await createSupabasePglite();
 *   db.asUser("user_123");
 *   const rows = await db.query("select * from projects");
 *   await db.close();
 *
 * What it stubs (as Supabase does):
 * - Roles `anon`, `authenticated`, `service_role` (BYPASSRLS), all NOLOGIN.
 * - `auth.jwt()`, `auth.uid()`, `auth.role()` reading `request.jwt.claims`.
 * - Schema `extensions` on the search path (put `vector` there:
 *   `create extension vector with schema extensions`).
 * - Supabase's default grants on schema `public`: all three API roles get ALL on
 *   new tables, sequences and functions. So a migration that forgets to revoke
 *   from `anon` fails its tests here, as it would leak on Supabase.
 *
 * Every `query`/`exec` runs in its own transaction with `SET LOCAL ROLE` and the
 * JWT claims of the current identity, so one test can switch roles freely.
 */
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import type { Transaction } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite-pgvector";

/** `supabase/migrations` at the repo root. */
export const DEFAULT_MIGRATIONS_DIR = fileURLToPath(new URL("../../supabase/migrations", import.meta.url));

export type DbRole = "postgres" | "anon" | "authenticated" | "service_role";

export type JwtClaims = Record<string, unknown>;

export interface SupabasePglite {
  /** The raw PGlite instance (runs as `postgres`, the superuser). */
  readonly pg: PGlite;
  /** The role queries currently run as. */
  readonly role: DbRole;
  /** Run as `authenticated` with `sub` set, like an owner's Clerk token. */
  asUser(sub: string, extraClaims?: JwtClaims): void;
  /** Run as `anon` with no claims, like a visitor with the publishable key. */
  asAnon(): void;
  /** Run as `service_role`, like the server's secret key. */
  asService(): void;
  /** Run as `postgres` (superuser) for setup and seeding. The default. */
  asSuperuser(): void;
  /** One parameterised statement as the current identity. Returns the rows. */
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  /** Several statements (no params) as the current identity. */
  exec(sql: string): Promise<void>;
  /** Names of the migration files applied, in order. */
  readonly migrations: readonly string[];
  close(): Promise<void>;
}

export interface CreateSupabasePgliteOptions {
  /** Folder of `<timestamp>_<name>.sql` files. Defaults to `supabase/migrations`. */
  migrationsDir?: string;
}

const BOOTSTRAP_SQL = `
  -- Supabase's search_path, so migrations can write \`vector(1536)\` unqualified.
  set search_path = "$user", public, extensions;

  create role anon nologin noinherit;
  create role authenticated nologin noinherit;
  create role service_role nologin noinherit bypassrls;

  create schema if not exists extensions;
  grant usage on schema extensions to anon, authenticated, service_role;

  create schema if not exists auth;
  grant usage on schema auth to anon, authenticated, service_role;

  create function auth.jwt() returns jsonb
    language sql stable
    set search_path = ''
  as $$
    select coalesce(
      nullif(current_setting('request.jwt.claim', true), ''),
      nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
  $$;

  create function auth.uid() returns uuid
    language sql stable
    set search_path = ''
  as $$
    select nullif(auth.jwt()->>'sub', '')::uuid
  $$;

  create function auth.role() returns text
    language sql stable
    set search_path = ''
  as $$
    select auth.jwt()->>'role'
  $$;

  grant execute on function auth.jwt(), auth.uid(), auth.role() to anon, authenticated, service_role;

  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
`;

/** Migration files in apply order (filename order: UTC timestamp first). */
export async function listMigrations(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".sql"))
    .map((e) => e.name)
    .sort();
}

const quoteLiteral = (value: string) => `'${value.replace(/'/g, "''")}'`;

/** Boot PGlite, stub Supabase, apply every migration. Call `close()` when done. */
export async function createSupabasePglite(options: CreateSupabasePgliteOptions = {}): Promise<SupabasePglite> {
  const migrationsDir = options.migrationsDir ?? DEFAULT_MIGRATIONS_DIR;
  const pg = await PGlite.create({ extensions: { vector } });

  await pg.exec(BOOTSTRAP_SQL);

  const migrations = await listMigrations(migrationsDir);
  for (const file of migrations) {
    const sql = await readFile(join(migrationsDir, file), "utf8");
    try {
      await pg.exec(sql);
    } catch (error) {
      throw new Error(`Migration ${file} failed: ${(error as Error).message}`, { cause: error });
    }
  }

  let role: DbRole = "postgres";
  let claims: JwtClaims | null = null;

  async function run<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    return pg.transaction(async (tx) => {
      if (role !== "postgres") {
        await tx.exec(`set local role ${role}`);
      }
      const json = claims ? JSON.stringify(claims) : "";
      await tx.exec(`select set_config('request.jwt.claims', ${quoteLiteral(json)}, true)`);
      return fn(tx);
    });
  }

  return {
    pg,
    migrations,
    get role() {
      return role;
    },
    asUser(sub, extraClaims = {}) {
      role = "authenticated";
      claims = { ...extraClaims, sub, role: "authenticated" };
    },
    asAnon() {
      role = "anon";
      claims = { role: "anon" };
    },
    asService() {
      role = "service_role";
      claims = { role: "service_role" };
    },
    asSuperuser() {
      role = "postgres";
      claims = null;
    },
    async query<T>(sql: string, params: unknown[] = []) {
      return run(async (tx) => (await tx.query<T>(sql, params)).rows);
    },
    async exec(sql: string) {
      await run((tx) => tx.exec(sql));
    },
    close: () => pg.close(),
  };
}
