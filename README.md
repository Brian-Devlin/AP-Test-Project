# Askwell

An AI support chat widget for any website. See `docs/project.md` for what we build and `docs/plan.md` for the build order.

## Setup

Needs Node 22+ and pnpm 10 (`packageManager` in `package.json` pins the version).

```sh
pnpm install
cp .env.example .env.local   # then fill in values; never commit them
```

## Commands

| Command | Does |
|---|---|
| `pnpm dev` | Run the app locally |
| `pnpm typecheck` | Type-check every package (turbo) |
| `pnpm lint` | ESLint over the whole repo |
| `pnpm test` | Vitest over every package |
| `pnpm build` | Build every package (turbo), incl. the widget's 5 kb size check |

All four checks must pass before a PR.

## Layout

```
apps/web/            Next.js: landing, dashboard, /embed, /api
apps/widget/         vanilla TS loader → dist/widget.js (esbuild, < 5 kb)
packages/shared/     contract: types, API shapes, plan limits
packages/db/         generated Supabase types + pglite test helper
supabase/migrations/ SQL migrations
```

## Deploys

Vercel builds a preview for every PR and production from `main`. The Vercel project's Root Directory is `apps/web`. Previews are protected; automated checks send `x-vercel-protection-bypass`.
