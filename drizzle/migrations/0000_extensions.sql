-- Postgres extensions required by the data model.
-- These are idempotent and safe to re-run.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Wrapper that yields an immutable signature usable inside generated columns
-- and partial indexes. `unaccent(text)` is stable, not immutable, so we wrap
-- it with a fixed dictionary call.
CREATE OR REPLACE FUNCTION public.immutable_unaccent(text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT public.unaccent('public.unaccent', $1);
$$;
