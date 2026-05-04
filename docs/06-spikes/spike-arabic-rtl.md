# Spike 6 — Arabic + RTL

- **Status.** Not started.
- **Owner.** Souhail.
- **Time box.** 1 day.
- **Blocks.** [ADR 0005](../02-architecture/adr/0005-i18n-strategy.md) Arabic specifics, design tokens, font choice, and the AR portion of the public site.

## Hypothesis

Tailwind logical utilities + `next-intl` + a well-chosen Arabic font render the public site cleanly in `ar` (RTL) including:

- Mixed FR/AR runs in the same paragraph (very common Tunisian B2B reality).
- Numerals (Western 0–9) displayed correctly inside Arabic text.
- Forms with appropriate input direction and placeholder alignment.
- Header/footer/cards layout flipped without per-component manual overrides.

## Why it matters

- Confirms the i18n architecture (ADR 0005) is sound.
- Locks in the font pairing (Latin + Arabic) for design tokens.
- Surfaces any unexpected blockers (e.g. shadcn/ui components needing RTL fixes).

## Method

1. **Sandbox app.** Spin up a throwaway Next.js App Router app (or use a branch in this repo when scaffolded). Install `next-intl`, Tailwind v4, `tailwindcss-rtl` (or rely on logical utilities).
2. **Build a sample page** containing:
   - Header with logo + nav links + language switcher.
   - Hero with title + subtitle + CTA.
   - 3-column card layout.
   - A form (input, textarea, submit).
   - A footer with multiple columns.
3. **Build it bilingually** (FR and AR) using the same components. Verify no AR-specific JSX needed.
4. **Mixed-content test.** Inside an Arabic paragraph, render: a French phrase, a number with thousand separator (`1 234,567 TND`), an English brand name (`Prodet`), and a phone number (`+216 71 XXX XXX`). Use `<bdi>` only where directional embedding is needed.
5. **Font test.** Compare two Arabic font pairings:
   - **Pair A**: Inter (Latin) + IBM Plex Sans Arabic.
   - **Pair B**: Geist Sans (Latin) + Noto Naskh Arabic.
   - Render the same content in both. Pick the one with better visual harmony for mixed runs.
6. **shadcn/ui smoke test.** Drop in 3 shadcn components (Button, Input, Card). Note any RTL issues.
7. **Numerals decision.** Render the same string with Western (0–9) and Eastern (٠–٩) numerals. Ask Mère/Sœur which feels more natural for Tunisian B2B. Default Western unless they prefer Eastern.

## Dataset

- Lorem-ipsum-style FR copy.
- Real AR copy (a paragraph of professional B2B-style Arabic, ideally about cleaning products).
- A short mixed-language paragraph (FR + AR + numerals) representative of real Tunisian product names.

## Gate criteria

| Outcome | Decision |
|---|---|
| Sample page renders cleanly in both directions; mixed runs look correct; one font pair clearly wins | ADR 0005 → Accepted. Font pair locked. Document in [04-design/design-tokens.md](../04-design/design-tokens.md). |
| Some shadcn components need overrides | Acceptable. Document overrides in [04-design/components.md](../04-design/components.md). |
| Significant rendering issues with mixed content | Investigate alternative font / fallback chain. May extend spike by 1 day. |

## Time box

1 day.

## Result

_To fill in:_

- Sample page screenshots (FR LTR / AR RTL).
- Mixed-content rendering notes:
- Font pair chosen:
- shadcn issues:
- Numerals choice:

## Decision

_To fill in:_

- ADR 0005 → confirmed / amended.
- Font pair:
- Tailwind RTL plugin used: yes / no (logical utilities only).
- Followups (component overrides, font subsetting):

## References

- [adr/0005-i18n-strategy.md](../02-architecture/adr/0005-i18n-strategy.md)
- [02-architecture/i18n.md](../02-architecture/i18n.md)
- [04-design/design-tokens.md](../04-design/design-tokens.md)
- [04-design/components.md](../04-design/components.md)
