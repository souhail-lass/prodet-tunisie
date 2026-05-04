# Sectors served — Prodet Platform

> Status: Draft. Owner: Souhail. Last updated: 2026-05.

The public site organizes the catalog and the marketing narrative around **sectors served**, not around abstract product categories. Buyers self-identify ("I run a restaurant"), and the site shows them what is relevant. This is the dominant pattern across the competitor set (see [../07-research/competitors.md](../07-research/competitors.md)).

## MVP sector list (FR-canonical)

| Sector key | FR label | AR label | EN label | MVP page status |
|---|---|---|---|---|
| `hospitality.hotels` | Hôtels et hébergement | الفنادق والإيواء | Hotels & lodging | Index card only |
| `hospitality.restaurants` | Restaurants | المطاعم | Restaurants | Index card only |
| `hospitality.cafes` | Cafés et salons de thé | المقاهي وصالات الشاي | Cafés & tea rooms | Index card only |
| `cleaning.companies` | Sociétés de nettoyage | شركات التنظيف | Cleaning companies | Index card only |
| `wholesale.distributors` | Grossistes et distributeurs | تجار الجملة والموزعون | Wholesalers & distributors | Index card only |
| `institutions.public` | Institutions publiques | المؤسسات العمومية | Public institutions | Index card only |
| `business.offices` | Entreprises et bureaux | الشركات والمكاتب | Businesses & offices | Index card only |

At MVP we ship a single `/secteurs` index page that lists all seven with a short paragraph and a CTA. We do **not** ship seven full landing pages at launch. Deep per-sector pages arrive in Phase 2 once we have content and product associations.

> Why one page, not seven. Each deep page needs sector-specific copy, recommended product list, sector-specific imagery, and ideally a customer reference. Producing seven of these *well* is a 2–3 week content workstream and would block the rest of the MVP.

## Sector-to-product association (data model)

Each `Product` has zero or more recommended sectors via a many-to-many `product_sector` table. This drives:

- "Recommended for hotels" badges on product detail pages.
- Sector landing pages (Phase 2) showing curated product lists.
- Future quote-form prefill ("Tell us your sector → we suggest a starter list").

A single product can serve multiple sectors. Most do.

## Sector pages — content brief (Phase 2)

Each per-sector page (`/secteurs/{key}`) will follow this template:

1. **Hero.** Sector name + 1-sentence positioning ("Des solutions d'hygiène professionnelles pour les hôtels tunisiens.").
2. **Why Prodet for this sector.** 3 bullets max. Manufacturing locally, regulatory compliance (HACCP for hospitality, etc.), delivery footprint.
3. **Recommended product families.** 5–10 products with images and one-line descriptions, linking to product detail pages.
4. **Use cases.** 2–3 short scenarios written in customer language ("Cuisine professionnelle", "Salle de bain client", "Espaces communs").
5. **Sector-specific guidance.** Optional: dilution tables, frequency-of-use recommendations, food-contact considerations. This is the *expert manufacturer* signal.
6. **CTA.** Demander un devis with optional "I am a [sector]" prefill.
7. **Reference customer logos** (only with written consent).

## Sectors deliberately *excluded* from the MVP public site

- **Particuliers / B2C.** Prodet is B2B-first. A consumer page would dilute the manufacturer-credibility narrative and invite low-value support load. Revisit only if the operational economics demand it.
- **Construction / BTP.** The construction items in Swiver are mostly purchases related to Prodet's own factory build, not products for sale. They are an accounting artifact, not a sector served.
- **Healthcare / hôpitaux et cliniques.** Tempting (high-margin, recurring), but it requires regulatory positioning (NF EN 14476 virucidal claims, EN 1276 bactericidal claims, often documented dilution tables) we do not yet have ready. Add in Phase 2 *only if* SDS and efficacy claims are documented.
- **Industrial / heavy industry.** Different product mix. Out of scope unless catalog audit reveals existing demand.
- **Education (schools, universities).** Treat as a future addition under `institutions.public` or as its own key in Phase 3.

## Sector-narrative principles

- **Speak to a buyer in their context, not in chemistry.** A hotel housekeeping manager wants "désinfection des sanitaires sans odeur résiduelle", not "ammonium quaternaire à 0.5%".
- **Lead with the manufacturer story.** Most competitors in Tunisia are pure distributors. Prodet manufactures. That is the differentiator on every sector page.
- **Local proximity is a feature.** "Fabricant tunisien, livraison Grand Tunis sous 48h" beats abstract claims of quality.
- **Avoid fake guarantees.** No certifications we do not actually hold. No claims we cannot back.

## Open questions

These are tracked in [../01-product/open-questions.md](../01-product/open-questions.md) and need answers before Phase 2 sector pages can be written:

- Are *Sociétés de nettoyage* a target sector or a competitor channel? They might be both — they buy from us *and* compete for the same end-customers. Need positioning clarity.
- Should we add `industrie.alimentaire` (food industry — bakeries, dairies, beverage producers) as an MVP sector? They are high-volume buyers of cleaning chemicals and a likely existing customer subset.
- Is there an existing customer concentration in any sector that would justify making it the lead landing page?

## Related

- [vision.md](vision.md)
- [personas.md](personas.md)
- [../07-research/competitors.md](../07-research/competitors.md) — sector pattern analysis from Dustbane, InnuScience, Bunzl, etc.
- [../03-modules/public-site/](../03-modules/public-site/) — implementation spec.
