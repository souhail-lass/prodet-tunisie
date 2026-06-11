# Paste this to Claude Code

> Copy everything below the line into Claude Code, run from the root of your
> `prodet-tunisie` repo, with this `design_handoff_website/` folder placed
> somewhere it can read (e.g. dropped into the repo, or referenced by path).

---

You previously implemented the Prodet website but it does **not** match the
reference. The problem is that the styling was rebuilt from scratch (approximated
colors/spacing, Tailwind utilities with eyeballed values, wrong font wiring). We
are going to fix it by using the **exact** source styles, not re-deriving them.

**Read these files in `design_handoff_website/` first:**
- `README.md` — full spec and the rules below, expanded.
- `prodet-tokens.css` — the source-of-truth design tokens (colors, type, spacing,
  radii, shadows, motion, base layer) + `@font-face` for DM Sans & Cairo.
- `kit.css` and `kit-pages.css` — the **exact** layout/section CSS for every part
  of the site (header, hero, trust row, sectors, featured grid, CTA band, footer,
  catalogue, product detail, sectors, about, contact, quote drawer).
- `reference/prodet-website-standalone.html` — open this in a browser. It is the
  **pixel oracle**. The result must match it 1:1. View source to read the exact
  markup, class names, and copy used to produce it.
- `reference/data.js` — the exact product data used in the oracle.
- `fonts/` and `assets/` — the actual font files, logo, and product packshot.

**Non-negotiable rules:**

1. **Use the provided CSS verbatim.** Copy `prodet-tokens.css`, `kit.css`, and
   `kit-pages.css` into the app (e.g. `src/styles/`) and import them globally.
   Do **not** translate them into Tailwind, CSS Modules, or styled-components, and
   do **not** "tidy up" or change any value. Every visual property already lives
   in these files.
2. **Reuse the exact class names** from the oracle's markup (`.site-header`,
   `.hero`, `.hero__title`, `.trust`, `.sector-card`, `.featured-grid`,
   `.cta-band`, `.site-footer`, etc.) so the CSS applies with zero remapping.
   Recreate the same DOM structure those components render.
3. **Wire DM Sans (and Cairo for AR) from the provided font files** at weights
   400/500/600/700. `@font-face` blocks are already in `prodet-tokens.css` — just
   make the `fonts/` files resolvable at the path the CSS expects (or adjust the
   `src:` paths to your asset route). Do not substitute Inter/Roboto/system fonts.
4. **Never hard-code a hex, px, shadow, or radius.** Reference the CSS variables
   (`var(--prodet-blue)`, `var(--surface-page)`, `var(--radius-card)`,
   `var(--shadow-card)`, …). If you think you need a value that isn't a token,
   stop — it's already a token.
5. **Match the oracle, not your judgment.** Page background is warm off-white
   `#F7F6F3`, never pure white. Hero/footer are flat navy `#063561`, **no
   gradients** anywhere. Headings are **sentence case**, never uppercase (only the
   small eyebrow labels are uppercase). The primary CTA is always **"Demander un
   devis"** — there are no public prices and no stock counts.
6. **After implementing, open your build next to
   `reference/prodet-website-standalone.html` and diff them section by section**
   (header, hero, trust, sectors, featured products, CTA band, footer). Fix any
   drift in spacing, color, font weight, radius, or shadow until they are
   indistinguishable.

Keep my app's routing, data layer, and component framework (Next.js) — only the
**presentation** must become a 1:1 match to the oracle using the supplied CSS.
