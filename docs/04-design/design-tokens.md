# Design tokens

> Status: Working. Based on the shared logo and sample label; exact numeric values will be finalized once the source SVG and print files are dropped into the repo. Last updated: 2026-05-04.

## Token categories

Tokens should live as Tailwind v4 `@theme` variables and as CSS custom properties when runtime reuse helps. The point is not token completeness. The point is a consistent Prodet visual language.

## Color

The palette should be implemented in **light mode only** at MVP.

| Token | Role | Direction |
|---|---|---|
| `--color-background` | App/page background | Warm off-white, not pure white |
| `--color-foreground` | Main text | Cool dark ink, not hard black |
| `--color-card` | Cards and panels | Pure white or near-white |
| `--color-border` | Dividers, cards, inputs | Stronger than default SaaS gray |
| `--color-primary` | Main action color | Real Prodet blue from the wordmark |
| `--color-primary-strong` | Dense blue surfaces | Darker label-style blue |
| `--color-secondary` | Quiet supporting surfaces | Very light neutral/blue tint |
| `--color-accent` | Tiny visual highlights | Light signal blue only |
| `--color-support` | Secondary accent | Prodet green, used sparingly |
| `--color-success` | Positive states | Close to the green family but not identical |
| `--color-warning` | Caution states | Practical amber, not saturated orange |
| `--color-destructive` | Error states | Standard accessible red |
| `--color-ring` | Focus ring | Blue with strong contrast on ivory/white |

Implementation rule:

- Use the **blue family** to structure the interface.
- Use **green only as a support note**, not as the main action language.
- Avoid decorative gradients except where a restrained label-inspired geometric surface is intentional.

## Typography

| Token | Direction |
|---|---|
| `--font-display` | `IBM Plex Sans` preferred for headings, nav, and labels |
| `--font-sans` | Neutral readable body sans; may stay close to current body stack if needed |
| `--font-arabic` | `IBM Plex Sans Arabic` or equivalent |
| `--font-mono` | Reserved for codes only; do not let the UI become monospaced |

Typography rules:

- Eyebrows and product labels may use uppercase with wider tracking.
- Main content headings should stay in sentence case per [content-style-guide.md](content-style-guide.md).
- Product codes and conditionnement should use tabular numerals.
- Arabic text should not inherit Latin tracking behavior.

## Spacing and layout

- Reduce default public-site vertical rhythm from the current oversized SaaS spacing.
- Desktop sections should generally live in the `py-12` to `py-16` range.
- Mobile sections should remain compact enough that the user can reach product and quote content early.
- Keep text measures around `60ch` to `65ch` for long paragraphs.
- Keep the main container wide enough for dense catalog/product layouts without drifting into edge-to-edge content.

## Radii

- `--radius-xs`: 4px
- `--radius-sm`: 6px
- `--radius-md`: 8px
- `--radius-lg`: 10px
- `--radius-xl`: 14px

Direction:

- Public-site cards should feel practical and engineered, not pillow-soft.

## Shadows

- Card shadows should be flatter and darker than the current placeholder treatment.
- Borders should do most of the structural work.
- No glow effects on CTA surfaces.

## Motion

- Hover and tap feedback: `120ms` to `180ms`
- Section reveal and layout transitions: around `200ms` to `240ms`
- Motion should confirm hierarchy, not advertise animation

Allowed:

- subtle hover lift on product cards,
- soft opacity/translate reveals,
- button/state transitions.

Avoid:

- parallax,
- large spring animations,
- decorative scroll theatrics.

## Z-index

- Header: `50`
- Dropdown/popover: `60`
- Modal/dialog: `100`
- Toast: `200`

## Breakpoints

- Tailwind defaults are sufficient.
- Consider an `xs` breakpoint only if low-end 360px screens show real layout pain in the quote flow or header.

## Modes

- Light only at MVP.
- Dark mode is not a requirement for the public site.
- If dark mode ever appears, the admin console should get it first, not the marketing surface.

## Related

- [brand.md](brand.md)
- [components.md](components.md)
