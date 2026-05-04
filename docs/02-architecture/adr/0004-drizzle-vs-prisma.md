# ADR 0004 — Drizzle (not Prisma) as the ORM

- **Status.** Proposed
- **Date.** 2026-05-03
- **Owner.** Souhail
- **Supersedes.** —

## Context

We need a TypeScript-friendly query layer over Postgres that:

- Provides strong type inference end-to-end (server actions, Zod schemas, RHF forms).
- Has a workable migration story for forward-only SQL.
- Cold-starts well on Vercel serverless.
- Plays nicely with Supabase / Postgres extensions (`pg_trgm`, `pgvector`, `unaccent`).
- Is reasonable to operate solo.

Two dominant choices in TS land:

1. **Drizzle ORM**
2. **Prisma**

Plus less-popular options: **Kysely** (query builder, no migration), raw SQL with `postgres.js`, **TypeORM** (deprecated-feeling), **MikroORM**.

## Decision

We use **Drizzle ORM** with its bundled migration toolkit (`drizzle-kit`).

## Alternatives considered

- **Prisma.** Mature ecosystem, excellent docs, great DX. Rejected because:
  - Engine binary adds cold-start overhead on Vercel serverless (improving but still real).
  - Schema-first DSL (Prisma schema) is duplicative with our Zod and Drizzle schemas.
  - Type inference for complex includes/selects is good but heavier than Drizzle's.
  - First-class `pgvector` support is recent and less ergonomic than Drizzle's plain-SQL escape hatch.
- **Kysely.** Excellent query builder, no migration. We would need to add a separate migration story (e.g. `node-pg-migrate`). The all-in-one of Drizzle wins for solo-dev simplicity.
- **Raw SQL.** Tempting, but we lose type inference for joins/inserts and gain nothing meaningful.
- **TypeORM / MikroORM.** Rejected — heavier abstractions, less alignment with the Next.js + Postgres ecosystem.

## Consequences

- **Positive.**
  - No engine binary; faster cold starts on Vercel.
  - Strong type inference; near raw-SQL performance.
  - Easy `pgvector`/`pg_trgm` use via `sql` template tag for advanced queries.
  - Migration generation from schema diff (`drizzle-kit generate`).
  - Schema and types live in TypeScript — single source.
- **Negative.**
  - Smaller community than Prisma (but growing fast).
  - Fewer learning resources for unusual edge cases.
  - Migrations are SQL files; rollbacks require a forward migration. We accept "forward-only" as an explicit policy.
- **Neutral.**
  - Schema location: `src/db/schema/*.ts` with one file per entity area.
  - Migrations: `drizzle/migrations/*.sql` checked into the repo.
  - CI runs a "schema-vs-migrations drift" check on every PR.

## Open questions

- Whether to use `drizzle-zod` for automatic Zod schema generation from Drizzle schema. Inclined to yes; defer until first concrete use case.

## References

- [tech-stack.md](../tech-stack.md)
- [data-model.md](../data-model.md)
- [Drizzle ORM docs](https://orm.drizzle.team)
