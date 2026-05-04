# Security and privacy (RGPD-aligned) — Prodet Platform

> Status: Draft. Owner: Souhail. Last updated: 2026-05.
>
> Tunisia operates under loi organique n° 2004-63 sur la protection des données personnelles. We adopt RGPD-aligned practices as a superset that satisfies both — and protects against future EU-customer requirements.

## Posture in one paragraph

We collect the minimum personal data needed to respond to commercial inquiries and process orders. We store it inside the EU (Supabase Frankfurt + Vercel Paris). We document retention and deletion. We give data subjects access, rectification, and erasure. We log every administrative access to personal data via `audit_log`. We do not sell, share, or transfer data to third parties beyond the technical processors required to operate the service (Vercel, Supabase, LLM provider, Postmark, Resend, Sentry, Plausible, Inngest, Cloudflare).

## Data classification

| Class | Examples | Storage | Retention default |
|---|---|---|---|
| **Public** | Product info (visible-public), category/family/sector taxonomy, marketing copy, public images, SDS PDFs | Postgres + public Storage buckets | Indefinite |
| **Personal — contact** | `customer.email`, `customer.phone`, `customer_contact.*`, quote-form submitter contact | Postgres | While the commercial relationship is active + 5 years (Tunisian commercial code), then anonymize |
| **Personal — content** | Inbound-email body and attachments, free-text notes, raw quote-form text | Postgres + private Storage | 24 months from last activity, then purge content (keep order metadata anonymized) |
| **Operational sensitive** | Customer-scoped aliases, customer order history | Postgres | Same as contact |
| **Auth** | `user.email`, password hashes, sessions | Supabase Auth | While account active + 30 days |
| **Audit** | `audit_log` rows | Postgres | 24 months minimum, longer if legal requires |
| **Telemetry** | Plausible page views (anonymized), Sentry error events (scrubbed), application logs | Vendor-hosted | Vendor default; we do not extend |

Retention is enforced by scheduled jobs (Inngest, Phase 2) that anonymize or delete according to the table above. Audit log is append-only and not deleted by app code.

## Personal-data inventory (DPIA-light)

| Data point | Where it enters | Where it lives | Who can see it | Why we need it |
|---|---|---|---|---|
| Visitor IP | Cloudflare logs | Cloudflare (vendor-managed) | Cloudflare admins | DDoS / abuse only. Not in our DB. |
| Quote form name/email/phone | Public quote form | `order_draft.raw_input` + `customer_contact` (if customer linked) | Admin staff | Respond to the quote |
| Inbound-email From, Subject, Body, attachments | Postmark inbound | `order_draft.raw_input` + `order_attachment` storage | Admin staff | Process the order |
| Customer name, address, contacts | Swiver import | `customer`, `customer_contact` | Admin staff | Operate the relationship |
| Admin user email | Manual onboarding | `user`, Supabase Auth | Owner | Authenticate and audit |
| Customer-scoped aliases | Console review | `product_alias` (scope=customer) | Admin staff (Phase 3: the owning customer) | Match future orders |
| LLM prompt context | Extraction job | LLM provider (transit) + `extraction_jobs.raw_response` (rest) | Provider per their policy + admin staff | Run extraction |

## Subject rights (process)

- **Access** — On written request via `contact@...`, we provide a CSV of all rows referencing the subject's email/phone within 30 days.
- **Rectification** — Edits applied via the console; audit-logged.
- **Erasure** — Soft-delete the `customer` and `customer_contact` rows; redact PII fields in `order_draft.raw_input` (replace with `[redacted]`); keep order metadata (lines, totals) for accounting integrity. Audit-logged. Operationally we will document that some attachments physically deleted from Storage cannot be reconstructed.
- **Objection / restriction** — Mark `customer.processing_objection = true` (column to add at Phase 3) and stop sending non-essential outreach.
- **Portability** — CSV export of the same data as access.

These flows live in [../05-ops/runbooks/](../05-ops/runbooks/) (to be authored).

## Security controls (technical)

### Network

- HTTPS everywhere, TLS 1.2+.
- Cloudflare WAF in front of Vercel.
- Rate limiting on quote-request and inbound-email handler endpoints.
- HSTS with `includeSubDomains`, `preload` after stability period.
- CSP (`default-src 'self'`, allow Plausible, Resend tracking pixels off, Vercel analytics, Cloudflare Turnstile). Reported via report-uri to Sentry.

### Application

