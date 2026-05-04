# Drizzle migrations

Forward-only SQL migrations for the Prodet Platform Postgres schema.

## Workflow

1. Edit a schema file under `src/db/schema/`.
2. Run `pnpm db:generate` to produce a new SQL file under `drizzle/migrations/`.
3. Review the generated SQL **carefully** before committing. Hand-edit when:
   - you need a `GENERATED ALWAYS AS` column,
   - you need a partial / functional index,
   - you need a Row-Level Security policy.
4. Apply locally with `pnpm db:migrate`.
5. Commit both the schema change and the generated SQL in the same commit.

## Reserved files

- `0000_extensions.sql` is hand-written; do not regenerate. It enables
  `pgcrypto`, `unaccent`, `pg_trgm`, and `vector`, plus the `immutable_unaccent`
  wrapper used by trigram indexes.

## Conventions

- Migrations are forward-only. To roll back, write a new migration that undoes
  the change. Keeps history honest and auditable.
- Keep migrations small. One logical change per migration.
- Never edit a migration file once it has been applied to staging or
  production.

See [docs/02-architecture/data-model.md](../docs/02-architecture/data-model.md)
for the canonical data model.
