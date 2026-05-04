# Personas — Prodet Platform

> Status: Draft. Owner: Souhail. Last updated: 2026-05.

These are the actors who interact with Prodet Platform, directly or indirectly. They are intentionally specific: this is a family company in Tunisia, not an abstraction.

For each persona we capture: role, primary goal, current pain, what success looks like for them in v1, and the **adoption risk** — because the best feature ignored by the user is worth nothing.

---

## Internal personas

### Père — Decision-maker / Supervisor

- **Role.** Owner. Approves significant decisions. Reviews dashboards. Validates pricing and unusual orders. ~2 hours/day on the business.
- **Primary goal.** Confidence that the operation runs correctly without him having to inspect every order. Visibility into revenue, top customers, slow movers.
- **Current pain.** Limited synthesis from Swiver. No glanceable view of "what happened today / this week / this month" without clicking through reports.
- **What v1 success looks like for him.** A single screen showing today's incoming orders with their validation status, this week's revenue trend (sourced from Swiver export), and the top 5 customers. He should not have to log into the console daily.
- **Adoption risk.** Low — he is the sponsor.
- **Design implications.** Glanceable summaries. Email or WhatsApp digests, not "go open the dashboard." Approval flows must be one-click, including from mobile.

### Mère — Operations / Order intake

- **Role.** Daily operations. Reads incoming emails, takes phone orders, types orders into Swiver, talks to customers, follows up on deliveries.
- **Primary goal.** Get through the day's orders accurately, without redoing work, without losing emails in the inbox.
- **Current pain.** Repetitive transcription. Same client, same products, every week — re-typed every time. Mental cost of remembering which client uses which name for which product.
- **What v1 success looks like for her.** Pasting an email or uploading a PDF takes < 30 seconds to land on the review screen. Most line items are pre-matched correctly. The few that are not are easy to correct in the same screen. Approving sends the result somewhere she can quickly copy into Swiver (or, if Swiver API works, pushes a draft devis directly).
- **Adoption risk.** **HIGH.** This is the make-or-break user of Phase 1B. If the console is not strictly faster than her current Swiver workflow from day one, she will go back to Swiver and the project fails its operational thesis. Slow load times, clicky review UIs, and "AI confidence" jargon are all blockers.
- **Design implications.**
  - Keyboard-first review UI.
  - Default-accept for high-confidence matches; surface low-confidence ones at the top.
  - Never block her on AI uncertainty — let her override with a single field.
  - First-class support for "I know this client always means X when they write Y."
  - Mobile-friendly enough for after-hours order checking, but the primary form factor is desktop / laptop.

### Sœur — Operations / Customer contact

- **Role.** Daily operations. Overlaps with Mère. May own customer follow-up, quotation responses, occasionally takes phone orders.
- **Primary goal.** Same as Mère, plus: respond quickly to customer questions about prices and product availability.
- **Current pain.** Same as Mère. Plus: when a customer asks "do you have X in stock?", the answer is often "let me check and call you back" because Swiver stock is unreliable.
- **What v1 success looks like for her.** Same console as Mère. Plus a fast product search from a customer-context page that shows "this customer ordered X N times in the last 12 months" so she can preemptively offer the usual list.
- **Adoption risk.** Medium. She may be more open to new tools than Mère, but the same speed bar applies.
- **Design implications.** Customer-detail page with order history, usual products, contact actions (WhatsApp deep link, phone tap-to-call, email).

### Souhail — Owner / Architect / Reviewer

- **Role.** Builder. Reviews every change. Owns the PRD, the architecture, the spikes, and the deployment.
- **Primary goal.** Ship a serious platform without becoming a permanent on-call engineer for the family business.
- **Current pain.** N/A — this is the role being instantiated.
- **What v1 success looks like for him.** Documented decisions, ADRs that future-Souhail can read in 6 months and remember why. CI that catches regressions. Spikes that retire risk before bulk build. No vendor-locked code that cannot be moved.
- **Adoption risk.** N/A.
- **Design implications.** Strong documentation discipline. Modular code structure. Observability from day one (Sentry, basic analytics). Feature flags for risky rollouts.

### Workers (3–4)

