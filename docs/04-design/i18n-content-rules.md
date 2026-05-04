# i18n content rules

> Status: Draft. Owner: Souhail. Last updated: 2026-05.

## Locales (recap)

`fr` (default), `ar` (RTL), `en`. See [../02-architecture/i18n.md](../02-architecture/i18n.md).

## Translation discipline

- **No machine translation in production.** AI may draft; humans review.
- **Glossary-first.** Domain terms come from [../00-overview/glossary.md](../00-overview/glossary.md). Translators do not coin new terms.
- **Keep FR inline if unsure.** A French term inside an Arabic sentence is acceptable when the AR equivalent is uncertain. Do not invent.
- **Mirror, don't shrink.** AR translations are full sentences, not literal word-for-word. Tunisian B2B Arabic conventions for professional registers.
- **English is for credibility, not casual.** Avoid colloquialisms in EN copy; this is a B2B audience.

## Numerals

- Default Western (0–9) across all locales at MVP. Confirm with Mère/Sœur during AR content review.
- Currency: TND with thousands and decimal separators per locale convention.

## Mixed-content paragraphs

- A French phrase inside Arabic text is fine. Use `<bdi>` only when directional embedding becomes visually wrong (rare).
- Brand names (Prodet) stay Latin in all locales.
- Product canonical names (often FR with capital letters) stay as-is in the canonical name slot in all locales.

## Plurals

- Use ICU MessageFormat plural syntax. Provide all forms even when not different (`one`, `other`).

## Page-level priorities at MVP (translation order)

1. Homepage hero + CTA.
2. Footer.
3. Header nav.
4. Quote-request form.
5. Contact page.
6. Sector index card text.
7. Legal pages.
8. Catalog filters and labels.
9. Product short descriptions (deferred — FR-only at MVP for product long descriptions).

## Missing-key handling

- Dev: warn loudly + Sentry breadcrumb.
- Production: render the key path (`home.hero.title`) so the gap is visible. Never fall back to FR silently — that hides the issue.

## Asset versioning

- `messages/{locale}/{namespace}.json` checked into the repo. Diff-friendly.
- Phase 2 may move to runtime-loaded messages if a non-developer needs to author copy.

## Related

- [../02-architecture/i18n.md](../02-architecture/i18n.md)
- [../02-architecture/adr/0005-i18n-strategy.md](../02-architecture/adr/0005-i18n-strategy.md)
- [../00-overview/glossary.md](../00-overview/glossary.md)
- [content-style-guide.md](content-style-guide.md)
