# Vision — Prodet Platform

> Status: Approved (conception phase). Owner: Souhail Lassoued. Last updated: 2026-05.

## One paragraph

Prodet Platform is the digital front-layer of a real Tunisian manufacturer of cleaning, hygiene, and detergent products. It exists to (a) give Prodet B2B credibility online so professional buyers — hotels, restaurants, cafés, cleaning companies, wholesalers, institutions — can find, trust, and request quotes from a serious manufacturer, and (b) compress the manual email / PDF / phone → Swiver order workflow that today consumes hours of family time. Swiver remains the ERP / accounting source of truth. Prodet Platform owns acquisition, catalog presentation, order intake, AI-assisted extraction, product matching, human validation, and analytics.

> **AI proposes. Humans approve. Swiver records.**

## Why this exists

Prodet is **not** a startup looking for product-market fit. It is an active company with:

- ~856 KTND in 2025 revenue.
- ~263 KTND year-to-date in 2026.
- 141 customers in Swiver (96 active, 45 inactive).
- ~499 product / service lines, of which ~80 are *Produits finis Prodet* (manufactured in-house) and ~233 are *articles commercialisés* (resold).
- 3–4 workers, 3 vehicles (1 Fiat Punto, 2 Isuzu D-Max).
- A working ERP (Swiver) used as the official accounting and commercial document system.

The company already runs. The question is not "does this business exist?" but "where is the operational drag and the commercial ceiling, and which of those can software remove?"

We see two clear answers.

### Commercial ceiling: zero serious digital presence

Prospective B2B buyers (hotels, restaurants, cleaning companies, wholesalers, institutions) cannot today verify that Prodet is a serious manufacturer in 30 seconds of search. Competitors abroad — Dustbane, InnuScience, Bunzl, Biocip Maroc, ACEPRO Maroc, Mutandis — present themselves as confident industrial suppliers with structured catalogs, sectors served, certifications, and a clean "request a quote" flow. Prodet does not. Every prospect lost to "they look more professional online" is a margin lost forever.

### Operational drag: the email / PDF → Swiver loop

The single most expensive recurring task in the company is the manual interpretation of incoming orders. Today:

1. A client sends an order by phone, email, or attached PDF (often generated from their own ERP).
2. Someone at Prodet reads it.
3. Someone at Prodet maps each line to the official Swiver product reference — knowing that clients almost never use Prodet's official names. They write "javel 5L", "bidon javel", "JAV 5", "eau de javel" when the official reference is "JAVEL PRODET BID 5KG".
4. Someone at Prodet types the result into Swiver.

This is repetitive, error-prone, and bounded by the family's time. It is also a perfect target for AI assistance — *but only if* the system never fabricates an order. Hence the load-bearing principle: AI proposes, humans approve.

## What we are building (scoped)

A modular platform, delivered in phases, composed of:

1. **Public B2B website** — homepage, manufacturing/quality story, sectors served, manufactured-product catalog, product detail pages (no public price), quote request, WhatsApp deep links, SEO foundation, multilingual (FR / AR / EN).
2. **Internal order intake console** — paste email / upload PDF / enter phone order, AI line extraction, product matching against the official catalog with alias learning, human review and approval, draft order generation, manual export to Swiver at v1.
3. **Quote request bridge** — public form lands in the same review queue as parsed emails. One inbox for the family.
4. **Client portal** (Phase 3) — repeat ordering, history, client-specific aliases.
5. **Deeper Swiver integration + AI automation** (Phase 4) — push validated drafts directly to Swiver, WhatsApp Business API confirmation, sales insights, CRM-lite follow-up.

## What we are explicitly **not** building

See [docs/01-product/non-goals.md](../01-product/non-goals.md). Headlines:

- **Not** a consumer e-commerce shop with online payment and checkout.
- **Not** a Swiver replacement.
- **Not** a marketplace or multi-vendor system.
- **Not** a public price list.
- **Not** a stock-display system at MVP (Swiver stock is not reliable today).
- **Not** an automated order pipeline that hits Swiver without a human click.

## Strategic principles (invariants)

These are non-negotiable and apply across every phase.

1. **Swiver is the ERP source of truth.** Official documents (devis, bon de commande, bon de livraison, facture) live in Swiver. Prodet Platform produces drafts and proposals; Swiver records the truth.
2. **AI proposes, humans approve.** No customer-visible business action (order, alias creation, price, devis) is committed without a human click in the first three phases. This is a UX rule and an architectural constraint.
3. **Confidence over precision.** A line extracted with confidence 0.62 that triggers a human review is a feature, not a failure. Success is measured in human keystrokes saved per validated order, not in raw model accuracy.
4. **The catalog is bilingual at the data layer.** French primary, Arabic and English supported, mixed-language client vocabulary expected. Aliases are first-class data, not a CSV bolted on later.
5. **Prefer boring tech.** Postgres, Next.js, server actions, Drizzle, Resend, Postmark. New SaaS only when the existing stack genuinely cannot do the job.
6. **Modular but not over-engineered.** Single Next.js app with route groups, not a monorepo. We can split later if pain demands it. We will not build infra for a team of ten while we are a team of one.
7. **Human change-management is a hard requirement, not a soft one.** If the internal console is not faster than direct Swiver entry from day one for *Mère* and *Sœur*, it dies. Their adoption is the success criterion of Phase 1B, not "is the model accurate?".
8. **Public site does not show prices at MVP.** Prices reveal margins and undercut the sales conversation. "Demander un devis" is the conversion event.

## Success metrics (proposed, to confirm in PRD v1)

We will measure four things. Targets are placeholders to be revised after baseline data is collected.

- **Acquisition.** Quote requests per month from net-new prospects (no prior Swiver record). Target: ≥ 8/month within 3 months of public-site launch.
- **Operational efficiency.** Median time from "email arrives" to "draft order ready to push to Swiver." Target: cut by ≥ 60% vs. current manual baseline within 2 months of console launch.
- **Matching quality.** Top-1 product match accuracy after 150 alias seeds. Target: ≥ 70%.
- **Adoption.** % of incoming email/PDF orders processed via the console (vs. bypassed). Target: ≥ 80% within 2 months. Below 50% is a kill-switch — the tool is not earning its place.

## Out-of-scope risks we accept

- We are deliberately not solving stock accuracy in Phase 1. If the family does not start updating stock in Swiver, the platform cannot fix that for them. We surface "stock unknown" rather than lying.
- We are deliberately not solving cash collection / accounts receivable. That is Swiver's job.
- We are deliberately not solving production planning or raw-material procurement. Prodet's manufacturing operations are out of scope until Phase 4+.

## Related

- [personas.md](personas.md) — who uses this.
- [sectors.md](sectors.md) — who we sell to.
- [glossary.md](glossary.md) — domain vocabulary, FR/AR/EN.
- [../01-product/mvp-scope.md](../01-product/mvp-scope.md) — what ships in MVP.
- [../01-product/non-goals.md](../01-product/non-goals.md) — what we are explicitly not doing.
- [../02-architecture/system-overview.md](../02-architecture/system-overview.md) — technical shape.
