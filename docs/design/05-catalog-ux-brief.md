# Catalog UX brief

> Status: Draft synthesis. Owner: Souhail. Last updated: 2026-05-13.
> Scope: public catalog index UX direction only. No application code.

## Purpose

The catalog must help professional buyers browse manufactured Prodet products, compare formats quickly, and request a quote. It is not an e-commerce store. It must make the product range credible without showing public prices, public stock, checkout, or commercialized articles unless scope is explicitly changed.

## Catalog position

Primary page framing:

> Catalogue des produits fabriqués par Prodet, disponibles sur devis pour les professionnels.

The catalog should reinforce three facts:

- Prodet manufactures professional products.
- Product facts are visible before a quote request.
- Price and availability are confirmed directly by Prodet.

## MVP scope rules

- Show manufactured Prodet products only.
- Do not show articles commercialisés in the public MVP catalog.
- Do not show raw materials.
- Do not show prices or stock status.
- Do not include checkout, payment, account pricing, or customer login.
- Do not expose a public Swiver reference unless the reference is intentionally approved for public display.
- Do not show SDS/FDS or fiche-technique links unless real files exist.

## Page structure

### 1. Catalog header

Required content:

- title naming the manufactured catalog,
- one-sentence no-price B2B explanation,
- primary CTA: `Demander un devis`,
- secondary cue: `Prix et disponibilité confirmés directement par Prodet`,
- optional count only if the count is real and generated from the visible product set.

Avoid `nouveautés`, `best-sellers`, or other claims unless backed by data.

### 2. Search and filters

Search should support professional vocabulary and product recognition.

Search fields:

- localized product name,
- canonical product name,
- product code/reference if public,
- family,
- category,
- conditionnement,
- use case,
- sector,
- common aliases when approved for public search.

MVP filters:

- professional need: restauration & cuisine, buanderie & linge, étage / housekeeping, articles ménagers & hygiène,
- category,
- family,
- sector,
- conditionnement where data is structured.

Phase 2 filters only when data exists:

- pH,
- dilution,
- surface type,
- scent/color,
- document availability,
- certification/approval.

Do not overbuild filters that return sparse or empty result sets. If fewer than roughly 30 products are launch-ready, prefer simple filters and stronger product cards.

### 3. Product grid

Cards should compare real procurement facts.

Required card fields:

- fixed square image area with transparent packshot or honest placeholder,
- localized product name,
- canonical name or public reference if available,
- conditionnement,
- product family or use case,
- recommended sector tags, limited to 2-3 visible tags,
- `Voir le produit`,
- `Demander un devis`.

Do not hide conditionnement behind hover. Do not crop packshots. Do not use repeated generic photos as if they were real product images.

### 4. Active filters

Show active filters as removable chips. This matters for mobile and for buyers browsing by sector/need.

Rules:

- chips use buyer-readable labels, not internal keys,
- reset action is visible,
- result count updates with the same visible product set,
- empty states explain what to change.

### 5. Empty states

Empty search/filter state copy:

> Aucun produit ne correspond à ces filtres. Modifiez votre recherche ou décrivez votre besoin dans une demande de devis.

Actions:

- `Réinitialiser les filtres`,
- `Demander un devis`.

Do not imply that a product is unavailable. Public stock is not shown.

## Quote behavior

Define one consistent model:

- Product card CTA adds the product context to the quote selection and gives visible feedback.
- `Voir le produit` opens the product page for details.
- General catalog CTA opens an empty quote form with a "describe your need" path.
- The quote form should capture product lines, quantities, sector, company, contact details, and notes.
- WhatsApp is secondary and appears only when the number is confirmed.

Use `sélection devis` or `demande de devis` language. Avoid `panier`, `checkout`, `acheter`, and `commande` on the public catalog.

## Product image requirements

Catalog imagery must use the product image system:

