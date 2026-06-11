# Client access review TODO

> Status: Phase 1C auth foundation. Owner: Souhail. Last updated: 2026-05-15.

Phase 1A stores public `Espace client` access requests in `client_access_request`.

Phase 1C adds the Supabase Auth foundation, but still does not expose stored requests until the queue/detail UI is implemented:

- Supabase SSR server client,
- magic-link admin login,
- auth callback,
- `requireSession()`,
- `assertRole(...)`,
- protected `/[locale]/admin/*` layout,
- no-data placeholder at `/[locale]/admin/demandes-acces`.

Implemented in Phase 1B:

- deny-by-default admin auth guard,
- guarded review server action that cannot mutate until auth exists,
- no-data placeholder route at `/[locale]/admin/demandes-acces`,
- status vocabulary for `reviewing`, `needs_info`, `approved`, `rejected`.

Implemented in Phase 1C:

- real Supabase Auth session helper,
- app user lookup through `app_user.auth_id` or pre-provisioned email,
- magic-link login route at `/[locale]/connexion-admin`,
- callback route at `/auth/callback`,
- server-side admin layout protection.

The placeholder route deliberately loads no `client_access_request` rows and displays no personal data.

## Phase 1D

Build the real admin review surface now that the auth boundary exists.

Minimum work:

- access request queue filtered by status,
- request detail screen,
- actions for `reviewing`, `needs_info`, `approved`, `rejected`,
- audit log entries for each review action,
- no account invite until the request is approved by a human.

## Rule

Access approval prepares a future client invitation. It must not create a usable client portal account until Prodet validates the company and links the user to a `customer`.

## Implemented in Phase 1D

- Server-rendered admin queue at `/[locale]/admin/demandes-acces` with real `client_access_request` rows.
- Search by company, name, email, or phone.
- Status filter for `new`, `reviewing`, `needs_info`, `approved`, and `rejected`.
- Protected detail page at `/[locale]/admin/demandes-acces/[id]`.
- Review actions for note updates and status changes.
- Status changes write `updated_at`; `approved`, `rejected`, and `needs_info` also set `reviewed_at`.
- Review mutations require an authenticated active admin role and write an `audit_log` row.
- Approval still does not create a client account, send an invite, or push to Swiver.

## Implemented in Phase 1E

- Added `portal_invite` as the preparation record for future client portal activation.
- Approving a `client_access_request` creates or refreshes one `portal_invite` with status `prepared`.
- Prepared invitations copy the target email and company name from the approved access request.
- Prepared invitations do not include a usable token yet; `token_hash` and `expires_at` remain empty until the real send flow exists.
- The admin detail page shows the prepared invitation state and a disabled `Envoyer invitation` action.
- No open registration, client dashboard, reorder/history/usual-products flow, Swiver integration, or automatic customer creation was added.

## Implemented in Phase 1F

- Admins can send a prepared invitation from the protected access-request detail page.
- Sending an invitation generates a high-entropy one-time token and stores only `token_hash`.
- Sent invitations get `expires_at` set to seven days after generation.
- If Resend is configured, the activation email is sent to the approved request email.
- If Resend is not configured in local development, the admin UI shows a development activation link.
- Public activation route exists at `/[locale]/activation-client?token=...`.
- Activation validates the token hash server-side and requires status `sent` with a non-expired `expires_at`.
- Accepted, revoked, expired, and invalid tokens cannot be reused.
- Activation marks the invite `accepted` only after the invitee confirms.
- Admins can revoke prepared, sent, or expired invitations.
- Audit log entries are written for token preparation, email/manual delivery preparation, acceptance, expiry, and revocation.
- Still not implemented: client user creation, customer linking, portal dashboard, reorder/history/usual-products, Swiver integration, and open registration.

## Implemented in Phase 1G

