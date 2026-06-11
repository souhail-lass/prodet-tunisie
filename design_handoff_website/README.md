# Handoff: Prodet Tunisie — Public Website (1:1 match)

## Why your site didn't match the download

The standalone HTML you exported is a **design reference** built from a specific
set of plain-CSS files plus the DM Sans typeface. When you handed it to Claude
Code, it rebuilt the look from scratch — approximating colors and spacing, using
utility classes with eyeballed values, and not wiring the exact font. That's why
it "ain't the same."

The fix in this package is to stop re-deriving the styling and instead drop in the
**exact source CSS** the mockup uses. The styles are portable plain CSS with custom
properties (not Tailwind, not framework-specific), so they apply 1:1 in your
Next.js app. Match the class names + DOM structure and it becomes pixel-identical.

> **These files are a design reference, not drop-in production code for the whole
> app.** Recreate the *presentation* in your existing Next.js environment using
> your routing/data patterns — but for styling, use the provided CSS verbatim
> rather than reinterpreting it.

## Fidelity

**High-fidelity.** Final colors, typography, spacing, radii, shadows, and copy.
Recreate pixel-for-pixel against the oracle file.

## What's in this folder

| File | What it is | How to use it |
|---|---|---|
| `PROMPT_FOR_CLAUDE_CODE.md` | A ready directive | Paste into Claude Code in your repo |
| `prodet-tokens.css` | **Source-of-truth tokens** + `@font-face` | Import globally, once |
| `kit.css` | Exact layout CSS: header, hero, trust, sectors, featured, CTA band, footer | Import globally |
| `kit-pages.css` | Exact CSS for catalogue, product detail, sectors, about, contact, quote drawer | Import globally |
| `reference/prodet-website-standalone.html` | **The pixel oracle** — open in a browser (view source for exact markup/classes/copy) | Diff your build against it |
| `reference/data.js` | Exact product data used in the oracle | Mirror this data |
| `fonts/` | DM Sans ×4 + Cairo ×4 (TTF) | Serve at the path the CSS expects |
| `assets/` | `logo-prodet.png`, `sirafan.png` | Logo + sample packshot |

## Implementation steps

1. Copy `prodet-tokens.css`, `kit.css`, `kit-pages.css` into your app (e.g.
   `src/styles/prodet/`) and import all three globally (in Next.js, import them in
   `app/layout.tsx` or `pages/_app.tsx`). Import order: tokens first.
2. Put the `fonts/` files where the `@font-face` `src:` paths resolve (the CSS
   expects `fonts/DMSans-*.ttf` relative to `prodet-tokens.css`). Adjust the paths
   to your asset route if needed — but keep DM Sans 400/500/600/700.
3. Recreate each section using the **same class names** from the oracle's markup
   (view source). Keep your own React/Next components and data layer — only the rendered markup +
   classes need to match.
4. Open `reference/prodet-website-standalone.html` beside your running build and
   diff section by section. Fix any drift until indistinguishable.

## Design tokens (quick reference — full values in `prodet-tokens.css`)

**Colors**
- Primary blue `#095296` (actions, links, active nav) · hover `#074173` · press `#05335C`
- Navy `#063561` (hero, footer, sidebar) · navy-soft `#0A4173`
- Sky `#41AAE2` (sparkle accent — used sparingly)
- Green `#24883E` ("Fabriqué par Prodet" / success) · hover `#1C6E31`
- Page canvas `#F7F6F3` (warm off-white — **never** pure white) · card `#FFFFFF` · sunken `#F0EEEA`
- Text: primary `#1A1A18` · secondary `#6B6B67` · tertiary `#A8A7A3` · on-dark `#FFFFFF` / soft `#B9CBDD`
- Borders: default `#D8D7D3` · strong `#BFBEB9`
- Status: En cours blue · Livré green · En préparation `#B26B04` · Annulé `#B23B3B`

**Type** — DM Sans (400/500/600/700). Display 48px · H1 36 · H2 28 · H3 22 · H4 18 ·
lead 17 · body 15 · sm 13 · xs 12 · eyebrow 11. Display tracking `-0.02em`. Sentence
case headings; uppercase only on small eyebrow labels (`tracking 0.14em`).

**Spacing** — 4px grid (4/8/12/16/20/24/32/40/48/64/80/96). Container max `1280px`,
header height `68px`, catalogue sidebar `256px`.

**Radii** — cards `12px`, buttons/inputs `8px`, panels `16px`, badges pill `999px`,
chips `4px`.

**Shadows** — soft, blue-tinted, low spread:
`--shadow-card: 0 2px 8px rgba(6,53,97,0.06)` · `--shadow-card-hover: 0 6px 20px rgba(9,82,150,0.12)`
· `--shadow-focus: 0 0 0 3px rgba(9,82,150,0.18)`. No heavy black drop shadows.

**Motion** — one curve `cubic-bezier(0.22,0.61,0.36,1)`, durations 130/200/320ms.
No gradients, no decorative/infinite animation. Respect `prefers-reduced-motion`.

## Screens in the oracle

Home (navy hero + packshot, trust row, sectors grid, featured products, navy CTA
band, footer), Catalogue (256px sidebar filters + product grid, no prices),
Product detail (sunken image stage, "Ajouter au devis" stepper), Sectors, About,
Contact, and the right-side **Quote drawer** ("Demander un devis").

## Commercial rules baked into the design

- **No public prices, no public stock.** Primary CTA everywhere: **"Demander un devis"**.
- Manufactured products carry the green **"Fabriqué par Prodet"** badge; resold
  accessories never do.
- Trilingual FR (default) / AR (RTL, Cairo font) / EN.
