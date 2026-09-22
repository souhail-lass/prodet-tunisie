import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, isLocale } from '@/i18n/routing';
import { AuthAtmosphere } from '@/components/auth/auth-atmosphere';
import {
  ClientLoginNextField,
  ClientLoginQueryFeedback,
} from '@/components/auth/client-login-query';
import { ClientSessionRedirect } from '@/components/auth/client-session-redirect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { requestClientMagicLink } from '@/features/client-auth/login-actions';

/**
 * Static login shell — same navigation speed as Catalogue / Contact.
 * Session skip + ?sent=/?error= run in a client Suspense island after paint.
 */
export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Connexion espace client Prodet',
    description: 'Connexion par lien magique pour les clients Prodet invités.',
    robots: { index: false, follow: false },
  };
}

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }];
}

export default async function ClientLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect('/fr/connexion-client');
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'common.clientAccess' });
  const fallbackNext = `/${locale}/client`;

  const feedbackMessages = {
    sent: t('sentLogin'),
    errors: {
      'errors.invalidEmail': t('errors.invalidEmail'),
      'errors.notActivated': t('errors.notActivated'),
      'errors.notConfigured': t('errors.notConfigured'),
      'errors.sendFailed': t('errors.sendFailed'),
      'errors.badLink': t('errors.badLink'),
      'errors.signInFailed': t('errors.signInFailed'),
    },
  };

  return (
    <main>
      <AuthAtmosphere>
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
            <Suspense fallback={<input type="hidden" name="next" value={fallbackNext} />}>
              <ClientLoginNextField locale={locale} />
            </Suspense>
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

          <Suspense fallback={null}>
            <ClientLoginQueryFeedback messages={feedbackMessages} />
          </Suspense>

          <div className="my-6 flex items-center gap-3" aria-hidden>
            <span className="bg-border h-px flex-1" />
            <span className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
              {t('or')}
            </span>
            <span className="bg-border h-px flex-1" />
          </div>

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

      <Suspense fallback={null}>
        <ClientSessionRedirect locale={locale} fallbackNext={fallbackNext} />
      </Suspense>
    </main>
  );
}
