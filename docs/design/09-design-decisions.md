# Design decisions

> Status: Draft synthesis by Design Lead. Owner: Souhail. Last updated: 2026-05-13.
> Scope: unified public-site design direction and handoff notes. No application code.

## Purpose

This file consolidates the design-agent outputs into one public-site direction for Homepage V3, catalog UX, product detail UX, quote/devis behavior, copy, imagery, responsive behavior, implementation phases, and acceptance criteria.

This is not an ADR. If a future design choice changes product scope, architecture, data model, public claims, or MVP boundaries, promote it into the relevant product, architecture, or ADR document.

## Source synthesis

This direction synthesizes:

- the repository guardrails in [../../AGENTS.md](../../AGENTS.md),
- public-site scope in [../01-product/mvp-scope.md](../01-product/mvp-scope.md),
- non-goals in [../01-product/non-goals.md](../01-product/non-goals.md),
- brand and token direction in [../04-design/brand.md](../04-design/brand.md) and [../04-design/design-tokens.md](../04-design/design-tokens.md),
- component direction in [../04-design/components.md](../04-design/components.md),
- copy rules in [../04-design/content-style-guide.md](../04-design/content-style-guide.md),
- sector definitions in [../00-overview/sectors.md](../00-overview/sectors.md),
- competitor patterns in [../07-research/competitors.md](../07-research/competitors.md),
- temporary design-agent notes read from the local `prodet-agents/` worktrees on 2026-05-13.

The root `docs/design/` folder did not exist before this synthesis pass, so this file is the canonical root design-decision log from this point forward.

## Unified visual direction

Prodet should look like a serious Tunisian B2B manufacturer and supplier, not a startup, marketplace, or consumer cleaning shop.

The visual system should be:

- product-led,
- industrial-modern,
- practical and dense,
- quote-first,
- French-first with Arabic RTL readiness,
- local to Tunisia without heritage decoration,
- credible through proof, not slogans.

Primary proof assets:

- real Prodet packshots,
- real labels and packaging,
- real factory/storage/exterior photos when public-safe,
- address and direct contact paths,
- product codes and conditionnement,
- verified manufacturing language.

Primary visual cues:

- Prodet blue for main actions and active states,
- deep blue/navy for industrial structure,
- green as a restrained support accent,
- warm off-white page background,
- white product/form surfaces,
- stronger borders and flatter shadows,
- label-inspired angled details and specification panels used sparingly.

Avoid:

- SaaS-style gradient heroes,
- giant empty whitespace,
- decorative blobs/glows,
- generic stock-photo cleaning scenes,
- fake 3D icon sets,
- consumer retail cues,
- fake trust proof.

## Homepage V3 direction

Homepage V3 is defined in [04-homepage-v3-brief.md](04-homepage-v3-brief.md).

Homepage must focus on:

- Prodet as a Tunisian B2B manufacturer/supplier,
- a quote-first flow,
- hotels, restaurants/cafés, companies, cleaning companies, revendeurs/grossistes, and institutions,
- solutions by professional need:
  - restauration & cuisine,
  - buanderie & linge,
  - étage / housekeeping,
  - articles ménagers & hygiène.

The homepage should follow this sequence:

1. Compact utility/header with logo, nav, language, contact cue, and one quote CTA.
2. Hero with manufacturer positioning, real product proof, `Demander un devis`, and `Voir le catalogue`.
3. Solutions by professional need.
4. Sector mosaic.
5. Featured manufactured products.
6. Manufacturer credibility band.
7. Quote flow strip.
8. Final quote/contact CTA.

Do not add customer logos, numerical trust stats, or best-seller claims unless verified and approved.

## Catalog UX direction

Catalog UX is defined in [05-catalog-ux-brief.md](05-catalog-ux-brief.md).

The MVP catalog must:

- show manufactured Prodet products only,
- prioritize product recognition, code/reference when approved, conditionnement, family/use case, and sector fit,
- support search and filters by professional need, category/family, sector, and conditionnement,
- keep quote actions visible without becoming checkout,
- use honest product placeholders where packshots are missing.

