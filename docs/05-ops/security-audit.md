# Security audit — Prodet Platform

> Audit date: 2026-06-08 · Scope: full application (`src/`), middleware, server
> actions, API routes, auth, file handling, config, dependencies.

This is a point-in-time review. Re-run the dependency audit (`pnpm audit`) and
re-read this file before each production deploy.

## Summary

The codebase is, on the whole, **security-conscious**: parameterised DB access
(Drizzle), Zod-validated server actions, IP/identity rate-limiting, magic-link
anti-enumeration, RBAC with `isActive` checks, IDOR-safe portal queries (every
read scoped by `customerId` from the session), a strict CSP + security headers,
service-role key kept server-only, secrets git-ignored, and forced-download
signed URLs for customer files. No XSS sinks (`dangerouslySetInnerHTML`/`eval`)
and no hard-coded secrets were found.

The findings below are the gaps. The High/Medium code-level issues were **fixed
in this pass**; the remainder need infra or a dependency migration and are
tracked as follow-ups.

| ID | Severity | Issue | Status |
|----|----------|-------|--------|
| H1 | High | Swiver webhook accepted unauthenticated payloads (no signature check, hard-coded `signatureVerified:true`, no size cap / rate limit) | **Fixed** |
| M1 | Medium | Client-portal dev auth bypass keyed only on `NODE_ENV` | **Fixed** |
| M2 | Medium | Host-header injection into magic-link redirect origin (client + admin) | **Fixed** |
| M3 | Medium | `next-intl@3.26.5` CVEs (open redirect + prototype pollution) | **Follow-up** (major migration) |
| M4 | Medium | In-process rate limiter is ineffective across serverless instances | **Follow-up** (needs Redis/Upstash) |
| L1 | Low | CSP allows `script-src 'unsafe-inline'` in production | **Accepted / follow-up** |
| L2 | Low | Upload MIME trusts client `Content-Type` (no magic-byte sniff) | **Accepted** (mitigated) |
| L3 | Low | DB connection SSL not enforced in code | **Follow-up** (config) |

---

## Fixed in this pass

### H1 — Swiver webhook hardening (`src/app/api/webhooks/swiver/route.ts`)
The endpoint was an unauthenticated, public DB-writer. Hardened:
- **Gated on `SWIVER_MODE`** — returns `404` while the integration is `disabled`
  (the default), removing it from the attack surface entirely.
- **HMAC-SHA256 verification** over the raw body, keyed by `SWIVER_WEBHOOK_SECRET`,
  using a constant-time compare. Invalid/missing signatures → `401`. In
  production, a *missing secret* is refused (`503`) rather than trusted.
- **256 KB body cap** (Content-Length pre-check + actual byte check) → `413`.
- **Per-IP rate limit** (120/min) → `429`.
- `signature_verified` is now recorded **honestly** instead of hard-coded `true`.

> Action for ops: when enabling Swiver, set a strong `SWIVER_WEBHOOK_SECRET`
> (`openssl rand -hex 32`) and confirm Swiver signs with HMAC-SHA256 hex (adjust
> `verifyHmacSignature` if their scheme differs).

### M1 — Dev auth bypass now requires explicit opt-in
The client-portal preview (mock data without a session) previously activated on
`NODE_ENV !== 'production'` alone — risky if `NODE_ENV` is ever misconfigured on
a host. It now requires **`PORTAL_DEMO_MODE=1` AND non-production**, enforced in
both `src/middleware.ts` and `src/app/[locale]/(client)/client/layout.tsx`.
Production can never bypass auth. `.env.example` documents the flag with a
warning; it is `0` by default.

### M2 — Magic-link host-header injection
`src/features/{client-auth,admin}/login-actions.ts` derived the email redirect
origin from the spoofable `Host`/`Origin` headers. In **production** they now
trust `NEXT_PUBLIC_SITE_URL`; request headers are only used in dev (localhost
ports). This prevents an attacker from poisoning a login email to point at their
domain. (Supabase's redirect allow-list is the second layer — keep it locked to
the production domain.)

---

## Follow-ups (infra / migration — not safe to auto-apply)

### M3 — `next-intl` dependency CVEs
`pnpm audit` reports two moderate advisories on `next-intl@3.26.5`:
- Open redirect (GHSA-8f24-v5vv-gm5j, fixed ≥4.9.1)
- Prototype pollution via `experimental.messages.precompile` (GHSA-4c35-wcg5-mm9h, fixed ≥4.9.2)

**Exploitability here:** the prototype-pollution path is **not reachable** (we do
not use `experimental.messages.precompile`). The open-redirect risk is partially
mitigated by app-level redirect sanitisation (`sanitizeNext` in the auth callback
and login actions). **Fix requires the 3→4 major migration** (breaking API
changes to routing/navigation/middleware) — schedule a dedicated PR + ADR per the
repo's dependency policy, then re-run `pnpm audit`. Do not blind-bump.

### M4 — Rate limiter is in-process
`src/lib/rate-limit.ts` is an in-memory `Map`. On Vercel/serverless (many
short-lived instances) each instance has its own counters, so the effective limit
is `N × configured`. Acceptable for a single long-lived Node instance; for
production scale, back it with Upstash Redis / Vercel KV (the file already notes
this; needs an ADR + the KV binding).

### L1 — CSP `script-src 'unsafe-inline'` in production
Required today by Next.js's inline RSC/bootstrap scripts. It weakens XSS defence
(an injected inline script would execute). Migrating to a **nonce-based CSP**
(per-request nonce via middleware) removes `'unsafe-inline'` — larger change,
schedule separately. `style-src 'unsafe-inline'` is harder to remove and lower
risk.

### L3 — Enforce DB TLS
`src/db/client.ts` relies on `DATABASE_URL` containing `sslmode=require`. Ensure
the production connection string enforces TLS (Supabase pooled URLs do). Optional
hardening: pass `ssl: 'require'` in the `postgres()` options for prod.

---

## Accepted / low risk

- **L2 — Upload MIME trust:** `uploadCustomerDocumentAction` validates against an
  allow-list using the client-supplied `file.type`. Mitigated because the bucket
  is **private**, files are served via short-lived signed URLs with a forced
  `Content-Disposition: attachment` (no inline render), and `X-Content-Type-Options:
  nosniff` is set. Magic-byte sniffing would be defence-in-depth but is not
  required. Storage paths are canonical (`customerId/documentId.ext`) — no path
  traversal from filenames.

## Verified-good controls (do not regress)

- **AuthZ:** `requireClientPortalAccess()` / `assertRole()` validate the JWT via
  Supabase `getUser()` (not just cookie reads) and check `isActive` + role.
- **IDOR:** every portal query is scoped by `customerId`/`access.customer.id`
  (documents, order history, attachments). Forged IDs cannot cross tenants.
- **Injection:** all DB access is parameterised; the few `sql\`\`` uses interpolate
  values as bound parameters. No `eval`/`Function`/`innerHTML`.
- **Anti-enumeration:** magic-link returns the same `sent=1` for unknown/inactive
  accounts; honeypot + rate-limit on public forms.
- **Secrets:** `.env*` git-ignored (`!.env.example` whitelisted), service-role key
  `import 'server-only'`, no secrets in source.
- **Headers:** CSP, `X-Frame-Options: DENY`, `frame-ancestors 'none'`, HSTS
  (prod), `nosniff`, Referrer-Policy, Permissions-Policy.
