# Spike 3 — Product matching engine

- **Status.** Not started.
- **Owner.** Souhail.
- **Time box.** 3–5 days.
- **Blocks.** [ADR 0008](../02-architecture/adr/0008-product-matching-engine.md), Slice B review-screen UX, MVP acceptance criterion A7.

## Hypothesis

The layered matching pipeline defined in [ADR 0008](../02-architecture/adr/0008-product-matching-engine.md) — alias → exact code → trigram fuzzy → vector cosine → LLM rerank — achieves **≥ 70% top-1 product match accuracy** on a holdout of 100 real customer-written product lines, after seeding the alias database with ~150 entries derived from observed customer patterns.

## Why it matters

- ≥ 70%: matching engine is viable. Combined with extraction (Spike 2), Slice B's value prop holds.
- 50–70%: usable but the review UI must lean heavily on top-3 candidates rather than auto-accept. Adjust UX accordingly.
- < 50%: Tripwire 3 fires. Reframe matching as "search-and-pick" — the human always picks from a search box rather than confirming an AI top-1. Defer auto-match UX to Phase 2.

## Method

1. **Build the catalog.** Import the ~499 Swiver products into a local Postgres with `pg_trgm` and `pgvector`. Generate normalized `search_text` for each. Compute embeddings via `text-embedding-3-small`.
2. **Build the holdout.** From the same anonymized order corpus as [Spike 2](spike-ai-extraction.md), extract 100 distinct "raw line" strings ground-truthed to a known product. Mix:
   - ~40 obvious matches ("javel 5L" → JAVEL PRODET BID 5KG).
   - ~30 abbreviated/code-like ("JAV 5", "DET-002").
   - ~15 mixed-language ("javel BIDON 5 لتر").
   - ~10 highly idiosyncratic per-customer wordings ("notre détergent vert").
   - ~5 ambiguous (could be one of two products).
3. **Seed aliases.** Manually create ~150 `product_alias` rows from observed customer patterns (mostly global; ~20 customer-scoped for the idiosyncratic cases tied to identifiable customers).
4. **Implement the pipeline.**
   - Layer 1: alias normalized lookup.
   - Layer 2: exact code substring match.
   - Layer 3: `SELECT ... ORDER BY similarity(search_text, $1) DESC LIMIT 8`.
   - Layer 4: `SELECT ... ORDER BY 1 - (vector <=> $1) DESC LIMIT 8`.
   - Layer 5: union top candidates from layers 3+4 (deduped by product_id), send to LLM rerank with the raw input as context, take the LLM's top-1 (or `unmatched`).
5. **Measure.**
   - Top-1 accuracy: % of holdout where pipeline top-1 == ground truth.
   - Top-3 accuracy: % where ground truth is in pipeline top-3.
   - Per-layer contribution: count how often each layer produced the eventual top-1.
   - Latency p50, p95.
   - Cost per match (LLM rerank only).
6. **Ablation.** Repeat with each layer disabled in turn to understand individual contribution.
7. **Calibration.** Confidence vs actual correctness — bucket and report.

## Dataset

- ~499 Swiver products (all of them; matching engine sees the full catalog, not just public-visible).
- 100 holdout raw lines.
- ~150 seeded aliases.
- Same anonymized email/PDF corpus as Spike 2 (overlap allowed).

## Gate criteria

| Top-1 accuracy | Decision |
|---|---|
| ≥ 70% | ADR 0008 → Accepted. Auto-accept threshold 0.92. Proceed. |
| 50% to < 70% | ADR 0008 → Accepted with UX caveat: review screen surfaces top-3 prominently, no auto-accept. Tighten alias seeding plan. |
| < 50% | Tripwire 3 fires. Reframe as search-and-pick. |

Latency target: p95 < 500ms per line. If exceeded, profile (likely the LLM rerank); consider short-circuiting on high-confidence alias hits.

## Time box

5 days maximum:

- Day 1: import catalog, build holdout, generate embeddings.
- Day 2: implement layers 1–4.
- Day 3: implement layer 5 (LLM rerank), seed aliases.
- Day 4: measure, ablate.
- Day 5: write up, decide.

## Result

_To fill in after running:_

- Catalog size: 499.
- Holdout size: 100.
- Aliases seeded: 150 (X global, Y customer-scoped).
- Top-1 accuracy: _ %.
- Top-3 accuracy: _ %.
- Per-layer contribution:
  - Alias: _ %
  - Exact code: _ %
  - Trigram: _ %
  - Vector: _ %
  - LLM rerank changed top-1 in _ % of cases.
- Latency: p50 _ ms, p95 _ ms.
- Cost per match: $_ .
- Ablation:
- Calibration:

## Decision

_To fill in after running:_

- ADR 0008 → Accepted / Modified / Rejected.
- Auto-accept threshold (default 0.92):
- Embedding model retained:
- LLM rerank model retained:
- Tripwire status:
- Followups:

## References

- [adr/0008-product-matching-engine.md](../02-architecture/adr/0008-product-matching-engine.md)
- [spike-ai-extraction.md](spike-ai-extraction.md)
- [01-product/roadmap.md tripwires](../01-product/roadmap.md#tripwires-phase-1)
- [03-modules/product-matching/](../03-modules/product-matching/)
