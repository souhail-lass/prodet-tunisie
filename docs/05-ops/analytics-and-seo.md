# Analytics and SEO — what to turn on after each deploy

The site ships technical SEO and Vercel Web Analytics (`@vercel/analytics`).
Two Google accounts still have to be created by Souhail; the code cannot do that.

## 1. Count visitors (this week)

1. Deploy `main` (the `@vercel/analytics` package is already in the app).
2. Open `https://www.prodet.com.tn/fr` once after the deploy goes green.
3. Vercel project → **Analytics** — page views appear within ~30 seconds (Hobby plan).

Do **not** click “Implement with Vercel Agent”. Do **not** run `npm i` yourself —
the package is already in the repo.

Optional later: [Plausible](https://plausible.io) (EU, no cookies). Create a site
for `www.prodet.com.tn`, then set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=www.prodet.com.tn`
in Vercel env and redeploy.

Do **not** add Google Analytics unless we also add a consent banner (RGPD / loi 2004-63).

## 2. See what Google actually ranks (this week)

1. [Google Search Console](https://search.google.com/search-console) → add `https://www.prodet.com.tn`.
2. Choose **HTML tag** verification. Copy only the `content="…"` token.
3. Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<token>` on the Vercel project (Production) and redeploy.
4. Also add the apex `https://prodet.com.tn` as a domain property, or confirm the 308 to www.
5. Submit `https://www.prodet.com.tn/sitemap.xml` under Sitemaps.
6. Wait 48h–2 weeks for Coverage + Queries. Filter countries: Tunisia vs rest.

Same account: [Google Business Profile](https://business.google.com) for
`20 Rue de Somalie, L'Aouina, Tunis 2045`. That is the local-pack listing (Maps),
not the website.

## 3. Canonical host

Production `NEXT_PUBLIC_SITE_URL` **must** be `https://www.prodet.com.tn`
(or the apex — the app rewrites apex → www). Canonicals that redirect are ignored
by Google.

## 4. Tunisia vs abroad

| Goal | What works |
|---|---|
| Tunisia | FR titles with “Tunisie”, NAP on contact, Maps listing, Search Console country = TN |
| Abroad | `/en` pages, `hreflang` fr-TN / en, English titles that still say *manufactured in Tunisia* |

Arabic is not a public locale yet. Do not advertise `ar` in hreflang until those pages exist.

A blog is still out of scope ([non-goals](../01-product/non-goals.md)). Ranking for
generic queries (“javel hôtel tunisie”) will come from catalogue + sector pages,
not articles.

## Related

- [ADR 0014](../02-architecture/adr/0014-vercel-web-analytics.md)
- [open-questions.md Q16](../01-product/open-questions.md)
- [observability.md](observability.md)
- [i18n.md SEO](../02-architecture/i18n.md)
