# Spike 2 — AI extraction on real Prodet emails/PDFs

- **Status.** Not started.
- **Owner.** Souhail.
- **Time box.** 3–5 days.
- **Blocks.** [ADR 0007](../02-architecture/adr/0007-ai-extraction-architecture.md), Slice B extraction integration, MVP acceptance criterion A7.

## Hypothesis

A frontier LLM (Claude or GPT) with a Zod-validated structured-output schema and a single-shot prompt can extract order line items from real Prodet customer emails and PDFs at **≥ 80% top-1 line precision** with calibrated confidence.

## Why it matters

- ≥ 80%: the architecture defined in ADR 0007 holds. Proceed with Slice B as planned.
- 60–80%: usable but degraded. Add prompt engineering / few-shot tuning / dual-model voting to push accuracy. Consider per-customer prompt tuning.
- < 60%: Tripwire 2 fires (see [roadmap.md](../01-product/roadmap.md#tripwires-phase-1)). Reframe Slice B as a "structured paste-and-correct form" without LLM in the critical path. Defer LLM extraction to Phase 2.

## Method

1. **Collect anonymized real orders.** 20–30 historical Prodet orders from the last 6 months. Mix:
   - ~12 plain-text email bodies.
   - ~8 customer-ERP-generated PDFs (text-extractable).
   - ~3 mixed-format (email body + attached order PDF).
   - ~2 mixed-language (FR + AR).
   - 1–2 known-tricky outliers.
   - Anonymization: replace customer names and personal info with placeholders; **keep product names and quantities verbatim** (the whole point).
2. **Build a ground-truth set.** For each input, hand-label the expected `lines[]` with `{rawText, qty, unit?, code?, note?}`. Owner: Souhail (~3 hours).
3. **Define the Zod schema** and a single system prompt (v1) per [ADR 0007](../02-architecture/adr/0007-ai-extraction-architecture.md).
4. **Run two providers.**
   - Anthropic Claude (default): latest Sonnet-tier model with structured output / tool-use.
   - OpenAI GPT (alternate): latest GPT-4-class model with structured output.
   - Both at `temperature = 0`.
5. **Per input, run extraction and compare to ground truth.**
   - Line precision: `# correctly-extracted lines / # AI-extracted lines`.
   - Line recall: `# correctly-extracted lines / # ground-truth lines`.
   - Confidence calibration: bucket per-line confidence into [0, 0.6), [0.6, 0.8), [0.8, 1.0]; report accuracy in each bucket.
6. **Catalog failure modes.** For every miss: why did it fail (ambiguity, OCR-needed scan, unusual format, language)?
7. **OCR probe.** For 2–3 image-only PDFs, attempt OCR via a single tool (e.g. Mistral OCR or vision-based extraction). Note quality but do not block.

## Dataset

- 20–30 real anonymized orders ([Q3 answered 2026-05-03](../01-product/open-questions.md) — Souhail can pull and anonymize within hours).
- Anonymization: replace customer names and personal info with placeholders; **keep product names and quantities verbatim** (the entire point of the spike is the messy reality of customer wording).

## Gate criteria

| Top-1 precision (text inputs) | Decision |
|---|---|
| ≥ 80% | ADR 0007 → Accepted with default provider X. Proceed with Slice B as planned. |
| 60% to < 80% | ADR 0007 → Accepted with caveats. Schedule a prompt-engineering iteration during Phase 1B week 4. |
| < 60% | Tripwire 2 fires. Reframe Slice B. Defer LLM extraction to Phase 2. |

Confidence calibration is informational at this stage but recorded. Target: in the [0.8, 1.0] confidence bucket, accuracy ≥ 95%.

## Time box

5 days maximum, including:

- Day 1: collect + anonymize + label ground truth.
- Days 2–3: implement the extractor (thin script, not production code).
- Day 4: run + measure.
- Day 5: write up + decide.

## Result

_To fill in after running:_

- Inputs used: N text emails, M PDFs, K mixed-language.
- Provider results:
  - Claude: precision _ %, recall _ %, latency _ ms, cost _ /run.
  - GPT: precision _ %, recall _ %, latency _ ms, cost _ /run.
- Confidence calibration:
- Top failure modes:
- OCR probe:

## Decision

_To fill in after running:_

- ADR 0007 → Accepted / Modified / Rejected.
- Default provider:
- Prompt version retained: v1 / v_x.
- Tripwire status:
- Followups (prompt iterations, format-specific adapters):

## References

- [adr/0007-ai-extraction-architecture.md](../02-architecture/adr/0007-ai-extraction-architecture.md)
- [01-product/open-questions.md Q3](../01-product/open-questions.md)
- [01-product/roadmap.md tripwires](../01-product/roadmap.md#tripwires-phase-1)
- [03-modules/order-intake/](../03-modules/order-intake/)
