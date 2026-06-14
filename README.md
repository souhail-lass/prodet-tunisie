f# Prodet Platform

Digital platform for **Prodet Tunisie** — Tunisian manufacturer and distributor of cleaning, hygiene, and detergent products.

> **Current state (2026-06-06):** Active development. Public site, client portal, and partial admin console are implemented. Order intake / AI extraction is next. See [docs/05-ops/project-status.md](docs/05-ops/project-status.md).

> **AI proposes. Humans approve. Swiver records.**

## What this is

1. **Public B2B site** — multilingual (FR / AR / EN), catalog, sectors, devis, contact.
2. **Client portal** — authenticated reorder, history, usual products, documents.
3. **Admin console** — access-request review, portal-request triage.
4. **(Planned)** Internal order intake with AI extraction + product matching.
5. **(Planned)** Deeper Swiver ERP sync.

Swiver remains the ERP source of truth. This platform owns acquisition, catalog presentation, order intake, validation, and the client workspace.

## AI agent onboarding

| Tool | Start here |
|---|---|
| Claude Code | [CLAUDE.md](CLAUDE.md) |
| Cursor / others | [AGENTS.md](AGENTS.md) |
| All developers | [docs/00-overview/developer-guide.md](docs/00-overview/developer-guide.md) |
| Handoff setup | [docs/05-ops/claude-code-handoff.md](docs/05-ops/claude-code-handoff.md) |

## Status

| Area | Status |
|---|---|
| Public site | Built |
| Client portal | Built (dashboard, requests, history, documents) |
| Admin console | Partial (demandes-acces, demandes-portail) |
| Order intake / AI | Not started |
| Swiver live sync | Adapter only (`SWIVER_MODE=disabled` default) |
| Spikes 1/2/3 | Not executed (risks documented) |

## Tech stack

- **Next.js 15** App Router + **TypeScript** strict
- **Tailwind CSS v4** + **shadcn/ui**
- **next-intl** — `fr` (default), `ar` (RTL), `en`
- **Drizzle ORM** + **Postgres** (Supabase)
- **Supabase Auth** + **Storage**
- **Zod** + **React Hook Form**

Details: [docs/02-architecture/tech-stack.md](docs/02-architecture/tech-stack.md).

## Prerequisites

- **Node.js 20+** (`.nvmrc` may pin 22)
- **pnpm 9** — `corepack enable`
- **Postgres** with extensions (`pgcrypto`, `unaccent`, `pg_trgm`, `pgvector`) — Supabase recommended

## Quick start

```bash
corepack enable
pnpm install

cp .env.example .env.local
# Edit .env.local — see docs/05-ops/secrets-checklist.md

pnpm db:migrate
pnpm dev
# http://localhost:3004/fr
```

### Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Dev server (port 3004, Turbopack) |
| `pnpm build` | Production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest (36 tests) |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:generate` | Generate migration from schema |
| `pnpm db:seed:demo-portal` | Demo portal data |
| `pnpm screenshots:portal` | Portal screenshot script |

## Repository layout

```
src/
  app/[locale]/(public|auth|client|admin)/  # Route groups
  features/                                  # Domain logic + server actions
  db/schema/                                 # Drizzle tables
  integrations/swiver/                       # ERP adapter
  components/                                # UI
  data/                                      # Static catalog fixtures (MVP)
docs/                                        # Vision, ADRs, runbooks
drizzle/migrations/                          # Forward-only SQL
```

## Reading order

1. [docs/00-overview/vision.md](docs/00-overview/vision.md)
2. [docs/05-ops/project-status.md](docs/05-ops/project-status.md)
3. [docs/00-overview/developer-guide.md](docs/00-overview/developer-guide.md)
4. [docs/02-architecture/system-overview.md](docs/02-architecture/system-overview.md)
5. [docs/02-architecture/adr/](docs/02-architecture/adr/)

## License

Proprietary — Prodet Tunisie. All rights reserved.
