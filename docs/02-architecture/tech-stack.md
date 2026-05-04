# Tech stack — Prodet Platform

> Status: Draft. Owner: Souhail. Last updated: 2026-05.
> Authoritative per-decision rationale lives in [adr/](adr/). This page is a single-screen summary.

## Stack at a glance

| Layer | Choice | Why (1 line) | ADR |
|---|---|---|---|
| Language | TypeScript (strict) | Type safety end-to-end including Drizzle, Zod, RHF. | — |
| Runtime | Node.js 20 LTS | Vercel default; stable. | — |
| App framework | Next.js 15 App Router | Server components + actions; one app for public + admin + portal. | [0002](adr/0002-nextjs-app-router.md) |
| UI styling | Tailwind CSS v4 | Velocity, utility-first, RTL plugin available. | — |
| Component library | shadcn/ui | Copy-in components; full ownership; accessible primitives. | — |
| Forms | React Hook Form + Zod | Schema-first validation, share Zod between client/server/AI. | — |
| i18n | `next-intl` | App Router-native, `[locale]` segment, server-component support. | [0005](adr/0005-i18n-strategy.md) |
| ORM | Drizzle | Lightweight, strong TS inference, no engine binary, fast cold start. | [0004](adr/0004-drizzle-vs-prisma.md) |
| Database | Postgres 15 (Supabase EU) | Managed; `pg_trgm` + `pgvector`; Auth + Storage in same vendor. | [0003](adr/0003-postgres-supabase.md) |
| Auth | Supabase Auth | Bundled with DB; cookies + RLS; admins now, customers later. | — |
| Storage | Supabase Storage | Bundled; per-bucket public/private; signed URLs. | — |
| Search (MVP) | Postgres FTS + `pg_trgm` | No new infra; French dictionary; Arabic config in Phase 2. | [0006](adr/0006-search-strategy.md) |
| Embeddings | OpenAI `text-embedding-3-small` (or equivalent) | Cheap, multilingual enough for FR/AR product names. | [0008](adr/0008-product-matching-engine.md) |
| LLM extraction | Claude / GPT (provider-agnostic via thin adapter) | Best structured-output models. Adapter allows swap. | [0007](adr/0007-ai-extraction-architecture.md) |
| Background jobs | Inngest | Event-driven, free tier sufficient, observable runs. | [0010](adr/0010-jobs-and-queues.md) |
| Email outbound | Resend | Modern API; React Email templates; great DX. | — |
| Email inbound | Postmark inbound | Mature inbound parser; reliable webhooks. | — |
| Hosting (app) | Vercel (Paris `cdg1`) | Native Next.js; preview deploys; EU region. | [hosting.md](hosting.md) |
| DNS / Edge | Cloudflare | DDoS, WAF, optional Workers; full TLS. | [hosting.md](hosting.md) |
| Error tracking | Sentry | Standard. Frontend + backend. | — |
| Logs | Logtail (or Vercel Logs) | Cheap, queryable. | — |
| Analytics | Plausible | Privacy-first; no cookie banner; lightweight. | — |
| Tests | Vitest + Playwright | Fast unit; reliable E2E for critical user flows. | — |
| Linting / format | ESLint + Prettier + `eslint-plugin-tailwindcss` | Standard. | — |
| Package manager | pnpm | Fast, disk-efficient, monorepo-ready if we ever split. | — |
| CI | GitHub Actions | Free for our load; workflow already scaffolded. | — |
| Spam protection | Cloudflare Turnstile | Free, Cloudflare-native, accessible. | — |

## Anti-stack (things we do not use, to be explicit)

| Avoided | Why |
|---|---|
| Prisma | Engine binary; cold-start tax on Vercel; less type inference than Drizzle for our usage. |
| GraphQL / Apollo | Adds toolchain weight; server actions and route handlers are sufficient. |
| Redux / Zustand | No global client-state needs; server components own most data. |
| SWR / React Query (at MVP) | Server actions cover the use case. Re-evaluate at Phase 3 portal. |
| Pinecone / Weaviate / Qdrant | `pgvector` is sufficient at our catalog size; no new infra. |
| Algolia / Meilisearch (at MVP) | Postgres FTS handles MVP scale; reconsider in Phase 2. |
| Self-hosted Postgres / Kubernetes | Operational tax with no upside at our size. |
| Mongoose / non-relational DBs | Our domain is relational; Postgres wins. |
| Stripe / Paddle / payment processors | No online payment in scope. |
| Custom auth | Supabase Auth covers MVP and Phase 3. |
| Custom job runner | Inngest covers MVP and beyond. |
| Vercel Postgres (Neon-backed) | Decided to consolidate on Supabase for Auth + Storage too. Re-evaluate later. |
| Sanity / Contentful / a CMS | Catalog content lives in Postgres with admin UI. Marketing copy is co-located in code at MVP; can lift to a CMS later if a non-developer needs to author content. |

## Versions and pinning

- Node 20 LTS pinned via `engines` and `.nvmrc`.
- pnpm pinned via `packageManager` in `package.json`.
- Drizzle migrations are forward-only; rollbacks via new migrations.
- Schema changes require a migration commit (CI checks for drift between schema and migrations).

## Local dev expectations

- `pnpm dev` — Next.js with HMR, pointed at local Postgres.
- `pnpm test` — Vitest unit suite.
- `pnpm test:e2e` — Playwright E2E (uses staging or local).
- `pnpm db:migrate` — apply migrations.
- `pnpm db:seed` — load fixtures (small product set, sample customers, anonymized order corpus).
- `pnpm typecheck` — `tsc --noEmit`.
- `pnpm lint` — ESLint.

## Cost ceiling at MVP

| Service | Tier | Monthly cap |
|---|---|---|
| Vercel | Hobby (until commercial cutover) → Pro ($20) | < $20 |
| Supabase | Free → Pro ($25) at Phase 2 | < $25 |
| Inngest | Free | $0 |
| Resend | Free (3k/month) | $0 |
| Postmark | Free dev (100/month inbound) → Starter ($15) | < $15 |
| Sentry | Developer free | $0 |
| Plausible | Self-hosted or starter ($9) | < $9 |
| Cloudflare | Free | $0 |
| LLM API (Anthropic or OpenAI) | Metered | < $30 at MVP traffic |
| **Total estimate** | | **~$60–100/month** at MVP |

Confirm budget posture in [open question 11](../01-product/open-questions.md).

## Related

- [adr/](adr/) — every choice above has its rationale captured.
- [system-overview.md](system-overview.md) — how these pieces fit together.
- [hosting.md](hosting.md) — deployment topology.
