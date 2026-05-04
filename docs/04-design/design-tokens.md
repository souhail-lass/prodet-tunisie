# Design tokens — placeholder

> Status: Awaiting brand inputs ([Q4](../01-product/open-questions.md)) and [Spike 6](../06-spikes/spike-arabic-rtl.md) outcome.

## Token categories

Tokens will live as Tailwind v4 `@theme` variables and as CSS custom properties for runtime themability if needed.

- **Color** — primary / surface / muted / accent / destructive / success / warning, plus per-state shades. Defined in OKLCH for predictable contrast across light / dark.
- **Typography** — font families (Latin + Arabic), sizes, line heights, weights, letter spacing.
- **Spacing** — Tailwind default scale + project-specific extensions if any.
- **Radii** — small (4px), medium (8px), large (16px), full.
- **Shadows** — subtle (cards), medium (popovers), strong (modals).
- **Motion** — durations + easings used for transitions (50ms tap-feedback, 200ms layout, 400ms enter).
- **Z-index** — header (50), dropdown (60), modal (100), toast (200).
- **Breakpoints** — Tailwind defaults; possibly an extra `xs` (~360px) for low-end mobile parity.

## Modes

- Light only at MVP.
- Dark mode considered in Phase 2 (admin console first).

## Related

- [brand.md](brand.md)
- [components.md](components.md)
