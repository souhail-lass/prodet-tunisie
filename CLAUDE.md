# CLAUDE.md — Instructions for Claude Code

> Read this file first. Then read [AGENTS.md](AGENTS.md) and [docs/05-ops/project-status.md](docs/05-ops/project-status.md).

## Project

**Prodet Platform** — Next.js 15 B2B app for Prodet Tunisie (cleaning/hygiene products).
One codebase: public site + client portal + admin console. Postgres on Supabase EU.

**Load-bearing rule:** *AI proposes. Humans approve. Swiver records.*

## Repository state (2026-06-06)

| Area | Status |
|---|---|
| Application code | **Active** — full Next.js app in `src/` |
| Public site | Built (catalog uses static fixtures + client search) |
| Client portal | Built (dashboard, requests, history, usual products, documents) |
| Admin console | Partial (access requests + portal request review) |
| Order intake / AI extraction | **Not started** (planned Phase 1 Slice B) |
| Swiver live sync | Architecture only (`SWIVER_MODE=disabled` default) |
| Spikes 1/2/3 | Briefs exist; **not executed** — risks documented |

Souhail approved implementation before spike gates ([AGENTS.md](AGENTS.md) execution override). Do not pretend spikes were completed.

## Before you change code

1. Read [docs/00-overview/developer-guide.md](docs/00-overview/developer-guide.md) for architecture, routes, algorithms.
2. Read [docs/05-ops/claude-code-handoff.md](docs/05-ops/claude-code-handoff.md) for setup, key files, and blockers.
3. Run `pnpm typecheck && pnpm lint && pnpm test` before declaring work done.
4. New dependencies require an ADR under `docs/02-architecture/adr/`.

## Architecture invariants (do not redesign)

- Single Next.js App Router app — route groups `(public)`, `(auth)`, `(client)`, `(admin)`.
- Postgres + Drizzle — schema in `src/db/schema/`, migrations forward-only in `drizzle/migrations/`.
- Three locales: `fr` (complete), `ar` (RTL), `en` (scaffolded). `next-intl`.
- Supabase Auth — magic links; service-role key server-only.
- No public prices, stock, or payment.
- No autonomous push to Swiver.
- Every state-changing mutation writes `audit_log`.

## Commands

```bash
pnpm install
cp .env.example .env.local   # fill secrets — see docs/05-ops/secrets-checklist.md
pnpm db:migrate
pnpm dev                     # http://localhost:3004
pnpm typecheck && pnpm lint && pnpm test && pnpm build
pnpm db:seed:demo-portal     # optional portal demo data
```

## Key directories

| Path | Purpose |
|---|---|
| `src/app/[locale]/(public)/` | Marketing, catalog, devis, contact |
| `src/app/[locale]/(client)/client/` | Authenticated B2B portal |
| `src/app/[locale]/(admin)/admin/` | Admin review queues |
| `src/features/client-portal/` | Portal business logic + server actions |
| `src/features/client-access/` | Onboarding, invites, activation |
| `src/features/admin/` | Admin auth + portal request actions |
| `src/integrations/swiver/` | ERP adapter (disabled/sandbox/production) |
| `src/db/schema/` | Drizzle tables |
| `docs/` | Vision, ADRs, module specs, runbooks |

## Auth model (short)

- **Middleware** (`src/middleware.ts`): session check for `/client/*` and `/admin/*`.
- **Client server gate**: `requireClientPortalAccess()` — `customer_user` + `user_customer` link.
- **Admin server gate**: `requireAdminAccess()` / `assertRole(...)`.
- **Magic link anti-enumeration**: unknown emails get `sent=1` without OTP (`src/features/client-auth/login-actions.ts`).

## What NOT to build without explicit ask

- Online payment, public prices/stock, checkout.
- Auto-push to Swiver.
- Open self-registration.
- AI extraction pipeline (until Slice B is scoped).
- Customer-facing chatbot.
- New npm deps without ADR.

Full list: [docs/01-product/non-goals.md](docs/01-product/non-goals.md).

## Git / commits

- Souhail commits and pushes unless explicitly told otherwise.
- Conventional commits: `feat(scope):`, `fix(scope):`, `docs(scope):`, etc.
- Never commit `.env`, `.env.local`, or secrets.

## Design system rebuild (Claude Design)

Full feed document for rebuilding the visual system:

- [`docs/04-design/design-system-rebuild-brief.md`](docs/04-design/design-system-rebuild-brief.md)
- Logo master: `public/brand/Logo_Prodet_page-0001_1_-removebg.svg`

## When stuck

| Blocker | Doc |
|---|---|
| Env / Supabase setup | [docs/05-ops/secrets-checklist.md](docs/05-ops/secrets-checklist.md) |
| First admin account | [docs/05-ops/first-admin-setup.md](docs/05-ops/first-admin-setup.md) |
| Swiver integration | [src/integrations/swiver/README.md](src/integrations/swiver/README.md), ADR 0012 |
| Open product decisions | [docs/01-product/open-questions.md](docs/01-product/open-questions.md) |
| Portal module spec | [docs/03-modules/client-portal.md](docs/03-modules/client-portal.md) |

## Ignore these paths for lint noise

`prodet-agents/` — experimental agent subprojects, not part of the main app build.
