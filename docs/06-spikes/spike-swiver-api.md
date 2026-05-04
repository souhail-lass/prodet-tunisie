# Spike 1 — Swiver API capability

- **Status.** Not started.
- **Owner.** Souhail (credentials confirmed available — [Q2 answered 2026-05-03](../01-product/open-questions.md)).
- **Time box.** 1–2 days.
- **Blocks.** [ADR 0009](../02-architecture/adr/0009-swiver-integration-strategy.md), Slice B push-to-Swiver design, Phase 4 planning.

## Hypothesis

Swiver exposes either a documented public API or, failing that, a tolerable bulk-export mechanism that lets Prodet Platform synchronize products and customers and (eventually) push order documents.

## Why it matters

- If Swiver has read+write API: Phase 4 push-to-Swiver becomes a feature, not a separate workstream.
- If Swiver has read-only API: we sync customers/products automatically and keep manual push at MVP.
- If Swiver has no API at all but supports CSV export: we build a periodic-export ingestion pipeline; manual push forever.
- If Swiver has nothing usable: escalate to Père, reconsider [Q14 long-term posture](../01-product/open-questions.md), and accept that the platform's value is materially reduced until that conversation closes.

## Method

1. **Documentation review.** Search Swiver's website, help center, developer portal for any API docs (REST, OAuth, OpenAPI/Swagger spec). Estimated 1–2 hours.
2. **Account inspection.** With Père's credentials, log into the Swiver account and look for API token settings, integration settings, webhook settings. ~30 min.
3. **Direct contact.** Email Swiver support with a specific question list (see below). Plan for 1–3 days response time. Begin spike 2 in parallel while waiting.
4. **Hands-on test (if API exists).** Generate a token. Hit endpoints:
   - `GET /products` — list, paginate, fields.
   - `GET /customers` — list, paginate, fields.
   - `GET /devis` — list recent.
   - `POST /devis` (test mode if available) — create a draft devis with one line item.
   - Webhook test: configure a webhook for a non-destructive event (e.g. devis.created) and capture it.
5. **Bulk-export test (if no API).** Try the CSV export from the Swiver UI. Note format, completeness, frequency limits.

## Questions for Swiver support

- Is there a public API? Documented endpoint list?
- Authentication: OAuth 2.0, API key, or other?
- Read scope: products, customers, devis, BC, BL, factures.
- Write scope: can we create devis as drafts? BC?
- Webhooks: what events? signing?
- Rate limits.
- Sandbox / test environment.
- Pricing for API tier (if separate).

## Dataset

- The live Prodet Swiver account (read-only inspection).
- One created test devis (clearly marked) for the write probe — to be deleted after.

## Gate criteria

| Outcome | Decision |
|---|---|
| Read+write API with webhooks | ADR 0009 → Stage 3 viable. Plan Phase 4 push-to-Swiver. |
| Read-only API | ADR 0009 → Stage 2. Auto-sync customers/products; manual push remains. |
| No API but CSV export | ADR 0009 → Fallback path. Build CSV ingestion pipeline. Manual push forever. |
| No API, no usable export | Escalate. Reconsider Q14. Slice B v1 ships with one-time CSV import + manual push. |

## Time box

- **48 hours of Souhail's time** plus Swiver support response window.
- Swiver-support delay does not block bulk Phase 0 work; continue with other spikes.

## Result

_To fill in after running:_

- Documentation found: yes/no, link.
- API exists: yes/no.
- Auth method:
- Read endpoints tested:
- Write tested:
- Webhooks:
- Rate limits:
- Sandbox:
- Notes:

## Decision

_To fill in after running:_

- Stage selected (1 / 2 / 3 / fallback):
- ADR 0009 status: Proposed → Accepted (with stage X).
- Roadmap impact: any tripwire triggered?
- Followups (issues to file, support tickets to keep open):

## References

- [adr/0009-swiver-integration-strategy.md](../02-architecture/adr/0009-swiver-integration-strategy.md)
- [01-product/open-questions.md Q2, Q14](../01-product/open-questions.md)
- [03-modules/swiver-integration/](../03-modules/swiver-integration/)
