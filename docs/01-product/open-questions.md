# Open questions — Prodet Platform

> Status: Active. Owner: Souhail. Last updated: 2026-05.

These are the decisions blocking PRD v1, Phase 0 spike completion, or specific architectural commitments. They are tracked here, raised in batches of 3–5 with the sponsor (Père / Souhail), and answered in writing in this file as they close.

Each question carries:

- **Status.** `open`, `answered`, `deferred`, `closed`.
- **Blocks.** What this question is gating.
- **Default if unanswered.** What we do if forced to ship without an answer (so the project does not stall).

---

## Batch 1 — gating PRD v1 and Phase 0 (ask first)

### Q1. Domain name(s)

**Status.** Deferred (2026-05-03) — operating with the documented default.
**Blocks.** Hosting setup, DNS, email infrastructure, brand presentation, SEO foundation.
**Question.** Which domain(s) do we own or want to register? Candidates:

- `prodet.tn` (preferred — Tunisian ccTLD, country signal).
- `prodet.com.tn` (commercial Tunisian).
- `prodettunisie.com` (international, less likely conflicts).

Are any already registered? Are there existing email addresses (e.g. `contact@…`) to preserve?
**Default applied.** Use `prodet.tn` if registrable; fall back to `prodet.com.tn`, then `prodettunisie.com`. Confirm registrability and any existing email addresses to preserve **before** the Phase 0 hosting checklist (it's a 30-minute decision, not an architectural one).
**Action item.** Souhail to verify registration status during Phase 0 and re-confirm or override the default.

### Q2. Swiver access and API credentials

**Status.** Answered (2026-05-03).
**Blocks.** [Spike 1](../06-spikes/spike-swiver-api.md), the entire Slice B push-to-Swiver path, customer/product import.
**Question.** Does Père or someone in the family have admin credentials on the Swiver account, with the ability to: (a) generate an API token if Swiver supports it, (b) export full customer + product CSVs, (c) contact Swiver support to ask about integration capability?
**Answer.** Yes — full admin credentials available. Souhail can generate API tokens (if Swiver exposes them), export customer + product CSVs, and contact Swiver support directly.
**Implication.** [Spike 1](../06-spikes/spike-swiver-api.md) is unblocked and can run on Day 1 of Phase 0. No coordination delay with Père. If Spike 1 confirms a usable write API, push-to-Swiver may move into MVP scope (currently planned as Phase 4).

### Q3. Historical email/PDF orders for spikes

**Status.** Answered (2026-05-03).
**Blocks.** [Spike 2 (AI extraction)](../06-spikes/spike-ai-extraction.md), [Spike 3 (matching)](../06-spikes/spike-product-matching.md).
**Question.** Can you provide 20–30 anonymized real Prodet orders from the last 6 months? Mix of email-body text, ERP-generated PDFs, and any other formats you receive. Anonymization can be a simple pass replacing customer names and personal info; product names and quantities must remain real.
**Answer.** Yes — Souhail can pull and anonymize 20–30 real orders within hours. Mix should target ~12 plain-text emails, ~8 customer-ERP-generated PDFs, ~3 mixed-format, ~2 mixed FR/AR, 1–2 known outliers (per [Spike 2](../06-spikes/spike-ai-extraction.md) §Method).
**Implication.** Spikes 2 and 3 produce real numbers, not synthetic ones. The A7 acceptance criterion in [mvp-scope.md](mvp-scope.md#acceptance-criteria-high-level) is testable against real data. Anonymization protocol: replace customer/contact names and personal info with placeholders; **keep product names and quantities verbatim**.

### Q4. Brand assets

**Status.** Answered (2026-05-03).
**Blocks.** Public site visual design, header/footer, OpenGraph images, favicons, brand consistency.
**Question.** Existing logo (vector — SVG, PDF, AI)? Existing brand colors? Existing typography choices? Existing photography (factory, products, team)? If yes, can we get the source files?
**Answer.** Yes — logo, color palette, and photography (factory + products) exist; source files available.
**Implication.** No brand mini-sprint required. The placeholder default in [04-design/brand.md](../04-design/brand.md) is replaced by real assets from Phase 0 onward. Phase 0 todo: drop the source files into `assets/brand/` (location to be confirmed when scaffolded), document usage rules in [04-design/brand.md](../04-design/brand.md), populate [04-design/design-tokens.md](../04-design/design-tokens.md) with the real palette and typography. **Followup question** at design-token time: are the existing photos high-resolution and rights-clear for web/marketing use, or do we need a re-shoot for the top 30 products?

### Q5. Product photography

**Status.** Open.
**Blocks.** Public catalog visual quality, product detail pages, social previews.
**Question.** Do the ~80 manufactured products have usable photos today (anywhere — Swiver, old catalog, marketing materials, supplier files)? Is there budget for a one-day photo session of the top 30? Or do we ship with neutral placeholders and add photos progressively?
**Default if unanswered.** Ship with category-level placeholder illustrations. Add real photos in Phase 2 as they become available.

### Q7. Daily operator(s) of the internal console

**Status.** Open.
**Blocks.** UX defaults of the review screen, keyboard shortcut design, training plan.
**Question.** Will Mère, Sœur, or both be the daily operators of the order intake console? If both, is one the primary? This drives whose workflow we optimize first.
**Default if unanswered.** Design for both with no per-user differentiation. Schedule the stopwatch test (A8) with whoever is available.

### Q8. Hosting region / data residency

**Status.** Open.
**Blocks.** Vercel region selection, Supabase region selection, RGPD vs Tunisian-data-protection (loi 2004-63) posture.
**Question.** Is EU hosting (Frankfurt / Paris / Dublin) acceptable, or is there a soft/hard preference for MENA-resident hosting? Are any current or near-future customers (institutions, public sector) likely to require Tunisian data residency in their procurement terms?
**Default if unanswered.** EU hosting (Vercel `cdg1` Paris, Supabase `eu-central-1` Frankfurt). Privacy policy declares EU residency.

### Q10. WhatsApp number(s)

**Status.** Open.
**Blocks.** WhatsApp deep links across the public site (header, footer, product CTA, contact, quote-confirmation).
**Question.** Single WhatsApp number for all inbound, or per-role split (sales / support / general)? Number(s) in E.164 format?
**Default if unanswered.** Single number reused everywhere. Switch to per-role in Phase 2 if the family signals routing pain.

### Q12. Souhail's weekly time commitment

**Status.** Answered (2026-05-03).
**Blocks.** Realism of the 8–10 week MVP estimate, weekly slice scope sizing.
**Question.** Realistic hours/week dedicated to this project? Distinguish "focused build" hours from "review/family/admin" hours.
**Answer.** Souhail is full-time on this; aiming to finish in "weeks" (interpreted as targeting the lower end of the planned envelope).
**Implication.** Phase 1 baseline (8–10 weeks) is achievable with parallel slices. Push-back: "in weeks" needs a more specific target. Calibration:

- **Realistic floor.** Phase 0 (2–3 weeks of spikes + foundation) + Phase 1 (8 weeks if everything goes well) = **10–11 weeks to a live MVP**, full-time.
- **Sub-8-week MVPs are not credible** for parallel slices with the scope in [mvp-scope.md](mvp-scope.md). They become credible only by collapsing to Slice A first and deferring Slice B by 4–6 weeks.
- **Tripwire reminder.** Even at full-time, the parallel-slip tripwire from [roadmap.md](roadmap.md#tripwires-phase-1) still applies. Two consecutive missed weekly demos collapses to single-slice. Speed does not bypass discipline.
- **Action item.** Souhail to confirm a target launch date (e.g. "live by 2026-08-15"). That date drives the slice scope conversations every Monday.

---

## Batch 2 — needed for Phase 0 architecture finalization

### Q6. SDS / fiche-technique availability

**Status.** Open.
**Blocks.** Phase 2 document hosting; product detail page completeness.
**Question.** For the manufactured catalog: do SDS (FDS) and TDS (fiches techniques) exist as PDFs today? In which languages? Up to date? Which products are missing them? Who would author the missing ones?
**Default if unanswered.** Hide SDS/TDS download UI until Phase 2 with real documents.

### Q9. Existing digital footprint to migrate or preserve

**Status.** Open.
**Blocks.** SEO migration plan, redirect map, brand continuity.
**Question.** Is there an existing prodet.tn or prodettunisie.com site (even a parked one)? A Google Business Profile? Facebook / Instagram / LinkedIn pages? Any indexed content we should redirect from? Any reviews on those channels?
**Default if unanswered.** Assume green field. No redirect map. Claim/create Google Business Profile in Phase 1.

### Q11. Budget for paid services

**Status.** Open.
**Blocks.** Stack choice for LLM (OpenAI / Anthropic / both?), email (Resend + Postmark vs free-tier alternatives), error tracking (Sentry team plan), background jobs (Inngest paid plan after free tier), search (Algolia/Meilisearch later).
**Question.** Approximate monthly recurring budget envelope for SaaS dependencies? (e.g. < $100/mo, < $300/mo, < $1000/mo.) Any vendor preferences or restrictions?
**Default if unanswered.** Stay within free tiers wherever possible: Vercel hobby (until commercial-use cutover required), Supabase free, Inngest free, Sentry developer, Resend free, Postmark dev sandbox. LLM costs metered. Estimate < $50/mo at MVP traffic.

### Q13. Auto-acknowledge to clients on order receipt

**Status.** Open.
**Blocks.** Inbound email pipeline UX, customer-facing tone of v1.
**Question.** When an email order arrives at `orders@prodet.tn` and the system parses it, do we send an auto-acknowledgement to the client ("we received your order, will confirm shortly") in the detected language? Or stay completely silent until a human responds?
**Default if unanswered.** Silent at v1. Add auto-ack in Phase 2 once we have confidence in detection and templates.

### Q14. Long-term: replace Swiver, or always coexist?

**Status.** Open.
**Blocks.** Architectural decisions about source-of-truth duplication (do we ever own customer master data, or always defer to Swiver?), how aggressively to invest in Swiver-integration code.
**Question.** Strategic intent — is the long-term plan that Prodet Platform will eventually replace Swiver as the ERP, or always coexist with Swiver as the accounting backend?
**Default if unanswered.** Coexist. Build with Swiver-as-SoT for accounting indefinitely. Re-litigate at end of Phase 3.

---

## Batch 3 — nice-to-have early but not blocking

### Q15. Sectors confirmation

**Status.** Open.
**Blocks.** Sector page priority order in Phase 2.
**Question.** Of the 7 MVP sectors in [sectors.md](../00-overview/sectors.md), is there an existing customer concentration that would justify making one the lead landing page? Should `industrie.alimentaire` (food industry) be added as an MVP sector? Are *Sociétés de nettoyage* a target sector, a competitor channel, or both?
**Default if unanswered.** Treat all 7 sectors as equal weight. Defer add/remove decisions to Phase 2.

### Q16. Analytics vendor

**Status.** Open.
**Blocks.** Public site instrumentation, cookie banner scope.
**Question.** Preference for Plausible (privacy-first, no cookie banner needed), Vercel Analytics (free with our hosting), Google Analytics 4 (richest features but cookie banner required), or Matomo (self-hosted)?
**Default if unanswered.** Plausible. Adds zero cookie-banner liability.

### Q17. Cookie / consent UX

**Status.** Open.
**Blocks.** First-page UX for new visitors, RGPD compliance posture.
**Question.** If we choose an analytics vendor that requires consent, do we want a friction-light banner (small bottom-anchored bar) or a modal? Or zero banner (Plausible / no analytics)?
**Default if unanswered.** Plausible + no banner.

### Q18. Public catalog launch set

**Status.** Open.
**Blocks.** [Spike 5 (catalog audit)](../06-spikes/spike-catalog-quality.md) acceptance, A4 acceptance criterion.
**Question.** Of the ~80 manufactured products, is there a curated subset (maybe 30) that represent the strongest credibility story to launch with? Or do we audit all 80 and launch whichever pass the audit?
**Default if unanswered.** Audit all 80. Launch whichever clear the audit (target 30+).

### Q19. Customer database cleanup

**Status.** Open.
**Blocks.** Initial customer import, customer-scoped alias seeding, Phase 3 portal invitation list.
**Question.** Of the 141 Swiver customers (96 active + 45 inactive), is the data clean enough to import as-is, or do we need a manual cleanup pass first (deduplication, contact normalization, sector tagging)?
**Default if unanswered.** Import as-is, mark all as `needs_review`, surface in console for progressive cleanup.

### Q20. Email infrastructure today

**Status.** Open.
**Blocks.** Inbound email setup (DNS records, SPF, DKIM, DMARC), `orders@prodet.tn` provisioning.
**Question.** What email provider does Prodet currently use (Google Workspace, Microsoft 365, IONOS, cPanel, other)? Who can manage DNS records?
**Default if unanswered.** Block [Spike 4 (inbound email)](../06-spikes/spike-inbound-email.md) until known.

---

## Process

- **Asking.** Souhail asks the relevant person (usually Père) in batches of 3–5 over WhatsApp or in person. Not 14 in one shot.
- **Recording.** Once an answer is received, mark `Status: answered (YYYY-MM-DD)` and write the answer below the question. Do not delete the question.
- **Promoting.** When an answer materially changes a doc (PRD, architecture, scope), make the doc edit in the same commit and reference this question by number in the commit message.
- **Aging.** A question open for > 4 weeks should either be answered, deferred (with a note), or escalated.

## Related

- [prd.md](prd.md), [mvp-scope.md](mvp-scope.md), [roadmap.md](roadmap.md).
- [../06-spikes/](../06-spikes/) — many of these questions gate spike acceptance.
- [../02-architecture/adr/](../02-architecture/adr/) — answers may trigger ADR additions or amendments.
