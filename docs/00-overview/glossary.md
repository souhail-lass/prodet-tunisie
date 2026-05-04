# Glossary — Prodet Platform

> Status: Draft. Owner: Souhail. Last updated: 2026-05.

Domain vocabulary used across Prodet, Swiver, and this platform. Terms are cross-referenced FR / AR / EN where relevant. Used to (a) onboard new contributors, (b) standardize interface labels, (c) seed the i18n translation glossary.

## Business documents (Tunisian commercial practice + Swiver naming)

| FR | AR | EN | Definition / our use |
|---|---|---|---|
| Devis | عرض سعر | Quote / quotation | Non-binding price offer issued to a customer. Generated in Swiver as the official document. Prodet Platform issues "draft devis" that the family validates before pushing to Swiver. |
| Bon de commande (BC) | بون طلب | Purchase order (PO) | Customer's order document confirming the devis. Often what arrives by email/PDF — frequently from the customer's own ERP. The order intake console parses these. |
| Bon de livraison (BL) | بون تسليم | Delivery note | Document accompanying physical delivery. Out of scope at MVP — stays in Swiver. |
| Facture | فاتورة | Invoice | Official tax invoice. Out of scope — Swiver authoritative. |
| Avoir | إشعار دائن | Credit note | Out of scope — Swiver authoritative. |
| Fiche technique | بطاقة تقنية | Technical data sheet (TDS) | Product specification PDF. Hosted on Prodet Platform from Phase 2. |
| Fiche de données de sécurité (FDS) | بطاقة بيانات السلامة | Safety data sheet (SDS / MSDS) | Regulatory safety sheet for chemical products. Hosted on Prodet Platform from Phase 2. |

## Catalog and product vocabulary

| Term | Definition |
|---|---|
| Produit fini Prodet | Cleaning/hygiene product manufactured by Prodet (~80 SKUs in current Swiver export). The credibility-anchor of the public catalog. |
| Article commercialisé | Finished product (mop, accessory, etc.) bought from a supplier and resold by Prodet (~233 SKUs). Added progressively in Phase 2. |
| Matière première | Raw material used in manufacturing (~76 SKUs). **Never publicly visible.** |
| Catégorie / Famille | Taxonomy. "Catégorie" is the top-level grouping (détergents, désinfectants, accessoires); "famille" can be a finer sub-grouping (e.g. javellisants within désinfectants). |
| Référence (réf.) | Internal product code in Swiver (the official identifier). |
| Conditionnement | Packaging form (bidon 5L, fût 25L, carton 12 pcs, sachet 1kg). |
| Unité de vente | Sales unit (pièce, litre, kilogramme, carton). |
| BID | Common abbreviation for *bidon* — used inside product names like "JAVEL PRODET BID 5KG". |

## Naming and matching vocabulary (this platform's invention)

| Term | Definition |
|---|---|
| Official name | The canonical product name as it exists in Swiver. The system of record. |
| Alias | Any non-canonical string a customer or staff member uses for a product. Stored in `product_aliases` and used by the matching engine. |
| Global alias | Alias valid for any customer ("javel 5L" → JAVEL PRODET BID 5KG). |
| Customer-scoped alias | Alias only valid for one specific customer ("notre détergent vert" → a specific Prodet detergent). Captures per-customer naming. |
| Match confidence | Score in [0, 1] from the matching engine indicating the likelihood that the proposed product is correct. Drives review-UI sorting and the human-validation threshold. |
| Extraction job | A run of the AI line extractor over a single input (email body, PDF, pasted text). Has inputs, outputs, model used, prompt version, latency, and human feedback. |
| Order draft | An order in Prodet Platform that has not yet been pushed to Swiver. Has status `parsing` → `review` → `approved` → `exported` (or `rejected`). |
| Review queue | The internal screen where pending order drafts wait for human approval. The single inbox for the family. |

## Sector vocabulary

See [sectors.md](sectors.md). Keys are stable identifiers like `hospitality.hotels`; labels are localized.

## Roles and access

| Term | Definition |
|---|---|
| Admin | A staff user (Père, Mère, Sœur, Souhail) with access to the internal console. Phase 1+. |
| Operator | Default admin role: can process orders, manage aliases, edit product info. (Mère, Sœur.) |
| Reviewer | Admin role limited to approval of high-value orders. (Optional, Père-style use.) |
| Owner | Full admin including user management and integration settings. (Souhail.) |
| Customer user | Phase 3 only. A user belonging to a customer organization, accessing the client portal. |

## ERP and integration vocabulary

| Term | Definition |
|---|---|
| Swiver | The ERP currently in use ([app.swiver.io](https://app.swiver.io/)). The system of record for accounting and official commercial documents. |
| Source of truth (SoT) | The system that "owns" a piece of data. Swiver = SoT for accounting. Prodet Platform = SoT for product names/descriptions/aliases, leads, drafts. |
| Push-to-Swiver | The (manual at MVP, API-driven later) action of moving an approved order draft into Swiver as an official devis or bon de commande. |
| Stock movement | A change to physical inventory (entry from production, exit to delivery). Currently not reliably recorded; the source of Swiver's bad stock data. |

## i18n / locale conventions

| Term | Definition |
|---|---|
| Locale | One of `fr-TN`, `ar-TN`, `en`. URL segment is the short form (`fr`, `ar`, `en`). |
| Default locale | `fr` — French. All content must be complete in French; AR and EN may lag. |
| RTL | Right-to-left. Applies only to `ar` locale. |
| Mixed-language string | A product name or customer term combining FR and AR characters. Common in Tunisian B2B. The data model stores these as-is, no transliteration. |

## Acronyms

| Acronym | Meaning |
|---|---|
| TND | Tunisian dinar. |
| HACCP | Hazard Analysis and Critical Control Points — food-safety standard relevant to hospitality buyers. |
| RGPD / GDPR | EU data protection regulation. We adopt RGPD-aligned practices even though Tunisia has its own (loi 2004-63). |
| SDS / FDS | Safety data sheet (EN) / Fiche de données de sécurité (FR). |
| TDS | Technical data sheet. |
| ADR | Architecture Decision Record. See [../02-architecture/adr/](../02-architecture/adr/). |
| PRD | Product Requirements Document. See [../01-product/prd.md](../01-product/prd.md). |
| MVP | Minimum Viable Product. Here: Phase 1A + Phase 1B parallel slices. |
| LCP | Largest Contentful Paint — Core Web Vitals metric. |
| FTS | Full-text search (Postgres). |
| RLS | Row-level security (Postgres / Supabase). |

## Things we deliberately do not call something else

- We say **"order draft"**, not "ticket" or "lead". A draft can become a real order; a lead is something else.
- We say **"alias"**, not "synonym" or "keyword". Aliases have ownership (global vs customer-scoped) and validation status.
- We say **"sector"**, not "industry" or "vertical".
- We say **"manufactured by Prodet"**, not "house brand" or "private label".

## Related

- [vision.md](vision.md), [personas.md](personas.md), [sectors.md](sectors.md).
- [../02-architecture/data-model.md](../02-architecture/data-model.md) — formalizes most terms here as entities.
- [../04-design/i18n-content-rules.md](../04-design/i18n-content-rules.md) — language conventions for UI copy.
