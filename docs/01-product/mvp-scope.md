# MVP scope — Prodet Platform

> Status: Draft. Owner: Souhail. Last updated: 2026-05.
> See also: [non-goals.md](non-goals.md), [roadmap.md](roadmap.md), [prd.md](prd.md).

## What MVP means here

**MVP = Phase 1A + Phase 1B shipped to production in parallel.**

The MVP is *not* "smallest thing we can build." It is "smallest thing that simultaneously (a) gives Prodet a credible B2B online presence and (b) measurably reduces the manual order-handling load." Either half on its own would not justify the project.

We deliberately did **not** choose website-only first, nor internal-tool-only first. We chose parallel thin slices, and we accept the execution risk that comes with that choice. See [vision.md §1.2 push-back](../00-overview/vision.md#why-this-exists) and the tripwires below.

## In scope — Slice A: Public B2B website

### Pages

- **Homepage** (`/[locale]/`)
  - Hero with manufacturer positioning (1 sentence, 1 supporting line, 1 CTA).
  - 3-tile sector teaser (linking to `/secteurs`).
  - Manufacturing/factory credibility band (1 photo + 2 short paragraphs).
  - Featured product families (3 cards from manufactured catalog).
  - Quote-request CTA + WhatsApp deep link.
- **About / Manufacturing / Quality** (`/[locale]/a-propos`)
  - Company story (founding, location L'Aouina, current scale).
  - Manufacturing capability and quality narrative.
  - Team brief (no PII, role-anchored).
- **Sectors index** (`/[locale]/secteurs`) — single page listing all 7 sectors. Per-sector deep pages are Phase 2.
- **Catalog index** (`/[locale]/catalogue`)
  - Browse by category and family.
  - **Only manufactured products at MVP** (~80 items, possibly 30–50 if catalog audit reveals quality gaps).
  - Filter: category, family, sector.
  - Sort: name, family.
  - No price.
- **Product detail** (`/[locale]/catalogue/{slug}`)
  - Localized name, short description, long description.
  - Image (or placeholder).
  - Conditionnement, unité de vente, recommended sectors.
  - "Demander un devis" CTA (prefilled with this product).
  - Fiche technique download link if available; otherwise hidden.
  - SDS download link if available; otherwise hidden.
- **Quote request** (`/[locale]/devis`)
  - Multi-product cart-style form (add lines from product pages).
  - Customer fields: name, company, email, phone, sector, free-text notes.
  - Honeypot + Turnstile/hCaptcha for spam.
  - Submission lands in the internal review queue (same place as parsed emails).
  - Confirmation page with order reference + WhatsApp deep link as fallback contact.
- **Contact** (`/[locale]/contact`)
  - Address (20 Rue de Somalie, L'Aouina, Tunis 2045), phone, email, WhatsApp deep link, embedded map.
- **Legal** — `mentions-legales`, `confidentialite`, `cookies`. Bilingual minimum (FR + AR), EN if budget allows.

### Cross-cutting (Slice A)

- **Languages.** FR complete, AR and EN scaffolded (UI strings translated; long-form content may show "[Traduction en cours]" placeholders for non-critical pages). Language switcher functional on every page.
- **RTL.** Working for `ar` locale.
- **SEO.** `sitemap.xml`, `robots.txt`, per-page meta tags, OpenGraph, JSON-LD `Organization` and `Product`.
- **Analytics.** Basic page-view + event tracking. Vendor TBD ([open question 16](open-questions.md)). Cookie banner if any non-essential analytics are used.
- **Performance.** LCP < 2.5s on 4G mobile for homepage and catalog index.
- **Accessibility.** WCAG 2.2 AA on critical paths (homepage, catalog, product, quote form). Tested with axe.
- **Responsive.** Mobile-first, validated on common screen sizes including iPhone SE.
- **WhatsApp.** `wa.me/<E.164>` deep links from header, footer, product CTA, contact, quote-confirmation. **No WhatsApp Business API at MVP.**

## In scope — Slice B: Internal order intake console

### Auth

- Supabase Auth with email + password (or magic link) for admin users.
- 4 user accounts at launch: Père, Mère, Sœur, Souhail.
- One role at MVP: `admin`. Role-based granularity arrives in Phase 2 if needed.
- Session timeout of 24h. Re-login required after.

### Order intake — input methods

1. **Paste text** — paste an email body or any free text. Auto-detect language.
2. **Upload PDF** — single PDF. Text-extractable PDFs only at MVP. Scanned/image PDFs deferred (logged with "OCR not yet supported, please retype").
3. **Inbound email** (if Spike 4 ships in time) — `orders@prodet.tn` (or chosen domain) → Postmark/Mailgun webhook → automatically appears in the queue.
4. **Manual entry** — typed-in form for phone orders. Customer + line items + notes.

### AI extraction

- LLM with structured output (Zod-validated schema): `lines[] = { rawText, qty, unit?, code?, note? }`.
- Per-line confidence score `[0, 1]`.
- Extraction job logged in `extraction_jobs` with prompt version, model, latency, token cost.
- Failure mode: extraction returns `{lines: [], reason: "..."}`. UI shows the raw input and a manual-entry fallback.

### Product matching

- Pipeline: alias hit → exact code → trigram fuzzy (`pg_trgm`) → embedding cosine (`pgvector`) → LLM rerank top-K.
- Per-line top-3 candidates with confidence scores.
- Auto-accept threshold (configurable; default 0.92). Below threshold → human must confirm.
- Customer-scoped aliases checked first if a customer is identified.

### Review UI

- One-screen workflow: input + extracted lines + matched products + actions.
- Keyboard-first. Tab through lines. Enter to accept. Type to override.
- Color-coded confidence (green ≥ 0.92, amber 0.6–0.92, red < 0.6).
- Customer attachment (search/select existing Swiver-imported customer; or create-pending placeholder).
- Notes field per draft.
- "Approve" button generates a finalized order draft with status `approved`.

### Alias learning

- Every override (human picks a product different from the AI suggestion) creates a candidate alias.
- Alias scope picker: global (default for never-seen text) vs customer-scoped (default if customer is identified).
- Alias requires explicit confirmation — never auto-created. ("AI proposes, humans approve.")

### Push to Swiver (v1 = manual)

- Approved order draft gets a print-friendly / copy-friendly view designed to map 1:1 to Swiver's devis entry form (product code, qty, unit).
- Mère/Sœur copy/paste into Swiver. Manual.
- Once pasted, mark draft as `exported` with a Swiver document reference (free-text field).
- **If Spike 1 confirms a usable Swiver write API**, push-to-Swiver becomes a button in MVP. Otherwise it is a Phase 4 deliverable.

### Customer directory

- Read-only mirror of Swiver customers (one-time CSV import for MVP, scheduled sync if API allows).
- Customer detail page: contact info, recent order drafts, customer-scoped aliases.

### Product directory

- Editable mirror of Swiver products. Edits to localized name/description/images live in Prodet Platform; Swiver names remain untouched.
- Visibility toggle: `is_visible_public` controls catalog display.

### Cross-cutting (Slice B)

- Audit log of every approval, alias creation, override.
- Sentry error tracking, Logtail (or equivalent) for application logs.
- Daily backup of Postgres.
- Basic dashboard for Père: today's drafts, this week's count, top customers (sourced from Swiver export).

## Out of scope at MVP

The full list is in [non-goals.md](non-goals.md). Headlines:

- Online payment / checkout.
- Public price display.
- Customer-facing portal.
- Auto-push to Swiver (unless Spike 1 says yes).
- WhatsApp Business API.
- OCR for scanned PDFs.
- Stock display anywhere.
- Per-sector deep landing pages (Phase 2).
- Articles commercialisés in public catalog (Phase 2).
- Raw materials, ever public.
- SDS/TDS document hosting (Phase 2 — uploads land then).
- Production planning, procurement, logistics, delivery tracking.

## Acceptance criteria (high-level)

The MVP ships when **all** of the following are true. Each row needs a tick before launch.

| # | Criterion | Owner | How verified |
|---|---|---|---|
| A1 | Public site live on production domain with HTTPS via Cloudflare. | Souhail | Manual + Lighthouse. |
| A2 | All MVP pages render in FR, AR (RTL), EN — even if AR/EN content has placeholders. | Souhail | Manual locale switch on each page. |
| A3 | LCP < 2.5s on mobile 4G for `/`, `/catalogue`. | Souhail | Lighthouse + WebPageTest. |
| A4 | Catalog displays ≥ 30 manufactured products with image, name, description, sector tags. | Souhail | Catalog audit checklist. |
| A5 | Quote-request form successfully creates an order draft visible in the console review queue. | Souhail | E2E test. |
| A6 | At least 4 admin accounts can log into the console. | Souhail | Manual login. |
| A7 | Pasting one of the 20 anonymized real Prodet emails produces ≥ 80% top-1 line precision after 150 alias seeds. | Souhail + Mère | Spike 2 + Spike 3 measured on holdout. |
| A8 | Mère can process one real email-based order from paste to "ready to copy into Swiver" in ≤ 50% of her current Swiver-only time, measured on 5 real orders. | Mère + Souhail | Stopwatch comparison. |
| A9 | Sentry, Logtail, daily DB backup all confirmed working with a test alert. | Souhail | Manual test. |
| A10 | RGPD-aligned privacy policy and cookies notice live in FR (and AR/EN if budget). | Souhail | Manual review. |

If any of A7 or A8 fails, **the MVP does not ship.** It means the operational thesis is unproven. Tripwires kick in (see [roadmap.md §Tripwires](roadmap.md#tripwires-cross-phase-summary)).

## Slice cadence

- Weekly demo. Friday end-of-day. Both slices show what shipped that week.
- If either slice misses two consecutive weekly demos, collapse to single-slice mode (Slice A first).
- No "scope creep" inside a week. New ideas land in [backlog.md](backlog.md), not in the current week.

## Related

- [prd.md](prd.md) — full PRD v0.
- [non-goals.md](non-goals.md).
- [roadmap.md](roadmap.md).
- [open-questions.md](open-questions.md).
- [../03-modules/public-site/](../03-modules/public-site/).
- [../03-modules/order-intake/](../03-modules/order-intake/).
