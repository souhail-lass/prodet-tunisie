import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getServerEnv } from '@/lib/env';

/**
 * Service-role Supabase client. NEVER expose this to a client component or
 * route handler that serves untrusted callers — it bypasses RLS by design.
 * Reach for `createSupabaseServerClient()` for session-bound access instead.
 */
export class SupabaseAdminUnavailableError extends Error {
  constructor(
    message = 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for service-role access.',
  ) {
    super(message);
    this.name = 'SupabaseAdminUnavailableError';
  }
}

let cached: SupabaseClient | null = null;

export function createSupabaseAdminClient(): SupabaseClient {
  if (cached) return cached;
  const env = getServerEnv();
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new SupabaseAdminUnavailableError();
  }
  cached = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return cached;
}
