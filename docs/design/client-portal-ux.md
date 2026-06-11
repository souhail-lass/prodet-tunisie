# Client portal UX

> Status: Phase 3 UX proposal. Owner: Souhail. Last updated: 2026-05-15.
> Module spec: [../03-modules/client-portal.md](../03-modules/client-portal.md). Flow spec: [../03-modules/client-portal-flows.md](../03-modules/client-portal-flows.md). Data model: [../03-modules/client-portal-data-model.md](../03-modules/client-portal-data-model.md).

## UX Goal

The portal should feel like a serious B2B reorder desk, not a consumer shop and not a generic SaaS dashboard.

A returning client should be able to:

1. log in,
2. start from last request or usual products,
3. adjust quantities,
4. choose delivery site,
5. submit to Prodet,

in under 60 seconds.

The portal should create repeat behavior by making Prodet ordering cleaner than phone/email while still respecting Prodet's quote-first business model.

## UX Principles

1. **Memory first.** Show last request, usual products, and later templates before full catalog browsing.
2. **Request, not checkout.** Use `demande`, `réapprovisionnement`, `recommander`, and `envoyer la demande`. Avoid `panier`, `checkout`, `acheter`, and `payer`.
3. **Human review visible.** Every submitted request is reviewed by Prodet. Do not imply automatic order acceptance.
4. **B2B density.** Prefer compact tables, product rows, filters, status chips, and operational summaries.
5. **No fake self-service.** Access is validated; addresses are reviewed; Swiver actions remain Prodet-controlled.
6. **ERP-friendly output.** Copy/export exists because client buyers often need to paste the request into their own process.
7. **Reliable data only.** Stats must come from portal requests unless Swiver history is imported and trusted.

## Information Architecture

Public:

- `Espace client`
- `Déjà client`
- `Devenir client Prodet`
- `Demander un devis sans compte`

Authenticated:

- `Tableau de bord`
- `Produits habituels`
- `Nouvelle demande`
- `Historique`
- `Statistiques`
- `Coordonnées`
- `Contact Prodet`

Secondary authenticated surfaces:

- request builder,
- delivery site selector,
- request review/submit,
- request detail,
- copy/export panel,
- template detail later.

## Public Entry Page

Route recommendation: `/[locale]/espace-client`.

Page role:

- separate existing clients from new professional buyers,
- explain restricted B2B access,
- keep public quote path available.

Layout:

- compact hero with `Espace client Prodet`,
- two primary panels:
  - `Déjà client`
  - `Devenir client Prodet`
- secondary strip:
  - `Demander un devis sans compte`
- three short proof points:
  - `Accès réservé aux professionnels validés`
  - `Produits habituels et réapprovisionnement`
  - `Demandes vérifiées par Prodet`

Avoid:

- large marketing hero,
- fake product access claims,
- instant account creation language.

## Déjà Client UX

Fields/actions:

- email,
- password or magic-link flow,
- access code activation,
- `Accéder à mon espace`,
- `Recevoir un lien de connexion`,
- `Je n'ai pas encore d'accès`.

States:

- unknown email -> guide to access request,
- expired code -> ask for a new code,
- suspended access -> contact Prodet,
- unlinked user -> no data, contact Prodet.

Copy:

> Connectez-vous avec l'adresse invitée par Prodet. Si vous avez reçu un code d'accès, utilisez-le pour activer votre espace.

## Devenir Client Prodet UX

The form should feel professional and bounded.

Sections:

1. Société.
2. Contact.
3. Activité.
4. Zone de livraison.
5. Produits ou besoins.

Submit copy:

> Envoyer la demande d'accès

Confirmation:

> Demande reçue. Prodet vous contactera après vérification.

Do not say:

- `Compte créé`,
- `Accès immédiat`,
- `Inscription gratuite`.

## Authenticated Shell

Desktop layout:

- left sidebar or compact top nav,
- organization name clearly visible,
- primary action `Nouvelle demande`,
- contact Prodet shortcut,
- logout/user menu.

Mobile layout:

- top bar with organization name,
- bottom or drawer navigation,
- primary action visible but not blocking content.

Navigation order:

1. `Tableau de bord`
2. `Produits habituels`
3. `Nouvelle demande`
4. `Historique`
5. `Statistiques`
6. `Coordonnées`
7. `Contact`

## Dashboard

Dashboard job: resume ordering fast.

Primary modules:

- `Recommander la dernière demande`
- `Produits habituels`
- `Demande en cours` if a saved draft exists later
- latest request status
- default delivery site
- quick stats preview
- Prodet contact card

Do not include:

- generic welcome cards,
- decorative metrics,
- fake account health,
- marketing sections.

Recommended hierarchy:

1. Big primary action row: last request + usual products.
2. Latest status.
3. Stats preview.
4. Company/contact summary.

## Usual Products

This is the main reorder surface.

Desktop:

- table-like product rows,
- image cell,
- product name,
- conditionnement,
- category/family,
- last requested date,
- default quantity,
- quantity stepper,
- note action,
- add/remove state.

Mobile:

- compact product rows,
- image left,
- name and conditionnement right,
- quantity controls below,
- note collapsed.

Interactions:

- `Tout ajouter avec quantités habituelles`,
- per-row `Ajouter`,
- quantity edit,
- `Ajouter une note`,
- search within usual products.

Empty state:

> Aucun produit habituel n'est encore configuré. Contactez Prodet pour préparer votre liste.

## Reorder Last Request

Screen/job:

- show copied lines from previous submitted request,
- make the copied origin visible,
- allow fast quantity edits,
- mark unavailable/retired products if any,
- proceed to delivery/review.

Copy:

> Dernière demande reprise. Ajustez les quantités avant l'envoi à Prodet.

