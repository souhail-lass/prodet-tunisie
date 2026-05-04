# Authentication & authorization — Prodet Platform

> Status: Draft. Owner: Souhail. Last updated: 2026-05.

## MVP

### Who logs in

- **Admin users** only at MVP: Père, Mère, Sœur, Souhail. ~4 accounts.
- **No customer accounts** until Phase 3.
- **No public mutations** other than the quote-request form (rate-limited and Turnstile-protected, no account).

### Provider

- Supabase Auth.
- Methods enabled at MVP:
  - Email + password (with strong-password policy).
  - Magic-link as fallback / recovery.
- 2FA: deferred to Phase 2 (TOTP via Supabase). Strongly encouraged for the `owner` role then.
- Session: HTTP-only cookie containing the Supabase JWT. SameSite=Lax. Secure.
- Session lifetime: 24h, sliding via refresh token.
- No social logins. No SSO.

### Roles

Role table: `user_role(user_id, role)`. A user can hold multiple roles.

| Role | Capabilities |
|---|---|
| `owner` | Full admin: user management, integration settings, schema-touching ops. (Souhail only.) |
| `admin` | Manage products, customers, sectors, settings other than user/integration. |
| `operator` | Process orders, create/confirm aliases, edit product display fields. (Mère, Sœur.) |
| `reviewer` | Read-only on most surfaces; approve high-value orders. (Optional Père flow.) |
| `customer_user` | Phase 3 only — access to client portal scoped to one or more `customer` rows. |

Authorization checks happen in **server actions and route handlers**. Pages may re-check for visibility, but the decision happens server-side. Never rely on client-side hiding.

### Row-level security (RLS) at MVP

- RLS **enabled** on every table (default-deny posture).
- Server actions use the **service-role key** (server-side only, never shipped to the browser) and operate above RLS — but their authorization is enforced explicitly in code (`assertRole(['operator'])`, etc.).
- The **anon key** is used for the public catalog read path. Public tables (`product`, `product_translation`, `category`, `family`, `sector`, `product_asset` for public images and SDS) carry policies allowing anon `SELECT` only on rows where `is_visible_public = true`.

### Public surface

- Quote-request form: no auth. Rate-limited (~10/hour/IP via Cloudflare). Cloudflare Turnstile required. Honeypot field.
- Inbound-email webhook: HMAC-signed by Postmark, verified in the route handler. No user session.

## Phase 3 — client portal

### Customer signup

- Self-serve signup: email + password.
- Status `pending_approval` until an admin links the user to one or more `customer` records via `user_customer`.
- An unlinked `customer_user` cannot see anything beyond their own profile.

### Customer authorization

- `user_customer.role_at_customer` — `owner` | `purchaser` | `viewer`.
- `purchaser` can submit reorders.
- `viewer` is read-only.
- `owner` (at-customer) can invite other users from their organization (up to N — TBD).

### RLS in Phase 3

- Customer-scoped tables (`order_draft` where `source = 'portal'` or `customer_id = X`, `customer_contact`, `product_alias` with `scope='customer'`) get RLS policies of the shape:

  ```sql
  USING (
    customer_id IN (
      SELECT customer_id FROM user_customer
      WHERE user_id = auth.uid()::uuid
    )
  )
  ```
- Admin staff operate via server actions with service-role and explicit checks; they bypass RLS by design.

## Authorization invariants

These hold across all phases.

1. **Server-side enforcement.** No mutation accepts trust from the client. Every server action begins with an `assertSession()` and `assertRole(...)` (or an explicit anon-allowed marker).
2. **Audit on mutation.** Every state change writes `audit_log(user_id, action, entity_type, entity_id, metadata)`.
3. **Read paths are explicit too.** Sensitive read endpoints (customer detail, order draft contents, alias lists) check role + (Phase 3) ownership.
4. **No privilege escalation in app code.** A user cannot gain a role they do not have via any in-app flow. Role grants happen via the admin UI by an `owner`, with audit.
5. **Service-role key never leaves the server.** Never embedded in client bundles, never exposed via API routes that lack auth.

## Password policy

- Minimum 12 characters.
- Must include 3 of: lowercase, uppercase, digit, symbol.
- Block top-N common passwords.
- Reset via magic link to the verified email.
- Lockout after 10 failed attempts in 10 minutes (Supabase Auth setting).

## Account lifecycle

| Event | Action |
|---|---|
| New admin onboarded | `owner` creates user + role grant via admin UI. Magic link sent. |
| Admin leaves | `owner` revokes all roles. User row soft-deleted (`deleted_at`). Their alias-creation history retained for audit. |
| Customer self-signup (Phase 3) | Status `pending_approval`. Admin approves and links to `customer`. |
| Customer revokes self | Self-serve "delete my data" — RGPD right of erasure honored. PII redacted, role revoked. |

## Secrets and integration auth

- Supabase URL, anon key — public-safe.
- Supabase service-role key — server-only env var.
- LLM provider key — server-only env var.
- Resend, Postmark, Inngest, Sentry, Cloudflare Turnstile keys — server-only env vars.
- Swiver credentials (Phase 4) — Vault-stored, never in repo, rotated on cadence.
- Local dev uses `.env.local` (gitignored). Example template `.env.example` checked in.

## Threat-model headlines

- **Credential stuffing.** Mitigated by lockout + magic-link recovery + monitored failed-login Sentry alerts.
- **Inbound-email forgery.** Inbound is a webhook from Postmark only — the `From` header is informational, not trust-bearing. Customer auto-detection is suggestive; admin confirms.
- **Public quote spam.** Turnstile + rate limit + honeypot.
- **Session hijack.** HTTP-only + Secure cookies. SameSite=Lax. TLS-only.
- **Privilege escalation via SQL.** All inputs parameterized via Drizzle. No raw concatenation.
- **Data exfil via service-role abuse.** Service-role key never in client bundles. Server actions run only on server. Audit log records every mutation.

## Related

- [security-rgpd.md](security-rgpd.md) — privacy and retention.
- [adr/0003-postgres-supabase.md](adr/0003-postgres-supabase.md) — why Supabase (Auth + DB + Storage in one).
- [data-model.md](data-model.md) — `user`, `user_role`, `user_customer`, `audit_log`.
