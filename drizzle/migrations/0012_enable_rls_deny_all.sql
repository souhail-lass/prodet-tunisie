-- Enable Row Level Security on every table in the exposed `public` schema.
--
-- WHY
-- Supabase exposes `public` through PostgREST, and new tables receive default
-- grants to `anon` and `authenticated`. With RLS off, that made all 28 tables
-- readable AND writable by anyone holding the publishable key — verified against
-- this project on 2026-08-23 (full row dumps from customer, app_user,
-- user_customer, audit_log; UPDATE/DELETE accepted).
--
-- POSTURE: deny-all. RLS is enabled and NO policy is created, so `anon` and
-- `authenticated` get zero rows on SELECT and are refused every write.
--
-- WHY THIS DOES NOT BREAK THE APP
-- All application data access goes through Drizzle over DATABASE_URL as role
-- `postgres`, which has rolbypassrls = true (verified) and owns all 28 tables.
-- RLS is never evaluated for that connection. The anon key is used ONLY for
-- supabase.auth.* (GoTrue, `auth` schema) and the service-role key ONLY for
-- storage.* and auth.admin.* — neither touches PostgREST tables. Verified by
-- grepping every .from()/.rpc() call site: zero PostgREST table reads.
--
-- ENABLE, never FORCE: FORCE ROW LEVEL SECURITY would apply RLS to the table
-- owner as well. Plain ENABLE keeps the owner (and therefore the app) exempt.
--
-- Idempotent: ENABLE ROW LEVEL SECURITY is a no-op when already enabled.

ALTER TABLE public."app_user" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."audit_log" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."catalogue_product" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."category" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."client_access_request" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."customer" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."customer_contact" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."customer_document" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."customer_usual_product" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."extraction_job" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."family" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."order_attachment" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."order_draft" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."order_draft_document" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."order_line" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."portal_invite" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."product" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."product_alias" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."product_asset" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."product_embedding" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."product_sector" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."product_translation" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."quote_request" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."sector" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."support_ticket" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."swiver_webhook_event" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."ticket_message" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public."user_customer" ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint
-- Self-verifying: fail the migration if any public table is left unprotected,
-- so a table added later without RLS cannot slip through unnoticed.
DO $$
DECLARE unprotected text;
BEGIN
  SELECT string_agg(tablename, ', ' ORDER BY tablename) INTO unprotected
  FROM pg_tables WHERE schemaname = 'public' AND NOT rowsecurity;
  IF unprotected IS NOT NULL THEN
    RAISE EXCEPTION 'RLS missing on public tables: %', unprotected;
  END IF;
END $$;
