# Module — Swiver integration

> Status: Spec stub. Owner: Souhail. Last updated: 2026-05.
> Authoritative design: [../../02-architecture/adr/0009-swiver-integration-strategy.md](../../02-architecture/adr/0009-swiver-integration-strategy.md).
> Validation: [../../06-spikes/spike-swiver-api.md](../../06-spikes/spike-swiver-api.md).

## Purpose

Maintain the relationship between Prodet Platform and Swiver across its three planned stages:

1. **MVP — manual everything** except a one-time CSV import of customers and products.
2. **Stage 2 (post-Spike 1, if API exists)** — scheduled read-sync of customers and products. Manual push remains.
3. **Phase 4 — full integration.** Push approved order drafts to Swiver as devis (or BC). Receive webhooks for downstream events.

## MVP responsibilities

### Import (one-time, manually triggered)

- Accept a CSV exported from Swiver (products and customers in separate files).
- Schema mapping documented in `swiver-csv-mapping.md` (to be authored at import time).
- Idempotent re-import: match on `swiver_id` if available; else on normalized name + code.
- Surface conflicts (e.g. two Swiver IDs mapping to one local row) for admin resolution.
- Audit-logged.

### Manual push view

- For each `OrderDraft` with `status = 'approved'`, render a "Push to Swiver" view:
  - Customer name + Swiver ID.
  - Lines: code, qty, unit, formatted for direct paste into Swiver's devis form.
  - Notes.
- After the human pastes into Swiver, they mark the draft `exported` and enter the Swiver document reference.
- Audit-logged.

## Stage 2 responsibilities (if API exists)

### Read-sync job (Inngest, daily)

- Fetch updated products since last sync timestamp.
- Fetch updated customers since last sync timestamp.
- Upsert by `swiver_id`. New rows flagged for admin review (set `needs_review = true`).
- Conflicts (local edit vs Swiver edit) surfaced as a queue.
- Audit-logged.

### Health check

- Job exposes a status endpoint / dashboard tile showing last successful sync and any errors.

## Phase 4 responsibilities

### Push job

- Triggered when an order draft is approved.
- Server action constructs the Swiver devis payload from `OrderDraft` + `OrderLine` rows.
- API call to Swiver. On success: store `swiver_document_reference`, set `swiver_export_status = 'api_pushed'`, set draft status to `exported`.
- On failure: keep draft `approved`, set `swiver_export_status = 'failed'`, log error, surface in queue.

### Webhook listener

- Endpoint `/api/swiver/webhook`.
- Verify signature.
- Map Swiver events (devis.accepted, BC.created, BL.created, facture.issued) to local audit events on the corresponding `OrderDraft`.
- Update `swiver_export_status` accordingly.

## Failure modes (across stages)

| Failure | Behavior |
|---|---|
| Swiver API down | Push job retries with backoff; drafts stay `approved`; admin sees the queued failures. Manual copy/paste fallback always available. |
| CSV import column mismatch | Import refuses; surfaces diff vs expected mapping; admin re-exports or edits the mapping. |
| Conflict between local edit and Swiver edit | Conflict queue. Admin chooses winner; resolution audit-logged. |
| Webhook signature invalid | Reject 401, log to Sentry, do not process. |

## Out of scope

- Bidirectional real-time sync (premature; not planned).
- Replacing Swiver as accounting source of truth (forbidden until [Q14](../../01-product/open-questions.md) closes otherwise).
- Pushing factures or BLs (those originate in Swiver).

## Open questions

- See [Q2](../../01-product/open-questions.md) and Spike 1.
- Whether to mirror Swiver's chart of accounts for any reason. Default: no.
- Whether to capture Swiver-side stock movements (Phase 4+). Conditional on stock data becoming reliable.

## Related

- [../../02-architecture/adr/0009-swiver-integration-strategy.md](../../02-architecture/adr/0009-swiver-integration-strategy.md)
- [../../06-spikes/spike-swiver-api.md](../../06-spikes/spike-swiver-api.md)
- [../../02-architecture/data-model.md](../../02-architecture/data-model.md) — `swiver_id`, `swiver_export_status`, `swiver_document_reference`.
- [../order-intake/](../order-intake/)
