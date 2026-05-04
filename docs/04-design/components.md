# Components

> Status: Working public-site component brief for the v2 redesign. Last updated: 2026-05-04.

## Foundation

- shadcn/ui copied into `src/components/ui/` (full ownership).
- Composed components in `src/components/`.
- Module-specific components co-located with their route group when possible.

## Foundation primitives

`Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `Label`, `Card`, `Dialog`, `Popover`, `Tabs`, `Toast`, `Tooltip`, `Skeleton`, `Avatar`, `Separator`.

## Layout

`SiteHeader`, `SiteFooter`, `AdminShell`, `LocaleSwitcher`, `LanguageMenu`, `BreadcrumbBar`.

## Public site v2 components

### Site shell

- `TopUtilityBar`
- `SiteHeader`
- `SiteFooter`
- `LocaleSwitcher`
- `WhatsAppLink`

Rules:

- The header must show the real logo, not a text fallback, once assets land.
- The shell must expose a visible quote/contact path without looking like a sticky sales banner.
- Footer should prioritize trust, contact, and navigation over filler copy.

### Homepage

- `HeroSection`
- `BestSellersStrip`
- `SectorMosaic`
- `ManufacturerBand`
- `HowWeWorkStrip`
- `TrustWall`
- `FinalCtaBand`

Rules:

- The hero must show a real product visual.
- The sector block must represent the 7 MVP sectors, not a made-up number of tiles.
- Trust components should use real proof and text cues, not invented metrics or decorative icon trios.

### Catalog and product

- `ProductCard`
- `ProductGrid`
- `CatalogFilters`
- `ProductDetailLayout`
- `RelatedProductsStrip`
- `QuoteCtaRail`

Rules:

- `ProductCard` must always surface image, code, and conditionnement clearly.
- Missing images should fall back to an on-brand placeholder, not a gray empty box.
- Product detail on desktop should keep the quote CTA rail visible; mobile should keep the CTA reachable without hunting.

### Quote and contact

- `QuoteCart`
- `QuoteForm`
- `ContactForm`
- `MapEmbed`
- `LegalPageLayout`

Rules:

- Quote forms must feel lighter than enterprise procurement software.
- Contact and quote pages should reassure quickly: address, phone, WhatsApp, and what happens next.

## Admin / Console

`OrderQueueTable`, `OrderReviewLayout`, `OrderLineRow`, `ProductPicker`, `CustomerPicker`, `AliasSuggestionDialog`, `ConfidenceBadge`, `RawInputViewer`, `PdfPreview`, `KeyboardShortcutsLegend`.

## Shared utility

`EmptyState`, `ErrorState`, `LoadingState`, `ConfirmDialog`, `CopyableText`.

## Component conventions

- Server components by default. Mark `'use client'` only when needed.
- Forms via React Hook Form + Zod. No uncontrolled inputs.
- Direction-aware (RTL): use logical properties / Tailwind logical utilities; avoid `ml-*` / `mr-*` outside legacy components.
- Accessibility: labels for all inputs; visible focus states; ARIA where roles need clarity.
- No emojis. No marketing voice in copy.
- No decorative component variants that are not tied to a real product or UX need.

## UX guardrails

- The site should expose `Demander un devis` at all critical decision points without repeating the same CTA block mechanically.
- We prefer **denser and clearer** over **bigger and emptier**.
- Product pages should feel like professional specification pages with a clear next step, not editorial articles.
- AR and EN variants must inherit the same hierarchy and not look like afterthought translations.

## Related

- [brand.md](brand.md)
- [design-tokens.md](design-tokens.md)
- [../06-spikes/spike-arabic-rtl.md](../06-spikes/spike-arabic-rtl.md) — RTL component validation.
