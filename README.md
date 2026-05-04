# Prodet Platform

Digital platform for **Prodet Tunisie** — a Tunisian manufacturer and distributor of cleaning, hygiene, and detergent products.

> Current state: **Phase 0 — Foundation.** The Next.js app is scaffolded, the homepage is wired in three locales (FR / AR / EN), and the database schema is defined. Spikes 1, 2, and 3 (Swiver API, AI extraction, product matching) are next, and gate Phase 1 feature work.

## What this is

Prodet Platform is the digital front-layer of the company. It is **not** a brochure website. It is a B2B commercial and operational platform composed of:

1. A multilingual (FR / AR / EN) public B2B website with a manufacturer-grade catalog and a "demander un devis" flow.
2. An internal order intake console that accepts pasted emails / uploaded PDFs / phone-entered orders, runs AI extraction + product matching against the official catalog, and produces validated draft orders.
3. (Phase 3) A client portal for repeat ordering and order history.
4. (Phase 4) Deeper Swiver ERP integration and AI automation.

Swiver remains the ERP / accounting source of truth. Prodet Platform owns acquisition, catalog presentation, order intake, AI assistance, validation, and analytics.

> **AI proposes. Humans approve. Swiver records.**

## Where to start (reading order)

1. [docs/00-overview/vision.md](docs/00-overview/vision.md) — what we are building and why.
2. [docs/00-overview/personas.md](docs/00-overview/personas.md) — who uses it.
3. [docs/01-product/mvp-scope.md](docs/01-product/mvp-scope.md) — what is in / out for MVP.
4. [docs/01-product/roadmap.md](docs/01-product/roadmap.md) — phased delivery plan.
5. [docs/02-architecture/system-overview.md](docs/02-architecture/system-overview.md) — high-level architecture.
6. [docs/06-spikes/](docs/06-spikes/) — the proofs-of-concept that gate development.
7. [AGENTS.md](AGENTS.md) — conventions for AI tools (Claude, Cursor, Codex CLI) working in this repo.

## Status

| Area | Status |
| --- | --- |
| Vision & strategy | Drafted |
| PRD | v0 (pending Batch 2/3 of open questions) |
| Architecture | Drafted; 10 ADRs in place |
| Spikes | Briefs written; Spike 1 / 2 / 3 not yet executed |
| Application scaffold | **Up** — Next.js 15 + Tailwind v4 + next-intl + Drizzle |
| Public pages | Homepage v0 (FR/AR/EN); other public pages pending |
| Order intake console | Not started (Slice B, Phase 1) |

See [docs/01-product/open-questions.md](docs/01-product/open-questions.md) for the list of decisions blocking PRD v1.

## Tech stack at a glance

- **Next.js 15** App Router + **TypeScript** strict (`tsconfig.json` is strict + `noUncheckedIndexedAccess`).
- **Tailwind CSS v4** + **shadcn/ui** primitives copied into `src/components/ui/`.
- **next-intl 3** with `[locale]` URL segments — `fr` (default, complete), `ar` (RTL, complete), `en` (complete for MVP shell).
- **Drizzle ORM** + **Postgres** (Supabase in production). Schema in `src/db/schema/`, migrations in `drizzle/migrations/` (forward-only).
- **pgcrypto, unaccent, pg_trgm, pgvector** extensions enabled for the matching engine.
- **Zod** for env + form + LLM-output validation; **React Hook Form** for forms.
- **ESLint 9** flat config + **Prettier** with the Tailwind plugin.

Full justification: [docs/02-architecture/tech-stack.md](docs/02-architecture/tech-stack.md).

## Prerequisites

- **Node.js 22 LTS** (or any `>=20`). `.nvmrc` pins 22.
- **pnpm 9** (managed via Corepack). Run `corepack enable` once.
- **PostgreSQL 16+** for local development (with `pgcrypto`, `unaccent`, `pg_trgm`, `pgvector`). Easiest: a Supabase local Docker stack or a plain Postgres container with the extensions installed.

## How to run

```bash
# 1. Install dependencies
corepack enable
pnpm install

# 2. Configure environment
cp .env.example .env.local
# edit .env.local — at minimum set DATABASE_URL

# 3. Apply DB migrations (requires DATABASE_URL pointed at a running Postgres)
pnpm db:migrate

# 4. Start the dev server
pnpm dev

# Visit:
#   http://localhost:3000        -> redirects to /fr
#   http://localhost:3000/fr     -> French homepage
#   http://localhost:3000/ar     -> Arabic homepage (RTL)
#   http://localhost:3000/en     -> English homepage
```

### Useful scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Next.js dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Run a production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` / `pnpm lint:fix` | ESLint |
| `pnpm format` / `pnpm format:check` | Prettier |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright E2E tests |
| `pnpm db:generate` | Generate a new Drizzle migration from schema changes |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:push` | Push the schema directly (dev only — never in CI) |
| `pnpm db:studio` | Open Drizzle Studio against the configured DB |

## Repository layout

```
src/
  app/
    [locale]/
      (public)/        # Public website route group
      layout.tsx       # Locale-aware HTML wrapper (sets dir, lang, fonts)
    layout.tsx         # Required root layout (no UI)
    globals.css        # Tailwind v4 entry + design tokens
    not-found.tsx
  components/
    ui/                # shadcn-style primitives we own
    site-header.tsx
    site-footer.tsx
    locale-switcher.tsx
    whatsapp-link.tsx
  db/
    client.ts
    schema/            # Drizzle schema, one file per concern
  i18n/
    routing.ts         # locales, defaultLocale, navigation helpers
    request.ts         # next-intl message loader
  lib/
    env.ts             # Zod-validated env access
    utils.ts           # cn() and friends
  messages/
    {fr,ar,en}/{common,header,footer,home,legal}.json
  middleware.ts        # next-intl middleware
drizzle/
  migrations/          # Forward-only SQL
docs/                  # Vision, PRD, architecture, ADRs, spikes
```

## License

Proprietary — Prodet Tunisie. All rights reserved.
