---
name: prodet website v2 redesign
overview: Replace the generic SaaS-flavoured public site with a Prodet-specific industrial B2B identity grounded in the real logo and sample label, while staying inside the documented MVP scope and keeping the site quote-led, multilingual, and clean.
todos:
  - id: p0-brand-normalization
    content: "P0: Normalize brand inputs before any UI pass. Gather source logo files, confirm exact palette from the vector, confirm which product photos are web-usable, and prepare transparent cutouts for the top products. This is required to avoid another placeholder-driven design cycle."
    status: pending
  - id: p1-brand-system
    content: "P1: Replace placeholder tokens with a Prodet brand system in globals.css and shared components. Lock deep blue as the primary action color, off-white as the default surface, green as a restrained support accent, stronger borders, flatter shadows, and label/code typography for product references and conditionnement."
    status: pending
  - id: p2-shell-and-navigation
    content: "P2: Upgrade the site shell. Add a compact utility bar with address and contact entry points, replace the text logo with the real mark, tighten header density, and make the quote CTA visible without making the shell feel like a SaaS dashboard."
    status: pending
  - id: p3-homepage
    content: "P3: Rebuild the homepage around a split hero with a real product packshot, a dense featured-products strip, a 7-sector composition that matches MVP scope, a manufacturer credibility band, a simple quote-flow explainer, and a trust wall based on proof and text signals rather than invented metrics."
    status: pending
  - id: p4-catalog-and-conversion
    content: "P4: Refine catalogue, product detail, quote request, about, contact, and legal pages so they share one visual language. Prioritize product recognition, code visibility, conditionnement clarity, and low-friction quote conversion. Do not make Phase 2 sector-detail pages a v2 dependency."
    status: pending
  - id: p5-qa-and-proof
    content: "P5: Finish with restrained motion, AR/RTL checks, accessibility review, mobile CTA validation, favicon/OG assets from the real logo and hero packshot, and a content pass removing generic or unverified trust language."
    status: pending
isProject: false
---

# Prodet website v2 redesign

## 1. Status and scope guardrail

This document is a **build plan**, not a silent approval to start shipping code. It is implementation-aware because this workspace already contains a public-site codebase under `src/`, but the redesign still needs to respect the repo's documented MVP and approval flow.

Two scope corrections are locked here:

- The homepage sector composition must reflect the **7 sectors** listed in [docs/00-overview/sectors.md](docs/00-overview/sectors.md), not an invented 8-tile structure.
- Deep sector detail pages are **Phase 2** in the product docs. If the route already exists in code, it can be lightly styled later, but it must not block the v2 public-site redesign.

## 2. Diagnosis — why v1 feels generic

Looking at [src/app/[locale]/(public)/page.tsx](src/app/[locale]/(public)/page.tsx), [src/app/globals.css](src/app/globals.css), and [src/components/site-header.tsx](src/components/site-header.tsx):

- Placeholder OKLCH palette with no relation to the actual Prodet logo color.
- A single font treatment, no label / code typography for product references like `JAV-BID-5`.
- Three Lucide icons (`Beaker`, `Factory`, `ShieldCheck`) standing in for sector identity.
- Single `[Photo usine — à intégrer Phase 0]` placeholder div, no real product photo, no factory shot.
- Trust strip uses invented numerical claims (`30+`, `80`, `96`) — you have asked us to remove these.
- `py-20` / `py-28` SaaS rhythm reads as a startup landing, not as a supplier.
- Logo is rendered as the literal text `Prodet Tunisie` — no brand mark anywhere.

The fix is not a color swap. We need to change the **identity language, density, product presentation, and conversion hierarchy together**.

## 3. What the real assets change

The two shared visuals already tell us a lot:

- The **logo** is not neutral corporate blue. It has a rounded, approachable industrial wordmark, a dynamic orbit stroke, a green support sweep, and a light-blue sparkle detail.
- The **sample label** is not minimalist in a luxury sense. It is structured, technical, bilingual, and product-first: strong uppercase naming, deep blue geometric blocks, dense utility copy, and a very white container/label field.