Do not expose articles commercialisés publicly at MVP unless product scope changes in writing.

## Product detail UX direction

Product-page UX is defined in [06-product-page-ux-brief.md](06-product-page-ux-brief.md).

The product page must behave like a procurement/specification page:

- product image,
- localized name,
- canonical name/reference when appropriate,
- conditionnement,
- unit of sale,
- sectors and use case,
- specification panel,
- documents only when real,
- related products,
- `Demander un devis pour ce produit`.

The quote action and conditionnement must appear in the first screen, not after long content.

## Quote/devis UX notes

The public conversion event is quote request.

Rules:

- `Demander un devis` is the primary CTA across homepage, catalog, product, and contact paths.
- Product-specific CTAs preserve product context into the quote request.
- Catalog-card CTAs may add product context and keep the buyer browsing, but feedback must be visible.
- General CTAs open a quote form with a "describe your need" path.
- WhatsApp and phone are direct-contact fallbacks, not replacements for the structured quote flow.
- Confirmation copy should provide a reference or clear next step once backend persistence exists.
- Public copy should not mention Swiver, AI extraction, internal queue mechanics, or automatic order creation.

Form expectations:

- product lines and quantities,
- name,
- company,
- email,
- phone,
- sector,
- delivery zone or address when confirmed,
- notes,
- spam protection according to product scope.

Do not rely on `mailto:` as the primary quote path once implementation reaches MVP quality. It can remain a fallback only.

## Component list

Public shell:

- `TopUtilityBar`
- `SiteHeader`
- `SiteFooter`
- `Logo`
- `LocaleSwitcher`
- `WhatsAppLink`
- `BreadcrumbBar`

Homepage:

- `HomeHero`
- `ProfessionalNeedsGrid`
- `SectorMosaic`
- `FeaturedProductsStrip`
- `ManufacturerBand`
- `QuoteFlowStrip`
- `TrustProofStrip`
- `FinalCtaBand`

Catalog:

- `CatalogHeader`
- `CatalogSearch`
- `CatalogFilters`
- `ActiveFilterChips`
- `ProductGrid`
- `PublicProductCard`
- `CatalogEmptyState`

Product detail:

- `ProductHero`
- `ProductImageFrame`
- `ProductSpecPanel`
- `ProductQuoteRail`
- `ProductDocumentZone`
- `RelatedProductsStrip`
- `MobileProductCta`

Quote/contact:

- `QuoteSelection`
- `QuoteLineItem`
- `QuoteForm`
- `QuoteConfirmation`
- `ContactRoutingCards`
- `ContactDetails`
- `MapEmbed`

Shared:

- `Badge`
- `Button`
- `Input`
- `Textarea`
- `Select`
- `Checkbox`
- `Tooltip`
- `Tabs` or `Accordion`
- `EmptyState`
- `ErrorState`
- `LoadingState`

Component rules:

- use cards for repeated items and focused tools, not nested page sections,
- product cards always show conditionnement,
- buttons use clear verb-object labels,
- icon-only buttons need labels/tooltips,
- direction-aware layout is required for AR.

## Product image requirements

Product images are a primary trust signal.

Requirements:

- real product packaging is the source of truth,
- transparent PNG master,
- 1:1 square canvas,
- preferred master size 2400 x 2400 px,
- minimum accepted master 1600 x 1600 px,
- product fills 75-85% of canvas height,
- 8-12% transparent margin,
- no baked checkerboard,
- no background rectangle,
- no cropped caps, pumps, handles, triggers, or labels,
- label is readable at product-detail size,
- optimized WebP/AVIF derivatives generated from the master later,
- stable kebab-case naming by product slug and format.

Rendering rules:

- use `object-contain`,
- never `object-cover` for packshots,
- keep a stable square media area,
- use format-specific placeholders when missing,
- do not use generic stock product photos.

Placeholders:

