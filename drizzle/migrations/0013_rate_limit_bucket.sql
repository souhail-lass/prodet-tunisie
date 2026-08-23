-- Durable, cross-instance rate-limit counters. See ADR 0013.
--
-- The previous limiter was an in-process Map, which on Vercel meant one empty
-- counter per lambda instance and per cold start — every published limit on the
-- contact form, public devis, access request and magic-link endpoints was
-- unenforced in production.
--
-- RLS deny-all like every other table in the exposed `public` schema
-- (see 0012_enable_rls_deny_all). The app reaches it as the owner role, which
-- has rolbypassrls.
CREATE TABLE IF NOT EXISTS public.rate_limit_bucket (
  key        text PRIMARY KEY,
  count      integer NOT NULL DEFAULT 0,
  reset_at   timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS rate_limit_bucket_reset_at_idx
  ON public.rate_limit_bucket (reset_at);
--> statement-breakpoint
ALTER TABLE public.rate_limit_bucket ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
-- Same guard as 0012: no table in `public` may go without RLS.
DO $$
DECLARE unprotected text;
BEGIN
  SELECT string_agg(tablename, ', ' ORDER BY tablename) INTO unprotected
  FROM pg_tables WHERE schemaname = 'public' AND NOT rowsecurity;
  IF unprotected IS NOT NULL THEN
    RAISE EXCEPTION 'RLS missing on public tables: %', unprotected;
  END IF;
END $$;
