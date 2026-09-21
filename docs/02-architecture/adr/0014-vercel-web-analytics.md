# ADR 0014 — Vercel Web Analytics via `@vercel/analytics`

- **Status.** Accepted
- **Date.** 2026-09-21
- **Owner.** Souhail
- **Supersedes.** —

## Context

We need page-view counting on the public site without a cookie consent banner
(RGPD / loi 2004-63). Open question Q16 answered: Vercel Web Analytics at MVP,
Plausible optional, Google Analytics out until we want a banner.

Vercel’s dashboard now requires the official `@vercel/analytics` package
(manual `/_vercel/insights/script.js` alone 404s until the package is wired).

## Decision

We use `@vercel/analytics` (`Analytics` from `@vercel/analytics/next`) in the
locale layout. Plausible remains optional behind `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.

## Alternatives considered

- **Manual insight script only.** Rejected — Vercel Get Started flow requires the package; script 404s without it.
- **Google Analytics 4.** Rejected — cookie banner required.
- **Plausible alone.** Acceptable later; Vercel is free with our host and enough for MVP.

## Consequences

- One small first-party dependency tied to our host.
- No consent banner for MVP analytics.
- Visitor data lives in the Vercel project Analytics tab after production deploys.

## References

- [open-questions.md Q16](../../01-product/open-questions.md)
- [analytics-and-seo.md](../../05-ops/analytics-and-seo.md)
