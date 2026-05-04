# Non-goals — Prodet Platform

> Status: Draft. Owner: Souhail. Last updated: 2026-05.
> Companion to [mvp-scope.md](mvp-scope.md). The point of this document is to make explicit what we are *not* building, and why, so future-Souhail and any AI agent stop trying to add it.

A non-goal is not the same as a future feature. Some of these (marked Phase 2/3/4) are deferred. Others (marked Permanent) are choices we plan to keep saying no to.

---

## E-commerce / payment

### No online payment / checkout — Permanent for the foreseeable future

Prodet is B2B with negotiated prices, credit terms, and delivery handled offline. The conversion event is "demander un devis", not "Add to cart → Pay". Adding online payment introduces:

- payment-processor compliance overhead (TPE, Click to Pay, regulatory),
- a UX expectation of in-stock real-time inventory we cannot honor,
- a sales narrative that competes with the existing personal-relationship channel,
- and zero observed customer demand.

If a future B2C side business is launched, it gets its own subdomain and its own product. It does not pollute the B2B platform.

### No public price display — Permanent at MVP, revisit only with explicit business case

B2B prices are negotiated. Public prices reveal margins to competitors and undercut the sales conversation. This is the dominant pattern across the competitor set ([competitors.md](../07-research/competitors.md)). If we ever change this, it will be for a deliberate strategic reason (e.g. a low-margin commodity line aimed at small shops), not for SEO theatre.

---

## Stock and inventory

### No public stock display — MVP through Phase 2

Swiver stock data is not currently reliable: stock movements are not consistently recorded, and negative stock values exist. Showing this to customers would be worse than showing nothing.

In the **internal** console we may surface "last known stock" with an explicit staleness badge, because Mère/Sœur understand the caveat. We never expose it publicly.

### No production planning, no procurement, no MRP — Phase 4+

Prodet manufactures, but we are not building a manufacturing-execution system. Not in MVP. Not in Phase 2 or 3. Possibly addressed in Phase 4+ as a separate module if order-intake is solid.

### No delivery tracking, no driver mobile app — Phase 4+

The 3 vehicles (Fiat Punto, 2 Isuzu D-Max) and the workers operate today without software. Adding a driver app to confirm deliveries and feed stock movements is *the* obvious next operational win after intake — but it is a separate workstream with its own personas. Not in MVP.

---

## Internal scope

### Not a Swiver replacement — Permanent at MVP

Swiver remains the source of truth for accounting and official documents. Prodet Platform is the **front-layer**. The long-term posture (replace vs. coexist) is [open question 14](open-questions.md). Until that is decided, we build assuming coexistence.

### Not building our own auth / queue / email infrastructure — Permanent

Use Supabase Auth, Inngest (or QStash), Resend, Postmark/Mailgun. Building these in-house is a way to spend three months of solo-dev time on commodity software. We will only consider in-house if a vendor-specific limit blocks a real requirement.

### Not building a CRM — MVP through Phase 3

Customer relationships happen via WhatsApp, phone, email. We will record customers and orders. We will not build pipelines, deal stages, lead scoring, marketing automation, or campaign management. Phase 4 may add "follow-up suggestions" — that is the ceiling.

### Not building a marketplace — Permanent

Prodet sells Prodet products and selected resold articles. We will not host third-party sellers. We will not enable supplier self-service catalog uploads.

---

## AI scope

### No autonomous order push to Swiver — MVP through Phase 3

