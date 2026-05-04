# ADR 0006 — Postgres FTS + `pg_trgm` for search at MVP

- **Status.** Proposed
- **Date.** 2026-05-03
- **Owner.** Souhail
- **Supersedes.** —

## Context

We need search in three places:

1. **Public catalog** — visitor types "javel" or "désinfectant", catalog filters/lists relevant manufactured products.
2. **Internal product picker** (in the order intake review screen) — fast autocomplete from a partial string against the full ~499-product catalog including aliases.
3. **Product matching engine** (separate concern, see [ADR 0008](0008-product-matching-engine.md)) — uses fuzzy + vector behind the scenes; this ADR is about end-user search.

Constraints:

- Catalog size at MVP: hundreds of products.
- French and Arabic and English content; mixed-language strings real.
- Must handle accents (`désinfectant` ↔ `desinfectant`).
- Must handle plurals/morphology in French.
- Cost-sensitive (no new infra at MVP).

Plausible options:

1. **Postgres FTS + `pg_trgm` + `unaccent`.**
2. **Algolia** (managed search-as-a-service).
3. **Meilisearch** (self-hosted or cloud).
4. **Typesense** (self-hosted or cloud).
5. **Elasticsearch / OpenSearch** (overkill, ops-heavy).

## Decision

At MVP, search is implemented entirely in **Postgres**:

- A generated `search_text` column per product/alias: `unaccent(lower(...))`.
- A GIN index on `search_text` using `gin_trgm_ops` for fuzzy/substring matches.
- A tsvector column with `french` text-search configuration for ranked full-text queries (added when we have meaningful product descriptions).
- For Arabic, we rely on `pg_trgm` (no built-in Arabic stemming in Postgres). Acceptable at our catalog size. Stemming can be addressed later via Algolia/Meilisearch if AR-quality search becomes a real need.

Re-evaluation triggers (we'd consider migrating to Algolia/Meilisearch when):

- Catalog size > ~5,000 products.
- AR-stemming search quality becomes a complaint.
- We need typo tolerance beyond what `pg_trgm` similarity provides.

## Alternatives considered

- **Algolia.** Best DX, best quality, fastest. Costs $$ at scale and requires data sync. Defer to Phase 2+ if FTS proves insufficient.
- **Meilisearch.** Excellent open-source. Self-hosting adds ops burden; cloud version is fine but adds a vendor at MVP. Defer.
- **Typesense.** Similar to Meilisearch. Defer.
- **Elasticsearch / OpenSearch.** Massive overkill for hundreds of products. Rejected.

## Consequences

- **Positive.**
  - No new infra. No data sync to keep consistent.
  - Search and matching live in the same place — easy to combine signals.
  - Cheap.
- **Negative.**
  - French stemming via `tsvector french` is decent but not best-in-class.
  - Arabic stemming is absent. Trigram-only AR search will return relevant-ish results but rank quality is mediocre.
  - At larger catalogs (5k+ products), latency degrades; we'll need to revisit.
- **Neutral.**
  - We treat the matching engine ([ADR 0008](0008-product-matching-engine.md)) as a separate, internal-only concern with its own pipeline (alias → exact → trigram → vector → LLM rerank). End-user search is simpler.

## Open questions

- Whether to use `pg_search` (Paradedb) extension on Supabase for stronger FTS. Available in some Supabase plans. Re-evaluate at Phase 2.

## References

- [system-overview.md](../system-overview.md)
- [data-model.md](../data-model.md)
- [adr/0008-product-matching-engine.md](0008-product-matching-engine.md)
- [Postgres FTS docs](https://www.postgresql.org/docs/current/textsearch.html)
