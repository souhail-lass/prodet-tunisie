# ADR 0013 — Durable rate limiting for public write endpoints

- **Status.** Accepted
- **Date.** 2026-08-23
- **Owner.** Souhail
- **Relates to.** Security audit of 2026-08-23 (finding #2), [ADR 0010](0010-jobs-and-queues.md)

## Context

Every public write path — contact form, public devis, "devenir client" access request,
and both magic-link login actions — is throttled by `consumeRateLimit()` in
`src/lib/rate-limit.ts`. That limiter was a `Map` held in process memory, with an
explicit comment acknowledging the limitation:

> "When we scale beyond one server (Vercel multi-region, multi-worker) we must swap
> the backing store for Redis / Upstash KV."

We are on Vercel. Each serverless invocation may land on a different instance, and a
cold start begins with an empty `Map`. So in production every published limit was
effectively decorative: an attacker spreading requests across instances was never
throttled at all. Concretely this allowed flooding `prodet.tunisie@gmail.com` through
the contact and devis forms, brute-forcing magic-link issuance per email address, and
— since the public devis now pushes a draft into Swiver — filling the production ERP
with junk documents.

A second defect compounded it: the caller's identity came from
`x-forwarded-for.split(',')[0]`, i.e. the **first** entry of a header the client can
set. On Vercel the platform-authoritative values are `x-vercel-forwarded-for` and
`x-real-ip`; taking the leading `x-forwarded-for` entry lets a caller rotate a fake
identity per request and reset its own bucket.

## Decision

### 1. Back the limiter with Postgres, not a new service

We already have Postgres in the request path for every endpoint being limited. A
`rate_limit_bucket` table with an atomic upsert gives correct cross-instance counting
with:

- **no new npm dependency** (CLAUDE.md requires an ADR for each; this avoids the need),
- **no new hosted service** to provision, pay for, or add secrets for,
- **no new failure domain** — if Postgres is unreachable the request was going to fail
  anyway for every endpoint that persists something.

Upstash Redis was the obvious alternative and is the better tool at high volume: it
avoids a DB round trip and has purpose-built sliding-window primitives. We rejected it
for now because Prodet's public-form volume is a handful of requests per minute, the
operational cost of another service and secret is real, and switching later is a
single-file change behind the same `consumeRateLimit()` signature.

### 2. Fixed window, counted atomically

One statement does the whole thing, so concurrent invocations cannot interleave:

```sql
INSERT INTO rate_limit_bucket (key, count, reset_at)
VALUES ($1, 1, now() + make_interval(secs => $2))
ON CONFLICT (key) DO UPDATE SET
  count    = CASE WHEN rate_limit_bucket.reset_at <= now() THEN 1
                  ELSE rate_limit_bucket.count + 1 END,
  reset_at = CASE WHEN rate_limit_bucket.reset_at <= now() THEN excluded.reset_at
                  ELSE rate_limit_bucket.reset_at END
RETURNING count, reset_at;
```

A fixed window (not a sliding one) is deliberate: it is one statement, needs no
per-hit row, and its worst case — 2× the limit across a window boundary — is
irrelevant at these thresholds.

### 3. Fail open, and say so

If the limiter query throws, the request is allowed and the failure is logged. A
rate limiter that fails closed turns a database blip into a total outage of the
contact form. This is a deliberate availability-over-enforcement trade: the limiter
is abuse control, not an authorization boundary, and nothing security-critical
depends on it.

### 4. Trust only proxy-set identity headers

`getClientIp()` prefers, in order: `x-vercel-forwarded-for`, `x-real-ip`,
`cf-connecting-ip`, and only then the **last** entry of `x-forwarded-for` (the hop
nearest our proxy, which a client cannot forge by prepending). Unattributable callers
share a single `unknown` bucket, so they throttle each other rather than getting a
free pass each.

## Consequences

- One extra DB round trip per public write. Acceptable at current volume; it is the
  same connection pool the endpoint already uses.
- `rate_limit_bucket` grows by one row per active key. Expired rows are swept
  opportunistically (~2% of calls) and the table is keyed and indexed on `reset_at`.
- The table lives in the exposed `public` schema, so it carries RLS deny-all like
  every other table (see migration `0012_enable_rls_deny_all`).
- If volume grows past roughly a request per second sustained, revisit Upstash; the
  swap is confined to `src/lib/rate-limit.ts`.
