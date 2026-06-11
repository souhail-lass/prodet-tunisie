# Claude Code handoff guide

> Owner: Souhail. Last updated: 2026-06-06.
> Entry point for Claude Code: [CLAUDE.md](../../CLAUDE.md) at repo root.

## 1. Purpose of this document

Souhail is handing ongoing development to **Claude Code**. This guide tells you how to get productive in under 30 minutes without breaking auth, customer isolation, or audit requirements.

## 2. First-time setup

```bash
# Prerequisites: Node >=20, pnpm 9 (corepack enable)
cd "/path/to/Prodet Tunisie"
corepack enable
pnpm install

cp .env.example .env.local
# Fill all required vars — see secrets-checklist.md
# Souhail must provide Supabase + DATABASE_URL values out of band.

pnpm db:migrate
pnpm dev
# → http://localhost:3004/fr
```

Verify health:

```bash
pnpm typecheck && pnpm lint && pnpm test
```

## 3. Secrets Souhail must provide manually

Never commit these. Copy from Souhail's password manager / Supabase dashboard:

| Variable | Required for | Where to get it |
|---|---|---|
| `DATABASE_URL` | All DB features | Supabase → Settings → Database (direct, port 5432) |
| `SUPABASE_URL` | Auth | Supabase project URL |
| `SUPABASE_ANON_KEY` | Auth middleware | Supabase → API keys |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin actions, Storage | Supabase → API keys (server only) |
| `SWIVER_API_KEY` | Swiver sandbox reads | Swiver → Intégration → Application web |
| `SWIVER_WEBHOOK_SECRET` | Webhook verification (future) | Swiver integration panel |
| `RESEND_API_KEY` | Invite emails (optional) | Resend dashboard |

Full checklist: [secrets-checklist.md](secrets-checklist.md).

## 4. Supabase manual setup (one-time)

Souhail should confirm these exist in the Supabase project:

1. **Auth redirect URLs**: `http://localhost:3004/auth/callback` (+ production domain).
2. **Storage bucket**: `customer-documents` (private, no public access).
3. **RLS**: enabled on tables (admin uses service-role from server actions).
4. **First admin**: see [first-admin-setup.md](first-admin-setup.md).
5. **Demo client** (optional): `pnpm db:seed:demo-portal` after a `customer_user` exists.

## 5. Mental model

```mermaid
flowchart TB
    subgraph Public
        Site[Public pages]
        Access[Devenir client form]
    end
    subgraph Auth
        ML[Magic link]
        CB[/auth/callback]
    end
    subgraph Portal
        Dash[Dashboard]
        Req[Request builder]
        Hist[History]
        Docs[Documents]
    end
    subgraph Admin
        AccRev[Access review]
        PortRev[Portal review]
    end
    subgraph Data
        OD[order_draft source=portal]
        AL[audit_log]
    end

    Access --> AccRev
    AccRev --> ML
    ML --> CB --> Portal
    Req --> OD
    PortRev --> OD
    Req & PortRev --> AL
```

**Unified queue:** portal submissions are `order_draft` rows, not a separate table.

## 6. File map — where to edit what

### Client portal

| Task | Start here |
|---|---|
| Dashboard metrics | `src/features/client-portal/dashboard.ts` |
| Submit request | `src/features/client-portal/request-builder.ts` |
| Product search in builder | `src/lib/portal-product-search.ts` |
| History / detail | `src/features/client-portal/request-history.ts` |
| Usual products | `src/features/client-portal/usual-products.ts` |
| Documents upload | `src/features/client-portal/documents/actions.ts` |
| Portal shell UI | `src/components/portal/` |
| Auth gate | `src/features/client-portal/auth.ts` |

### Admin

| Task | Start here |
|---|---|
| Access request review | `src/features/client-access/admin-actions.ts` |
| Portal request review | `src/features/admin/portal-request-actions.ts` |
| Admin auth | `src/features/admin/auth.ts` |

### Public site

| Task | Start here |
|---|---|
| Catalog data | `src/data/products.ts`, `src/data/queries.ts` |
| Catalog UI | `src/app/[locale]/(public)/catalogue/` |
| Quote form | `src/features/quote/actions.ts` |
| Contact form | `src/features/contact/actions.ts` |

### Infrastructure

