# Homepage V3 brief

> Status: Draft synthesis. Owner: Souhail. Last updated: 2026-05-13.
> Scope: public homepage direction only. No application code.

## Purpose

Homepage V3 must make Prodet credible in the first screen as a Tunisian B2B manufacturer and supplier of professional hygiene, cleaning, and detergent products. The page should help buyers recognize that Prodet serves their sector, see real product/manufacturing proof, and move toward a quote request without public prices, stock, checkout, fake proof, or public Swiver integration.

## Positioning

Primary positioning:

> Fabricant et fournisseur tunisien de produits d'hygiène et d'entretien professionnels.

Supporting line:

> Produits fabriqués et distribués pour hôtels, restaurants, entreprises, sociétés de nettoyage, revendeurs et institutions.

Use `fabricant` first where true. Use `fournisseur` to cover the broader commercial relationship without implying that all public catalog items are resold or that resold articles are in MVP scope.

## Audience

The homepage is primarily for a new professional buyer who needs to decide in less than 30 seconds whether Prodet is real, relevant, and easy to contact.

Priority audiences:

- hôtels et hébergement,
- restaurants, cafés et cuisines professionnelles,
- entreprises et bureaux,
- sociétés de nettoyage,
- revendeurs et grossistes,
- institutions publiques.

## Business rules

- No public prices.
- No public stock.
- No checkout or payment language.
- No fake client logos, fake reviews, invented metrics, fake certifications, or unsupported sustainability claims.
- No public Swiver integration language.
- No customer-facing AI language.
- WhatsApp appears only once the public number is confirmed.
- SDS/FDS and fiches techniques appear only when real files exist.

## Visual direction

The homepage should feel product-led, industrial-modern, and local to Tunisia. It should not feel like a SaaS landing page, consumer shop, or stock-photo cleaning service.

Use:

- real Prodet product packshots as the main proof asset,
- factory/storage/exterior photography only when public-safe and credible,
- Prodet blue as the primary action color,
- green as a restrained support accent,
- warm off-white page surfaces with white product/card surfaces,
- label-inspired geometry as small structural accents,
- compact professional spacing that gets to products and quote actions early.

Avoid:

- abstract hero illustrations,
- generic cleaning stock photos as first proof,
- large empty hero bands,
- decorative gradients, glow effects, blobs, and fake 3D icons,
- customer-logo walls without written permission.

## Page structure

### 1. Utility and header

Keep the header compact and practical.

Required elements:

- real logo once source assets are available,
- primary nav: `Catalogue`, `Secteurs`, `Fabrication`, `Devis`, `Contact`,
- phone or contact cue when confirmed,
- language switcher,
- one primary `Demander un devis` CTA.

Do not duplicate quote CTAs in the header. If selected products exist later, show that as a quote-selection state, not as a second generic devis link.

### 2. Hero

The hero must show manufacturer credibility, a real product visual, and the quote path within the first viewport.

Required content:

- one direct manufacturer headline,
- one supporting line naming professional buyer types,
- primary CTA: `Demander un devis`,
- secondary CTA: `Voir le catalogue`,
- optional secondary contact: WhatsApp only when the number is confirmed,
- proof line using verified facts only, such as `L'Aouina, Tunis` or `Produits professionnels sur devis`.

Hero visual priority:

1. group of real Prodet packshots,
2. one strong product family packshot,
3. factory/product photography composition,
4. format-specific placeholder only if real assets are still missing.

### 3. Solutions by professional need

This is the homepage's main discovery layer. It should help buyers self-identify by operational need before browsing the full catalog.

Required solution groups:

| Need | Buyer language | UX role |
|---|---|---|
| Restauration & cuisine | dégraissage, vaisselle, surfaces alimentaires where claims are documented | Route restaurants, cafés, hotels, institutions |
| Buanderie & linge | lessive, assouplissant, linge professionnel | Route hotels, institutions, cleaning companies |
| Étage / housekeeping | sanitaires, chambres, sols, vitres, odeur | Route hotels, accommodation, offices |
| Articles ménagers & hygiène | hygiène des mains, entretien courant, accessoires only if in public scope | Route offices, institutions, revendeurs |

Each card should include:

- short need label,
- one practical use-case sentence,
- recommended sector chips,
- `Voir les produits` or `Demander un devis` action,
- product-led image or placeholder, not stock lifestyle imagery.

Do not turn these into Phase 2 sector deep pages. At MVP they route to catalog filters or the quote form.

### 4. Sector mosaic

Show that Prodet serves real B2B contexts without inventing customer proof.

Recommended sectors:

- Hôtels et hébergement,
- Restaurants et cafés,
- Entreprises et bureaux,
- Sociétés de nettoyage,
- Revendeurs et grossistes,
- Institutions publiques.

If space allows, cafés can remain explicit; otherwise fold cafés into restaurants for homepage density while keeping the full seven-sector list on `/secteurs`.