- one per common format: 5L, 20L, 20KG, 750ml spray, 500ml pump, generic,
- neutral silhouette only,
- no fake labels,
- same 1:1 transparent system,
- honest alt text such as `Image produit à venir: {product name}`.

## Copywriting direction

Voice:

- direct,
- specific,
- industrial,
- local,
- quote-first,
- manufacturer-confident,
- calm.

Use:

- `Fabricant et fournisseur tunisien`,
- `Produits d'hygiène et d'entretien professionnels`,
- `Demander un devis`,
- `Voir le catalogue`,
- `Conditionnement`,
- `Usage professionnel`,
- `Recommandé pour`,
- `Prix communiqués sur devis`,
- `Contact direct avec Prodet`.

Avoid:

- `acheter`,
- `panier`,
- `checkout`,
- `en stock`,
- `prix imbattables`,
- `tarifs grossiste` unless approved,
- `leader`,
- `révolutionnaire`,
- `innovant` without proof,
- `AI-powered`,
- fake sustainability language,
- fake certifications,
- fake customer proof.

Product copy:

- localized public name first,
- canonical/internal name secondary where useful,
- short description in 1-2 practical sentences,
- long description only when it adds use, format, or safety context,
- technical values only when verified.

## Responsive behavior

Global rules:

- mobile-first,
- no horizontal overflow,
- no hover-only critical actions,
- no text clipping in buttons/cards,
- stable card/media dimensions,
- visible focus states,
- AR/RTL layout uses logical direction and does not inherit Latin-only spacing tricks.

Desktop:

- compact header,
- dense content bands,
- 3-4 column catalog grid,
- product pages with two-column hero and optional sticky quote rail.

Tablet:

- two-column cards where useful,
- filters collapse into top panels,
- product detail stacks with CTA still near top.

Mobile:

- quote CTA appears early,
- product image is not cropped,
- filters use drawer/disclosure behavior,
- product cards are one column with conditionnement and CTA visible,
- sticky CTA is allowed only if it does not cover content or form controls.

## Implementation phases

### Phase D0: Documentation and claims scrub

- Use these briefs as the design source of truth.
- Remove fake proof and unverified claims from planned UI.
- Confirm what is actually approved for public use.

### Phase D1: Brand and asset normalization

- Confirm source logo and exact colors.
- Confirm product photography coverage.
- Approve placeholder style.
- Confirm contact facts, WhatsApp, hours, and public email.

### Phase D2: Shell and tokens

- Apply Prodet brand colors, typography, borders, radii, and spacing.
- Replace text logo with real logo.
- Make header quote path clear and non-duplicative.

### Phase D3: Homepage V3

- Build hero, professional needs, sectors, product proof, manufacturer band, quote flow, and final CTA.
- Keep the homepage within MVP scope.

### Phase D4: Catalog UX

- Enforce manufactured-only public catalog.
- Standardize product cards.
- Add search/filter/active chips.
- Integrate quote context.

### Phase D5: Product detail UX

- Move procurement facts and quote action into first screen.
- Add spec panel and document zone logic.
- Align image system and related products.

### Phase D6: Quote/contact flow

- Replace mailto-primary behavior with structured quote submission when backend is ready.
- Keep WhatsApp/email as fallback.
- Add confirmation and next-step copy.

### Phase D7: Responsive, i18n, accessibility, performance QA

- Validate FR, AR RTL, and EN.
- Check mobile CTA and forms.
- Check Lighthouse targets for homepage and catalog.
- Run accessibility checks on homepage, catalog, product, quote, and contact.

## Acceptance criteria

Public-site design direction is accepted when:

- Prodet is clearly positioned as a Tunisian B2B manufacturer/supplier.
- Quote request is the dominant conversion model.
- Homepage covers the required sectors and four professional-need groups.
- Catalog is manufactured-only at MVP.
- Product cards and product pages show conditionnement clearly.
- Product detail pages act like procurement/spec pages.
- Product images follow the transparent packshot system or honest placeholder system.
- No public prices, stock, checkout, payment, fake proof, fake reviews, invented metrics, unsupported claims, public Swiver integration, or customer-facing AI language appears.
- CTAs preserve quote context.
- FR is complete first and layouts are ready for AR RTL and EN.
- Mobile, tablet, and desktop layouts keep CTAs accessible without overlap.
- Accessibility is planned for all critical public paths.

