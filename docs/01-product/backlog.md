# Backlog — Prodet Platform

> Status: Living document. Owner: Souhail. Last updated: 2026-05.
>
> The backlog is the parking lot for ideas, defects, and small enhancements that are **not** in the current week's slice scope. Items here are not commitments. They are reviewed at the start of each phase.

## How to use

- New idea → add to **Inbox** (no triage required).
- Confirmed defect → add to **Defects** with severity.
- Phase-specific candidate → file under its phase section.
- Promoted to a week's scope → cut from here, tracked in the slice plan.

Each entry: `- [phase | size | tag] One-line description. Source: who/when. Notes.`

Sizes: `XS` (< 1 day), `S` (1–3 days), `M` (3–7 days), `L` (1–2 weeks), `XL` (> 2 weeks).
Tags: `feat`, `chore`, `bug`, `perf`, `docs`, `infra`, `ux`, `seo`, `i18n`, `ai`.

## Inbox (untriaged)

- _empty_

## Defects

- _empty_

## Phase 1 (MVP)

- [P1 | XS | docs] Add `humans.txt` and a brief credits note. Source: Souhail. Nice-to-have polish.
- [P1 | S | i18n] Decide formal vs informal Arabic for UI labels. Source: Souhail. Default to formal Tunisian Arabic.
- [P1 | S | ux] Confirmation page for quote submissions includes WhatsApp deep link with the quote reference prefilled. Source: Souhail.
- [P1 | M | feat] Customer auto-detection from inbound-email From: header, with manual override. Source: Souhail.
- [P1 | M | ai] Prompt versioning with `prompt_version` recorded on every extraction job. Source: Souhail.

## Phase 2 (hardening + content)

- [P2 | L | feat] Per-sector deep landing pages (one per sector key from sectors.md). Source: roadmap.
- [P2 | L | feat] Add the ~233 articles commercialisés to the public catalog progressively. Source: vision.
- [P2 | M | i18n] Full AR translation pass on all marketing pages and product short descriptions. Source: roadmap.
- [P2 | M | i18n] Full EN translation pass on key pages. Source: roadmap.
- [P2 | M | feat] Fiche technique / SDS upload + per-product link. Source: roadmap.
- [P2 | M | feat] Postgres FTS search with `unaccent` + French config. Source: roadmap.
- [P2 | S | feat] Auto-acknowledgement to clients on inbound-email order receipt. Conditional on [open question 13](open-questions.md). Source: roadmap.
- [P2 | M | ai] OCR path for scanned PDFs. Source: deferred from MVP.
- [P2 | M | ux] Telemetry dashboard: extraction accuracy, override rate, time-to-validate. Source: roadmap.
- [P2 | M | feat] Image quality pass for top 30 manufactured products. Source: roadmap.

## Phase 3 (client portal)

- [P3 | L | feat] `Espace client` public entry with `Déjà client` and `Devenir client Prodet`. Source: roadmap.
- [P3 | L | feat] Validated access request, Prodet approval, invitation, and suspension workflow. Source: roadmap.
- [P3 | L | feat] Usual-products reorder flow with quantity edits and notes. Source: roadmap.
- [P3 | M | feat] Portal request history for authenticated clients. Source: roadmap.
- [P3 | M | feat] Read-only company/contact/delivery profile with "request a change" path. Source: roadmap.
- [P3 | M | feat] Quote-to-portal conversion path for validated customers. Source: roadmap.

## Phase 4 (deep integration + automation)

- [P4 | L | feat] Direct Swiver write API push. Source: roadmap.
- [P4 | L | feat] WhatsApp Business API integration with confirmation flow. Source: roadmap.
- [P4 | L | feat] Sales insights dashboard from Swiver exports. Source: roadmap.
- [P4 | M | feat] CRM-lite follow-up suggestions. Source: roadmap.
- [P4 | XL | feat] Driver / delivery confirmation mobile app + stock movement capture. Source: roadmap.
- [P4 | XL | feat] Procurement / supplier order module. Source: roadmap.
- [P4 | M | ai] Per-customer auto-push opt-in for high-confidence orders, with shadow run. Source: roadmap.

## Permanent / wishlist (no phase commitment)

- [- | - | feat] Public downloadable catalog PDF (decided not at MVP — see non-goals).
- [- | - | feat] Customer reviews / testimonials (deferred indefinitely).
- [- | - | feat] AI customer-chat widget (decided no — see non-goals).
- [- | - | feat] Multi-tenant white-label (decided no — see non-goals).
- [- | - | feat] Client-specific portal pricing only if a later ADR explicitly approves it. Source: client portal spec.

## Related

- [roadmap.md](roadmap.md) — phasing.
- [mvp-scope.md](mvp-scope.md) — what is in MVP.
- [non-goals.md](non-goals.md) — what is permanently out.
