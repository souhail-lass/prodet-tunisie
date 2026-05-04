# CI / CD — placeholder

> Status: To be filled in once application code arrives.

## Today

- `.github/workflows/ci.yml` is a no-op placeholder.
- `.github/workflows/docs-check.yml` runs link-check and markdown-lint on documentation.

## Plan (Phase 1)

### On PR

- `pnpm install --frozen-lockfile`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm db:check-drift` (Drizzle: schema vs migrations consistency)
- `pnpm build` (catches build-time regressions)
- Vercel preview deploy (auto)

### On merge to `main`

- All of the above
- Vercel production deploy (auto)
- Bundle analyzer (report-only)
- Sentry release marker

### Cron

- Weekly link check on docs and external links
- (Phase 2) Synthetic Playwright smoke test against production

## Branch protection

- `main` requires: 1 reviewer approval (self-approval allowed, flagged), all required checks green, no force-push.
- Admin override audit-logged.

## Related

- [deployment.md](deployment.md)
- [../02-architecture/hosting.md](../02-architecture/hosting.md)
