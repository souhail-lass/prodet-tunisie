# ADR 0008 — Layered matching: alias → exact → trigram → vector → LLM rerank

- **Status.** Proposed
- **Date.** 2026-05-03
- **Owner.** Souhail
- **Supersedes.** —

## Context

The defining technical challenge of the platform: **map messy customer-written product strings to canonical Prodet products**.

Examples (real-world style):

- `"javel 5L"` → `JAVEL PRODET BID 5KG`
- `"bidon javel"` → `JAVEL PRODET BID 5KG`
- `"JAV 5"` → `JAVEL PRODET BID 5KG`
- `"eau de javel"` → `JAVEL PRODET BID 5KG`
- `"notre détergent vert"` (one specific customer) → `DETERGENT MULTI-USAGE PRODET 5L PARFUM POMME`
- mixed FR/AR: `"javel BIDON 5 لتر"` → `JAVEL PRODET BID 5KG`

Constraints:

- Catalog size MVP: ~80 manufactured + ~233 resold + (eventually) more = a few hundred entries actively matched.
- Aliases: thousands eventually as the system learns.
- Latency: < 500ms per line at p95 in the review screen.
- Confidence calibration is more important than raw accuracy (see [vision principle #3](../../00-overview/vision.md#strategic-principles-invariants)).
- Provider-agnostic preferred.

## Decision

Matching is a **layered pipeline**. Each layer adds candidates with confidence; downstream the union is reranked and the top-K returned.

Pipeline (per input line, per customer-context):

1. **Alias hit (exact).** Lookup `product_alias.alias_text_normalized` against the normalized input. If `scope = customer` matches with `customer_id`, that wins. If `scope = global` matches, that wins next. Confidence: 0.99 if `validation_status = confirmed`; 0.85 if `proposed`.
2. **Exact code match.** If the input contains a token matching `product.code` (case-insensitive), confidence: 0.97.
3. **Trigram fuzzy.** `pg_trgm` similarity (`%` operator, threshold 0.3) against `product.search_text`. Confidence: similarity score (0–1).
4. **Embedding cosine.** `pgvector` cosine distance between input embedding and `product_embedding.vector`. Confidence: `1 - distance`. Embeddings via `text-embedding-3-small` (or equivalent), pre-computed per product, refreshed on product change.
5. **LLM rerank (top-K=8).** Take the top 8 distinct candidates from steps 1–4. Send them with the raw input to an LLM with a strict structured output: `{ranking: [{productId, confidence, reason}]}`. Final `confidence` = LLM's confidence (clamped). The LLM may reorder or reject all candidates (in which case the line is `unmatched`).

Output per line: top-3 candidates with confidence scores. The UI:

- If top-1 confidence ≥ 0.92: pre-selected, "auto-accept on Approve" — but the human can still override.
- If top-1 in [0.6, 0.92): pre-selected, "needs review" badge.
- If top-1 < 0.6: nothing pre-selected; human picks from candidates or types a fresh search.

Alias learning:

- When a human approves a line where they overrode the AI's top-1 (or where the AI returned no match and the human picked one), a candidate `product_alias` row is offered with `validation_status = proposed`.
- The human chooses scope (`global` vs `customer`) and confirms in one click. The alias becomes `confirmed`.

## Alternatives considered

- **Single LLM call: "given this input, pick the right product from this list of 500."** Rejected — token-cost prohibitive at scale; precision is decent but recall on rare wordings is worse than the layered pipeline; harder to debug and trust.
- **Embeddings only.** Rejected — embeddings struggle on very short strings ("JAV 5"); trigram + alias compensate.
- **Trigram only.** Rejected — fails on synonyms ("eau de javel" vs "javel"); embeddings handle this.
- **Bayesian/learned ranker.** Premature. Re-evaluate at Phase 3 once we have hundreds of human decisions to train on.
- **External vector DB (Pinecone/Weaviate).** Rejected — `pgvector` is sufficient at our size; no new vendor.

## Consequences

- **Positive.**
  - Each layer is independently testable, tunable, and replaceable.
  - Aliases give us a fast, deterministic top-of-funnel that improves over time without retraining.
  - Confidence is calibrated by combining signals.
  - LLM rerank is the only LLM call in the pipeline → low cost, low latency.
- **Negative.**
  - Five-stage pipeline is more code than a one-shot LLM. Worth it.
  - Embedding refresh requires care when product names change; a `source_text_hash` column detects staleness.
  - Cold-start: new products have no alias hits; rely on trigram + vector until aliases form.
- **Neutral.**
  - Customer-scoped aliases create per-customer ranking — explicit and intentional. Cross-customer leakage forbidden by the alias model.

## Open questions

- Embedding model choice: `text-embedding-3-small` (OpenAI) vs Cohere multilingual vs Voyage. Decided by [Spike 3](../../06-spikes/spike-product-matching.md).
- LLM rerank model: smaller fast model (Claude Haiku, GPT-4o mini) vs the same model used for extraction. Default: smaller fast model for cost.
- Whether to skip the LLM rerank when top-1 from alias hit is `confirmed` (`>= 0.95` confidence). Default: yes — short-circuit. Revisit if we see degradation.

## References

- [system-overview.md](../system-overview.md)
- [data-model.md](../data-model.md) — `product_alias`, `product_embedding`.
- [adr/0007-ai-extraction-architecture.md](0007-ai-extraction-architecture.md)
- [../../06-spikes/spike-product-matching.md](../../06-spikes/spike-product-matching.md)
- [../../03-modules/product-matching/](../../03-modules/product-matching/)
