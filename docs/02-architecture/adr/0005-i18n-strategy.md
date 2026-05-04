# ADR 0005 — i18n with `next-intl`, three locales, RTL for Arabic

- **Status.** Proposed
- **Date.** 2026-05-03
- **Owner.** Souhail
- **Supersedes.** —

## Context

Per [vision.md](../../00-overview/vision.md) and the user's choice during conception, MVP must support **French + Arabic + English from day one**. Architecture must be i18n-ready even if content rolls in progressively.

Constraints:

- App Router (server components first).
- Three locales: `fr` (default, complete), `ar` (RTL, scaffolded then progressive), `en` (scaffolded then progressive).
- Mixed FR/AR product names must work as-is in the data model.
- SEO requires `hreflang`, `<html lang dir>`, locale-specific canonicals.

Plausible options:

1. **`next-intl`** — App Router-native i18n with server-component support and `[locale]` segment routing.
2. **`next-i18next`** — Pages Router-friendly; not as well aligned with App Router.
3. **`react-intl` (FormatJS)** — powerful ICU but no App Router routing helpers.
4. **Custom** — build dictionary loading and routing ourselves.

## Decision

We use **`next-intl`**. Locale lives in the URL as `[locale]` (`/fr/...`, `/ar/...`, `/en/...`). Default locale is `fr`. Root `/` redirects per `Accept-Language` with `fr` fallback.

Locales: `fr` (default), `ar` (RTL), `en`.

Messages live in `src/messages/{locale}/{namespace}.json`. ICU MessageFormat for plurals.

RTL handled by Tailwind logical utilities and `dir="rtl"` on `<html>` for `ar`.

Product names use the data model's `product_translation` table (per-locale) plus `product_alias` (any string in any language, mixed allowed).

## Alternatives considered

- **`next-i18next`.** Mature, but its server-component story is less polished than `next-intl`. Rejected.
- **FormatJS / `react-intl`.** Excellent ICU support but lacks Next.js routing helpers. Would still need custom routing. Rejected.
- **Custom.** Adds maintenance debt for a problem already well-solved.
- **Single locale (FR only) at MVP, AR/EN later.** This was the alternative path during conception. Rejected by the user; we accept the increased content workload and ship with i18n architected day one + content shipped progressively.

## Consequences

- **Positive.**
  - Server-component-aware translations; minimal client JS.
  - Type-safe message keys via codegen.
  - Native App Router routing via `[locale]`.
  - SEO hooks (`hreflang`, `<html lang dir>`) handled in one place.
- **Negative.**
  - We pay the i18n complexity cost from day one even though only FR is content-complete at MVP.
  - Locale URL prefix on every route adds slight noise (acceptable).
  - Translation discipline is required: missing keys must be visible (not silently fallback to FR), to avoid drifting locales.
- **Neutral.**
  - We do not auto-translate. AI may draft; humans review.
  - We do not allow user-language preference outside the URL path (no cookie-only locale).

## Open questions

- Should AR use Western Arabic numerals (0–9) or Eastern (٠–٩)? Default Western. Confirm during AR content review.
- Whether to ship `fr-TN` and `ar-TN` as distinct locales or use `fr` and `ar` directly. Default to short forms (`fr`, `ar`, `en`) in URLs and use `fr-TN`, `ar-TN` only in `hreflang`. Less URL noise.

## References

- [i18n.md](../i18n.md), [../../06-spikes/spike-arabic-rtl.md](../../06-spikes/spike-arabic-rtl.md), [../../00-overview/glossary.md](../../00-overview/glossary.md).
- [`next-intl` docs](https://next-intl-docs.vercel.app)
