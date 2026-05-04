# Module — Product matching engine

> Status: Spec stub. Owner: Souhail. Last updated: 2026-05.
> Authoritative design: [../../02-architecture/adr/0008-product-matching-engine.md](../../02-architecture/adr/0008-product-matching-engine.md).
> Validation: [../../06-spikes/spike-product-matching.md](../../06-spikes/spike-product-matching.md).

## Purpose

Map a free-text customer line ("javel 5L", "JAV 5", "notre détergent vert") to the right canonical Prodet product, with a calibrated confidence score and the alias-learning loop that improves the system over time.

## Public surface (server-side TypeScript)

```ts
type MatchInput = {
  rawText: string;
  customerId?: string;
  topK?: number; // default 3
};

type Candidate = {
  productId: string;
  confidence: number; // 0..1
  reason: 'alias' | 'exact_code' | 'trigram' | 'vector' | 'llm_rerank';
  aliasId?: string;
};

type MatchResult = {
  candidates: Candidate[]; // sorted desc by confidence
  topConfidence: number;
};

async function match(input: MatchInput): Promise<MatchResult>;
```

## Pipeline (per call)

1. **Normalize input.** Lowercase, unaccent (`unaccent` extension), trim, collapse whitespace. Keep the original for display.
2. **Alias lookup (deterministic).**
   - If `customerId` set: query `product_alias` where `scope='customer' AND customer_id = ?` AND `alias_text_normalized = ?`. If found and `validation_status='confirmed'`, return immediately as confidence 0.99.
   - Then global aliases. Same logic, confidence 0.95 (confirmed) / 0.80 (proposed).
3. **Exact code match.** Tokenize the input. For each token, check if any token equals `product.code` (case-insensitive). Match → confidence 0.97.
4. **Trigram fuzzy.** `SELECT product_id, similarity(search_text, $1) AS s FROM product WHERE search_text % $1 ORDER BY s DESC LIMIT 8`. Confidence = `s` clamped.
5. **Vector cosine.** Embed input via the chosen embedding model (cached by input hash). `SELECT product_id, 1 - (vector <=> $1) AS s FROM product_embedding ORDER BY vector <=> $1 LIMIT 8`. Confidence = `s` clamped.
6. **Merge and dedupe.** Union top candidates from steps 2–5 by `product_id`. Take per-product max confidence and the source layer.
7. **LLM rerank** (only if no early-return from step 2 with high confidence). Send top-K=8 candidates + raw input to the rerank LLM. Output: ordered list with revised confidences and a per-candidate `reason`. Cap K=3 in the returned `MatchResult`.

## Inputs and outputs (DB)

- Reads from: `product`, `product_translation`, `product_alias`, `product_embedding`.
- Writes to: nothing during a `match` call. (Logging happens in the calling code, e.g. `extraction_jobs` and `order_line.candidate_alternatives`.)

## Alias learning

Triggered from the order-intake review UI, not from this module. The matching engine is read-only. The intake module proposes new aliases when a human overrides the AI's top-1 or accepts an `unmatched` line with a manual pick.

## Embedding refresh

A separate Inngest job re-embeds a product when:

- `product.name_canonical` changes.
- A `product_translation` row is added/updated.
- A new `product_alias` is `confirmed` (optional — re-embedding to include alias text in the embedded representation; see open question below).

Detection via `source_text_hash` on `product_embedding`.

## Calibration and metrics

Tracked per call (rolled up into `extraction_jobs` or a dedicated `match_event` table — TBD post-Spike 3):

- Top-1 accuracy on the rolling 50-line holdout.
- Confidence calibration (predicted vs actual).
- Per-layer hit rate.
- Latency p50, p95.
- Cost (LLM rerank only).

These feed the [M3 success metric](../../01-product/prd.md#7-success-metrics).

## Open questions

- Should aliases be embedded into the product's representation (so vector search benefits from alias coverage), or kept separate (so alias hits are deterministic only)? Default: separate (alias = deterministic short-circuit; embeddings cover synonymy).
- LLM rerank model: fast/cheap (Claude Haiku, GPT-4o-mini) by default. Reconsider after Spike 3.

## Related

- [../../02-architecture/adr/0008-product-matching-engine.md](../../02-architecture/adr/0008-product-matching-engine.md)
- [../../02-architecture/data-model.md](../../02-architecture/data-model.md) — `product_alias`, `product_embedding`.
- [../../06-spikes/spike-product-matching.md](../../06-spikes/spike-product-matching.md)
- [../order-intake/](../order-intake/) — primary consumer of this module.
