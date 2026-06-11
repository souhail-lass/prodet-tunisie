# Design system rebuild brief — feed document for Claude Design

> **Purpose:** This is the single comprehensive input for rebuilding Prodet's entire design system from scratch.
> **Owner:** Souhail Lassoued. **Date:** 2026-06-06.
> **Audience:** Claude Design (or any design AI/human rebuilding tokens, components, and visual language).
> **Output expected:** A complete design system — color/type/spacing tokens, component specs, patterns for 3 surfaces, RTL rules, and implementation notes for Tailwind v4 + shadcn/ui.

---

## 1. Mission statement for the redesign

Rebuild Prodet's visual system so the platform feels like a **serious Tunisian B2B manufacturer and supplier** — not a SaaS startup, not a consumer shop, not a generic cleaning brand.

The design system must serve **three distinct surfaces** in one codebase:

| Surface | Users | Feeling |
|---|---|---|
| **Public site** | New prospects, Google searchers | Manufacturer credibility in 5 seconds; quote-first |
| **Client portal** | Returning B2B buyers (hotels, restaurants, cleaning cos.) | Operational reorder desk — Shopify B2B / Linear density, not e-commerce |
| **Admin console** | Prodet family staff (Mère, Sœur, Père) | Fast, keyboard-friendly, zero jargon — tool not dashboard theater |

**North star:** A hotel purchasing manager lands on the homepage and thinks *"this is a real factory, I can request a quote."* A returning client logs into the portal and reorders in under 60 seconds. Mère reviews a portal request faster than reading an email.

---

## 2. Company context

### Who is Prodet?

- **Prodet Tunisie** — Tunisian **manufacturer and distributor** of professional cleaning, hygiene, and detergent products.
- Location: **L'Aouina, Tunis** (Grand Tunis delivery footprint).
- ~80 products manufactured in-house (*Produits finis Prodet*); ~233 resold articles (*articles commercialisés* — not in public MVP catalog).
- ~141 B2B customers in ERP (Swiver); family-operated (~3–4 workers, 3 vehicles).
- Revenue: active business (~856 KTND in 2025), not a startup seeking PMF.

### What the platform is

A **modular B2B platform** (Next.js 15, one app):

1. Public multilingual site (FR / AR / EN) — catalog, sectors, quote request.
2. Client portal — repeat ordering, history, documents (built).
3. Admin console — access review, portal request triage (partial).
4. (Future) Internal order intake with AI extraction.

**Swiver** is the ERP/accounting source of truth. This platform does not replace it.

### Load-bearing product rule

> **AI proposes. Humans approve. Swiver records.**

Design must never imply: automatic order acceptance, instant checkout, public AI chatbot, or autonomous ERP writes.

---

## 3. Vision and strategic positioning

### One-line positioning (French-canonical)

> **Fabricant et fournisseur tunisien de produits d'hygiène et d'entretien professionnels.**

Supporting line:

> Produits fabriqués et distribués pour hôtels, restaurants, entreprises, sociétés de nettoyage, revendeurs et institutions.

### What success looks like (design-relevant)

| Stakeholder | Design success |
|---|---|
| **New prospect** | Credible manufacturer in <30 seconds; clear path to devis |
| **Existing B2B client** | Portal feels faster than email for repeat orders |
| **Mère / Sœur** | Admin/portal review is denser and faster than inbox + Swiver typing |
| **Père** | Glanceable status summaries; approves from mobile if needed |

### Strategic principles that constrain design

1. **No public prices, stock, or payment** — ever at MVP. CTA is always *Devis*, never *Acheter*.
2. **Manufacturer proof over marketing fluff** — packshots, labels, factory, address beat slogans.
3. **Practical density over SaaS whitespace** — B2B buyers scan for facts (code, conditionnement, sector).
4. **French-first, Arabic RTL-ready, English scaffolded** — bilingual is structural, not decorative.
5. **Local Tunisian credibility** — not generic MENA stock; not faux European luxury.
6. **No fake trust** — no invented client logos, stats, certifications, or sustainability claims.

---

## 4. Target clients and personas

### Primary external audiences (design for these)

#### A. New professional buyer — "the Google searcher"

