# PRD v0 — Prodet Platform

> Status: **v0 (pending answers to [open-questions.md](open-questions.md))**.
> Owner: Souhail Lassoued. Reviewers: Père (sponsor). Last updated: 2026-05.
>
> v0 is a working draft used to drive Phase 0 spikes and architectural commitments. v1 (sign-off) requires Batch 1 of [open-questions.md](open-questions.md) answered.

This document is intentionally short. The detail lives in companion docs:

- [mvp-scope.md](mvp-scope.md) — what is in / out of MVP, with acceptance criteria.
- [non-goals.md](non-goals.md) — what we are explicitly not building, and why.
- [roadmap.md](roadmap.md) — phasing and tripwires.
- [../00-overview/vision.md](../00-overview/vision.md) — strategic positions.
- [../00-overview/personas.md](../00-overview/personas.md) — actors.
- [../02-architecture/system-overview.md](../02-architecture/system-overview.md) — technical shape.

The PRD's job is to (a) connect those pieces into one statement and (b) define the success criteria the product is judged against.

---

## 1. Summary

Build Prodet Platform — a digital front-layer for Prodet Tunisie — composed of a multilingual public B2B website and an internal AI-assisted order intake console. Swiver remains the ERP source of truth. AI proposes, humans approve. MVP ships Phase 1A (public site) and Phase 1B (intake console) in parallel thin slices over 8–10 weeks following 2–3 weeks of Phase 0 spikes.

## 2. Problem statements

**P1 — Acquisition ceiling.** Prodet has no credible B2B online presence today. New prospects searching for cleaning/hygiene suppliers in Tunisia cannot verify Prodet's legitimacy in 30 seconds. Volume of net-new B2B relationships is bounded by personal networks.

**P2 — Operational drag in order intake.** Every incoming email/PDF/phone order requires a human to (a) interpret the customer's free-text, (b) map each line to the correct Swiver product reference (where customers use their own naming), (c) type the order into Swiver. This consumes hours of family time daily and produces transcription errors.

**P3 — No memory of customer naming.** The same customer uses the same non-canonical name for the same product month after month, and the family re-translates it every time. There is no system that learns "client X always means product Y when they write Z."

## 3. Goals

**G1.** Establish online B2B credibility — measured by net-new quote requests from prospects with no prior Swiver record.

**G2.** Reduce median time-from-email-to-Swiver-draft for incoming orders by ≥ 60% within 2 months of the console launch.

**G3.** Build a system memory of client product naming (alias DB) so per-line manual mapping disappears for repeat customers within 3 months of console launch.

**G4.** Maintain Swiver as the accounting source of truth — the platform never bypasses Swiver for official documents.

## 4. Non-goals

See [non-goals.md](non-goals.md). Headlines: no online payment, no public price display, no public stock display, no Swiver replacement, no autonomous order push, no OCR at MVP, no native mobile app, no chatbot.

## 5. Personas

See [../00-overview/personas.md](../00-overview/personas.md). Primary actors at MVP:

- **Mère / Sœur** — primary internal users (intake console).
- **Père** — sponsor and dashboard reviewer.
- **New prospect (Google searcher)** — primary external user (public site).
- **Existing client** — indirect at MVP (their email lands in the console).

## 6. User stories — MVP

### Public site

- *As a hotel purchasing officer searching Google, I want to confirm in 30 seconds that Prodet is a real Tunisian manufacturer of professional cleaning products so that I can decide whether to request a quote.*
- *As a B2B prospect, I want to browse manufactured products by category so that I can identify the items relevant to my operation.*
- *As a B2B prospect, I want to request a quote for several specific products in one form so that I do not have to send multiple emails.*
- *As a mobile user in Arabic, I want the site to be readable RTL with proper typography so that I can use it without switching language.*

### Internal console

