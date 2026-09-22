import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { ArrowRight, MailCheck, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Link, isLocale } from '@/i18n/routing';
import { AuthAtmosphere } from '@/components/auth/auth-atmosphere';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { requestClientMagicLink } from '@/features/client-auth/login-actions';
import { requireClientPortalAccess } from '@/features/client-portal/auth';
import { hasSupabaseAuthCookie } from '@/lib/supabase/auth-cookie';

// Per-user by nature (session check + redirect). Must never be prerendered:
// the try/catch below would swallow the static-bailout signal cookies() throws
// during build and bake a form that ignores existing sessions.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Connexion espace client Prodet',
    description: 'Connexion par lien magique pour les clients Prodet invités.',
    robots: { index: false, follow: false },
  };
}

type PageSearchParams = Record<string, string | string[] | undefined>;

export default async function ClientLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<PageSearchParams>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect('/fr/connexion-client');

  const rawSearchParams = searchParams ? await searchParams : {};
  const error = firstParam(rawSearchParams.error);
  const sent = firstParam(rawSearchParams.sent);
  const next = sanitizeNext(locale, firstParam(rawSearchParams.next));
  const t = await getTranslations({ locale, namespace: 'common.clientAccess' });

  // Returning client with a still-valid session: skip the form entirely and
  // go straight to the portal. The magic link is only for the FIRST login on
  // a device (or after sign-out) — never a per-visit requirement.
  //
  // Fast path for public-site visitors (no auth cookie): skip Supabase getUser()
  // + DB membership lookup so the form can render without a network round trip.
  const cookieStore = await cookies();
  let alreadySignedIn = false;
  if (hasSupabaseAuthCookie(cookieStore.getAll())) {
    try {
      await requireClientPortalAccess();
      alreadySignedIn = true;
    } catch {
      // Cookie present but session invalid / no portal access — show the form.
    }
  }
  // redirect() must stay outside try/catch — it throws NEXT_REDIRECT.
  if (alreadySignedIn) redirect(next);

  return (
    <main>
      <AuthAtmosphere>
        {/* Heading — mirrors /espace-client for a consistent entry point. */}
        <header className="mb-8 flex flex-col items-center text-center">
          <p className="text-prodet-blue text-[11px] font-semibold tracking-[0.14em] uppercase">
            {t('eyebrow')}
          </p>
          <h1 className="text-prodet-text mt-2.5 text-[28px] leading-[1.15] font-semibold">
            {t('titleLogin')}
          </h1>
          <p className="text-muted-foreground max-w-[22rem] pt-5 text-[14px] leading-6 whitespace-pre-line">
            {t('lead')}
          </p>
        </header>

        <div className="border-border bg-card rounded-xl border p-7 shadow-[0_1px_2px_rgba(6,53,97,0.04),0_20px_40px_-24px_rgba(6,53,97,0.22)]">
          <form action={requestClientMagicLink} className="space-y-3.5">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="next" value={next} />
            <label className="block">
              <span className="text-prodet-text mb-1.5 block text-[12px] font-medium">
                Email professionnel
              </span>
              <Input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={t('emailPlaceholder')}
              />
            </label>
            <Button type="submit" size="lg" className="w-full">
              {t('submit')}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </form>

          {sent === '1' ? (
            <p
              role="status"
              className="border-prodet-green/20 bg-prodet-green/10 text-prodet-green mt-4 flex items-start gap-2 rounded-md border px-3 py-2.5 text-[12px] leading-5"
            >
              <MailCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>{t('sentLogin')}</span>
            </p>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="border-destructive/20 bg-destructive/10 text-destructive mt-4 flex items-start gap-2 rounded-md border px-3 py-2.5 text-[12px] leading-5"
            >
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>{t(clientLoginErrorKey(error))}</span>
            </p>
          ) : null}

          {/* Divider */}
          <div className="my-6 flex items-center gap-3" aria-hidden>
            <span className="bg-border h-px flex-1" />
            <span className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
              {t('or')}
            </span>
            <span className="bg-border h-px flex-1" />
          </div>

          {/* Secondary path — request access */}
          <div className="text-center">
            <p className="text-muted-foreground text-[13px]">{t('notYetClient')}</p>
            <Button asChild variant="neutral" size="lg" className="mt-2.5 w-full">
              <Link href="/devenir-client">{t('requestAccess')}</Link>
            </Button>
          </div>
        </div>

        <p className="text-muted-foreground mt-5 flex items-center justify-center gap-1.5 text-[11px]">
          <ShieldCheck className="text-prodet-blue h-3.5 w-3.5" aria-hidden />
          {t('reassure')}
        </p>
      </AuthAtmosphere>
    </main>
  );
}

type ClientLoginErrorKey =
  | 'errors.invalidEmail'
  | 'errors.notActivated'
  | 'errors.notConfigured'
  | 'errors.sendFailed'
  | 'errors.badLink'
  | 'errors.signInFailed';

/** Map the ?error= code to a translation key under common.clientAccess. */
function clientLoginErrorKey(error: string): ClientLoginErrorKey {
  switch (error) {
    case 'invalid':
      return 'errors.invalidEmail';
    case 'not-activated':
      return 'errors.notActivated';
    case 'config':
      return 'errors.notConfigured';
    case 'failed':
      return 'errors.sendFailed';
    case 'missing-code':
    case 'callback':
      return 'errors.badLink';
    default:
      return 'errors.signInFailed';
  }
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function sanitizeNext(locale: 'fr' | 'en', value?: string): string {
  if (!value) return `/${locale}/client`;

  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith(`/${locale}/client`) && !decoded.startsWith('//')) {
      return decoded;
    }
  } catch {
    // Fall through to default.
  }

  if (value.startsWith(`/${locale}/client`) && !value.startsWith('//')) return value;

  return `/${locale}/client`;
}
