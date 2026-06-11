# Project status — single source of truth

> Owner: Souhail. Last updated: 2026-06-06.
> For Claude Code onboarding see [claude-code-handoff.md](claude-code-handoff.md).

## Health check (last verified 2026-06-06)

| Check | Result |
|---|---|
| `pnpm typecheck` | Pass |
| `pnpm lint` | Pass (5 warnings in `prodet-agents/`, not main app) |
| `pnpm test` | 36/36 pass |
| `pnpm build` | Pass (verified in prior sessions) |
| Dev server | `pnpm dev` → http://localhost:3004 |

## What is built

### Public site `(public)`

- Homepage v3, about, sectors, catalog (fixture data), product detail, category pages.
- Contact form, devis (quote request), legal pages.
- `espace-client`, `devenir-client`, `activation-client`.
- Client-side product search (normalized token AND-match + rank).
- i18n: FR complete; AR/EN scaffolded.

### Auth `(auth)`

- Client magic link: `/connexion-client`
- Admin magic link: `/connexion-admin`
- Callback: `/auth/callback` (links Supabase user to `app_user`)

### Client portal `(client)` — Phase 2 complete + documents

| Route | Feature |
|---|---|
| `/client` | Dashboard with real metrics (90d activity, top products, status counts) |
| `/client/nouvelle-demande` | Request builder, search, submit → `order_draft` |
| `/client/historique` | Request list scoped to customer |
| `/client/historique/[id]` | Detail, ERP copy, document attach/detach |
| `/client/produits-habituels` | Usual products list |
| `/client/documents` | Upload/download/delete customer documents (Supabase Storage) |

### Admin `(admin)` — partial

| Route | Feature |
|---|---|
| `/admin/demandes-acces` | Access request queue + search/filter |
| `/admin/demandes-acces/[id]` | Review, approve/reject, invite send/revoke |
| `/admin/demandes-portail` | Portal request queue |
| `/admin/demandes-portail/[id]` | Status updates (review/approved/rejected) |

### Integrations

| Integration | Status |
|---|---|
| Swiver adapter | Code complete; default `disabled`; HTTP adapter for sandbox/prod |
| Swiver webhook | `POST /api/webhooks/swiver` — persists events; signature **mocked** |
| Resend (invite email) | Optional — dev shows manual activation link if unset |
| Postmark inbound | Not wired |
| Inngest jobs | Not wired |
| AI extraction / matching | Not wired (schema + ADRs exist) |

### Database

8 migrations applied (`0000` extensions → `0007` swiver webhook events).

Key portal tables: `client_access_request`, `portal_invite`, `customer_usual_product`, `customer_document`, `order_draft_document`, `swiver_webhook_event`.

## What is NOT built

| Area | Notes |
|---|---|
| Order intake console | Paste email, PDF upload, AI extraction, matching UI |
| Public catalog from DB | Still uses `src/data/products.ts` fixtures |
| Swiver live sync | Needs sandbox stable + endpoint confirmation |
| Real webhook HMAC | TODO in webhook route |
| `listDocumentsForCustomer` Swiver | Endpoint not mapped yet |
| Admin usual-product assignment UI | Client reads `customer_usual_product`; admin assign TBD |
| Inngest background jobs | ADR 0010 planned |
| Resend/Postmark production email | Env vars optional |
| Full AR/EN translations | FR is source of truth |
| Rate limit at scale | In-process only; needs Redis when multi-instance |

## Known issues / caveats

1. **Magic link no email** — If email is not an active `customer_user` with `user_customer`, OTP is not sent but UI shows success (anti-enumeration).
2. **`.next` corruption** — If `/fr` returns 500 ENOENT manifests: `rm -rf .next && pnpm dev`.
3. **Swiver sandbox** — Was intermittently down; adapter tested against documented endpoints only.
4. **Webhook security** — Mock signature verification; do not expose publicly without WAF/IP allow-list until fixed.
5. **ESLint warnings** — `prodet-agents/` subfolder has img warnings; excluded from main app.
6. **Spike risks** — Swiver API shape, extraction accuracy, matching quality unvalidated.

## Active initiative: design system rebuild

Souhail is handing visual/design work to **Claude Design**. Feed document:

- [`docs/04-design/design-system-rebuild-brief.md`](../04-design/design-system-rebuild-brief.md)
- Logo: `public/brand/Logo_Prodet_page-0001_1_-removebg.svg`
- Portal reference screenshots: `screenshots/portal-redesign/`

Implementation stays in Tailwind v4 `@theme` + shadcn/ui. Do not change product scope or add prices/checkout.

## Suggested next priorities (not committed)

Ordered by typical business value; Souhail decides:

1. **Admin usual-product assignment** — so portal clients have real usual products without SQL seed.
2. **Order intake console (Slice B)** — the original MVP differentiator (AI extraction + review).
3. **Swiver sandbox hardening** — real webhook HMAC, document list endpoint, status enum pinning.
4. **DB-backed public catalog** — migrate fixtures to Postgres with admin CRUD.
5. **Resend production** — invite emails without dev activation links.
6. **Portal UX polish** — history, mobile, copy (screenshots in `screenshots/portal-redesign/`).

## Phase history pointer

Detailed build log: [docs/03-modules/client-access-review-todo.md](../03-modules/client-access-review-todo.md) (Phases 1B–2G).

Developer architecture doc: [docs/00-overview/developer-guide.md](../00-overview/developer-guide.md).
