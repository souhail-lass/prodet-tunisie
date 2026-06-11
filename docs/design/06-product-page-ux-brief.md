# Product page UX brief

> Status: Draft synthesis. Owner: Souhail. Last updated: 2026-05-13.
> Scope: public product detail UX direction only. No application code.

## Purpose

The product detail page should feel like a professional specification page with a clear quote path. It must help a buyer understand the product, confirm format and use context, and request a quote without public prices, stock, checkout, fake documents, or unsupported chemical claims.

## Page job

Each product page must answer:

1. What product is this?
2. What format or conditionnement does it come in?
3. What professional need and sector is it for?
4. What facts are known and safe to publish?
5. How does the buyer request a quote for this product?

## MVP scope rules

- Show only public-visible manufactured products.
- Do not show public prices or public stock.
- Do not show checkout, payment, account pricing, or customer login.
- Do not show SDS/FDS, fiche technique, label, certificate, or claim documents unless real files exist and are approved.
- Do not invent pH, dilution, efficacy, food-contact, virucidal, bactericidal, ecological, or regulatory claims.
- Do not mention Swiver on the public product page.

## Page structure

### 1. Breadcrumb and context

Show a compact breadcrumb:

`Accueil / Catalogue / {Produit}`

Optional context chips:

- family,
- professional need,
- manufactured by Prodet.

Do not create deep sector-page breadcrumbs at MVP if sector detail pages are not implemented.

### 2. Product hero

The first screen must include product identity, procurement facts, and quote action.

Required left/right content:

- primary packshot or format-specific placeholder,
- localized public name,
- canonical/internal product name shown as secondary if appropriate,
- public product code/reference if approved,
- conditionnement,
- unit of sale if known,
- recommended sectors,
- short use-case description,
- primary CTA: `Demander un devis pour ce produit`,
- secondary action: `Retour au catalogue` or `Nous contacter`,
- WhatsApp only if the public number is confirmed.

Conditionnement and quote action must not be buried below long description.

### 3. Overview

Short, practical paragraph:

- what the product is used for,
- where it is used,
- any limits or caveats needed for honesty.

Use professional buyer language. Avoid chemical detail unless verified and useful.

### 4. Usage and applications

Use compact sections, tables, or lists.

Possible fields when data exists:

- professional need,
- target surfaces,
- sectors,
- format/packaging,
- dilution/use method,
- scent/color,
- storage note,
- warnings or handling notes.

If data is missing, hide the field. Do not show placeholder technical values.

### 5. Specifications

Use a label-like spec panel inspired by Prodet packaging.

Suggested fields:

- conditionnement,
- unité de vente,
- famille,
- catégorie,
- usage principal,
- secteurs recommandés,
- reference/code if public,
- `Fabriqué par Prodet` flag.

Do not call future resold items `Fabriqué par Prodet`; when Phase 2 adds them, use a separate `Distribué par Prodet` treatment.

### 6. Documents

Reserve a clean document zone in the template, but render it only when documents exist.

Allowed document types when approved:

- fiche technique,
- FDS/SDS,
- étiquette,
- notice/procédure,
- photo HD.

Empty-state rule:

- If no documents exist, hide the document zone or show a quote/contact prompt for product information.
- Do not show disabled fake download buttons.
- Do not generate technical documents with AI.

### 7. Related products

Show 3-4 related manufactured products from the same family, professional need, or sector.

Each related card must preserve:

- image/placeholder,
- name,
- conditionnement,
- quote path.

Do not use unrelated products only to fill space.

### 8. Quote rail or sticky CTA

Desktop:

- quote rail can remain visible beside product content,
- include product name, quantity input if supported, and `Demander un devis`,
- keep phone/WhatsApp secondary.

Mobile:

- use a compact sticky bottom CTA only if it does not block content or form fields,
- otherwise repeat CTA after major sections,
- quantity and selection state must be accessible without hover.

## Quote/devis UX notes

Product-page CTA behavior:

- add the current product to the quote selection with a default quantity of 1 or ask for quantity in the quote form,
- preserve product slug/name/conditionnement in the quote request,
- navigate to `/devis` or show a clear next-step confirmation,
- allow the buyer to continue browsing after adding from catalog cards, but product detail CTA can route directly to quote.

