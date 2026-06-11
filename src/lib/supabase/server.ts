import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getServerEnv } from '@/lib/env';

export class SupabaseAuthConfigurationError extends Error {
  constructor(message = 'Supabase Auth is not configured.') {
    super(message);
    this.name = 'SupabaseAuthConfigurationError';
  }
}

export async function createSupabaseServerClient() {
  const env = getServerEnv();
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new SupabaseAuthConfigurationError(
      'SUPABASE_URL and SUPABASE_ANON_KEY are required for admin authentication.',
    );
  }

  const cookieStore = await cookies();

  return createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server components cannot set cookies. Route handlers and server actions can.
        }
      },
    },
  });
}
