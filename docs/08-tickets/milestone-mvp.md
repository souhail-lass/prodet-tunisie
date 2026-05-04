# Milestone — MVP

> Status: Draft. Owner: Souhail. Last updated: 2026-05.
> Definition: Phase 1A (public site) + Phase 1B (intake console) shipped to production in parallel thin slices.

This is the master breakdown of MVP work into ticket-sized items. Items here will be promoted into actual tickets as they enter a slice's weekly scope. The list is intentionally not perfectly granular yet — we sharpen each item the week it is picked up.

Sizes: `XS` (< 1 day), `S` (1–3 days), `M` (3–7 days), `L` (1–2 weeks).

## Phase 0 — Foundation and spikes

- [P0-01 | S] Run [Spike 1: Swiver API capability](../06-spikes/spike-swiver-api.md). Decision in ADR 0009.
- [P0-02 | M] Run [Spike 2: AI extraction on real Prodet emails/PDFs](../06-spikes/spike-ai-extraction.md). Decision in ADR 0007.
- [P0-03 | M] Run [Spike 3: Product matching engine](../06-spikes/spike-product-matching.md). Decision in ADR 0008.
- [P0-04 | S] Run [Spike 4: Inbound email pipeline](../06-spikes/spike-inbound-email.md).
- [P0-05 | S] Run [Spike 5: Catalog data quality audit](../06-spikes/spike-catalog-quality.md). Output to [catalog-audit.md](../07-research/catalog-audit.md).
- [P0-06 | S] Run [Spike 6: Arabic + RTL](../06-spikes/spike-arabic-rtl.md).
- [P0-07 | S] Get answers to Batch 1 of [open-questions.md](../01-product/open-questions.md). Update PRD to v1.
- [P0-08 | S] Initialize Next.js 15 App Router scaffold with TypeScript, Tailwind v4, shadcn/ui, ESLint, Prettier, Vitest, Playwright config.
- [P0-09 | S] Set up Supabase project (staging + prod), Drizzle, initial schema migration.
- [P0-10 | S] Set up `next-intl` with `[locale]` routing, RTL plumbing, message file scaffolding.
- [P0-11 | XS] Configure Cloudflare DNS, Vercel project, environment variables.
- [P0-12 | XS] Configure GitHub Actions CI (real, not placeholder).
- [P0-13 | XS] Configure Sentry, Logtail, Plausible.

## Phase 1A — Slice A (Public B2B website)

### Foundation week

- [A-01 | S] Site shell: `<SiteHeader>`, `<SiteFooter>`, `<LocaleSwitcher>`. Working in FR, AR (RTL), EN.
- [A-02 | S] Design tokens applied; brand placeholder visual identity in.

### Static pages week 1

- [A-03 | M] Homepage v1: hero + sector teaser + manufacturing band + featured product families + CTA band.
- [A-04 | S] About / manufacturing / quality page.
- [A-05 | S] Contact page with map, phone, WhatsApp, email.
- [A-06 | S] Sectors index page (single page; per-sector deep pages are Phase 2).
- [A-07 | S] Legal pages (mentions, privacy, cookies) — FR-complete.

### Catalog

- [A-08 | M] Catalog index `/catalogue`: filters (category, family, sector), grid, pagination.
- [A-09 | M] Product detail `/catalogue/[slug]`: layout per [public-site spec](../03-modules/public-site/README.md).
- [A-10 | S] Catalog seeded with launch-set products from [catalog-audit.md](../07-research/catalog-audit.md).

### Quote & SEO

- [A-11 | M] Quote-request flow: cart-style form, RHF + Zod, Turnstile, server action creates `OrderDraft`. Confirmation page.
- [A-12 | S] SEO foundation: sitemap, robots, per-page meta, OpenGraph, JSON-LD (Org + Product), `hreflang`.
- [A-13 | S] Performance pass: image optimization, font subsetting, LCP tuning. Target < 2.5s mobile 4G on `/` and `/catalogue`.
- [A-14 | S] Accessibility pass: WCAG 2.2 AA on critical paths (homepage, catalog, product, quote, contact).

