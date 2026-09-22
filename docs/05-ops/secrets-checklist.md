# Secrets and environment checklist

> Owner: Souhail. Last updated: 2026-06-06.
> Template: [.env.example](../../.env.example). Never commit `.env` or `.env.local`.

## How to use

1. Copy `.env.example` → `.env.local` for local dev.
2. Copy the same keys to Vercel / deployment env when deploying.
3. Give Claude Code access to `.env.local` on your machine, or paste values into its env — never into git.

## Required for basic dev (public site + DB)

| Variable | Example shape | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://...@...supabase.co:5432/postgres` | Direct connection (5432), not pooler (6543) for drizzle-kit |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3004` | Magic link redirect base |

Without `DATABASE_URL`, public pages work; portal/admin DB features fail.

## Required for auth (portal + admin)

| Variable | Notes |
|---|---|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | Safe for browser; used in middleware |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — admin mutations, Storage uploads |

Without Supabase vars, `/client/*` and `/admin/*` redirect to login with `?error=config`.

## Required for documents module

| Variable | Default | Notes |
|---|---|---|
| `SUPABASE_CUSTOMER_DOCUMENTS_BUCKET` | `customer-documents` | Bucket must exist, **private** |

## Optional — email

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Send portal invite emails |
| `RESEND_FROM_EMAIL` | Sender address |
| `QUOTE_NOTIFICATION_EMAIL` | Admin notification on devis |
| `POSTMARK_INBOUND_TOKEN` | Future inbound order email |

If `RESEND_API_KEY` is unset, admin UI shows a dev activation link instead of sending email.

## Optional — Swiver

| Variable | Default | Purpose |
|---|---|---|
| `SWIVER_MODE` | `disabled` | `sandbox` or `production` for live adapter |
| `SWIVER_API_BASE_URL` | — | e.g. `https://sandbox.swiver.io` |
| `SWIVER_API_KEY` | — | Bearer token from Swiver integration panel |
| `SWIVER_WEBHOOK_SECRET` | — | Future HMAC verification |

## Optional — future features (not wired yet)

| Variable | Purpose |
|---|---|
| `OPENAI_API_KEY` | Embeddings + extraction |
| `ANTHROPIC_API_KEY` | Extraction alternative |
| `INNGEST_EVENT_KEY` | Background jobs |
| `INNGEST_SIGNING_KEY` | Background jobs |
| `SENTRY_DSN` | Error tracking |

## Optional — public site

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_DEFAULT_WHATSAPP_E164` | WhatsApp button (E.164, e.g. `+216...`) |

## Supabase dashboard checklist

### Local

- [ ] Auth → URL configuration: Site URL `http://localhost:3004`
- [ ] Redirect URLs include `http://localhost:3004/auth/callback`

### Production (required for magic links)

If Redirect URLs do not allow the callback, Supabase **silently replaces**
`emailRedirectTo` with Site URL. The mail then contains
`redirect_to=https://prodet.com.tn` (no `/auth/callback`) and the click
lands on the homepage with no session.

- [ ] Site URL: `https://www.prodet.com.tn`
- [ ] Redirect URLs (exact or wildcards), all of:
  - `https://www.prodet.com.tn/auth/callback`
  - `https://www.prodet.com.tn/**`
  - `https://prodet.com.tn/auth/callback` (apex, if used)
  - `http://localhost:3004/auth/callback` (local)
- [ ] Vercel `NEXT_PUBLIC_SITE_URL` = `https://www.prodet.com.tn`
- [ ] Auth → Email provider enabled
- [ ] `RESEND_API_KEY` set in Vercel — client magic links are sent via Resend
      straight to `/auth/callback` (token_hash). Without Resend, the app falls
      back to Supabase-hosted mail (PKCE).
- [ ] Storage → `customer-documents` bucket (private)
- [ ] Database → migrations applied (`pnpm db:migrate`)
- [ ] API keys → anon + service_role copied to `.env.local` / Vercel

## Security rules

1. Never commit `.env`, `.env.local`, or any file containing real keys.
2. Never put `SUPABASE_SERVICE_ROLE_KEY` in `NEXT_PUBLIC_*` vars.
3. Never log full API keys or magic-link tokens.
4. Rotate `SWIVER_API_KEY` if exposed.

## Verify env is working

```bash
pnpm dev
# Public:  curl -s -o /dev/null -w "%{http_code}" http://localhost:3004/fr  → 200
# Auth:    open /fr/connexion-admin — should NOT show ?error=config
# DB:      pnpm db:studio — should connect
```