The website should borrow the **clarity and hierarchy** of that label, not its full density. The right translation is:

- clean white and off-white surfaces,
- deep blue as the trust/action color,
- green used sparingly as a support accent,
- sharper borders and flatter elevation,
- strong product-code visibility,
- bilingual layout discipline from day one.

## 4. Design pillars (locked)

1. **Real Prodet in every fold.** Logo, product shots, factory imagery, label details, and contact proof points.
2. **Label aesthetic in the typography.** Uppercase tracking-wide for product codes; tabular numerals for conditioning (`5L`, `20kg`); a dedicated label/eyebrow style mirroring real bottle labels.
3. **Industrial-Tunisian palette.** Locked to the real logo family: deep Prodet blue, restrained green, optional light-blue highlight, off-white surface, stronger borders, flatter shadows. Any gradient use must come from the label geometry, not generic marketing gloss.
4. **Density, not clutter.** Tighter heroes; product recognition and sector relevance above the fold; fewer empty bands; more useful information per screen.
5. **Trust via proof, not invented numbers.** Real factory photo, visible address/contact paths, product codes, manufacturing language, and text claims only where we can defend them.
6. **Quote, not checkout.** Every product and every major page carries a clear `Demander un devis` path. WhatsApp stays secondary and visible. No price, no stock, no cart language.
7. **All three locales render with full identity.** FR primary, AR with RTL respected, EN scaffold. No band feels FR-only with bolted-on translations.
8. **Clean UI means controlled hierarchy.** We do not chase visual emptiness. We remove noise, not information.

## 5. Provisional brand system from the shared assets

These values are **provisional from the shared screenshots**. Exact values should be pulled from the source logo and print files before implementation.

| Role | Provisional value | Direction |
|---|---|---|
| Primary blue | `#0F5DA8` | Main CTA, header accents, active states, key headings |
| Deep label blue | `#113E8B` | Large blue panels, product-code surfaces, dense information blocks |
| Light signal blue | `#25A6E6` | Tiny highlights only: sparkles, separators, small emphasis |
| Support green | `#1E9D4F` | Secondary accent only; never the primary CTA color |
| Surface ivory | `#F7F5F0` | Page background, warmer than pure white |
| Line gray | `#D9DFE6` | Borders, dividers, control outlines |
| Ink | `#16324A` | Dark text on light surfaces |

Typography direction:

- Headings, nav, and product labels: **IBM Plex Sans** or an equally technical sans with strong uppercase performance.
- Body copy: may remain on a neutral sans, but the site cannot rely on a single undifferentiated font voice.
- Arabic UI: **IBM Plex Sans Arabic** or an equivalent with good small-size clarity and balanced weights.
- Product codes and conditionnement: tabular numerals and a dedicated compact label treatment.

## 6. Asset inventory

- `public/brand/logo.svg` (required; vector source of truth)
- `public/brand/logo.png` (raster fallback)
- `public/brand/logo-mark.svg` (to be extracted cleanly from the real brand assets, not improvised)
- `public/photos/hero-product.jpg` (primary product shot for the hero)
- `public/photos/factory-exterior.jpg`
- `public/photos/factory-interior.jpg`
- `public/photos/fleet.jpg`
- `public/photos/label-close-up.jpg`
- `public/photos/products/<slug>.jpg` (any subset is fine; missing slugs fall back to a code-on-color placeholder, still on-brand)

`Q5` in [docs/01-product/open-questions.md](docs/01-product/open-questions.md) is still open, so the redesign must tolerate partial product photography coverage.

## 7. New homepage band order

Rebuilding [src/app/[locale]/(public)/page.tsx](src/app/[locale]/(public)/page.tsx) into:

1. `<TopUtilityBar>` — address `20 Rue de Somalie, L'Aouina · Tunis 2045`, phone, opening hours or contact cue, locale switcher right.
2. `<SiteHeader>` — real logo, primary nav, `Demander un devis` CTA.
3. `<Hero>` — left: tagline, sub, two CTAs, micro-claim line; right: real hero product photo.
4. `<BestSellersStrip>` — 6 product cards with real photos, code badge, conditionnement, inline `Demander un devis`.
5. `<SectorMosaic>` — asymmetric composition for the **7 MVP sectors**: 2 large featured tiles and 5 compact tiles. Each compact tile should show one sharp use-case line, not a vague icon-only card.
6. `<ManufacturerBand>` — real factory photo on one side, 4 short proof statements on the other, plus a compact `Fabrication / Conditionnement / Livraison / Suivi` strip.
7. `<HowWeWorkStrip>` — 3 steps: décrivez vos besoins → nous préparons le devis → échange direct avec Prodet. If a response-time promise is not confirmed, do not invent one.
8. `<TrustWall>` — sector-tag or proof-pill strip (`Fabrication tunisienne`, `Devis sur demande`, `Produits professionnels`, etc.), prepared to evolve into a permissioned logo wall later.
9. `<FinalCtaBand>` — `Prêt à recevoir un devis ?` with product photo accent + Devis CTA.
10. `<SiteFooter>` — current footer kept, spacing and hierarchy polished.

Homepage UX rules:

- The first viewport must show manufacturer identity, a real product visual, and at least one immediate contact/quote action.
- No trust block may rely on invented numeric stats.
- The homepage should stay within **6 to 7 meaningful bands**. More than that will dilute clarity.

## 8. Other page upgrades

- **Catalogue** at [src/app/[locale]/(public)/catalogue/page.tsx](src/app/[locale]/(public)/catalogue/page.tsx): sticky left sidebar on desktop, top filter strip on mobile, denser product grid with real photos and code badges. Inline `Demander un devis` per card.
- **Product detail** at [src/app/[locale]/(public)/catalogue/[slug]/page.tsx](src/app/[locale]/(public)/catalogue/[slug]/page.tsx): dominant packshot or simple gallery, code + conditionnement metadata block, long description, sticky `Demander un devis` sidebar with WhatsApp deep-link, cross-sell strip, and a simple `fiches techniques sur demande` affordance when the documents are not hosted yet.
- **Sectors index** at [src/app/[locale]/(public)/secteurs/page.tsx](src/app/[locale]/(public)/secteurs/page.tsx): replace generic cards with denser sector cards tied to real professional contexts. Sector detail routes remain optional polish, not a redesign requirement.
- **About** at [src/app/[locale]/(public)/a-propos/page.tsx](src/app/[locale]/(public)/a-propos/page.tsx): real factory + production photos. Story rewritten with text-only trust signals; numbers removed unless verified and intentionally kept.
- **Quote request**, **Contact**, **Legal pages**: shell cleanup, stronger hierarchy, clearer reassurance copy, and more direct contact pathways.

Page-level UX rules:

- Product code, conditionnement, and quote action must be visible without scrolling deep on product pages.
- Mobile product detail needs a persistent or quickly reachable quote action; desktop gets the sticky sidebar.
- The quote request flow must feel lighter than a contact form, not heavier.

## 9. Design tokens — concrete edits to [src/app/globals.css](src/app/globals.css)

- Replace placeholder primary with the real logo blue once the SVG lands.
- Add a deep label-blue token for dense informational surfaces and a restrained light-blue token for tiny highlights.
- Keep green as a support accent only; do not let it dominate the interface.
- `--color-background` moves from pure white to off-white.
- `--color-border` becomes stronger; cards get a firmer border than the current default.
- Shadow scale flattened and darkened. No soft glows.
- Radii: keep the system practical and slightly flatter than the current large-card look.
- Add a display/label font treatment (`IBM Plex Sans` preferred); keep Arabic on a matched Arabic family.
- Add label/code utilities: uppercase eyebrow class, `tabular-nums` numeric class, product-code treatment.
- Drop `py-20` / `py-28` defaults toward a denser B2B rhythm.

## 10. Components touched

New components:

