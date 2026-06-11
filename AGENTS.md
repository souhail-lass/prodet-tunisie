# AGENTS.md — Instructions for AI agents working on Prodet Platform

> Audience: Claude (Anthropic), Cursor, Codex CLI, ChatGPT, and any other AI tool that lands in this repository to read or write.
>
> Read this file FIRST. Then read [docs/00-overview/vision.md](docs/00-overview/vision.md) and [docs/01-product/mvp-scope.md](docs/01-product/mvp-scope.md). Then proceed.

## Repository state

**Active implementation** (2026-06-06). Full Next.js 15 application in `src/`. See [docs/05-ops/project-status.md](docs/05-ops/project-status.md) for what is built vs pending.

| Area | Status |
|---|---|
| Public site | Built (catalog still uses static fixtures) |
| Client portal | Built (dashboard, requests, history, usual products, documents) |
| Admin | Partial (access + portal request review) |
| Order intake / AI | Not started |
| Swiver live sync | Adapter shipped; default `disabled` |

**Claude Code entry point:** [CLAUDE.md](CLAUDE.md) and [docs/05-ops/claude-code-handoff.md](docs/05-ops/claude-code-handoff.md).

**Developer guide:** [docs/00-overview/developer-guide.md](docs/00-overview/developer-guide.md).

Spikes 1, 2, 3 were **not executed** before coding began (Souhail override — see Execution override log). Do not assume spike-validated Swiver API shapes, extraction accuracy, or matching quality.

## The load-bearing principle (do not violate)

> **AI proposes. Humans approve. Swiver records.**

This rule is the entire reason the platform is being built. It applies to:

