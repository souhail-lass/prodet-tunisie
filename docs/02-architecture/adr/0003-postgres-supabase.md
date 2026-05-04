# ADR 0003 — Postgres on Supabase as the data layer

- **Status.** Proposed
- **Date.** 2026-05-03
- **Owner.** Souhail
- **Supersedes.** —

## Context

The platform needs:

- A relational database (orders, products, aliases, customers — all relational).
- Full-text search (`pg_trgm`, FTS) for product matching and catalog search.
- Vector search (`pgvector`) for embedding-based product matching.
- Authentication and session management for admins (now) and customers (Phase 3).
- File storage for product images, SDS PDFs, and inbound-email attachments.
- Row-level security to safely expose customer-scoped data in Phase 3.
- EU residency.

Hard constraint: managed (no Kubernetes, no self-hosted Postgres). Solo dev.

Plausible options:

1. **Supabase** — managed Postgres + Auth + Storage + Realtime, EU regions.
2. **Neon (DB) + Clerk (Auth) + S3 (Storage)** — best-of-breed; more vendors.
3. **Vercel Postgres (Neon-backed) + Clerk + Vercel Blob** — Vercel-aligned; more vendors.
4. **Self-hosted Postgres on a Hetzner VPS + Lucia + S3** — cheapest at scale; ops burden disqualifies for solo dev.

## Decision

We use **Supabase** as the primary data vendor. It provides:

- Postgres 15 with `pg_trgm`, `pgvector`, `unaccent` available.
- Supabase Auth with email/password, magic link, future TOTP.
- Supabase Storage with public/private buckets and signed URLs.
- EU regions (Frankfurt `eu-central-1` primary candidate).
- RLS first-class.
- Daily backups; PITR on paid tier.

Direct DB access from Drizzle uses the connection string. Server actions use the **service-role key**; public read paths use the **anon key** under RLS.

## Alternatives considered

- **Neon + Clerk + S3.** Best-of-breed, but three vendors to wire and three DPAs to manage. The Auth integration (Clerk) is excellent but adds cost. Supabase's bundling lowers cognitive load. Re-evaluate if a Supabase-specific limitation bites.
- **Vercel Postgres + Clerk + Vercel Blob.** Tightly Vercel-aligned. Storage feels less mature than Supabase Storage. Auth requires a third vendor anyway. No clear win.
- **Self-hosted on Hetzner.** Cheapest in steady state, but the ops burden (backups, OS patching, replication, RLS-equivalent policies) is a lifetime tax for a solo dev.
- **MySQL/PlanetScale.** Rejected — no `pgvector`, weaker FTS, and our domain is heavily relational with full FK enforcement.
- **Firestore / DynamoDB.** Rejected — relational requirements + complex queries + multi-locale joins make NoSQL a poor fit.

## Consequences

- **Positive.**
  - One vendor for DB, Auth, Storage. One DPA. One bill.
  - RLS lets us safely run a public read path on the same DB as admin/portal.
  - `pgvector` keeps matching infra inside Postgres — no separate vector DB.
  - EU residency available out-of-box.
- **Negative.**
  - Vendor lock-in to Supabase APIs (Auth + Storage). The DB is portable (it's just Postgres), but Auth tables and Storage URLs would require migration if we ever leave.
  - Connection limits on free tier require pgbouncer/pooler care. We use Supabase's built-in pooler.
  - Some Supabase features (preview branches, advanced logs) are paid.
- **Neutral.**
  - We commit to keeping Auth simple enough that switching to Clerk or self-hosted Lucia later is a 1-week project rather than a multi-month one. No deep coupling to Supabase Auth schema beyond the JWT token contract.

## Open questions

- Region: Frankfurt vs Paris. Latency-equivalent. Pick whichever pairs best with Vercel region. ([Q8](../../01-product/open-questions.md))
- Tier: Free at MVP, Pro at Phase 2 (PITR + larger DB).

## References

- [system-overview.md](../system-overview.md), [hosting.md](../hosting.md), [auth.md](../auth.md), [data-model.md](../data-model.md).
- [Supabase docs](https://supabase.com/docs)
