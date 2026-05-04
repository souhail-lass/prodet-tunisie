# Competitor pattern analysis — B2B cleaning & hygiene

> Status: Draft. Owner: Souhail. Last updated: 2026-05.
>
> Goal: extract the **patterns** that make professional B2B cleaning/hygiene company sites credible and convertable. We are not copying any one of them; we are mining the convergent practice across a peer set, and noting where Prodet's positioning should diverge.

## Peer set

| Company | Geography | Profile | Why we look at them |
|---|---|---|---|
| [Dustbane](https://www.dustbane.ca/) | Canada | Manufacturer + distributor of cleaning chemicals and equipment, ~140 years old. | The archetype of an established North-American B2B cleaning manufacturer. Strong "manufacturer credibility" framing. |
| [InnuScience](https://innuscience.com/) | Canada (with global) | Bioscience-based cleaning solutions; markets to hospitality, healthcare, food. | Very strong sector positioning, scientific credibility, multi-locale. |
| [CP Industries (Champion Products)](https://www.cpicleaning.com/) | USA | Manufacturer of cleaning chemicals, focus on jansan distributors. | Manufacturer-to-distributor messaging; minimal direct-to-end-customer noise. |
| [Chemfax](https://chemfax.com/) | Canada | Cleaning chemicals + paper + accessories; broad catalog. | Comprehensive catalog UX. |
| [W.E. Greer](https://wegreer.com/) | Canada | Distributor of cleaning supplies. Family-run feel. | Family-business presentation; distributor (not manufacturer) — useful contrast. |
| [Swish](https://www.swishclean.com/) | Canada | Distributor + own brands. | Sector-driven IA; "solutions" framing. |
| [Bunzl Cleaning & Hygiene Canada](https://www.bunzlcanada.ca/) | Canada (global parent) | Massive distributor, multi-vertical. | Enterprise-scale catalog and sector landing pages. |
| [Biocip Maroc](https://biocip.ma/) | Morocco | Cleaning products manufacturer/distributor. | MENA peer; French-first. Closest cultural reference. |
| [ACEPRO Maroc](https://acepro.ma/) | Morocco | Hygiene products. | MENA peer. |
| [Mutandis Detergents](https://mutandis.com/) | Morocco | Diversified consumer + B2B detergents. | MENA peer with mixed B2C/B2B. |

(Some sites change frequently; observations below capture patterns that have been stable across visits, not ephemeral campaign content.)

## Dimensions analyzed

For each company we scored — informally — across:

1. **Hero positioning** (what does the homepage say in 5 seconds?).
2. **Sector navigation** (do they organize by sector? where in the IA?).
3. **Catalog depth and structure** (browse by category/family/brand?).
4. **Price visibility** (any public prices? any indicative prices? gated?).
5. **CTA model** (request quote? add to cart? phone-first? portal?).
6. **Manufacturer vs distributor framing** (own production claims, certifications).
7. **Document hosting** (SDS / TDS / fiches techniques on product pages?).
8. **Languages** (FR/EN/AR/multi).
9. **Trust signals** (certifications, customer logos, years in business, footprint).
10. **Conversion friction** (form length, signup required, etc.).

## Convergent patterns (the boring truth)

These show up in 7+ of the 10 sites and represent the safe defaults Prodet Platform should adopt:

- **Sector-first navigation, not product-first.** "Solutions for hotels / restaurants / healthcare / education / industry" appears in the top nav or as the primary IA card grid on the homepage. Buyers self-identify before browsing the catalog.
- **No public prices.** B2B prices are negotiated. Even Bunzl, which has a real customer portal, hides prices behind login. Mutandis (consumer leaning) is the exception.
- **"Request a quote" / "Contact a specialist" as the dominant CTA.** Often paired with a phone number prominently in the header. No "Add to cart → Pay now" except on the consumer-leaning Mutandis.
- **Browseable but not transactional catalog.** Product detail pages exist with images, descriptions, conditionnement, and SDS/TDS downloads — but no price and no add-to-cart.
- **Strong manufacturer-vs-distributor framing.** Manufacturers (Dustbane, InnuScience, CP, Mutandis) lead with "we make this." Distributors (Bunzl, Swish, W.E. Greer) lead with "we curate the right brands for you." Both framings are credible; Prodet is hybrid (mostly manufacturer + some resold articles), and should lead with **manufacturer**.
- **SDS / TDS / fiches techniques as PDF downloads on product pages.** This is table-stakes for B2B chemical sites. Prodet defers to Phase 2 but should plan the layout to accommodate them on product detail pages from day one.
- **Sector landing pages that include scenarios and recommended product lists.** Hotels page recommends 8–12 products; restaurants page recommends a partially-overlapping set; etc. Curated, not just filtered.
- **Trust band on the homepage** with: years in business, geographic footprint, certifications, customer-logo strip (curated).
- **Phone number visible in the header.** Even on the most "modern" sites. Cultural for B2B everywhere; doubly so in MENA.
- **Footer contains: address, phone, hours, social, legal links, sitemap.** Predictable. No surprises.

## Divergent patterns (where they differ — and where we should choose)

- **Languages.**
  - Canadian sites: English + French.
  - Moroccan sites: French primary, sometimes English. **None observed with Arabic primary or even fully translated.** This is a Tunisia-specific opportunity — credible AR support is differentiating in MENA B2B.
  - Bunzl: English-only Canadian site (despite Canada's bilingual legal regime); local presence handles French via separate channels.
- **Customer portal.**
  - Bunzl, Swish: real portals with reorder, history, account-specific catalogs and pricing.
  - Dustbane, InnuScience: contact-first; no portal.
  - Moroccan peers: contact-first; no portal.
  - **Prodet plans portal in Phase 3** — aligned with the larger players, ahead of regional peers.
- **AI / "smart" features.**
  - Almost none on the public sites. Bunzl has a chatbot widget. The others are static-content + forms.
  - **Prodet's AI lives internally**, not in customer-facing widgets. Aligned with the convergent pattern; AI as a back-office advantage, not a customer-facing gimmick.
- **Catalog depth.**
  - Dustbane / Bunzl / Chemfax: thousands of SKUs, hierarchical browse.
  - InnuScience: ~50 hero products, deeply documented.
  - **Prodet aligns with the InnuScience model** at MVP (depth over breadth) and migrates toward Bunzl breadth in Phase 2. We are a small manufacturer; pretending to be Bunzl with 80 products would feel thin.
- **Scientific / technical depth.**
  - InnuScience: heavy science narrative (bioscience, sustainability claims).
  - Dustbane: practical workflow narrative (how to clean a hospital corridor).
  - Mutandis: brand narrative (consumer-leaning).
  - **Prodet should lead with practical + manufacturing** ("fabriqué en Tunisie pour les besoins tunisiens") rather than fight on bio/sustainability claims it does not yet have evidence for.
- **Sustainability framing.**
  - InnuScience, Mutandis: heavy.
  - Dustbane, Chemfax: light.
  - **Prodet:** do not over-claim. Mention what is true; expand in Phase 2 if real evidence accumulates.
- **Pricing transparency.**
  - All except Mutandis: hidden.
  - **Prodet: hidden at MVP.** No deviation.
- **Family-business framing.**
  - W.E. Greer: front and center.
  - Most others: invisible at the corporate level.
  - **Prodet: lean in moderately.** "Entreprise familiale tunisienne" is a credibility asset locally — but the *manufacturer* claim should lead, family second. Avoid emotional or "homespun" voice that could undermine the industrial-supplier positioning.

## Specific UX details worth stealing

- **InnuScience product detail page** — scenarios at the top, then properties, then dilution table, then SDS/TDS downloads. Educational without being preachy. Adapt the structure for Phase 2 product pages.
- **Bunzl sector landing pages** — opening hero with sector name + "we serve X hotels with Y products," then a recommended-product carousel with quick-quote checkboxes. Adopt the carousel pattern for Phase 2.
- **Dustbane "About / Our Manufacturing" page** — photos of the actual plant + quality-process narrative. Powerful credibility builder. Adapt for Prodet's Aouina factory.
- **Biocip Maroc footer** — concise multi-column with a "Demande de devis" CTA repeated. Adopt the repeated-CTA pattern.
- **Swish catalog filter UX** — sector + sub-sector + category nesting, with active-filter chips. Adopt for Phase 2 catalog filters when the resold articles arrive.
- **Mutandis "Nos marques"** — useful pattern only if Prodet ever launches sub-brands. Not a Phase 1 priority.

## Anti-patterns to avoid (observed in some peers)

- **"Buy Online" button on a B2B site that leads to a friction-heavy account-creation form.** Either commit to e-commerce or do not pretend.
- **A blog with last post 2 years old.** Either staff a blog or do not have one.
- **Stock-photo-only product pages with no real factory or product photos.** Hurts credibility immediately.
- **An unclear distinction between "products we make" and "products we resell."** Prodet should be explicit (badge: "Fabriqué par Prodet" vs implicit-resold).
- **Cookie banner over the hero on first paint.** Performance and conversion killer. Avoid by choosing Plausible.
- **Auto-translate widget that reorders Arabic poorly.** Avoid by shipping curated translations only.
- **Hiding the phone number behind a contact form.** B2B buyers want to call.

## Implications for Prodet's IA

Direct lifts to apply (already reflected in [00-overview/sectors.md](../00-overview/sectors.md), [03-modules/public-site/](../03-modules/public-site/), [01-product/mvp-scope.md](../01-product/mvp-scope.md)):

- Top nav: **Catalogue · Secteurs · Fabrication · Devis · Contact**. Phone number in the header.
- Homepage IA: hero (manufacturer claim) → sector cards → manufacturing band → featured product families → CTA.
- Catalog: browse by category, filter by sector. No price. "Demander un devis" on every product page.
- Product detail layout (Phase 2 polish): hero → conditionnement → sectors → use cases → SDS/TDS downloads → quote CTA.
- Sector page template: hero → why-Prodet → recommended product carousel → use cases → CTA.
- Footer: 4 columns (Société, Catalogue, Secteurs, Contact) + legal strip.

## Implications for Prodet's positioning

- **Lead with manufacturing** (not with bioscience, not with family). The peer set tells us this is the highest-credibility lever for a small/medium B2B chemical supplier.
- **Sector second** (alongside, not buried).
- **Tunisian roots third** (proximity, language, regulatory familiarity).
- **Family / personal touch fourth** (footer-level, not hero-level).
- **AI / digital sophistication: invisible to public.** It pays for itself internally.

## Open questions raised by this analysis

- Should Prodet pursue a specific certification narrative in Phase 2 (HACCP for hospitality, ISO 9001, NF EN 1276)? Adds credibility but requires evidence we may not have.
- Should the public site explicitly distinguish "fabriqué par Prodet" vs "distribué par Prodet" badges? Recommended yes — surface in product detail page.
- Mutandis has a fully-developed B2C arm (the parent does); Prodet has explicitly chosen B2B-only. Reconfirm in [open-questions.md](../01-product/open-questions.md).

## Related

- [00-overview/vision.md](../00-overview/vision.md), [00-overview/sectors.md](../00-overview/sectors.md).
- [01-product/mvp-scope.md](../01-product/mvp-scope.md).
- [03-modules/public-site/](../03-modules/public-site/).
- [04-design/content-style-guide.md](../04-design/content-style-guide.md) — to be authored, will codify the voice findings here.