Every order that lands in Swiver from Prodet Platform is **explicitly approved by a human in the console**. AI extracts, AI matches, AI proposes — humans click. This is a load-bearing principle. See [vision.md §Strategic principles #2](../00-overview/vision.md#strategic-principles-invariants).

If extraction quality reaches a level where auto-push becomes desirable (Phase 4+), we will gate it behind:

- per-customer auto-push opt-in,
- minimum confidence threshold,
- silent shadow run for N weeks comparing AI-only vs human-validated outputs,
- automatic rollback if disagreement rate exceeds a threshold.

Until then, no.

### No AI customer-chat — MVP through Phase 3

No chatbot on the public site. No "ask our AI assistant" widget. WhatsApp is the human-conversation channel. We are not interested in the support load and quality risk of an LLM giving incorrect information about regulated chemical products to potential B2B buyers.

### No OCR for scanned PDFs — MVP

If a PDF is image-only (scan or photo), the console says "OCR not yet supported, please retype or use a text PDF." OCR adds a ~3-week implementation tail and a quality-variance source. Defer to Phase 2 if real-world frequency justifies it.

### No automatic SDS / fiche-technique generation — Permanent

These are regulated documents. They are authored by humans who understand the chemistry. AI may help draft, but it does not generate finals. Hosted as PDFs from Phase 2.

---

## Internationalization

### No locales beyond FR / AR / EN — MVP

We will not add Italian, Spanish, German, or any other locale at MVP. The cost of *truly* maintaining a locale (UI strings, content, SEO, legal) is high. Three is already an ambitious target. See [../02-architecture/i18n.md](../02-architecture/i18n.md).

### No automatic AI translation in production — MVP through Phase 2

Translations are produced and reviewed by humans (or AI-drafted then human-reviewed). We do not ship browser-time machine translation that may miscommunicate product attributes (especially safety claims). The cost of being wrong on a chemical product description in Arabic is non-zero.

---

## Site features

### No blog / news / resource center — MVP

A blog is a content commitment we cannot honor with current capacity. SEO content arrives in Phase 2 only if a content owner is identified. Empty blogs hurt credibility; we'd rather not have one.

### No customer reviews / testimonials — MVP

We may add curated reference logos in Phase 2 (with written consent). User-generated reviews require moderation infrastructure we are not building.

### No multi-tenant or white-label features — Permanent

This is Prodet's platform, not a SaaS product. No white-labeling for other manufacturers.

### No public download of the full catalog — MVP

A downloadable PDF catalog enables competitor scraping and freezes data the instant it is generated. We will offer a "request the catalog" form that goes through the same lead pipeline as quote requests.

---

## Operational scope

### No 24/7 on-call — Permanent

Souhail is one person. The platform is designed to fail gracefully (e.g. if extraction is down, the console falls back to manual entry; if Swiver export is down, drafts queue locally). Incidents are addressed during Tunisian business hours.

### No SOC 2 / ISO 27001 — Permanent at MVP

We will follow good security hygiene (RGPD-aligned, encrypted at rest/transit, RLS, least-privilege, secret rotation), but we are not pursuing formal certification. Revisit only if a major institutional buyer demands it.

### No SLA commitments to customers — MVP

No "99.9% uptime" promises in the public legal pages. We will instrument for uptime internally (Sentry, status checks), but we do not contract on it.

---

## Architectural non-goals

### No microservices — Permanent at our current scale

Single Next.js app with route groups. Splitting into services is overhead that buys nothing for a one-person team. Revisit if and only if a single team / repo / deploy becomes the bottleneck.

### No GraphQL — Permanent

REST + tRPC-style server actions cover everything we need. GraphQL adds toolchain weight without solving a real problem here.

### No separate vector database — MVP through Phase 3

`pgvector` inside Postgres is sufficient at our catalog size (hundreds of products, thousands of aliases). Pinecone/Weaviate/Qdrant are unnecessary infra.

### No Kubernetes, no self-hosted Postgres — Permanent

Vercel for app, Supabase for Postgres + Auth + Storage, Inngest for jobs. We are not running pods to feel like a real engineering org.

### No mobile native app — MVP through Phase 3

Responsive web works. A native app is a separate product with its own release process and store-review tax. Not justified before Phase 4.

---

## Tone / brand non-goals

### No "AI-first" marketing voice — Permanent

The public site sells *cleaning chemistry made by a real Tunisian factory*. Not "AI-powered". The AI lives inside the console where it earns its keep. Customers do not need to know about it.

### No fake awards, no fake certifications, no fake customer logos — Permanent

We list only certifications we hold and customers who have given written consent.

### No emojis in product copy — Permanent

This is a B2B industrial supplier. Maintain that tone.

---

## When to revisit

Each non-goal has a marker: **Permanent**, or **Phase X+**. The Phase markers are the only ones that get re-litigated automatically — they enter the backlog at the start of their phase.

Permanent non-goals require an explicit ADR overturning them. Adding them back without an ADR is a code-review block.

## Related

- [mvp-scope.md](mvp-scope.md) — what *is* in.
- [../00-overview/vision.md](../00-overview/vision.md) — strategic principles.
- [roadmap.md](roadmap.md) — phase boundaries.
- [open-questions.md](open-questions.md) — decisions that may shift the boundaries above.