- **Who:** Purchasing officer or owner at hotel, restaurant, café, cleaning company, wholesaler, institution in Tunisia.
- **Mindset:** "Is this a real manufacturer? Do they serve people like me? How do I get a quote?"
- **Time budget:** 30 seconds to decide relevance.
- **Design needs:**
  - Hero = manufacturer + product proof, not abstract gradient.
  - Sector/use-case entry ("I run a hotel") before chemistry categories.
  - `Demander un devis` dominant; WhatsApp/phone as fallback.
  - No signup wall, no price tags, no cart icon.

#### B. Existing professional client — "the regular B2B buyer"

- **Who:** Recurring buyer; orders by phone, email, or PDF from their own ERP.
- **Mindset:** "Get it right, get it delivered — don't make me learn a new app."
- **Portal subset:** Larger or digitally comfortable clients who want self-service reorder.
- **Design needs (portal):**
  - Memory-first: last request, usual products, one-click reorder.
  - Language: *demande*, *réapprovisionnement*, *recommander* — never *panier*, *checkout*, *payer*.
  - Status chips show *En revue chez Prodet* — human review visible.
  - ERP copy/export affordance (they paste into their system).
  - B2B table density; mobile-usable but desktop-primary.

#### C. New client seeking access — "Devenir client"

- **Who:** Professional buyer without an account yet.
- **Flow:** Public form → Prodet validates → invite → activation → portal.
- **Design needs:** Trust + seriousness; explain restricted B2B access; no consumer signup patterns.

### Internal audiences (admin design)

#### Mère — primary operations user

- **Job:** Process orders, map client vocabulary to Swiver products, type into ERP.
- **Design needs:** Keyboard-first, default-accept high-confidence matches, override in one field, **strictly faster than current workflow** or she won't adopt.
- **Risk:** HIGH — if admin UI is slow or clicky, project fails operationally.

#### Sœur — operations + customer contact

- Same as Mère + customer context (history, usual products, WhatsApp deep link).

#### Père — supervisor

- Glanceable summaries, email/WhatsApp digest-friendly, one-click approvals on mobile.

### Sectors served (IA and visual narrative)

Organize around **who the buyer is**, not abstract chemistry:

| Sector key | FR label |
|---|---|
| `hospitality.hotels` | Hôtels et hébergement |
| `hospitality.restaurants` | Restaurants |
| `hospitality.cafes` | Cafés et salons de thé |
| `cleaning.companies` | Sociétés de nettoyage |
| `wholesale.distributors` | Grossistes et distributeurs |
| `institutions.public` | Institutions publiques |
| `business.offices` | Entreprises et bureaux |

### Professional needs (catalog/homepage grouping)

Buyers enter by **terrain need**, not product chemistry:

- Restauration et cuisine
- Buanderie et linge
- Étage / housekeeping
- Sanitaires et désinfection
- Sols
- Surfaces et vitres
- Hygiène des mains

---

## 5. Competitive visual context

Peers analyzed: Dustbane, InnuScience, Biocip Maroc, ACEPRO Maroc, Mutandis, Bunzl, etc.

**Convergent B2B hygiene patterns to adopt:**

- Sector-first navigation
- No public prices
- Quote / contact specialist as dominant CTA
- Browseable non-transactional catalog
- Manufacturer framing ("we make this")
- SDS/TDS document zones on product pages (layout ready; content Phase 2)
- Trust through years, footprint, certifications — **only when real**

**Where Prodet must diverge:**

- Lead with **Tunisian manufacturer** (most MENA peers are distributors)
- Warmer, practical industrial — not North American corporate blue-gray sterility
- Portal = B2B reorder desk (inspired by Shopify B2B, Stripe Dashboard clarity, Linear density) — **not** consumer Shopify

**Explicit anti-references:**

- Consumer detergent brands (Sun, Ajax retail aesthetic)
- Generic SaaS landing pages (purple gradients, floating blobs)
- Marketplace UI (Amazon, multi-vendor grids)
- French luxury minimal (too empty for B2B procurement)

---

## 6. Brand identity and logo

### Logo description

The Prodet logo is a **rounded wordmark** with orbital/industrial motion cues:

- **Wordmark:** "PRODET" in bold rounded sans-serif, primary **blue** (`~#0F5DA8` region).
- **Orbit stroke:** Blue elliptical arc wrapping the wordmark — suggests cycle, hygiene, completeness.
- **Green sweep:** Lower accent curve in **green** (`~#1E9D4F` region) — secondary brand signal.
- **Cyan sparkle:** Small **light blue** detail (`~#25A6E6`) — accent only, not a background wash.

