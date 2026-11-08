import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createSupabasePglite, listMigrations } from "./supabase-pglite";
import type { SupabasePglite } from "./supabase-pglite";

// Booting PGlite (WASM) takes a second or two.
const BOOT_TIMEOUT = 30_000;

describe("createSupabasePglite", () => {
  let emptyDir: string;
  let db: SupabasePglite;

  beforeAll(async () => {
    emptyDir = await mkdtemp(join(tmpdir(), "askwell-empty-migrations-"));
    db = await createSupabasePglite({ migrationsDir: emptyDir });

    // A tiny table with a Supabase-style owner policy, to prove RLS + roles work.
    await db.exec(`
      create extension if not exists vector with schema extensions;
      create table public.notes (
        id serial primary key,
        owner_id text not null,
        body text not null,
        embedding vector(3)
      );
      alter table public.notes enable row level security;
      revoke all on public.notes from anon;
      create policy notes_owner_select on public.notes for select to authenticated
        using (owner_id = (select auth.jwt()->>'sub'));
      insert into public.notes (owner_id, body, embedding) values
        ('user_a', 'a note', '[1,0,0]'),
        ('user_b', 'b note', '[0,1,0]');
    `);
  }, BOOT_TIMEOUT);

  afterAll(async () => {
    await db?.close();
    await rm(emptyDir, { recursive: true, force: true });
  });

  it("applies an empty migrations folder cleanly", () => {
    expect(db.migrations).toEqual([]);
  });

  it("switches roles", async () => {
    const whoami = async () => (await db.query<{ r: string }>("select current_user as r"))[0]?.r;

    db.asAnon();
    expect(await whoami()).toBe("anon");
    db.asUser("user_a");
    expect(await whoami()).toBe("authenticated");
    db.asService();
    expect(await whoami()).toBe("service_role");
    db.asSuperuser();
    expect(await whoami()).toBe("postgres");
  });

  it("auth.jwt()->>'sub' returns the set user, and nothing for anon", async () => {
    db.asUser("user_a", { email: "a@example.com" });
    const [row] = await db.query<{ sub: string; email: string; role: string }>(
      "select auth.jwt()->>'sub' as sub, auth.jwt()->>'email' as email, auth.role() as role",
    );
    expect(row).toEqual({ sub: "user_a", email: "a@example.com", role: "authenticated" });

    db.asAnon();
    const [anon] = await db.query<{ sub: string | null }>("select auth.jwt()->>'sub' as sub");
    expect(anon?.sub).toBeNull();
  });

  it("RLS scopes authenticated reads; service_role bypasses; anon is denied", async () => {
    db.asUser("user_a");
    expect(await db.query("select body from public.notes")).toEqual([{ body: "a note" }]);

    db.asUser("user_b");
    expect(await db.query("select body from public.notes")).toEqual([{ body: "b note" }]);

    db.asService();
    expect(await db.query("select body from public.notes order by id")).toHaveLength(2);

    db.asAnon();
    await expect(db.query("select * from public.notes")).rejects.toThrow(/permission denied/);
  });

  it("gives API roles Supabase's default grants on new public tables", async () => {
    db.asSuperuser();
    await db.exec("create table public.open_table (id int)");
    db.asAnon();
    expect(await db.query("select * from public.open_table")).toEqual([]);
  });

  it("supports a pgvector vector(3) column", async () => {
    db.asService();
    const rows = await db.query<{ body: string }>(
      "select body from public.notes order by embedding <-> $1::vector limit 1",
      ["[0.9,0.1,0]"],
    );
    expect(rows).toEqual([{ body: "a note" }]);
  });

  it("does not leak the role or claims between queries", async () => {
    db.asUser("user_a");
    await db.query("select 1");
    db.asSuperuser();
    const [row] = await db.query<{ r: string; claims: string }>(
      "select current_user as r, current_setting('request.jwt.claims', true) as claims",
    );
    expect(row).toEqual({ r: "postgres", claims: "" });
  });
});

describe("migrations", () => {
  let dir: string;

  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), "askwell-migrations-"));
    await writeFile(join(dir, "20260102000000_second.sql"), "insert into public.t values (2);");
    await writeFile(join(dir, "20260101000000_first.sql"), "create table public.t (n int); insert into public.t values (1);");
    await writeFile(join(dir, "README.md"), "not a migration");
  });

  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("lists .sql files in timestamp order", async () => {
    expect(await listMigrations(dir)).toEqual(["20260101000000_first.sql", "20260102000000_second.sql"]);
  });

  it("applies them in order", async () => {
    const db = await createSupabasePglite({ migrationsDir: dir });
    try {
      expect(await db.query("select n from public.t order by n")).toEqual([{ n: 1 }, { n: 2 }]);
    } finally {
      await db.close();
    }
  }, BOOT_TIMEOUT);

  it("applies the repo's supabase/migrations by default", async () => {
    const db = await createSupabasePglite();
    try {
      expect(Array.isArray(db.migrations)).toBe(true);
    } finally {
      await db.close();
    }
  }, BOOT_TIMEOUT);
});
