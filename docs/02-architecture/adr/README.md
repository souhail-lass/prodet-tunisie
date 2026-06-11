# Architecture Decision Records (ADRs)

This folder records the load-bearing technical and product-architectural decisions for Prodet Platform.

Format: see [0001-record-format.md](0001-record-format.md).

| # | Title | Status |
|---|---|---|
| [0001](0001-record-format.md) | Record format for ADRs | Accepted |
| [0002](0002-nextjs-app-router.md) | Use Next.js App Router as the single application framework | Proposed |
| [0003](0003-postgres-supabase.md) | Postgres on Supabase as the data layer | Proposed |
| [0004](0004-drizzle-vs-prisma.md) | Drizzle (not Prisma) as the ORM | Proposed |
| [0005](0005-i18n-strategy.md) | i18n with `next-intl`, three locales, RTL for Arabic | Proposed |
| [0006](0006-search-strategy.md) | Postgres FTS + `pg_trgm` for search at MVP | Proposed |
| [0007](0007-ai-extraction-architecture.md) | LLM with structured output + Zod for order extraction | Proposed |
| [0008](0008-product-matching-engine.md) | Layered matching: alias → exact → trigram → vector → LLM rerank | Proposed |
| [0009](0009-swiver-integration-strategy.md) | Swiver coexistence with manual export at v1, API-driven at Phase 4 | Proposed |
| [0010](0010-jobs-and-queues.md) | Inngest for background jobs | Proposed |
| [0011](0011-client-portal-access-and-request-model.md) | Client portal access and request model | Proposed |
| [0012](0012-swiver-integration-architecture.md) | Swiver integration architecture (adapter, sync boundaries, prerequisites) | Proposed |

## When to write an ADR

Write an ADR when the decision:

- Is hard to reverse later (changing it would require a migration, refactor, or vendor switch).
- Closes off other plausible options that a future contributor might otherwise pick.
- Is "load-bearing" — other decisions rest on it.

Do *not* write an ADR for:

- File naming conventions (use a Cursor rule).
- Library version upgrades (unless they introduce a paradigm shift).
- One-line config changes.

## Lifecycle

`Proposed` → `Accepted` (or `Rejected`).

A `Proposed` ADR becomes `Accepted` when:

- Its consequences have been understood.
- The owner (Souhail) has signed off.
- For Phase 0 ADRs: the relevant spike (if any) has confirmed the choice is viable.

`Accepted` ADRs are immutable. To change one, write a new ADR that `Supersedes` it, and mark the old one `Superseded by NNNN`.
