# ADR 0009 — Swiver coexistence with manual export at v1, API-driven at Phase 4

- **Status.** Proposed (gated on [Spike 1](../../06-spikes/spike-swiver-api.md))
- **Date.** 2026-05-03
- **Owner.** Souhail
- **Supersedes.** —

## Context

Swiver ([app.swiver.io](https://app.swiver.io/)) is the in-use ERP. It owns:

- Customer master data.
- Product master data (~499 lines today).
- Official commercial documents: devis, bon de commande, bon de livraison, facture.
- Accounting.

Prodet Platform must coexist with Swiver. Long-term posture (replace vs forever-coexist) is [Q14](../../01-product/open-questions.md). Until decided, we assume coexistence indefinitely.

Open questions about Swiver itself ([Q2](../../01-product/open-questions.md)):

- Does Swiver have a usable API?
- Does it support OAuth or API tokens?
- Read-only or read+write? Webhooks?
- Rate limits?

## Decision

Three-stage integration plan:

### Stage 1 — MVP (manual everything except product/customer import)

- **One-time CSV import** from Swiver of products and customers at MVP launch. Manually triggered. Idempotent re-import supported (matched on `swiver_id` if present, else on normalized name).
- **Push-to-Swiver = manual copy/paste.** The console produces a print-friendly view of an approved order draft (product code, qty, unit) optimized for direct entry into Swiver's devis form.
- **No automatic sync.** Drift between Prodet Platform and Swiver is accepted at MVP; the console flags items not yet in the latest import.

### Stage 2 — if Spike 1 confirms a usable API

- **Read-on-demand sync.** Periodic (daily) Inngest job pulls product and customer deltas from Swiver. Updates `swiver_id`-keyed rows. Conflicts surfaced for admin review.
- **Manual push remains the default at MVP.** Even if API write works, we wait until Phase 2/3 to wire API push, to avoid risking incorrect drafts going into the official record before the system has earned trust.

### Stage 3 — Phase 4 (full API integration)

- **Push-to-Swiver = API call.** Approved order drafts become devis (or bon de commande) via API.
- **Stage as draft, not final.** Even with API push, Prodet Platform creates Swiver documents in `draft` state where possible, requiring final human action in Swiver to commit. Belt-and-braces for the load-bearing principle "AI proposes, humans approve."
- **Webhook listener** (if Swiver supports) for downstream events (devis accepted, BL created, facture issued) that update `order_draft.swiver_export_status`.

### Fallback (if Swiver has no API at all, ever)

- Periodic CSV export pipeline: Swiver export → S3-style drop → Inngest job ingests deltas. Manual push-to-Swiver remains forever.
- This is workable but degrades the platform's value substantially. It would also strengthen the case to revisit [Q14 (long-term posture)](../../01-product/open-questions.md).

## Alternatives considered

- **Replace Swiver immediately.** Rejected — out of scope at MVP; massive operational risk; family is mid-relationship with Swiver.
- **Bidirectional real-time sync at MVP.** Rejected — premature. The complexity of conflict resolution (who wins when both systems edit a customer?) is not worth it before proving the operational thesis.
- **Run all official documents in Prodet Platform.** Rejected — this is the "replace Swiver" path and is out of MVP scope.

## Consequences

- **Positive.**
  - Stage 1 is shippable regardless of Swiver's API state.
  - Stage 2 adds value (no more reconciliation friction) before risking write integration.
  - Stage 3 is a goal, not a gate.
- **Negative.**
  - Manual copy/paste is friction at every approved order at MVP. Acceptable because Mère/Sœur already paste from email today; the console structure makes the paste easier.
  - "Two sources of truth" risk: customer/product changes in Swiver after import are not reflected in Prodet Platform until next import.
- **Neutral.**
  - Order drafts always carry `swiver_export_status` so we know what is in/out of Swiver at any time.
  - Aliases live in Prodet Platform exclusively; Swiver does not need to know about them.

## Open questions

- Spike 1 outcome: does Swiver have an API? ([Q2](../../01-product/open-questions.md), [Spike 1](../../06-spikes/spike-swiver-api.md))
- If so, can we create devis as drafts vs final?
- Are there webhooks for downstream events?

## References

- [system-overview.md](../system-overview.md)
- [../../06-spikes/spike-swiver-api.md](../../06-spikes/spike-swiver-api.md)
- [../../03-modules/swiver-integration/](../../03-modules/swiver-integration/)
- [../../01-product/open-questions.md](../../01-product/open-questions.md)