### Translation

- [A-15 | M] AR translation pass on shell + key pages (homepage, sectors, devis, contact, legal).
- [A-16 | M] EN translation pass on shell + key pages.

### Launch

- [A-17 | XS] DNS cutover.
- [A-18 | XS] Production smoke test.
- [A-19 | XS] Plausible verified.

## Phase 1B — Slice B (Internal order intake console)

### Foundation

- [B-01 | S] Auth: Supabase Auth wired; `/admin` route group; admin shell layout; 4 user accounts.
- [B-02 | S] Customer directory (read-only mirror): list + detail. CSV import.
- [B-03 | S] Product directory: list + detail; editable translations and visibility.

### Manual entry path (no AI in critical path)

- [B-04 | M] Manual order entry `/admin/orders/new`: customer picker, product picker (autocomplete), qty, submit → `OrderDraft` with `source = 'phone'`, `status = 'approved'`.

### Extraction integration

- [B-05 | M] Extractor adapter (Claude or GPT per [Spike 2](../06-spikes/spike-ai-extraction.md)) + Zod schema + `extraction_jobs` table writes.
- [B-06 | M] Paste / upload flow: paste text or upload text-PDF → enqueue extraction (Inngest) → write `OrderLine` rows.
- [B-07 | S] Inbound email pipeline: Postmark webhook → route handler → `OrderDraft` with attachments. Conditional on [Spike 4](../06-spikes/spike-inbound-email.md).

### Matching

- [B-08 | M] Product matching engine implementation per [ADR 0008](../02-architecture/adr/0008-product-matching-engine.md): alias → exact → trigram → vector → LLM rerank.
- [B-09 | S] Embedding pipeline: per-product embeddings stored in `pgvector`, refreshed on product change via Inngest.
- [B-10 | S] Seed alias DB (~150 entries) from observed customer patterns.

### Review screen

- [B-11 | L] Review screen `/admin/orders/[id]`: side-by-side raw input + extracted lines + matched products + customer card. Keyboard-first.
- [B-12 | M] Confidence-based UX: color coding, auto-accept threshold, per-line override.
- [B-13 | S] Alias suggestion dialog on approval; confirms scope (global / customer-scoped).
- [B-14 | S] Approval flow: status transitions, audit-log events.

### Push to Swiver

- [B-15 | S] Print-friendly "Copy to Swiver" view (manual at v1).
- [B-16 | M] (Conditional on [Spike 1](../06-spikes/spike-swiver-api.md)) Push-to-Swiver button: API call, status updates.

### Bridge

- [B-17 | XS] Public quote form lands in `/admin/queue` with `source = 'web_quote'`. Same review UI.

### Dashboard

- [B-18 | S] Dashboard `/admin`: today's drafts, week revenue (manual entry MVP), top customers.

### Adoption

- [B-19 | S] Stopwatch test with Mère/Sœur on 5 real orders. Document in `docs/05-ops/runbooks/console-adoption-test.md` (to be authored).
- [B-20 | S] Iterate on review UI based on test feedback.

## Cross-cutting (Slice A + B)

- [X-01 | S] Cookie/consent UX (Plausible default → no banner).
- [X-02 | S] Daily DB backup verified; restore drill scheduled.
- [X-03 | S] Sentry alerts test fired.
- [X-04 | S] Production runbooks: `inbound-email-bounce.md`, `extraction-job-failure.md`, `swiver-export-recovery.md`.

## Acceptance gate

Before declaring MVP launched: validate every row of [acceptance criteria A1–A10](../01-product/mvp-scope.md#acceptance-criteria-high-level).

## Related

- [../01-product/mvp-scope.md](../01-product/mvp-scope.md)
- [../01-product/roadmap.md](../01-product/roadmap.md)
- [../06-spikes/](../06-spikes/)
