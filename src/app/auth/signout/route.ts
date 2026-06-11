import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** Signs the current user out and returns to the admin login. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { origin } = new URL(request.url);
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // Best-effort — still redirect to login.
  }
  return NextResponse.redirect(`${origin}/fr/connexion-admin`);
}