**Brand reading:** Industrial, clean, modern, trustworthy — closer to a **product label** than a tech logo.

### Logo files in repository (source assets)

| File | Use |
|---|---|
| `public/brand/Logo_Prodet_page-0001_1_-removebg.svg` | **Primary master** — full logo, transparent background, high resolution (4000×2250 viewBox) |
| `public/brand/logo.svg` | Alternate export |
| `public/images/logo/prodet-logo.svg` | Currently used in app header (`src/components/brand/logo.tsx`) |

**Action for design system:** Extract **exact** hex values from the SVG paths (not screenshots). Replace all provisional palette tokens.

### Logo usage rules

- **Primary:** Full wordmark on white, ivory, or warm off-white.
- **Clearspace:** At least the height of the lowercase "o" on all sides.
- **Minimum width:** ~120px full signature; test legibility on mobile header.
- **Backgrounds:** White, `#F7F5F0` ivory, light neutral — never on busy photography.
- **Misuse:** No stretch, recolor, drop shadow, outline, or gradient fill on logo.
- **Mark-only variant:** Do not improvise until a proper icon export exists.
- **Light variant:** White/inverted for dark blue hero bands only (`logo.tsx` has `variant="light"`).

### Sample label reference

Product label example reviewed: **PROLAX LIQUIDE** on white industrial container — blue geometric fields, bilingual FR/AR copy, dense specification blocks. Use label geometry (diagonal fields, rectangular blocks) as **sparing** graphic accents (1–2 per page max).

---

## 7. Color system (provisional — must be refined from logo SVG)

### Current implementation (`src/app/globals.css`)

```css
/* Provisional — extract exact values from logo during rebuild */
--color-prodet-blue:   #0F5DA8   /* Primary brand / CTA */
--color-prodet-navy:   #0B3D73   /* Dense surfaces, headings */
--color-prodet-sky:    #25A6E6   /* Accent highlights only */
--color-prodet-green:  #1E9153   /* Support accent — sparingly */
--color-prodet-wash:   #F8F7F4   /* Page background (warm off-white) */
--color-prodet-surface:#F3F6F9   /* Secondary surfaces */
--color-prodet-ink:    #08294E   /* Darkest text */
--color-prodet-text:   #13293D   /* Body text */
--color-prodet-line:   #D5DEE7   /* Borders */
--color-prodet-mist:   #EAF2F8   /* Light blue tint panels */
```

### Color roles (semantic tokens to define)

| Role | Direction |
|---|---|
| `background` | Warm off-white — **not** pure `#FFFFFF` page fill |
| `foreground` | Cool dark ink — **not** pure black |
| `card` | Pure white for product cards, forms, packshot frames |
| `primary` | Prodet blue — main CTAs, active nav, links |
| `primary-strong` | Navy/deep blue — hero bands, dense info panels |
| `secondary` | Very light blue-gray tint — quiet panels |
| `accent` | Sky blue — tiny highlights only |
| `support` | Prodet green — secondary emphasis, **not** primary CTA |
| `border` | Stronger than default SaaS gray — structure via borders |
| `destructive` | Accessible red |
| `success` | Green family (distinct from brand green) |
| `warning` | Practical amber |
| `muted` | Secondary text, captions |

### Color rules

1. **Blue structures the UI.** Primary actions, focus rings, active states.
2. **Green is a support note** — not sustainability signaling, not primary buttons.
3. **No decorative gradients** except intentional label-inspired geometric panels.
4. **Light mode only** at MVP. Dark mode = admin console first, if ever.
5. **Portal/admin** may use slightly denser/neutral surfaces than marketing — same token family.

---

## 8. Typography

### Direction

| Role | Preferred | Fallback in app today |
|---|---|---|
| Display / headings / nav | **IBM Plex Sans** | Loaded via Next.js font |
| Body | Neutral sans compatible with Plex | System stack |
| Arabic | **IBM Plex Sans Arabic** or equivalent | Noto Naskh Arabic |
| Codes / reference / conditionnement | Tabular nums, compact uppercase label style | Mono stack |

### Rules

- **Headlines:** Sentence case (FR). 5–9 words. No all-caps shouting.
- **Eyebrows / labels:** Uppercase with wider tracking OK (`FABRICATION TUNISIENNE`).
- **Product codes & conditionnement:** Tabular numerals; visually distinct from body.
- **Arabic:** Must not inherit Latin letter-spacing/tracking. Separate scale testing required.
- **Avoid:** Consumer-rounded fonts (Nunito, Poppins playful), decorative condensed faces.