- **Role.** Production, packaging, delivery. Drive the Fiat Punto and the two Isuzu D-Max.
- **Primary goal.** Execute the day.
- **In-scope for v1?** **No.** They do not interact with the platform in any phase before mobile delivery tracking is considered (Phase 4+).
- **Why mention them.** They generate stock movement events. The fact that those events are not currently captured is *the* reason Swiver stock is unreliable. A future module may give them a barebones mobile UI for delivery confirmation; this is not on the MVP roadmap.

---

## External personas (customers and prospects)

### Existing professional client — "the regular B2B buyer"

- **Profile.** Purchasing officer or owner of a hotel, restaurant, café, cleaning company, wholesaler, or institution. Buys from Prodet recurrently. Has a relationship with Mère / Sœur / Père.
- **How they order today.** Phone, email, or PDF generated from their own ERP. Often mixed FR/AR vocabulary. Often uses their internal product names rather than Prodet's official names.
- **Primary goal.** Get the order placed correctly and delivered on time. Not interested in learning a new app.
- **Adoption risk for v1 self-service flows.** **HIGH.** They will not switch to a portal in Phase 1. They will keep emailing. The platform must serve them through their existing channel (email → console). The portal in Phase 3 is for the *subset* who want self-service repeat ordering.
- **What v1 success looks like for them.** Their email / PDF gets processed accurately and quickly. Optionally, an auto-acknowledgement reply ("we received your order, will confirm shortly") in their language. *(Whether to send this auto-ack at v1 is an [open question](../01-product/open-questions.md).)*
- **Design implications.** The email-in pipeline is a customer-experience surface, not just an internal tool. Treat it accordingly.

### New prospect — "the Google searcher"

- **Profile.** A buyer at a hotel / cleaning company / institution that does not currently buy from Prodet. Searched for "produits d'entretien Tunisie", "fournisseur javel hotel", "détergent industriel Tunis", or similar.
- **Primary goal in 30 seconds.** Confirm Prodet is a real, professional manufacturer / supplier. Find out what they sell. Find a way to get a quote.
- **Current pain.** Cannot find a credible Prodet web presence today.
- **What v1 success looks like for them.** A clean homepage that signals manufacturer credibility within 5 seconds, a sectors page that says "we serve people like you", a category-browsable catalog of manufactured products, a one-click "demander un devis" flow with WhatsApp as a fallback. No friction, no signup.
- **Adoption risk.** N/A — they choose us, not the other way around. The risk is invisibility, not refusal.
- **Design implications.** SEO foundation, fast Largest Contentful Paint, structured data (Organization + Product), clear CTAs above the fold, French-first content with Arabic and English available.

### Existing client wanting self-service (Phase 3 only)

- **Profile.** A subset of regular clients — typically the larger or more digitally-comfortable ones — who would like to repeat their last order in two clicks rather than write an email.
- **Primary goal.** "Reorder what I ordered last month." See past orders. See their personal aliases for products.
- **What success looks like.** Login. Land on "your usual order." Tweak quantities. Submit. Done.
- **Adoption risk.** Medium. Their behaviour will only shift once the portal is *demonstrably* easier than email. Phase 3, not before.

### Supplier of resold articles or raw materials

- **Out of scope** for all phases up to and including 4. Mentioned only because procurement is the obvious Phase 5+ direction once order intake is solid.

---

## Persona × phase matrix

| Persona | Phase 0 | Phase 1A (public site) | Phase 1B (intake console) | Phase 2 | Phase 3 (portal) | Phase 4 |
|---|---|---|---|---|---|---|
| Père | Sponsor | Approves content | Light user (dashboard) | Reviews KPIs | Reviews KPIs | Reviews KPIs |
| Mère | Stakeholder | — | **Primary user** | Primary user | Primary user | Primary user |
| Sœur | Stakeholder | — | **Primary user** | Primary user | Primary user | Primary user |
| Souhail | Owner | Owner | Owner | Owner | Owner | Owner |
| Workers | — | — | — | — | — | Possible mobile delivery UI |
| Existing client | — | — | Indirect (email pipeline) | Indirect | **Optional self-service** | Optional self-service |
| New prospect | — | **Primary target** | Indirect (quote form) | Primary target | Primary target | Primary target |

## Notes on naming

We refer to family members as Père, Mère, Sœur in documentation rather than by name. This is intentional: it keeps personas role-anchored and protects PII inside what may eventually be a shared repository.
