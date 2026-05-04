# Deployment — placeholder

> Status: To be filled in once application code arrives. Topology and region decisions are in [../02-architecture/hosting.md](../02-architecture/hosting.md).

## Environments

- **Production.** Vercel + Supabase (EU). Auto-deploy on push to `main`.
- **Staging.** Separate Vercel project + Supabase project. Manual promote from preview.
- **Preview.** Per-PR Vercel deploy, sharing the staging Supabase project.
- **Local.** Local Postgres or `supabase start`.

## Release cadence

- Continuous deployment on `main` for backend / non-disruptive changes.
- Coordinated releases (Friday EOD demo cadence) for visible UX changes.

## Migrations

- Forward-only. Run via Vercel build hook before the app boots.
- Failing migration → failing deploy.
- Migration safety reviewed in PR.

## Rollbacks

- Vercel "promote previous deploy" for app rollback.
- Database rollbacks happen via a new forward migration. We do not down-migrate in production.

## Smoke tests after deploy

- Manual at MVP: open homepage, switch language, submit a quote with test data, log into admin, open the queue.
- Phase 2: Playwright smoke test in CI against prod.

## Related

- [../02-architecture/hosting.md](../02-architecture/hosting.md)
- [ci-cd.md](ci-cd.md)
- [observability.md](observability.md)
- [incident-response.md](incident-response.md)