## What not to implement

- Public prices.
- Public stock.
- Checkout or online payment.
- Customer login or portal links at MVP.
- Public Swiver integration messaging.
- Customer-facing AI/chatbot.
- Fake client logos, fake reviews, fake certifications, fake awards, invented customer counts, invented revenue claims, or fake sustainability claims.
- Blog, news, or resource center at MVP.
- Full public catalog PDF download at MVP.
- Articles commercialisés in the public MVP catalog.
- Sector deep landing pages as a Homepage V3 dependency.
- Fake SDS/FDS or fiche-technique download buttons.
- Disabled document buttons for missing assets.
- Stock-photo-only product or homepage proof.
- Consumer sale/promotion language.
- Decorative UI effects unrelated to Prodet's actual product/label language.

## Decisions

### D-001: Manufacturer proof leads the visual system

Status: Accepted as working direction.

Decision: Product packshots, packaging, labels, factory/storage imagery, conditionnement, and direct contact cues are the primary credibility system.

Rationale: Professional buyers need proof that Prodet is real and relevant before they request a quote.

### D-002: Quote-first replaces commerce-first

Status: Accepted as MVP invariant.

Decision: The public site optimizes for `Demander un devis`, contact, and WhatsApp fallback. It does not use checkout, payment, public price, or stock UI.

Rationale: Prodet B2B pricing and availability are handled through direct commercial conversation.

### D-003: Use Prodet blue as primary action language

Status: Accepted as working direction.

Decision: Prodet blue drives primary CTAs, active states, important links, and selected states.

Rationale: The logo and label system already establish blue as the main professional brand color.

### D-004: Keep green secondary

Status: Accepted as working direction.

Decision: Green is a support accent, not the primary CTA color or sustainability proof.

Rationale: Overusing green would imply an eco-first positioning that Prodet has not documented.

### D-005: Practical density beats generic whitespace

Status: Accepted as working direction.

Decision: Public pages should show useful product, sector, and quote information early with compact spacing.

Rationale: Professional buyers scan for facts. Empty marketing space delays decision-making.

### D-006: No fake proof

Status: Accepted as hard rule.

Decision: Trust components use verified facts only. If proof is missing, the UI stays qualitative or omits the section.

Rationale: Fabricated trust signals are worse than no trust signal.

### D-007: Product images must be honest

Status: Accepted as working direction.

Decision: Use real packshots or format-specific placeholders. Do not invent packaging, use competitor imagery, or hide missing assets.

Rationale: Packaging recognition is central to B2B procurement confidence.

### D-008: Product detail pages are specification surfaces

Status: Accepted as working direction.

Decision: Product pages prioritize procurement facts, use cases, documents when real, and quote action.

Rationale: B2B chemical buyers need specification support, not editorial product storytelling.

### D-009: FR first, AR/RTL structurally ready

Status: Accepted as MVP direction.

Decision: French copy is complete first; layouts, typography, components, and spacing must support Arabic RTL and English from day one.

Rationale: The MVP requires three locales and the product label already proves bilingual brand reality.

### D-010: Public site does not expose internal automation

Status: Accepted as hard rule.

Decision: The public site does not market AI, mention Swiver integration, or imply automated order creation.

Rationale: AI and Swiver workflows are internal. The public buyer needs a clear quote path and human commercial follow-up.

## Open design questions

- Which exact logo-derived color values replace the provisional palette?
- Which top products have approved transparent packshots?
- Which format-specific placeholders should be created first?
- Which two sectors should receive visual emphasis on the homepage if asymmetry is used?
- Which WhatsApp number, phone number, hours, and contact email are public-approved?
- Which SDS/FDS and fiches techniques exist and are approved for public hosting?
- Which product references/codes are safe and useful to show publicly?
