import type { Metadata } from 'next';
import {
  ArrowLeft,
  BadgeCheck,
  FileText,
  LayoutDashboard,
  MailCheck,
  PhoneCall,
} from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link, isLocale } from '@/i18n/routing';
import { AccessRequestForm } from '@/components/client-space/access-request-form';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Demander un accès client Prodet',
    description: "Demande d'activation d'accès client Prodet pour professionnels validés.",
  };
}

const STEPS = [
  { icon: FileText, key: 'request' },
  { icon: PhoneCall, key: 'check' },
  { icon: BadgeCheck, key: 'approve' },
  { icon: MailCheck, key: 'activate' },
  { icon: LayoutDashboard, key: 'portal' },
] as const;

export default async function DevenirClientPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'common.becomeClient' });

  return (
    <div className="bg-prodet-wash">
      <section className="section-shell py-10 lg:py-14">
        <Link
          href="/espace-client"
          className="text-primary hover:text-primary-strong inline-flex items-center gap-2 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Retour espace client
        </Link>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-12">
          {/* LEFT — the procedure. Sticky on desktop so it stays in view while
              the form (right) scrolls. Vertical timeline = the enhanced schema. */}
          <aside className="lg:sticky lg:top-24">
            <p className="eyebrow-label">{t('controlled.title')}</p>
            <h1 className="font-display text-prodet-text mt-2 text-[28px] leading-tight font-bold">
              {t('title')}
            </h1>
            <p className="text-muted-foreground mt-2.5 text-sm leading-6">{t('controlled.body')}</p>

            <ol className="relative mt-8 space-y-6">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === STEPS.length - 1;
                return (
                  <li key={step.key} className="relative flex gap-4">
                    {/* Connector rail between nodes */}
                    {!isLast ? (
                      <span
                        className="bg-border absolute top-[44px] left-[21px] h-[calc(100%+4px)] w-px"
                        aria-hidden
                      />
                    ) : null}
                    <span className="border-prodet-blue/15 bg-prodet-blue-tint text-prodet-blue relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border">
                      <Icon className="h-[18px] w-[18px]" aria-hidden />
                    </span>
                    <div className="pt-1">
                      <span className="text-prodet-blue text-[0.7rem] font-semibold tracking-[0.12em] uppercase">
                        {t('step', { n: index + 1 })}
                      </span>
                      <h3 className="text-prodet-text mt-0.5 text-sm font-semibold">
                        {t(`steps.${step.key}.title`)}
                      </h3>
                      <p className="text-muted-foreground mt-0.5 text-xs leading-5">
                        {t(`steps.${step.key}.body`)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </aside>

          {/* RIGHT — the form (infos professionnelles). */}
          <AccessRequestForm />
        </div>
      </section>
    </div>
  );
}