- Accepting a valid invitation now creates or links a local `customer` from the approved access request.
- Accepting a valid invitation now creates or links an `app_user` with role `customer_user` for the invited email.
- Accepting a valid invitation now creates `user_customer` with role `owner` for the linked customer.
- Client login is invitation-gated through `/[locale]/connexion-client`; only activated client emails can request a Supabase magic link.
- `/auth/callback` accepts safe redirects to `/[locale]/client` in addition to admin redirects.
- `/[locale]/client` is protected by Supabase session and server-side `user_customer` checks.
- The client portal shell shows customer name, activation status, disabled future actions, and no fake business data.
- Audit log entries are written for customer create/link, app user creation, user-customer link, and portal activation.
- Still not implemented: full dashboard, reorder, usual products, history, stats, order submission, prices, stock, and Swiver integration.

## Implemented in Phase 2A

- Replaced the minimal `/[locale]/client` shell with a real authenticated dashboard layout.
- Added protected client portal navigation with only `Tableau de bord` active.
- Dashboard now shows real linked customer context: company name, sector if present, city/zone if present, and access status.
- Added premium but practical quick-action cards for future `Recommander rapidement` and `Nouvelle demande`.
- Added future cards for `Produits habituels`, `Historique des demandes`, `Modèles de commande`, and `Contact Prodet`.
- Added a compact list of future portal capabilities without fake counts, products, history, prices, stock, or Swiver documents.
- Added a real Prodet contact block using the existing company email and phone.
- Still not implemented: reorder logic, usual products management, full history, stats, order submission, prices, stock, and Swiver integration.

## Implemented in Phase 2B

- Added `customer_usual_product` as the narrow customer-scoped usual-products foundation.
- Added the protected `/[locale]/client/produits-habituels` page.
- The page fetches usual products server-side for the authenticated customer's `user_customer` link only.
- The dashboard `Produits habituels` card now links to the real page and shows a real configured count, or `À configurer`.
- The usual-products page shows only real assigned products and a clean empty state when none exist.
- Added a disabled future action for preparing a request from usual products.
- Admin assignment remains a TODO; it needs a protected product search/assignment workflow and should not be faked in the client UI.
- Still not implemented: reorder logic, request submission, full history, stats, prices, stock, Swiver integration, and fake orders.

## Implemented in Phase 2C

- Added `/[locale]/client/nouvelle-demande` as a protected request builder.
- The builder starts from the authenticated customer's active usual products.
- Clients can search real product records, add products, adjust quantities, remove lines, and add notes.
- Submission validates the current client session, membership, product IDs, quantities, and line count server-side.
- Submitted requests create `order_draft` rows with `source = portal`, `status = review`, and `swiver_export_status = none`.
- Submitted request lines create `order_line` rows linked to selected real products.
- Added `audit_log` action `portal_request.submitted`.
- Dashboard and usual-products CTAs now open the request builder.
- Draft saving remains deferred because the existing `order_status` enum does not include `draft`.
- Still not implemented: Swiver integration, official orders, prices, stock, payment, request history/status, fake stats, and fake history.

## Implemented in Phase 2D

- Added `/[locale]/client/historique` as a protected portal request history page.
- Added `/[locale]/client/historique/[id]` as a protected request detail page.
- History queries are scoped server-side to `order_draft.customer_id = current customer` and `source = portal`.
- Detail queries return not found for requests outside the authenticated customer's scope.
- Added client-friendly status labels for the existing `order_status` enum.
- History now shows real request count, product summary, delivery/timing context, and detail links.
- Detail now shows submitted lines, quantities, units, notes, request metadata, and a simple safe timeline.
- Added `Copier pour mon ERP` as a client-side copy action from visible request data only.
- Dashboard and client navigation now link to request history with real count/last status.
- Still not implemented: duplicate/reorder from previous request, complex stats, prices, stock, payment, checkout, fake delivered orders, and Swiver integration.

## Implemented in Phase 2E

- Added previous-request duplication through `/[locale]/client/nouvelle-demande?from=<order_draft_id>`.
- History rows now expose `Reprendre`.
- Request detail now exposes `Reprendre cette demande`.
- The builder preloads previous matched product lines with quantities, units, and line notes.
- Prefill is validated server-side against current customer ownership and `source = portal`.
- Submitting a duplicated request creates a new `order_draft`; the previous request is never modified.
- Duplication metadata is recorded in `order_draft.raw_inbound.duplicatedFromOrderDraftId` and `audit_log.metadata`.
- Added audit action `portal_request.submitted_from_previous`.
- Dashboard `Recommander rapidement` now links to the latest previous request when one exists, otherwise to the normal builder.
- Still not implemented: admin review queue for portal-submitted requests, official orders, prices, stock, payment, checkout, fake data, and Swiver integration.

