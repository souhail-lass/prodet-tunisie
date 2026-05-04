import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { isLocale } from '@/i18n/routing';
import { ProdetPackshot } from '@/components/brand/prodet-packshot';
import { Button } from '@/components/ui/button';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : 'fr';
  const t = await getTranslations({ locale: safeLocale, namespace: 'about.hero' });
  return { title: t('title'), description: t('lead') };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'about' });
  const valueItems = [0, 1, 2, 3] as const;

  return (
    <article className="section-shell py-12">
      <header className="surface-panel overflow-hidden p-7 sm:p-8">
        <p className="eyebrow-label">{t('hero.eyebrow')}</p>
        <h1 className="mt-4 max-w-4xl text-3xl font-semibold sm:text-4xl lg:text-5xl">
          {t('hero.title')}
        </h1>
        <p className="text-muted-foreground mt-4 max-w-3xl text-lg leading-8">{t('hero.lead')}</p>
      </header>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div>
          <h2 className="text-foreground text-2xl font-semibold">{t('story.title')}</h2>
          <p className="text-muted-foreground mt-4 leading-8">{t('story.p1')}</p>
          <p className="text-muted-foreground mt-3 leading-8">{t('story.p2')}</p>
        </div>
        <div className="surface-panel overflow-hidden p-5">
          <ProdetPackshot
            title="PROLAX LIQUIDE"
            subtitle={locale === 'ar' ? 'سائل للمنسوجات' : locale === 'en' ? 'Liquid textile care' : 'Liquide textile professionnel'}
            weightLabel="20KG"
          />
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-foreground text-2xl font-semibold">{t('values.title')}</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {valueItems.map((i) => (
            <li key={i} className="surface-panel p-6">
              <p className="text-card-foreground text-base font-semibold">
                {t(`values.items.${i}.title`)}
              </p>
              <p className="text-muted-foreground mt-2 text-sm leading-7">
                {t(`values.items.${i}.body`)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface-panel mt-16 p-8">
        <h2 className="text-foreground text-2xl font-semibold">{t('factory.title')}</h2>
        <p className="text-muted-foreground mt-3 max-w-3xl leading-8">{t('factory.body')}</p>
        <p className="mt-6 text-sm">
          <span className="text-foreground font-semibold">{t('factory.addressLabel')}&nbsp;:</span>{' '}
          <span className="text-muted-foreground">{t('factory.address')}</span>
        </p>
      </section>

      <section className="surface-panel mt-16 flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-semibold">{t('ctaBand.title')}</h2>
          <p className="text-muted-foreground mt-2">{t('ctaBand.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="rounded-full">
            <Link href="/devis">
              {t('ctaBand.primary')}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link href="/contact">{t('ctaBand.secondary')}</Link>
          </Button>
        </div>
      </section>
    </article>
  );
}