### Type scale to define

Provide a full scale for:

- Display (hero)
- H1–H4
- Body / body-sm
- Caption / eyebrow
- Code/label micro
- Arabic parallel sizes (often need +5–10% line-height)

---

## 9. Layout, spacing, and density

### Public site

- **Reduce vertical whitespace** vs. typical SaaS — target `py-12`–`py-16` desktop sections.
- **Mobile:** Quote CTA and product content reachable early (no endless hero).
- **Max text measure:** 60–65ch for paragraphs.
- **Container:** Wide enough for dense catalog (current `--container-2xl: 1340px`).
- **Cards:** Practical radii (4–14px), **borders over shadows**, flat shadows only.

### Client portal

- **B2B operational density** — tables, compact rows, status pills, metric tiles.
- Sidebar nav desktop; bottom nav mobile (already scaffolded in `src/components/portal/`).
- Empty states: calm, actionable, no illustration clutter.
- Request builder: search + basket pattern; thumb-friendly on mobile.

### Admin console

- **Maximum information density** without chaos.
- Queue tables: sortable/filterable aesthetic.
- Review detail: lines, quantities, audit timeline — scannable.
- Keyboard shortcuts consideration for Phase 2.

---

## 10. Graphic language and imagery

### Do

- Real Prodet **packshots** on white/ivory (1:1, `object-contain`, 75–85% product fill).
- **Factory/storage/daylight** photography when authentic.
- **Label-inspired** diagonal separators and spec panels — restrained.
- Sector imagery only when contextual; products stay hero.

### Don't

- Stock photos of generic cleaners in yellow gloves.
- Fake 3D renders of bottles.
- Glow, blur, glassmorphism, oversized gradients.
- Lifestyle scenes overpowering product proof.
- Competitor packaging in placeholders.

### Product image system

- Master: 2400×2400px transparent PNG preferred.
- Format-specific honest placeholders when missing (5L, 20L, 20KG, spray, pump).
- Alt text: `Image produit à venir: {name}` — never fake product names on placeholders.

---

## 11. Motion and interaction

| Context | Duration |
|---|---|
| Hover / tap feedback | 120–180ms |
| Layout / reveal | 200–240ms |
| Page transitions | Minimal — no scroll theater |

**Allowed:** subtle card lift, opacity fades, button state transitions.
**Forbidden:** parallax, spring bounces, decorative scroll animations.

---

## 12. Three surfaces — component inventory

Design system must spec components for all three. Current codebase uses **shadcn/ui** primitives in `src/components/ui/` — new system should map to replaceable tokens + component APIs.

### 12.1 Public site components

**Shell:** TopUtilityBar, SiteHeader, SiteFooter, Logo, LocaleSwitcher, WhatsAppLink, BreadcrumbBar

**Homepage:** HomeHero, ProfessionalNeedsGrid, SectorMosaic, FeaturedProductsStrip, ManufacturerBand, QuoteFlowStrip, FinalCtaBand

**Catalog:** CatalogHeader, CatalogSearch, CatalogFilters, ActiveFilterChips, ProductGrid, ProductCard, CatalogEmptyState

**Product detail:** ProductHero, ProductImageFrame, ProductSpecPanel, ProductQuoteRail, ProductDocumentZone, RelatedProducts, MobileProductCta

**Quote/contact:** QuoteForm, QuoteLineItem, QuoteConfirmation, ContactForm, ContactRoutingCards

**Shared:** Button, Input, Textarea, Select, Badge, Card, Tabs, EmptyState, ErrorState, LoadingState

### 12.2 Client portal components

**Shell:** AppShell, SidebarNav, BottomNav, PageHeader, Panel, MetricTile, StatusPill, EmptyState

**Dashboard:** ActivityStrip, TopProductsPanel, RecentRequestsList, QuickActionCards, TimelinePreview

**Request builder:** ProductSearch, ProductRow, QuantityStepper, BasketSummary, RecurrenceSelector, SubmitBar

**History:** RequestTable, RequestDetailHeader, LineItemsTable, CopyErpButton, DocumentAttachZone

**Documents:** UploadForm, DocumentList, DocumentCard, DownloadButton

**Auth:** MagicLinkForm, ActivationConfirmForm

### 12.3 Admin console components

