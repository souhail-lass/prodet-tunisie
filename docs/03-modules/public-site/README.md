# Module — Public site

> Status: Spec stub. Owner: Souhail. Last updated: 2026-05.
> Scope: [../../01-product/mvp-scope.md §Slice A](../../01-product/mvp-scope.md#in-scope--slice-a-public-b2b-website).

## Purpose

The customer-facing surface of Prodet Platform. The public site exists to:

1. Establish **manufacturer credibility** for new B2B prospects (the "Google searcher" persona) within 30 seconds.
2. Present a browseable catalog of **manufactured products** organized by category and sector.
3. Convert prospect intent into a structured **quote request** that lands in the same internal queue as parsed emails.
4. Keep the door open for offline conversation via **WhatsApp deep links** and a visible phone number.

What it explicitly does **not** do at MVP: show prices, show stock, allow checkout/payment, host a customer login (that is the portal in Phase 3), present articles commercialisés (Phase 2), present sector deep landing pages (Phase 2), host a blog or news section.

## Routes (under `[locale]`)

```
/                                  homepage
/a-propos                          about / manufacturing / quality
/secteurs                          sectors index (one page at MVP)
/catalogue                         catalog index with filters
/catalogue/[slug]                  product detail
/devis                             quote request (multi-product cart)
/contact                           contact + map + WhatsApp
/mentions-legales                  legal
/confidentialite                   privacy policy
/cookies                           cookie notice
```

## Pages — content briefs

### Homepage (`/`)

- **Hero.** One sentence positioning ("Fabricant tunisien de produits d'hygiène et d'entretien professionnels."), one supporting line, primary CTA "Demander un devis", secondary CTA WhatsApp.
- **Sector teaser** (3–4 cards). Linking to `/secteurs`.
- **Manufacturing band.** One photo (or placeholder) + 2 short paragraphs on the Aouina factory and quality.
- **Featured product families.** 3 cards from the manufactured catalog.
- **Trust strip.** Years in business, "fabriqué en Tunisie", certification logos when available.
- **CTA band.** "Vous voulez un devis sur mesure ?" + "Demander un devis" button + visible phone.
- **Footer.** 4 columns (Société, Catalogue, Secteurs, Contact) + legal strip.

### About (`/a-propos`)

- Founding story (location L'Aouina, current scale).
- Manufacturing capability narrative.
- Quality + safety positioning.
- Team brief (no PII; role-anchored).

### Sectors index (`/secteurs`)

- One page. 7 sectors with key + label + 2-line teaser + CTA.
- See [../../00-overview/sectors.md](../../00-overview/sectors.md).

### Catalog index (`/catalogue`)

- Filters: category, family, sector.
- Sort: name, family.
- Grid of product cards: image (or placeholder), name (localized), category, "Voir le produit" link.
- Pagination or infinite scroll (decide at implementation; pagination preferred for SEO).

### Product detail (`/catalogue/[slug]`)

- Image (or placeholder) gallery.
- Localized name + canonical Swiver name (small, secondary).
- Conditionnement + unit of sale.
- Long description.
- Recommended sectors (badges).
- Fiche technique download (Phase 2).
- SDS download (Phase 2).
- Prominent CTA: "Demander un devis pour ce produit" → adds to quote cart.
- Related products (3 from the same family).

### Quote request (`/devis`)

- Multi-line cart (lines added from product detail pages, persisted in localStorage).
- Customer fields: name, company, email, phone, sector (select), notes.
- Cloudflare Turnstile + honeypot.
- Submit → server action creates `OrderDraft` with `source = 'web_quote'`, `status = 'review'`, sends admin notification, returns confirmation page with order reference and WhatsApp deep link.

### Contact (`/contact`)

- Address (20 Rue de Somalie, L'Aouina, Tunis 2045).
- Phone (Q10).
- Email.
- WhatsApp deep link.
- Embedded map (OpenStreetMap or Google Maps embed — pick the one that does not require API key cost).
- Optional: short form for general inquiries (separate from quote — feeds same queue with `source = 'web_quote'` and a marker).

### Legal pages

- `/mentions-legales` — RC, MF, address, hosting provider, contact.
- `/confidentialite` — RGPD-aligned. See [../../02-architecture/security-rgpd.md](../../02-architecture/security-rgpd.md).
- `/cookies` — describe cookies in use (Plausible = none functional; Supabase session cookie if any auth flow ever lands on public).

## Cross-cutting

- **Languages.** FR complete, AR (RTL) and EN scaffolded. See [../../02-architecture/i18n.md](../../02-architecture/i18n.md).
- **SEO.** Sitemap, robots, per-page meta, OG, JSON-LD `Organization` and `Product`. `hreflang` on every alternate URL.
- **Analytics.** Plausible (no cookie banner needed).
- **Performance.** LCP < 2.5s mobile 4G on `/` and `/catalogue`.
- **Accessibility.** WCAG 2.2 AA on critical paths.
- **Responsive.** Mobile-first.
- **WhatsApp.** `wa.me/216XXXXXXXX` deep links from header, footer, product CTA, contact, quote-confirmation.

## Components (anticipated)

- `<SiteHeader />` — logo, nav, language switcher, phone number, "Demander un devis" CTA.
- `<SiteFooter />` — 4 columns + legal strip.
- `<HeroSection />` — composable; reused on homepage and (Phase 2) sector pages.
- `<ProductCard />` — image, name, category, link.
- `<ProductDetailLayout />` — all elements above.
- `<SectorCard />` — icon, name, teaser, link.
- `<QuoteCart />` — list of selected products, qty inputs, remove buttons; persisted in localStorage.
- `<QuoteForm />` — RHF + Zod, Turnstile.
- `<WhatsAppLink />` — wraps `wa.me/...` with prefilled message.
- `<LocaleSwitcher />` — preserves current path, sets cookie.

Most are shadcn-derived primitives (Button, Card, Input, etc.) composed into the above.

## Data dependencies

- `product` (visible-public subset) + `product_translation` + `product_asset` + `product_sector`.
- `sector`.
- `category` and `family`.
- (no auth required for the public surface).

## Performance considerations

- ISR for catalog and product detail. Revalidate on demand from the admin UI when a product visibility/translation/asset changes.
- `next/image` for all product images. Self-hosted via Supabase Storage public bucket.
- Self-hosted fonts via `next/font` (subset; AR included for `ar` locale only).

## Out of scope (this module, this phase)

- Articles commercialisés in catalog.
- Sector deep landing pages (`/secteurs/[key]`).
- SDS / fiches techniques downloads (PDFs).
- Search bar (Phase 2).
- Customer login (Phase 3 portal).
- Blog / news.

## Related

- [../../01-product/mvp-scope.md](../../01-product/mvp-scope.md)
- [../../01-product/non-goals.md](../../01-product/non-goals.md)
- [../../00-overview/sectors.md](../../00-overview/sectors.md)
- [../../07-research/competitors.md](../../07-research/competitors.md)
- [../../02-architecture/i18n.md](../../02-architecture/i18n.md)
- [../order-intake/](../order-intake/) — receives the quote-form submissions.
