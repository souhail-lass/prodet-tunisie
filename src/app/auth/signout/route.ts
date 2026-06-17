import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** Signs the current user out and returns to a login page. Honors a `next`
 *  query param (local paths only — guards against open redirects); defaults to
 *  the admin login to preserve the admin shell's logout behavior. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { origin, searchParams } = new URL(request.url);
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // Best-effort — still redirect to login.
  }
  const next = searchParams.get('next');
  const dest = next && next.startsWith('/') && !next.startsWith('//') ? next : '/fr/connexion-admin';
  return NextResponse.redirect(`${origin}${dest}`);
}