**Shell:** AdminLayout, AdminSidebar, AdminPageHeader

**Queues:** DataTable, StatusFilter, SearchBar, RequestDetailPanel, ReviewActions, InviteActions, AuditTimeline

**Shared with portal:** StatusPill (extended statuses), MetricSummary

---

## 13. UX copy and voice (design-relevant)

### Voice

- Direct, specific, industrial, local, calm.
- Manufacturer-confident: *"Nous fabriquons"* where true.
- Quote-first: primary button = **Devis** (short form, not "Demander un devis" everywhere if space tight).

### Use (FR-canonical)

| Context | Copy |
|---|---|
| Primary CTA | `Devis` / `Demander un devis` |
| Secondary | `Voir le catalogue`, `Nous contacter` |
| Pricing | `Prix communiqués sur devis` |
| Portal submit | `Envoyer la demande` |
| Portal status | `En revue chez Prodet`, `Validée`, `Refusée` |

### Never use

`acheter`, `panier`, `checkout`, `en stock`, `prix imbattables`, `leader`, `révolutionnaire`, `AI-powered`, emojis, fake eco claims.

### Languages

| Locale | Status | Design constraint |
|---|---|---|
| `fr` | Complete | Source of truth |
| `ar` | Progressive | **RTL** — logical properties (`ms-*`, `ps-*`), mirrored layouts |
| `en` | Scaffolded | LTR; professional B2B English |

---

## 14. Accessibility and responsive

- WCAG 2.1 AA target for public paths.
- Visible focus rings (blue, 2px offset — already in globals.css).
- No hover-only critical actions.
- Touch targets ≥44px on mobile portal.
- Test 360px width for quote flow and portal bottom nav.
- `dir="rtl"` on Arabic locale — components must not hardcode left/right.

---

## 15. Technical implementation constraints

The design system will be implemented in:

| Tech | Version | Implication |
|---|---|---|
| Tailwind CSS | v4 | Tokens as `@theme { }` in `globals.css` |
| Next.js | 15 App Router | Server Components default; CSS variables for theming |
| shadcn/ui | copied primitives | Components in `src/components/ui/` — we own the code |
| next-intl | 3.x | `[locale]` URL prefix always |
| Fonts | next/font | IBM Plex Sans + Arabic via `layout.tsx` |

**Deliverables should include:**

1. CSS custom properties / Tailwind v4 `@theme` block ready to paste.
2. Component specs with states: default, hover, focus, disabled, loading, error.
3. Responsive breakpoints per component (mobile-first).
4. RTL notes per component pattern.
5. Figma-style spacing grid OR clear 4/8px scale.
6. Iconography direction (recommend Lucide — already in codebase).

**Do not spec:** React code, unless helpful as reference. Focus on tokens + component anatomy + states.

---

## 16. Current state (what exists today — to be replaced)

The app is **functional but visually inconsistent** — grown iteratively. Claude Design should treat current UI as **reference only**, not constraint.

| Area | Current state |
|---|---|
| Public homepage | HomePageV3 scaffolded; mixed spacing; real copy in `src/data/site-content.ts` |
| Catalog | Client-side search; product cards exist; needs token cohesion |
| Portal | Redesigned shell (`src/components/portal/`); screenshots in `screenshots/portal-redesign/` |
| Admin | Minimal functional UI; no design polish |
| Tokens | `globals.css` @theme block — provisional colors |
| Fonts | IBM Plex intended; Arabic fallback Noto Naskh |

**Screenshots for reference:** `screenshots/portal-redesign/` (01–11 desktop + mobile portal states).

---

## 17. Deliverables checklist for Claude Design

Please produce:

### A. Foundation

- [ ] Color palette extracted from logo SVG (primary, navy, sky, green, neutrals) with hex + usage rules
- [ ] Semantic token map (background, foreground, primary, border, etc.)
- [ ] Typography scale (Latin + Arabic notes)
- [ ] Spacing scale (4px base recommended)
- [ ] Border radius scale
- [ ] Shadow scale (flat/border-first)
- [ ] Z-index scale
- [ ] Motion tokens

### B. Core components

- [ ] Button (primary, secondary, ghost, destructive, sizes)
- [ ] Input, Textarea, Select, Checkbox
- [ ] Card (public product card vs portal panel vs admin row)
- [ ] Badge / StatusPill
- [ ] Table / data row patterns
- [ ] Navigation (public header, portal sidebar, admin sidebar)
- [ ] Empty state, Error state, Loading skeleton
- [ ] Modal / Sheet / Dropdown

