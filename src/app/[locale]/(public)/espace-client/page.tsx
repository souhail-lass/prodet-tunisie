import type { Metadata } from 'next';
import { ArrowRight, MailCheck, ShieldAlert, ShieldCheck } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link, isLocale } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { requestClientMagicLink } from '@/features/client-auth/login-actions';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Espace client Prodet — Connexion professionnelle',
    description:
      'Accès professionnel à votre espace client Prodet. Connexion par lien magique pour les comptes validés.',
  };
}

type SearchParams = Record<string, string | string[] | undefined>;

export default async function EspaceClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<SearchParams>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'common.clientAccess' });

  const search = searchParams ? await searchParams : {};
  const error = firstParam(search.error);
  const sent = firstParam(search.sent);

  return (
    <div className="bg-prodet-wash">
      <section className="section-shell flex min-h-[calc(100vh-200px)] items-center justify-center py-16 lg:py-24">
        <div className="w-full max-w-[440px]">
          {/* Heading — one eyebrow, one line, one sub. No marketing wall. */}
          <header className="mb-8 text-center">
            <p className="text-prodet-blue text-[11px] font-semibold tracking-[0.14em] uppercase">
              {t('eyebrow')}
            </p>
            <h1 className="text-prodet-text mt-2.5 text-[28px] leading-[1.15] font-semibold">
              {t('title')}
            </h1>
            <p className="text-muted-foreground mx-auto mt-3 max-w-[320px] text-[14px] leading-6">
              {t('lead')}
            </p>
          </header>

          {/* Single focused card — login is primary, access request is the
              clearly separated secondary path. */}
          <div className="border-border bg-card rounded-xl border p-7 shadow-[0_1px_2px_rgba(6,53,97,0.04),0_20px_40px_-24px_rgba(6,53,97,0.22)]">
            <form action={requestClientMagicLink} className="space-y-3.5">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="next" value={`/${locale}/client`} />
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
                <span>{t('sentEspace')}</span>
              </p>
            ) : null}

            {error ? (
              <p
                role="alert"
                className="border-destructive/20 bg-destructive/10 text-destructive mt-4 flex items-start gap-2 rounded-md border px-3 py-2.5 text-[12px] leading-5"
              >
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>{t(loginErrorKey(error))}</span>
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

          {/* Trust line */}
          <p className="text-muted-foreground mt-5 flex items-center justify-center gap-1.5 text-[11px]">
            <ShieldCheck className="text-prodet-blue h-3.5 w-3.5" aria-hidden />
            {t('reassure')}
          </p>
        </div>
      </section>
    </div>
  );
}

type LoginErrorKey = 'errors.rateLimited' | 'errors.unavailable' | 'errors.signInFailed';

/** Map the ?error= code to a translation key under common.clientAccess. */
function loginErrorKey(error: string): LoginErrorKey {
  switch (error) {
    case 'rate_limited':
      return 'errors.rateLimited';
    case 'config':
      return 'errors.signInFailed';
    default:
      return 'errors.unavailable';
  }
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
