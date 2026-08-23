import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = sanitizeNext(searchParams.get('next'));
  const locale = getLocaleFromNext(next);
  const loginPath = isClientPath(next) ? `/${locale}/connexion-client` : `/${locale}/connexion-admin`;

  if (!code) {
    return NextResponse.redirect(`${origin}${loginPath}?error=missing-code`);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[admin-auth:callback-error]', {
        message: error.message,
        status: error.status,
      });
      return NextResponse.redirect(`${origin}${loginPath}?error=callback`);
    }
  } catch (error) {
    console.error('[admin-auth:callback-config-error]', error);
    return NextResponse.redirect(`${origin}${loginPath}?error=config`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}

function sanitizeNext(value: string | null): string {
  if (!value) return '/fr/admin/overview';

  try {
    const decoded = decodeURIComponent(value);
    if (isAllowedAuthRedirect(decoded)) return decoded;
  } catch {
    // Fall through to raw value.
  }

  if (isAllowedAuthRedirect(value)) return value;

  return '/fr/admin/overview';
}

function isAllowedAuthRedirect(value: string): boolean {
  return (
    (/^\/(fr|ar|en)\/admin\//u.test(value) || /^\/(fr|ar|en)\/client(?:\/|$)/u.test(value)) &&
    !value.startsWith('//')
  );
}

function isClientPath(value: string): boolean {
  return /^\/(fr|ar|en)\/client(?:\/|$)/u.test(value) && !value.startsWith('//');
}

function getLocaleFromNext(value: string): 'fr' | 'en' {
  const locale = value.split('/')[1];
  return locale === 'en' ? locale : 'fr';
}
