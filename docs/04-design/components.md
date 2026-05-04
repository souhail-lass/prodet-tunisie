# Components — placeholder

> Status: To be authored as the design system is built (Phase 0 → Phase 1A week 1).

## Foundation

- shadcn/ui copied into `src/components/ui/` (full ownership).
- Composed components in `src/components/`.
- Module-specific components co-located with their route group when possible.

## Catalog (anticipated)

### Foundation (shadcn-derived)

`Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `Label`, `Card`, `Dialog`, `Popover`, `Tabs`, `Toast`, `Tooltip`, `Skeleton`, `Avatar`, `Separator`.

### Layout

`SiteHeader`, `SiteFooter`, `AdminShell`, `LocaleSwitcher`, `LanguageMenu`, `BreadcrumbBar`.

### Public site

`HeroSection`, `SectorCard`, `ProductCard`, `ProductDetailLayout`, `QuoteCart`, `QuoteForm`, `WhatsAppLink`, `MapEmbed`, `LegalPageLayout`.

### Admin / Console

`OrderQueueTable`, `OrderReviewLayout`, `OrderLineRow`, `ProductPicker`, `CustomerPicker`, `AliasSuggestionDialog`, `ConfidenceBadge`, `RawInputViewer`, `PdfPreview`, `KeyboardShortcutsLegend`.

### Shared utility

`EmptyState`, `ErrorState`, `LoadingState`, `ConfirmDialog`, `CopyableText`.

## Component conventions

- Server components by default. Mark `'use client'` only when needed.
- Forms via React Hook Form + Zod. No uncontrolled inputs.
- Direction-aware (RTL): use logical properties / Tailwind logical utilities; avoid `ml-*` / `mr-*` outside legacy components.
- Accessibility: labels for all inputs; visible focus states; ARIA where roles need clarity.
- No emojis. No marketing voice in copy.

## Related

- [brand.md](brand.md)
- [design-tokens.md](design-tokens.md)
- [../06-spikes/spike-arabic-rtl.md](../06-spikes/spike-arabic-rtl.md) — RTL component validation.
