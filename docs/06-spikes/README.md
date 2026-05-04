# Spikes — Phase 0 proofs of concept

> Status: All briefs drafted; none executed yet.
> Execution note (2026-05-04): Souhail approved moving into implementation before the gating spikes were completed. The spike briefs remain active and still need written results; the implementation is proceeding at explicit sponsor risk.

A **spike** is a time-boxed investigation whose only output is a documented decision. Spikes do not ship code to users. They retire risk before bulk build.

Each spike file follows this structure:

1. **Hypothesis.** What we believe and want to test.
2. **Why it matters.** What downstream decisions hinge on the result.
3. **Method.** What we will do, in concrete steps.
4. **Dataset.** What inputs we will run the method against.
5. **Gate criteria.** Numeric thresholds that determine pass/fail/partial.
6. **Decision template.** What we will write at the end.
7. **Time box.** Maximum time allowed.
8. **Result.** Filled in after running.
9. **Decision.** Filled in after running. Linked to the relevant ADR or roadmap tripwire.

## Spikes for Phase 0

| # | Spike | Time box | Status | Gates |
|---|---|---|---|---|
| 1 | [Swiver API capability](spike-swiver-api.md) | 1–2 days | not started | Gate by Spike result; informs ADR 0009. |
| 2 | [AI extraction on real Prodet emails/PDFs](spike-ai-extraction.md) | 3–5 days | not started | ≥ 80% top-1 line precision on text inputs. |
| 3 | [Product matching engine](spike-product-matching.md) | 3–5 days | not started | ≥ 70% top-1 with 150 alias seeds. |
| 4 | [Inbound email pipeline](spike-inbound-email.md) | 1–2 days | not started | One real email lands as `OrderDraft`. |
| 5 | [Catalog data quality audit](spike-catalog-quality.md) | 1–2 days | not started | ≥ 30 manufactured products audited as launch-ready. |
| 6 | [Arabic + RTL](spike-arabic-rtl.md) | 1 day | not started | Sample page renders cleanly with mixed FR/AR strings. |

Spikes 1, 2, 3 are **gating** — Phase 1 cannot start until each has a written decision. Spikes 4, 5, 6 can run in parallel and are gating only for their specific feature paths.