## Request Builder

The builder is not called cart.

Recommended title:

> Demande en cours

Layout:

- left/main: line items,
- right/aside: summary, delivery site, submit state,
- mobile: line items first, sticky summary only if it does not cover fields.

Line item fields:

- product image,
- product name,
- conditionnement,
- quantity,
- unit,
- line note,
- remove.

Request-level fields:

- delivery site,
- requested delivery note,
- general note.

Submit CTA:

> Envoyer la demande

## Catalog/Search Inside Portal

Portal search is for adding missing items, not browsing everything.

Search priority:

1. usual products,
2. products from previous requests,
3. sector-relevant products,
4. eligible public catalog products.

Result row:

- product image,
- name,
- conditionnement,
- short description,
- category/family,
- `Ajouter`.

Behavior:

- suggestions close on outside click,
- Escape closes suggestions,
- Enter selects focused result,
- current draft is never lost.

Avoid result count unless it helps the task.

## Delivery Site Selector

UX requirements:

- show default site first,
- show saved sites as clear rows,
- show address and contact if available,
- allow `Adresse à préciser` as request note,
- allow `Demander l'ajout d'un site` later.

Copy:

> Choisissez le site de livraison concerné par cette demande.

Client cannot silently edit official addresses. Changes are requests.

## Review and Submit

Before submit, show:

- customer,
- delivery site,
- lines,
- quantities,
- notes,
- Prodet review reminder.

Review reminder:

> Prodet vérifie les références, quantités et modalités avant traitement.

Submit:

> Envoyer la demande

Success:

> Demande envoyée. Elle apparaît dans votre historique avec le statut En vérification.

## History

History is the client's proof that the portal is useful.

Desktop columns:

- reference,
- date,
- delivery site,
- status,
- products summary,
- actions.

Filters:

- date range,
- status,
- delivery site,
- product.

Mobile:

- stacked request cards,
- status chip visible,
- first 2 product names,
- `Voir la demande`.

## Request Detail

Sections:

1. Header: reference, status, submitted date.
2. Delivery site.
3. Product lines.
4. Notes.
5. Status timeline.
6. Copy/export actions.
7. Contact Prodet.

Copy/export panel:

- primary: `Copier la demande`,
- later: `Exporter CSV`, `Exporter PDF`.

Status labels:

- `Envoyée`
- `En vérification`
- `Information demandée`
- `Confirmée par Prodet`
- `En traitement`
- `Traitée`
- `Annulée`

Do not expose internal queue statuses directly.

## Stats

Stats should be useful, restrained, and reliable.

MVP widgets:

- `Produits les plus demandés`
- `Demandes par mois`
- `Catégories les plus utilisées`
- `Fréquence de réapprovisionnement`

Rules:

- label stats as based on portal requests if Swiver history is not imported,
- no spending in MVP,
- no fake savings,
- no ranking across other clients.

Copy:

> Statistiques basées sur vos demandes envoyées depuis l'espace client.

## Company and Contact Info

Keep mostly read-only.

Sections:

- company identity,
- main contacts,
- delivery sites,
- Prodet account contact if assigned later.

Actions:

- `Demander une modification`
- `Contacter Prodet`

Do not allow client-side silent writes to Swiver/customer master data.

## Visual Direction

Portal visual language should be:

- operational,
- compact,
- product-led,
- blue/navy dominant,
- white cards/surfaces,
- green only for success/confirmation,
- no large decorative green theme,
- no consumer shop cues.

Use:

- dense rows,
- strong dividers,
- stable image cells,
- tabular numerals,
- clear status chips,
- restrained icons.

Avoid:

- oversized marketing cards,
- dashboard vanity metrics,
- nested cards,
- checkout-like cart panels,
- price/stock placeholders.

## Component Plan

Portal-specific components:

- `PortalEntry`
- `PortalAccessCard`
- `PortalLoginForm`
- `AccessRequestForm`
- `PortalShell`
- `PortalNav`
- `PortalDashboard`
- `QuickReorderPanel`
- `UsualProductTable`
- `PortalProductSearch`
- `RequestBuilder`
- `RequestLineItem`
- `QuantityStepper`
- `LineNoteControl`
- `DeliverySiteSelector`
- `RequestReview`
- `RequestHistoryTable`
- `RequestStatusChip`
- `RequestTimeline`
- `CopyRequestButton`
- `ExportActions`
- `PortalStatsGrid`
- `CompanyInfoPanel`
- `PortalContactPanel`

Shared components:

- `Button`
- `Card`
- `SectionHeader`
- `ProductImageFrame`
- `Input`
- `Select`
- `Textarea`
- `Badge`
- `Tooltip`
- `EmptyState`
- `LoadingState`
- `ErrorState`

## Accessibility

- Forms need visible labels.
- Quantity controls must be keyboard accessible.
- Search suggestions need arrow-key navigation and Escape-to-close.
- Status cannot rely on color alone.
- Copy success must be announced to assistive tech.
- Tables need responsive alternatives on mobile.
- Focus states must work on navy, white, and off-white surfaces.
- AR/RTL must preserve product rows, steppers, and timeline order.

## UX Acceptance Criteria

- Returning client can reorder last request in under 60 seconds.
- Usual-products flow does not require full catalog browsing.
- Client can create a new request from search without losing draft lines.
- Every request captures quantities, optional line notes, request note, and delivery site/address.
- Submitted request clearly says Prodet will verify before treatment.
- History/detail/status are clear and customer-safe.
- Copy-to-clipboard is easy to find and produces useful plain text.
- Stats are useful and not misleading.
- No screen shows price, stock, checkout, payment, or automatic order confirmation.
- Visual system feels like Prodet's B2B website, but denser and more operational.