- 1:1 square transparent masters,
- product fills 75-85% of image height,
- 8-12% transparent margin,
- `object-contain` rendering,
- no baked checkerboard,
- no cropped caps, pumps, handles, triggers, or labels,
- format-specific placeholder when missing.

Card image areas must be stable so loading images do not shift the grid.

## Copywriting direction

The catalog should sound like a professional supplier, not a shop.

Use:

- `Produits fabriqués par Prodet`,
- `Conditionnement`,
- `Usage professionnel`,
- `Recommandé pour`,
- `Demander un devis`,
- `Prix communiqués sur devis`.

Avoid:

- `acheter maintenant`,
- `promo`,
- `en stock`,
- `rupture`,
- `livraison garantie`,
- `tarif grossiste`,
- `prix compétitif` unless explicitly approved.

## Responsive behavior

Desktop:

- left filter rail or compact filter panel,
- sticky filter area only if it does not trap content,
- product grid of 3-4 columns depending on card density,
- catalog header remains compact.

Tablet:

- filters collapse into a top panel or drawer,
- two-column grid,
- active filter chips remain visible above results.

Mobile:

- search appears before filters,
- filters open as a full-width drawer or stacked disclosure,
- product cards remain readable in one column,
- conditionnement and CTA are visible without hover,
- selected quote feedback is explicit and accessible.

## Accessibility

- Every filter has a label.
- Filter state changes are announced to assistive tech.
- Product images have meaningful alt text or honest missing-image alt text.
- Keyboard users can search, filter, open product detail, and request a quote.
- Focus states are visible on ivory and white surfaces.
- Color is not the only way to show active filters or selection.

## Implementation phases

### Phase C1: Scope cleanup

- Ensure the public catalog is manufactured-only.
- Remove price-adjacent and stock-adjacent language.
- Confirm catalog heading and no-price explanation.

### Phase C2: Product-card clarity

- Standardize one public product-card system.
- Add conditionnement, family/use case, and quote actions.
- Use packshot placeholders where real product images are missing.

### Phase C3: Search and filters

- Add filters by need, category/family, sector, and conditionnement.
- Add active filter chips and empty states.
- Keep filter count appropriate to the launch set size.

### Phase C4: Quote integration polish

- Make product-specific quote selection visible.
- Keep catalog browsing smooth after adding a product.
- Ensure product context reaches the quote form.

### Phase C5: Responsive and accessibility pass

- Validate mobile filter behavior.
- Check keyboard navigation and focus.
- Confirm card text does not overflow in FR, AR, or EN.

## Acceptance criteria

- Public catalog shows only manufactured products at MVP.
- No price, stock, checkout, payment, customer login, or account pricing appears.
- Product cards show image/placeholder, name, conditionnement, family/use case, and quote path.
- Filters match buyer mental models and do not create a sparse, overbuilt interface.
- Product-specific quote intent is preserved.
- Empty states route users to filter reset or quote request.
- Mobile catalog is usable without hover or horizontal scrolling.
- AR/RTL structure is considered for filters, chips, and card metadata.

## What not to implement

- Articles commercialisés in the MVP public catalog.
- Search filters for unsupported data such as pH, certifications, or documents before the fields are real.
- Visible public prices, stock labels, availability badges, or lead-time promises.
- Add-to-cart, checkout, payment, or portal/login patterns.
- Fake product images, competitor images, or repeated stock images presented as product photos.
- Public full-catalog PDF download at MVP.
- Customer reviews, ratings, or product popularity claims without data.

## Related

- [04-homepage-v3-brief.md](04-homepage-v3-brief.md)
- [06-product-page-ux-brief.md](06-product-page-ux-brief.md)
- [09-design-decisions.md](09-design-decisions.md)
- [../03-modules/public-site/README.md](../03-modules/public-site/README.md)
- [../01-product/mvp-scope.md](../01-product/mvp-scope.md)
- [../01-product/non-goals.md](../01-product/non-goals.md)
- [../06-spikes/spike-catalog-quality.md](../06-spikes/spike-catalog-quality.md)