| Task | Start here |
|---|---|
| Env validation | `src/lib/env.ts` |
| Rate limiting | `src/lib/rate-limit.ts` |
| Middleware auth | `src/middleware.ts` |
| DB schema | `src/db/schema/` |
| Swiver | `src/integrations/swiver/` |
| Webhook | `src/app/api/webhooks/swiver/route.ts` |

## 7. Patterns to follow

### Server action template

```ts
'use server';
// 1. Zod-parse FormData / input
// 2. requireClientPortalAccess() or assertRole(...)
// 3. consumeRateLimit(...) if public-facing
// 4. Drizzle mutation scoped to customer_id
// 5. audit_log insert
// 6. revalidatePath(...) or redirect
```

### Customer data isolation

Every portal query must filter:

```ts
eq(schema.orderDraft.customerId, access.customer.id)
eq(schema.orderDraft.source, 'portal')
```

Never trust `customerId` from the client.

### Migrations

```bash
# After editing src/db/schema/
pnpm db:generate
pnpm db:migrate
# Commit both schema + new SQL migration. Forward-only.
```

## 8. Routes reference

All routes prefixed with `/{locale}` where locale is `fr` | `ar` | `en`.

**Public:** `/`, `/catalogue`, `/catalogue/[slug]`, `/secteurs`, `/devis`, `/contact`, `/espace-client`, `/devenir-client`, legal pages.

**Auth:** `/connexion-client`, `/connexion-admin`.

**Client (protected):** `/client`, `/client/nouvelle-demande`, `/client/historique`, `/client/historique/[id]`, `/client/produits-habituels`, `/client/documents`.

**Admin (protected):** `/admin/demandes-acces`, `/admin/demandes-acces/[id]`, `/admin/demandes-portail`, `/admin/demandes-portail/[id]`.

**API:** `POST /api/webhooks/swiver`, `GET /auth/callback`.

## 9. Testing locally

### Admin flow

1. Ensure `app_user` with role `owner|admin|operator` exists.
2. `/fr/connexion-admin` → magic link → `/fr/admin/demandes-acces`.

### Client flow

1. Submit `/fr/devenir-client` OR use seeded demo user.
2. Admin approves + sends invite.
3. `/fr/activation-client?token=...` → activate.
4. `/fr/connexion-client` → magic link → `/fr/client`.

### Demo seed

```bash
pnpm db:seed:demo-portal
# Requires existing customer_user email in DB (see scripts/seed-demo-portal.sql)
```

## 10. Documentation index

| Doc | When to read |
|---|---|
| [developer-guide.md](../00-overview/developer-guide.md) | Architecture, algorithms, tech stack |
| [project-status.md](project-status.md) | What's built / not built |
| [system-overview.md](../02-architecture/system-overview.md) | High-level diagrams |
| [auth.md](../02-architecture/auth.md) | Roles, RLS, threat model |
| [data-model.md](../02-architecture/data-model.md) | Entity reference |
| [client-portal.md](../03-modules/client-portal.md) | Portal product spec |
| [ADR index](../02-architecture/adr/README.md) | Decision rationale |
| [open-questions.md](../01-product/open-questions.md) | Unresolved product decisions |

## 11. Common mistakes to avoid

1. Adding `customerId` from form data without server-side membership check.
2. Shipping `SUPABASE_SERVICE_ROLE_KEY` to client components.
3. Creating a second order table instead of using `order_draft`.
4. Auto-pushing to Swiver without human approval step.
5. Showing public prices or stock.
6. Editing applied Drizzle migrations instead of generating new ones.
7. Pretending spike-validated Swiver/matching behavior exists.
8. Using `ml-*`/`mr-*` in new RTL-facing UI (use `ms-*`/`me-*`).

## 12. Handoff checklist for Souhail

Before Claude Code starts autonomous work, confirm:

- [ ] `.env.local` populated locally (or Claude Code has env access)
- [ ] Supabase project URL + keys shared securely
- [ ] `pnpm db:migrate` applied on shared DB
- [ ] `customer-documents` bucket created (private)
- [ ] Auth redirect URLs configured
- [ ] At least one admin `app_user` exists
- [ ] Optional: demo portal seed applied
- [ ] Swiver sandbox credentials shared if Swiver work is in scope
- [ ] Priority list agreed (see [project-status.md](project-status.md))