- *As Mère, I want to paste an email or upload a PDF and see line items extracted with the correct Prodet product matched within 5 seconds, so that the workflow is faster than typing into Swiver myself.*
- *As Mère, when the system gets a match wrong, I want to override it in one keystroke and have the system remember the correction for next time.*
- *As Mère, I want to see all pending orders (from email, from the public quote form, from phone entry) in one queue so that nothing slips through.*
- *As Sœur, I want to see a customer's recent orders and their personal aliases when I open their record, so that I can answer their questions without context-switching to Swiver.*
- *As Père, I want a glanceable daily/weekly view of order volume and revenue so that I do not have to log into Swiver to feel oriented.*

## 7. Success metrics

Restated from [vision.md §Success metrics](../00-overview/vision.md#success-metrics-proposed-to-confirm-in-prd-v1). Pending sponsor confirmation in PRD v1.

| Metric | Definition | Target | Measurement |
|---|---|---|---|
| **M1 — Acquisition** | Quote requests/month from prospects with no prior Swiver record. | ≥ 8 within 3 months of public launch. | Quote-form submissions tagged `is_new_prospect`. |
| **M2 — Operational efficiency** | Median time from email arrival to "draft ready to push to Swiver". | -60% vs current baseline within 2 months. | Stopwatch baseline + `extraction_jobs` + `order_drafts` timestamps. |
| **M3 — Matching quality** | Top-1 product match accuracy on a rolling holdout of 50 recent lines. | ≥ 70% after 150 alias seeds; ≥ 85% after 500. | Holdout test, weekly. |
| **M4 — Adoption** | % of incoming email/PDF orders processed via the console (vs. bypassed to direct-Swiver entry). | ≥ 80% within 2 months. | Manual count + `order_drafts.source` distribution. |
| **M5 — Public site quality** | Lighthouse mobile performance score on `/` and `/catalogue`. | ≥ 90. | CI-integrated check. |

**M4 < 50% is a kill-switch.** It would mean Mère and Sœur are bypassing the tool — i.e. it does not earn its place. Design priority on the review UI is justified by this.

## 8. Functional requirements (linked)

Detailed functional requirements live in module specs:

- [../03-modules/public-site/](../03-modules/public-site/) — pages, routes, components, content model.
- [../03-modules/order-intake/](../03-modules/order-intake/) — input methods, queue, review UI, push-to-Swiver.
- [../03-modules/product-matching/](../03-modules/product-matching/) — matching pipeline, alias model, learning loop.
- [../03-modules/swiver-integration/](../03-modules/swiver-integration/) — import/export contracts, mapping rules.

## 9. Non-functional requirements

### 9.1 Performance

- Public-site LCP < 2.5s on 4G mobile for `/` and `/catalogue`.
- Console paste-to-extraction round trip < 5s p95 on text inputs ≤ 5KB.
- Console review-screen interaction latency < 100ms for keyboard navigation.

### 9.2 Availability

- Target 99% monthly uptime, **best-effort, no contractual SLA**. Single-region deploy.
- Graceful degradation: if extraction service is down, the console falls back to manual entry. If push-to-Swiver is down, drafts queue locally.

### 9.3 Security

- HTTPS only via Cloudflare in front of Vercel.
- Supabase Auth with email/password or magic link. No anonymous mutations.
- RLS on customer-scoped data once Phase 3 portal exists.
- Secrets in Vercel env / Supabase Vault. Never in repo.
- Daily encrypted Postgres backup. Tested restore quarterly.
- Detail in [../02-architecture/security-rgpd.md](../02-architecture/security-rgpd.md).

### 9.4 Privacy / RGPD

- Privacy policy in FR (AR/EN if budget). RGPD-aligned data subject rights honored even though Tunisia operates under loi 2004-63.
- Data minimization: quote forms collect only fields required to respond.
- Email-orders contain personal data; retention policy documented.
- Detail in [../02-architecture/security-rgpd.md](../02-architecture/security-rgpd.md).

### 9.5 Accessibility

- WCAG 2.2 AA on public critical paths (homepage, catalog, product, quote form, contact).
- Console: keyboard-first; not yet AA-targeted (internal tool, evolving).

### 9.6 Internationalization

- Three locales at MVP: `fr` (default, complete), `ar` (RTL, complete shell, content progressively), `en` (complete shell, content progressively).
- Mixed FR/AR strings allowed in product names. Detail in [../02-architecture/i18n.md](../02-architecture/i18n.md).

### 9.7 Observability

- Sentry for application errors.
- Logtail (or equivalent) for structured logs.
- Lightweight uptime monitoring (Better Stack or Vercel monitor).
- Custom event tracking for: extraction started/completed/failed, match override, alias created, push-to-Swiver completed.

## 10. Constraints and assumptions

### 10.1 Hard constraints

- Solo developer (Souhail) with AI tooling.
- Swiver is the ERP and stays the ERP.
- French is the default language; Arabic and English must be supported.
- Tunisian B2B context — local proximity, mixed-language vocabulary, professional buyer audience.

### 10.2 Working assumptions (to validate)

- Swiver exposes a usable API or a tolerable export path. ([Spike 1](../06-spikes/spike-swiver-api.md))
- AI extraction reaches ≥ 80% top-1 line precision on real Prodet inputs. ([Spike 2](../06-spikes/spike-ai-extraction.md))
- Product matching reaches ≥ 70% top-1 after 150 alias seeds. ([Spike 3](../06-spikes/spike-product-matching.md))
- Mère/Sœur will adopt the console only if it is faster than Swiver-direct from day one.
- New prospects arrive via search; existing clients keep emailing. The platform serves both through different surfaces.
- The 80 manufactured products are the right launch set.
- EU hosting acceptable for data residency.

### 10.3 Open questions

See [open-questions.md](open-questions.md) — Batch 1 blocks PRD v1 sign-off.

## 11. Risks and tripwires

Restated from [roadmap.md](roadmap.md#tripwires-cross-phase-summary):

| Risk | Tripwire | Action |
|---|---|---|
| Parallel slice slip | 2 consecutive weekly demos with one slice at zero progress | Collapse to single-slice (Slice A first) |
| AI extraction fails | Spike 2 < 60% top-1 | Reframe Slice B as paste-and-correct form; defer LLM |
| Matching fails | Spike 3 < 50% top-1 | Reframe matching as search-and-pick; defer auto-match |
| No Swiver API | Spike 1 negative | v1 ships with manual copy-paste; auto-push deferred to Phase 4 |
| AR content blocks Slice A | AR pass > 2 cumulative weeks | Ship FR-complete with AR/EN coming-soon |
| Mère adoption fails | A8 fails twice | Suspend launch, redesign review UI |

## 12. Out of scope (PRD-level reminder)

- Online payment, public prices, public stock, native mobile app, chatbot, Swiver replacement, OCR for scanned PDFs, autonomous order push, multi-vendor marketplace, white-label SaaS.

Full list and rationale: [non-goals.md](non-goals.md).

## 13. Review and sign-off

- **PRD v0** — drafted by Souhail. Used to drive Phase 0 spikes and architectural decisions. Not signed.
- **PRD v1 — sign-off conditions.** Batch 1 of [open-questions.md](open-questions.md) answered; Spikes 1, 2, 3 results integrated; Père has read and confirmed M1–M4 targets and the non-goals list.
- **PRD changes after v1.** Tracked via git history and a changelog section to be appended at v1.

## 14. Related

- [../00-overview/vision.md](../00-overview/vision.md), [../00-overview/personas.md](../00-overview/personas.md), [../00-overview/sectors.md](../00-overview/sectors.md), [../00-overview/glossary.md](../00-overview/glossary.md).
- [mvp-scope.md](mvp-scope.md), [non-goals.md](non-goals.md), [roadmap.md](roadmap.md), [open-questions.md](open-questions.md), [backlog.md](backlog.md).
- [../02-architecture/](../02-architecture/) — system overview, data model, ADRs.
- [../06-spikes/](../06-spikes/) — gating proofs of concept.
- [../07-research/competitors.md](../07-research/competitors.md) — pattern analysis.