### C. Domain components

- [ ] Public ProductCard (conditionnement prominent, devis CTA)
- [ ] ProductSpecPanel (label-inspired)
- [ ] QuoteForm rail
- [ ] Portal MetricTile + RequestRow
- [ ] Portal request builder line item
- [ ] Admin queue table row

### D. Page templates (wireframe-level)

- [ ] Public homepage structure
- [ ] Catalog listing
- [ ] Product detail
- [ ] Portal dashboard
- [ ] Portal nouvelle-demande (request builder)
- [ ] Admin demandes-portail queue

### E. Guidelines

- [ ] Logo usage sheet
- [ ] Photography / packshot rules
- [ ] Icon style (stroke width, size grid)
- [ ] RTL mirroring rules
- [ ] Do / Don't gallery

---

## 18. Hard constraints (non-negotiable)

| Constraint | Reason |
|---|---|
| No public prices | B2B negotiated pricing |
| No cart/checkout UI | Quote-first business model |
| No stock indicators | ERP stock unreliable |
| No fake trust badges | Brand integrity |
| No consumer retail patterns | B2B manufacturer positioning |
| No emojis | Brand + code convention |
| No dark mode on public site | MVP scope |
| No AI/chatbot widget on public site | Internal tooling only |
| Green ≠ primary CTA | Avoid false eco positioning |
| Manufacturer > distributor visually | Core differentiator in Tunisia |

---

## 19. Inspiration mood board (directional, not copy)

| Reference | Take |
|---|---|
| **Dustbane / InnuScience** | Manufacturer credibility, sector IA, spec-heavy product pages |
| **Biocip / ACEPRO Maroc** | MENA B2B tone, French-first |
| **Shopify B2B portal** | Reorder desk density, company context, line items |
| **Stripe Dashboard** | Clear hierarchy, calm precision, status chips |
| **Linear** | Compact tables, subtle borders, fast-scan admin patterns |

**Not inspiration:** Apple.com, Stripe.com marketing pages, consumer Shopify themes, DTC detergent D2C brands.

---

## 20. Related documents in repo

| Doc | Content |
|---|---|
| [brand.md](brand.md) | Brand reading, provisional palette |
| [design-tokens.md](design-tokens.md) | Token categories |
| [09-design-decisions.md](../design/09-design-decisions.md) | Unified public-site decisions D-001–D-010 |
| [04-homepage-v3-brief.md](../design/04-homepage-v3-brief.md) | Homepage structure |
| [05-catalog-ux-brief.md](../design/05-catalog-ux-brief.md) | Catalog UX |
| [06-product-page-ux-brief.md](../design/06-product-page-ux-brief.md) | Product detail UX |
| [client-portal-ux.md](../design/client-portal-ux.md) | Portal UX principles |
| [content-style-guide.md](content-style-guide.md) | Copy voice |
| [../00-overview/vision.md](../00-overview/vision.md) | Product vision |
| [../00-overview/personas.md](../00-overview/personas.md) | User personas |
| [../00-overview/sectors.md](../00-overview/sectors.md) | Sector definitions |
| [../07-research/competitors.md](../07-research/competitors.md) | Competitor patterns |

---

## 21. Prompt starter for Claude Design

Copy-paste this when opening the design session:

```
You are rebuilding the complete design system for Prodet Platform — a Tunisian B2B 
manufacturer of professional cleaning and hygiene products.

Read the full brief at docs/04-design/design-system-rebuild-brief.md in the repository.

Logo master file: public/brand/Logo_Prodet_page-0001_1_-removebg.svg
Extract exact brand colors from the SVG.

Deliver:
1. Complete token system (color, type, spacing, radius, shadow, motion)
2. Component library spec for 3 surfaces: public site, client portal, admin console
3. RTL/Arabic considerations
4. Tailwind v4 @theme CSS output
5. Do/Don't rules

Constraints: no public prices, no checkout, no fake trust, manufacturer-not-SaaS aesthetic,
quote-first CTAs, B2B density, French-first with Arabic RTL.

Inspiration: industrial B2B manufacturers (Dustbane, Biocip) + operational portals 
(Shopify B2B density, Linear admin clarity). NOT consumer retail or SaaS landing pages.
```

---

*End of brief. Questions → Souhail Lassoued.*