- The product itself (no AI-generated order ever lands in Swiver without a human click).
- AI agents working in this repo (you propose changes; Souhail reviews and accepts).
- ADRs and decisions (you may draft, you may not commit on Souhail's behalf).
- Commits and pushes (Souhail commits manually unless explicitly instructed otherwise).

If you are unsure whether an action requires human approval, default to "yes, ask first."

## Architecture invariants (do not redesign on a whim)

These are decided. Changing them requires a new ADR superseding the relevant one ([docs/02-architecture/adr/](docs/02-architecture/adr/)).

1. **Single Next.js App Router application.** Public site, admin console, and (Phase 3) client portal in one codebase, separated by route groups. No monorepo split, no microservices.
2. **Postgres on Supabase, EU.** Drizzle as the ORM. `pg_trgm` + `pgvector` inside Postgres. No separate vector DB.
3. **Three locales.** `fr` (default, complete), `ar` (RTL, scaffolded then progressive), `en` (scaffolded then progressive). i18n via `next-intl`.
4. **Swiver coexistence, not replacement.** Swiver is the ERP source of truth for accounting and official commercial documents.
5. **AI as proposer, not actor.** No autonomous push to Swiver. No customer-facing chatbot at MVP.
6. **No public prices, no public stock, no online payment** at MVP.
7. **Boring tech bias.** Use the stack in [docs/02-architecture/tech-stack.md](docs/02-architecture/tech-stack.md). Do not add new dependencies casually. New SaaS only when the existing stack genuinely cannot do the job.
8. **Modular code organization without over-engineering.** Route groups, `src/db/`, `src/ai/`, `src/jobs/` directories — not packages.

## What you may do without explicit approval

- Read any file in the repo.
- Run grep / glob / list / test / lint / typecheck commands.
- Edit application code following conventions below.
- Edit and create markdown under `docs/`.
- Update `README.md`, `AGENTS.md`, `CLAUDE.md`, ADRs, open questions.
- Add diagrams (mermaid only, kept inside markdown).

## What you must NOT do without explicit approval

- Add npm dependencies (requires ADR).
- Commit, push, or mutate git state — Souhail commits manually unless told otherwise.
- Use emojis in any file or response.
- Auto-translate documentation. Translations are reviewed by humans.
- Assert Swiver API capabilities, extraction accuracy, or matching quality as validated facts.
- Redesign architecture invariants (requires superseding ADR).

## Implementation rules (Phase 1+)

- Add tests for any feature you modify.
- Use the existing stack and patterns. Do not introduce GraphQL, Zustand, SWR, Prisma, or any other excluded library without an ADR.
- Run `pnpm typecheck`, `pnpm lint`, `pnpm test` before declaring work done.
- Write [`audit_log`](docs/02-architecture/data-model.md#audit_log) entries for any state-changing admin action.
- Honor RLS — never leak service-role-key paths into client bundles.

## Scope reminders (in vs out)

In scope at MVP:

- Public B2B site (homepage, about, sectors index, catalog of manufactured products, product detail, quote request, contact, legal).
- Internal order intake console (paste/upload/inbound-email/manual entry, AI extraction, product matching, review UI, alias learning, manual push to Swiver).
- Quote-request bridge feeding the same internal queue as parsed emails.
- Three locales (FR complete, AR/EN scaffolded).
- Supabase Auth for ~4 admin accounts.

Out of scope at MVP (do not add):

- Online payment, public prices, public stock, customer portal, auto-push to Swiver, WhatsApp Business API, OCR for scanned PDFs, sector deep landing pages, articles commercialisés in public catalog, fiches techniques / SDS hosting, blog, customer reviews, native mobile app, AI customer chat, SOC 2.

Full list: [docs/01-product/non-goals.md](docs/01-product/non-goals.md).

## Conventions

### Files and naming

- Markdown files: `kebab-case.md`.
- ADRs: `NNNN-title-in-kebab.md` under `docs/02-architecture/adr/`. Numbering monotonic, never reused.
- Spikes: `spike-<topic>.md` under `docs/06-spikes/`.
- Cross-references: relative markdown links from the referencing file. No absolute paths.

### Tone in documentation

- Direct. Specific. No marketing voice.
- French and Arabic terms in plain text — they are domain vocabulary, not foreign words.
- Diagrams in mermaid (no PNG screenshots).
- "We" for the Prodet team / project.

### Code (when it arrives)

- TypeScript strict.
- `snake_case` for DB tables/columns; `camelCase` for TS variables; `PascalCase` for types/components.
- Server actions for mutations from the UI; route handlers for webhooks.
- Zod-validate every external input (form, webhook, LLM output).
- Drizzle schema in `src/db/schema/`; migrations in `drizzle/migrations/`. Migrations are forward-only.
- Comments explain *why*, not *what*. No narrative comments.
- No emojis in code.

### Tests

- Vitest for unit/integration. Playwright for E2E on critical paths.
- Cover: server actions, matching pipeline, extraction adapter, auth boundary checks.
- Snapshot tests sparingly.

## Where things live

| You want to | Read |
|---|---|
| Understand strategy | [docs/00-overview/vision.md](docs/00-overview/vision.md) |
| Know the personas | [docs/00-overview/personas.md](docs/00-overview/personas.md) |
| Know what's in MVP | [docs/01-product/mvp-scope.md](docs/01-product/mvp-scope.md) |
| Know what's NOT in MVP | [docs/01-product/non-goals.md](docs/01-product/non-goals.md) |
| Understand timing | [docs/01-product/roadmap.md](docs/01-product/roadmap.md) |
| Find the open questions | [docs/01-product/open-questions.md](docs/01-product/open-questions.md) |
| Read the PRD | [docs/01-product/prd.md](docs/01-product/prd.md) |
| Understand the architecture | [docs/02-architecture/system-overview.md](docs/02-architecture/system-overview.md) |
| Understand the data model | [docs/02-architecture/data-model.md](docs/02-architecture/data-model.md) |
| Find the tech stack | [docs/02-architecture/tech-stack.md](docs/02-architecture/tech-stack.md) |
| Find architecture decisions | [docs/02-architecture/adr/](docs/02-architecture/adr/) |
| See what spikes need running | [docs/06-spikes/](docs/06-spikes/) |
| Understand sectors | [docs/00-overview/sectors.md](docs/00-overview/sectors.md) |
| Look up domain terms | [docs/00-overview/glossary.md](docs/00-overview/glossary.md) |
| Read competitor analysis | [docs/07-research/competitors.md](docs/07-research/competitors.md) |
| Find module specs | [docs/03-modules/](docs/03-modules/) |
| Current build status | [docs/05-ops/project-status.md](docs/05-ops/project-status.md) |
| Claude Code handoff | [docs/05-ops/claude-code-handoff.md](docs/05-ops/claude-code-handoff.md) |
| Env / secrets setup | [docs/05-ops/secrets-checklist.md](docs/05-ops/secrets-checklist.md) |
| Developer guide | [docs/00-overview/developer-guide.md](docs/00-overview/developer-guide.md) |

## When you are unsure

- If a decision is not documented, **propose** an answer in writing (a draft ADR, a comment on the PRD, an addition to open-questions). Do not silently choose.
- If you find a contradiction between two documents, raise it. Don't paper over it.
- If a user asks you to do something that contradicts an architecture invariant, ask them to confirm and explain why an ADR is being overturned.
- If you are blocked because Souhail has not answered an open question, write what you would do if forced to ship without the answer ("default if unanswered" — already a field in `open-questions.md`).

## Honest communication

- Do not pretend the platform has features it does not have.
- Do not pretend the catalog is complete.
- Do not invent customer data, real revenue numbers, or unverified claims.
- Do not write marketing-style content for documentation.
- If a task is unclear, ask. If a task is wrong, push back.
- Do not fabricate citations. If you do not know, say so.

## File-by-file expectations for AI authoring

- **README.md**: keep current; reflect actual state (conception → Phase 1 → live MVP).
- **AGENTS.md (this file)**: update when conventions change. Append, do not silently rewrite.
- **`docs/`**: append to relevant doc when you produce something durable. Don't bury decisions in commit messages.
- **`docs/02-architecture/adr/`**: every load-bearing decision goes here.
- **`docs/06-spikes/`**: spike briefs are mostly fixed; results are appended after running.
- **`docs/01-product/open-questions.md`**: never delete a question. Mark it answered.

## Final reminder

The whole point of Prodet Platform is to **measurably reduce family workload while building B2B credibility**, not to demonstrate technical sophistication. Choose the simpler path when in doubt. The successful agent is the one whose proposals make Mère's day easier on Monday morning.

## Execution override log

- **2026-05-04 — Sponsor override recorded by Souhail.** The repository originally documented "conception phase" guardrails that blocked Phase 1 execution until PRD v1 sign-off and Spikes 1, 2, 3 were completed. Souhail explicitly approved moving into implementation anyway. Agents may now continue execution in the existing codebase, but must keep the unresolved spike risks visible in documentation and must not pretend the original gates were completed.
