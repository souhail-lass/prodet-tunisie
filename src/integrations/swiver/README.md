# Swiver adapter

Server-side integration surface between Prodet Platform and Swiver. See
[ADR 0012](../../../docs/02-architecture/adr/0012-swiver-integration-architecture.md)
for the full architectural rationale.

## Status

**Disabled by default** (`SWIVER_MODE=disabled`). `getSwiverAdapter()`
returns the no-op adapter that yields empty lists / nulls.

**Live connection CONFIRMED (2026-06-08)** against the real tenant:

- Base URL: **`https://server.swiver.io`** (NOT `sandbox.swiver.io`, which is the web app).
- Auth: **`X-AUTH-TOKEN: <SWIVER_API_KEY>`** header (NOT `Authorization: Bearer`).
- Routes use a **trailing slash**; a no-slash request 301-redirects to it.
- `GET /open_api/products/?offset=&limit=` → `{ count, countArchived, countEnabled, rows: [...] }` (510 enabled products live).
- `GET /open_api/customers/?offset=&limit=` → same envelope (145 customers live).
- Verify in dev: `GET /api/dev/swiver` (dev-only route, 404 in prod).

When `SWIVER_MODE=sandbox|production` is set together with
`SWIVER_API_BASE_URL` and `SWIVER_API_KEY`, the resolver returns the live
HTTP adapter. Mapped endpoints:

- `GET /open_api/customers/` (+ single customer GET) — confirmed live
- `GET /open_api/products/` (+ single product GET) — confirmed live
- `GET /open_api/document/:id/` (document projection — type/state mapped heuristically until enums are pinned)

`listDocumentsForCustomer` remains unmapped until Swiver exposes a
confirmed list-by-customer path.

## Files

| File                                          | Purpose                                                          |
| --------------------------------------------- | ---------------------------------------------------------------- |
| [`types.ts`](types.ts)                        | Ports + entities (`SwiverCustomer`, `SwiverDocumentSummary`, …)  |
| [`disabled-adapter.ts`](disabled-adapter.ts)  | Default no-op implementation                                     |
| [`http-adapter.ts`](http-adapter.ts)          | Bearer-auth HTTP transport + ports; throws on unmapped endpoints |
| [`index.ts`](index.ts)                        | Resolver: `getSwiverAdapter()` returns the active adapter         |

## Prerequisites before wiring `http-adapter.ts`

Listed in full in ADR 0012. Short version (what we need from Souhail):

1. Swiver sandbox base URL + org slug (e.g. `https://sandbox.swiver.io`).
2. Swiver API token (sandbox), and rotation policy.
3. Production base URL + token (when sandbox is validated).
4. OpenAPI catalogue, or authenticated docs URL covering the Customers,
   Products, and Documents endpoint shapes.
5. Confirmation that `customer.swiver_id` is the value Swiver uses to
   scope its document endpoints (vs. an external code or VAT number).
6. Document-type and status enum mappings (devis / BC / BL / facture; draft
   / sent / paid / cancelled).
7. Webhook capability + signing secret (if it exists).
8. Rate-limit posture (documented or empirical).

## Env variables

Declared in `src/lib/env.ts`:

| Env var                 | Meaning                                                            |
| ----------------------- | ------------------------------------------------------------------ |
| `SWIVER_MODE`           | `disabled` (default) \| `sandbox` \| `production`                  |
| `SWIVER_API_BASE_URL`   | E.g. `https://sandbox.swiver.io` (no trailing slash, no `/open_api`) |
| `SWIVER_API_KEY`        | Bearer token issued via Swiver Intégration → Application web        |
| `SWIVER_WEBHOOK_SECRET` | Reserved for future real signature verification (currently unused — see webhook route). |

If `SWIVER_MODE !== 'disabled'` but the URL or key is missing, the
resolver logs a warning and falls back to the disabled adapter. This
prevents a half-configured production deploy from rendering 500s.

## Usage

```ts
import { getSwiverAdapter } from '@/integrations/swiver';

const swiver = getSwiverAdapter();
if (swiver.mode === 'disabled') {
  // Render the manual-export UI; no live mirror is available.
  return;
}

const customers = await swiver.customers.listCustomers({});
```

`swiver.mode` is the single source of truth for "is Swiver live?". UI
should never read environment variables to decide whether to show
Swiver-backed surfaces.

## Webhook receiver

`POST /api/webhooks/swiver` is mounted regardless of `SWIVER_MODE`.

**Development posture (Swiver sandbox intermittently unavailable):**
signature verification is **mocked**. Every accepted payload is stored with
`signature_verified = true` and `error = 'signature_verification_mocked_development_only'` so operators can grep the audit table for rows recorded before crypto verification ships. The handler includes a prominent `TODO` to replace this with Swiver's real signing scheme once documented.

Also:

- Records every payload in `swiver_webhook_event` (signature header snapshot,
  source IP, UA).
- Returns 200 with `{ ok: true, id, signatureVerified: true, warning }`.
  Returns 503 if the durable insert failed.
- Deduplicates by `event_id` when Swiver supplies one in the payload.

The route does NOT advance business state. Processing belongs to a future
background job that walks `status = 'received'`.