- `src/components/site/top-utility-bar.tsx`
- `src/components/brand/logo.tsx`
- `src/components/typography/label-text.tsx`
- `src/components/home/best-sellers-strip.tsx`
- `src/components/home/sector-mosaic.tsx`
- `src/components/home/manufacturer-band.tsx`
- `src/components/home/how-we-work-strip.tsx`
- `src/components/home/trust-wall.tsx`
- `src/components/home/final-cta-band.tsx`

Refreshed components:

- [src/components/catalog/product-card.tsx](src/components/catalog/product-card.tsx) — add `imageUrl?` slot, code badge top-left, conditionnement chip, inline `Demander un devis` button, `Fabriqué par Prodet` pill on the photo.
- [src/components/site-header.tsx](src/components/site-header.tsx) — real `<Logo>`, denser nav.
- [src/components/site-footer.tsx](src/components/site-footer.tsx) — spacing polish, real logo mark.
- [src/components/ui/card.tsx](src/components/ui/card.tsx) — flatter shadow, stronger border.

Component behavior rules:

- `ProductCard` must privilege recognition first: product visual, product code, conditionnement, then description.
- `SiteHeader` must remain dense and readable, not oversized. The quote CTA should be visible without drowning the navigation.
- `TrustWall` must use text proof and real sectors until permissioned client logos exist.

## 11. Data layer addition

In [src/data/types.ts](src/data/types.ts) and [src/data/seed/products.ts](src/data/seed/products.ts):

- Add `imageUrl?: string` to `Product`.
- Map each existing seed product to `public/photos/products/<slug>.jpg`.
- `<ProductCard>` shows a label-style placeholder when `imageUrl` is missing — never a generic gray box.

## 12. Execution sequence

- **P0 — Brand normalization.** Confirm source logo, exact colors, web-safe packshots, and which photographs are rights-clear.
- **P1 — Tokens + logo plumbing.** Edit `globals.css`, add `<Logo>`, add label/code utilities, add `imageUrl` to the product type with a strong fallback pattern.
- **P2 — Site shell.** Add `<TopUtilityBar>`, replace the text logo in the header/footer, tighten spacing and hierarchy.
- **P3 — Product cards.** Add image slot, code badge, conditionnement chip, manufactured pill, and inline quote action.
- **P4 — Homepage.** Replace [src/app/[locale]/(public)/page.tsx](src/app/[locale]/(public)/page.tsx) with the band order in §7 and the UX constraints above.
- **P5 — Catalogue and product pages.** Densify product browsing and product-detail conversion surfaces.
- **P6 — About, quote, contact, legal polish.** Align copy, spacing, and reassurance patterns across the non-catalog pages.
- **P7 — QA.** AR/RTL pass, accessibility pass, mobile CTA check, Lighthouse/performance check, and unverified-claim scrub.

We do not need to delete the current v1 surfaces in one pass. The redesign should be staged so each step leaves the public site coherent.

## 13. Open trade-offs to settle early

- **Hero treatment.** Two options: split text + product packshot, or factory-photo hero. Split product-first is still the stronger default because the shared label sample makes product identity a real asset.
- **Sector prominence.** I am promoting HORECA (`hôtels` and `restaurants`) to the two large homepage tiles. If cleaning companies or wholesalers are more commercially important, we should swap before implementation.
- **Best-sellers list.** Pick the 6 from [src/data/seed/products.ts](src/data/seed/products.ts) using the real revenue mix once it is confirmed. Until then, default to the most recognizable professional cleaning lines.
- **Numerical claims.** Per your direction, all headline-style numeric trust claims are removed for v2. If we later restore any, they must be documented and defensible.
- **Real client logos.** Out of scope for v2 unless permissioned logos are provided. The trust wall should be ready for them, not blocked by them.
- **Product photography coverage.** If only a subset of products has good photos, we design the placeholder system up front so the catalog remains sharp rather than half-finished.

## 14. What we need from you before implementation

Minimum required:

- the vector logo source,
- one strong hero packshot,
- confirmation on the preferred WhatsApp/phone entry point,
- confirmation on which two sectors should dominate the homepage,
- confirmation on whether the top 20 to 30 manufactured products have usable web photos.

Once those are confirmed, the plan is tight enough to execute without falling back into generic UI decisions.