Technical-document request behavior:

- if a buyer asks for a fiche/FDS that is not hosted, route to a product-specific quote/contact request,
- make it clear Prodet will respond directly,
- do not pretend the file is downloadable.

## Product image requirements

The product page uses the same image system as the catalog, but at a larger size.

Requirements:

- transparent 1:1 packshot master,
- optimized web derivative for runtime,
- `object-contain`,
- no cover crop,
- neutral white or light surface behind the transparent packshot,
- no baked checkerboard,
- no label blur from over-compression,
- product fills 75-85% of image height,
- caps, handles, pumps, triggers, and labels fully visible.

Secondary imagery:

- label close-up can support details later,
- factory/use-case photos are secondary, not a replacement for the packshot,
- avoid generic stock context photos.

Missing image rule:

- use format-specific placeholder,
- alt text should say the product image is coming,
- the catalog audit still marks the product as missing an approved image.

## Copywriting direction

Product pages should sound like procurement support.

Use:

- `Conditionnement`,
- `Usage principal`,
- `Recommandé pour`,
- `Demander un devis pour ce produit`,
- `Prix communiqués sur devis`,
- `Fiche technique disponible sur demande` only if approved.

Avoid:

- `acheter`,
- `en stock`,
- `promotion`,
- `garanti efficace contre...` unless backed by approved documentation,
- vague claims like `qualité supérieure`,
- invented delivery times,
- unsupported certifications.

## Responsive behavior

Desktop:

- two-column hero with large product image and quote/spec panel,
- sticky quote rail only when it remains stable and non-intrusive,
- content sections use compact anchors or stacked blocks.

Tablet:

- image and details can stack, but quote action remains in the first visible content group,
- spec panel remains readable without horizontal scroll.

Mobile:

- product name, conditionnement, and quote CTA appear before long text,
- image stays fully visible and not cropped,
- metadata uses stacked rows,
- sticky CTA does not overlap content,
- long names wrap cleanly in FR, AR, and EN.

## Accessibility

- Product image alt text describes product and format.
- CTA names include product context where useful.
- Tabs/accordions, if used, are keyboard accessible.
- Sticky CTA does not trap focus.
- Document links include file type and language when available.
- Technical tables have readable headers.

## Implementation phases

### Phase P1: First-screen procurement facts

- Move conditionnement, product status, sectors, and quote action into the hero.
- Add product reference/code only when data is approved for public display.

### Phase P2: Image system alignment

- Replace generic context images with packshots or honest placeholders.
- Use the product image rules consistently.

### Phase P3: Specification and use sections

- Add compact spec panel.
- Hide missing technical fields.
- Keep claims evidence-based.

### Phase P4: Quote behavior

- Preserve product context into the quote flow.
- Confirm mobile and desktop CTA behavior.

### Phase P5: Documents and related products

- Add document zone only when real files exist.
- Add related products from real family/need relationships.

## Acceptance criteria

- Product name, conditionnement, sector/use context, and quote CTA are visible near the top.
- No price, stock, checkout, payment, account login, or public Swiver language appears.
- Product image is not cropped and uses the approved packshot/placeholder system.
- Unsupported product claims are absent.
- Documents render only when real files are approved.
- Quote CTA preserves product context.
- Mobile page can be used without hover or horizontal scroll.
- AR/RTL layout does not break metadata, CTA rail, or tabs/accordions.

## What not to implement

- Fake SDS/FDS, fiche technique, labels, certificates, or disabled placeholder downloads.
- AI-generated public safety or performance claims.
- Public reviews, ratings, client examples, or popularity labels.
- Checkout-style quantity controls that imply payment or stock reservation.
- Generic context-photo galleries that hide the actual product.
- Phase 2 sector detail dependencies.
- Public stock, price, lead time, or delivery guarantee.

## Related

- [05-catalog-ux-brief.md](05-catalog-ux-brief.md)
- [09-design-decisions.md](09-design-decisions.md)
- [../03-modules/public-site/README.md](../03-modules/public-site/README.md)
- [../04-design/brand.md](../04-design/brand.md)
- [../04-design/components.md](../04-design/components.md)
- [../01-product/open-questions.md](../01-product/open-questions.md)