## Implemented in Phase 2F

- Added `/[locale]/admin/demandes-portail` as the protected admin queue for portal requests.
- Added `/[locale]/admin/demandes-portail/[id]` as the protected detail view.
- Queue reads only `order_draft.source = portal`.
- Queue supports search by reference, customer, creator email, and product text.
- Queue supports filtering by existing `order_status` values.
- Detail shows customer context, portal metadata, raw inbound data, lines, quantities, units, notes, matched product IDs, and audit timeline.
- Admin actions can update status to `review`, `approved`, or `rejected`.
- Status actions require admin auth, update `updated_at`, write `audit_log`, and never create Swiver documents.
- Client history reflects status updates through its existing `order_draft.status` read path.
- Admin navigation now links to both `Demandes d’accès` and `Demandes portail`.
- Still not implemented: Swiver export, official orders, devis, invoices, BLs, prices, stock, payment, checkout, fake delivery statuses, and client-side stats.

## Implemented in Phase 2G

- Replaced the basic client dashboard summaries with real customer-scoped operational summaries.
- `/[locale]/client` now reads dashboard data through a dedicated server-side selector.
- Summary cards show only real portal data: total submitted portal requests, requests in review, approved count, rejected count, latest request status, and usual-products count.
- Added an `Activité récente` section showing the latest 5 portal requests for the current customer only.
- Recent activity rows show status, created date, line count, short product summary, `Voir`, and `Reprendre`.
- Added practical cues derived from real data: current-month activity, requests waiting for review, latest-request status, and usual-products configuration.
- Added a latest-request timeline preview from real request status and timestamps.
- Empty states cover no requests, no recent activity, no usual products, no approved requests, and no rejected requests.
- Dashboard quick actions remain scoped to client portal flows: `Nouvelle demande`, `Produits habituels`, `Historique`, and `Reprendre dernière demande` only when a previous request exists.
- Still not implemented: Swiver integration, official orders, devis, invoices, BLs, prices, stock, payment, checkout, revenue analytics, fake KPIs, and full Phase 3 portal workflows.

## Implemented in Phase 2H (portal UX + espace-client)

- Redesigned `/[locale]/espace-client` with working magic-link form wired to `requestClientMagicLink`.
- Portal shell redesign: sidebar, bottom nav, metrics, panels (`src/components/portal/`).
- Dashboard activity strip: 90-day windows, average days between requests, top products leaderboard.
- Screenshots captured in `screenshots/portal-redesign/`.

## Implemented in Phase 2I (documents module)

- Schema: `customer_document`, `order_draft_document` (migration `0006_hesitant_jackal`).
- Protected `/[locale]/client/documents` with upload, list, download (signed URL), delete.
- Attach/detach documents on request detail `/client/historique/[id]`.
- Supabase Storage bucket `customer-documents` (private); env `SUPABASE_CUSTOMER_DOCUMENTS_BUCKET`.
- Rate limits, MIME allow-list, 25 MB cap, audit log on mutations.

## Implemented in Phase 2J (Swiver architecture)

- ADR 0012 — adapter contract, sync boundaries, webhook design.
- `src/integrations/swiver/` — disabled + HTTP adapters; `getSwiverAdapter()` by `SWIVER_MODE`.
- `POST /api/webhooks/swiver` + `swiver_webhook_event` table (migration `0007_sudden_wilson_fisk`).
- Webhook signature verification mocked until Swiver documents the algorithm.
- No live business sync; no autonomous Swiver writes.

## Handoff (2026-06-06)

Claude Code onboarding docs added:

- [CLAUDE.md](../../CLAUDE.md)
- [docs/05-ops/claude-code-handoff.md](../05-ops/claude-code-handoff.md)
- [docs/05-ops/project-status.md](../05-ops/project-status.md)
- [docs/05-ops/secrets-checklist.md](../05-ops/secrets-checklist.md)
- [docs/00-overview/developer-guide.md](../00-overview/developer-guide.md)
