# Brand — Prodet

> Status: Working brand direction based on the shared logo and sample product label. Exact numeric palette values still need confirmation from source SVG / print files. Owner: Souhail. Last updated: 2026-05-04.

## Inputs reviewed

- Prodet logo with rounded blue wordmark, blue orbit stroke, green lower sweep, and cyan sparkle detail.
- Sample `PROLAX LIQUIDE` label on a white industrial container with blue geometric fields, bilingual FR/AR copy, and dense specification blocks.

These inputs are enough to stop using placeholder brand assumptions.

## Brand reading

- **Industrial, not SaaS.** The site should feel like a manufacturer, not a software landing page.
- **Clean, not luxury-minimal.** We want disciplined hierarchy, not huge empty white bands.
- **Tunisian, not generic.** Local credibility is part of the sales argument.
- **Manufacturer, not retailer.** Product format, conditionnement, and practical use cases matter more than broad lifestyle imagery.
- **Bilingual by construction.** The label already proves FR/AR coexistence; the site should feel structurally ready for both.

## Logo system

- **Primary signature.** Use the full wordmark on white or off-white surfaces.
- **Small-screen signature.** A mark-only variant is acceptable only after a clean source-mark export exists. We should not improvise a symbol by cropping the screenshot.
- **Clearspace.** Keep at least the height of the lowercase `o` around the logo.
- **Minimum width.** Do not use the full signature below roughly 120px width without testing legibility.
- **Backgrounds.** Prefer white, ivory, or very light neutral surfaces. Avoid placing the logo directly on busy photography.
- **Misuse to avoid.** No stretching, recoloring, drop shadows, or outline effects.

## Provisional palette

These values are approximate from the shared screenshots and should be replaced with exact source-derived values before implementation.

| Token | Role | Provisional value | Notes |
|---|---|---|---|
| `brand-blue` | Primary brand/action color | `#0F5DA8` | Wordmark and main CTA direction |
| `brand-blue-deep` | Dense informational surfaces | `#113E8B` | Derived from the darker label blocks |
| `brand-blue-light` | Small highlights only | `#25A6E6` | Sparkle/detail accent, not a background wash |
| `brand-green` | Support accent | `#1E9D4F` | Secondary emphasis only |
| `surface-ivory` | Default page background | `#F7F5F0` | Warmer than pure white |
| `surface-white` | Cards and image frames | `#FFFFFF` | Keep packshots and labels crisp |
| `line-gray` | Borders and dividers | `#D9DFE6` | Strong enough to structure dense layouts |
| `ink` | Headings and dark text | `#16324A` | Cooler than black, less harsh |

## Typography direction

- **Latin display and labels.** `IBM Plex Sans` is the current preferred direction. It is technical, sharp, and works well for uppercase product names and codes.
- **Latin body.** Neutral sans, compact and readable at small sizes. If we keep a separate body font, it must stay visually compatible with the display face.
- **Arabic UI and content.** `IBM Plex Sans Arabic` or an equivalent with good small-size clarity and balanced weight mapping.
- **Code treatment.** Product codes and conditionnement should use tabular numerals and a compact uppercase label style.
- **What to avoid.** Consumer-rounded fonts, decorative condensed faces, or a single undifferentiated font treatment across every UI layer.

## Imagery direction

- **Hero visuals.** Real product packshots on white or ivory are stronger than generic lifestyle scenes.
- **Factory imagery.** Honest daylight photography of production, storage, or exterior context. No stock-photo gestures.
- **Product imagery.** Cutouts preferred for catalog cards. Label close-ups can be used as secondary detail crops.
- **Sector imagery.** Use only if it adds context. Do not let stock-like sector photos overpower the actual products.

## Graphic language

- Use the **label geometry** as a cue: diagonal fields, angled separators, strong rectangular blocks.
- Keep those shapes restrained. One or two directional moments per page is enough.
- Prefer **borders and layout structure** over glow, blur, or oversized gradients.
- Use green sparingly so it stays distinctive.

## UI implications

- Product codes, conditionnement, and quote actions must always read as first-class information.
- Trust should come from proof: logo, packshots, manufacturing language, location, and contact paths.
- The site should feel denser and more useful than a generic marketing site, while still scanning cleanly on mobile.

## Related

- [design-tokens.md](design-tokens.md)
- [components.md](components.md)
- [content-style-guide.md](content-style-guide.md)
- [../06-spikes/spike-arabic-rtl.md](../06-spikes/spike-arabic-rtl.md)
- [../01-product/open-questions.md Q4, Q5](../01-product/open-questions.md)