- All inputs Zod-validated server-side.
- Drizzle parameterizes all queries.
- React escapes by default; `dangerouslySetInnerHTML` only for trusted markdown rendered server-side.
- File uploads: MIME-validated, size-capped, virus-scanned (Phase 2; defer at MVP — admin-only access).
- Secrets in env vars; never committed.
- Service-role DB key never shipped to client; only used in server actions.

### Identity

- Supabase Auth: lockout after 10 failed attempts in 10 minutes.
- Password policy ≥ 12 chars + complexity.
- Magic-link recovery.
- 2FA Phase 2 (TOTP).
- Sessions: HTTP-only Secure SameSite=Lax cookies.

### Data at rest

- Supabase storage and Postgres encrypted at rest by Supabase.
- Backups encrypted.

### Data in transit

- TLS for all client-server, server-vendor links.
- Inbound webhooks (Postmark) signed with HMAC and verified.

## Audit logging

Every state-changing admin action writes a row to `audit_log`:

- `user_id` (nullable for system actions)
- `action` — dot-noun-verb: `order.approved`, `order.exported`, `alias.created`, `alias.confirmed`, `product.updated`, `customer.updated`, `auth.login`, `auth.logout`, `user.role.granted`, `user.role.revoked`, `customer.erased`
- `entity_type`, `entity_id`
- `metadata` (jsonb) — minimal context, no full PII payload (which lives in the entity itself)

The audit log is append-only. App code cannot UPDATE or DELETE rows.

## Vendor data processors

| Vendor | Role | Data processed | Region | DPA |
|---|---|---|---|---|
| Vercel | App hosting | All app traffic | Paris (`cdg1`) | Vercel DPA applies to Pro accounts |
| Supabase | DB + Auth + Storage | All persisted data | Frankfurt | Supabase DPA |
| Cloudflare | DNS + WAF | IPs, headers | Global edge | Cloudflare DPA |
| LLM provider (Anthropic or OpenAI) | Extraction & rerank | Order text, customer name (incidental) | US (typically) | Provider DPA + zero-retention mode if available |
| Postmark | Inbound email | Email body + attachments | US/EU per setup | Postmark DPA |
| Resend | Outbound transactional email | Recipient + subject + body | EU/US per setup | Resend DPA |
| Inngest | Job orchestration | Job payloads (avoid PII in payloads) | US | Inngest DPA |
| Sentry | Error reporting | Stack traces, scrubbed payloads | EU region selectable | Sentry DPA |
| Plausible | Analytics | Anonymized URL + referrer | EU (Plausible Cloud EU) | Plausible DPA |

We will request and review DPAs as part of the [hosting checklist](hosting.md#domain-and-email-setup-checklist-one-time). LLM provider zero-retention mode is enabled where supported.

## LLM-specific privacy considerations

- Prompts include only what is needed for extraction/matching: order text + (optional) customer name + truncated catalog snippets.
- We do not include emails, phone numbers, or full customer profiles in prompts.
- Provider zero-retention mode enabled where available (e.g. Anthropic via opt-in, OpenAI via API settings).
- Inputs and outputs are stored in `extraction_jobs.raw_response` for replay/debugging — covered by our own retention policy.

## Cookies

- **MVP analytics** — Plausible (no cookies). No banner needed.
- **Functional cookies** — Supabase Auth session cookie (essential, no banner needed under RGPD if strictly necessary).
- **Cloudflare Turnstile** — uses challenge mechanisms; documented in privacy policy.
- If we ever add tracking cookies (advertising, GA), a real consent banner becomes mandatory. Out of scope.

## Incident response (high level)

- Sentry alert + Logtail watch list for high-severity classes.
- On suspected breach:
  1. Souhail acknowledges within 1 business hour during Tunisian business hours.
  2. Containment (rotate keys, disable affected accounts).
  3. Investigation log started (private repo, time-stamped).
  4. Notify affected subjects within 72 hours if a personal-data breach is confirmed (RGPD Art. 33 timeline; aligned with Tunisian INPDP guidance).
  5. Post-incident review and update of runbooks.

Detailed playbook: [../05-ops/incident-response.md](../05-ops/incident-response.md) (to be authored).

## Compliance non-goals

- No SOC 2 / ISO 27001 pursuit at MVP.
- No HIPAA-equivalent (we do not handle health data).
- No PCI-DSS (no online payment).

## Related

- [auth.md](auth.md) — authentication and authorization.
- [hosting.md](hosting.md) — region and TLS.
- [data-model.md](data-model.md) — `audit_log`, soft-delete conventions.
- [../05-ops/incident-response.md](../05-ops/incident-response.md) — playbook (to be authored).
- [../01-product/non-goals.md](../01-product/non-goals.md) — what we are not doing on the privacy front.