Each sector card should answer: "Does Prodet serve people like me?" Use practical language, not broad marketing copy.

### 5. Featured manufactured products

This section is product proof, not a best-seller claim unless sales data is verified.

Required card fields:

- product image or format-specific placeholder,
- localized public name,
- canonical/internal product name or public product reference when available,
- conditionnement,
- product family/use case,
- `Demander un devis` action,
- `Voir le produit` secondary action.

Do not label the section `Meilleures ventes` unless the list is supported by real sales data and approved wording.

### 6. Manufacturer credibility band

Use one real factory, storage, product shelf, label close-up, or exterior photo.

Content should cover:

- Prodet manufactures in Tunisia,
- products are intended for professional use,
- quote and contact are handled directly,
- product details and conditionnements are visible before requesting a quote.

Allowed proof examples:

- public address,
- real product packaging,
- real product families,
- manufacturing language approved by Souhail.

Avoid:

- invented years,
- revenue or customer counts unless deliberately approved,
- unverified delivery promises,
- broad `qualité garantie` claims without support.

### 7. Quote flow strip

Explain the no-price B2B flow clearly.

Recommended three steps:

1. Sélectionnez des produits ou décrivez votre besoin.
2. Indiquez secteur, quantités et coordonnées.
3. Prodet confirme références, prix et modalités directement.

Use `devis` language, not `panier`, `commande`, `checkout`, or `paiement`.

### 8. Final CTA

Close with a direct quote/contact action.

Required:

- `Demander un devis`,
- visible phone or contact fallback if confirmed,
- no pressure language,
- no fake response-time promise.

## Quote/devis UX notes

- The homepage CTA should start a general quote request.
- Product cards should preserve product context when the user requests a quote for a specific item.
- WhatsApp is a fallback/direct-contact channel, not the primary structured quote path.
- Confirmation copy should explain that Prodet will review the request and respond directly.
- The public page should not mention internal Swiver processing.

## Copy direction

Write in French first. Use direct, specific B2B language.

Preferred phrases:

- `Demander un devis`,
- `Voir le catalogue`,
- `Produits professionnels sur devis`,
- `Fabrication tunisienne`,
- `Contact direct avec Prodet`,
- `Conditionnements professionnels`.

Avoid:

- `acheter`,
- `ajouter au panier`,
- `stock disponible`,
- `prix imbattables`,
- `leader du marché`,
- `solution révolutionnaire`,
- `clients satisfaits` without proof,
- `AI-powered` or similar public AI language.

## Responsive behavior

Desktop:

- first viewport shows headline, CTAs, real product proof, and at least one contact cue,
- solution cards can use a four-column or two-by-two layout,
- sector mosaic can use asymmetric emphasis but must not imply fake priority without approval.

Tablet:

- hero stacks with product visual still visible before the first major scroll,
- solution and sector cards become two-column grids,
- CTA remains visible without sticky banners that cover content.

Mobile:

- headline, `Demander un devis`, and product proof appear early,
- solution cards stack with compact content,
- no horizontal card overflow,
- header height stays controlled,
- mobile CTA does not hide form or navigation content.

## Acceptance criteria

- First viewport clearly states Prodet is a Tunisian B2B manufacturer/supplier.
- `Demander un devis` is the primary conversion action.
- The page names the required buyer groups: hotels, restaurants/cafés, companies, cleaning companies, revendeurs/grossistes, and institutions.
- The four professional-need groups are present.
- No public price, stock, checkout, fake client logo, fake review, fake metric, or unsupported claim appears.
- Real product/factory assets are used where available; missing images use honest placeholders.
- The page works in FR and is structurally ready for AR RTL and EN.
- The homepage stays dense enough that catalog/quote paths are visible before excessive scrolling.

## What not to implement

- Public prices, stock, checkout, online payment, or account pricing.
- Client logos, testimonials, or reviews without written permission.
- Numeric trust claims unless documented and approved.
- Sector detail pages as a Homepage V3 dependency.
- Blog/news/resource-center blocks.
- Public catalog PDF download.
- Customer login or portal affordance.
- Customer-facing AI/chatbot language.
- Swiver integration messaging on the public site.

## Open dependencies

- Q5 product photography decides how much of the homepage can rely on real packshots.
- Q10 WhatsApp number decides whether WhatsApp appears in header/hero/final CTA.
- Q15 sector priority decides whether hotels/restaurants or another pair get homepage emphasis.
- Q6 SDS/FDS availability decides whether document access is mentioned outside product pages.

## Related

- [../04-design/brand.md](../04-design/brand.md)
- [../04-design/components.md](../04-design/components.md)
- [../04-design/content-style-guide.md](../04-design/content-style-guide.md)
- [../03-modules/public-site/README.md](../03-modules/public-site/README.md)
- [../00-overview/sectors.md](../00-overview/sectors.md)
- [../01-product/non-goals.md](../01-product/non-goals.md)
