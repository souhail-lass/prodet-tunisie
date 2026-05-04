import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { isLocale } from '@/i18n/routing';
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
    <article className="mx-auto max-w-(--container-2xl) px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="text-primary text-sm font-medium tracking-wider uppercase">
          {t('hero.eyebrow')}
        </p>
        <h1 className="text-foreground mt-3 text-3xl font-semibold sm:text-4xl lg:text-5xl">
          {t('hero.title')}
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">{t('hero.lead')}</p>
      </header>

      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-foreground text-2xl font-semibold">{t('story.title')}</h2>
          <p className="text-muted-foreground mt-4">{t('story.p1')}</p>
          <p className="text-muted-foreground mt-3">{t('story.p2')}</p>
        </div>
        <div
          aria-hidden
          className="border-border bg-secondary/40 text-muted-foreground flex min-h-[280px] items-center justify-center rounded-lg border border-dashed text-sm"
        >
          {t('factory.photoPlaceholder')}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-foreground text-2xl font-semibold">{t('values.title')}</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {valueItems.map((i) => (
            <li key={i} className="border-border bg-card rounded-lg border p-6 shadow-sm">
              <p className="text-card-foreground text-base font-semibold">
                {t(`values.items.${i}.title`)}
              </p>
              <p className="text-muted-foreground mt-2 text-sm">{t(`values.items.${i}.body`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-border bg-secondary/30 mt-16 rounded-lg border p-8">
        <h2 className="text-foreground text-2xl font-semibold">{t('factory.title')}</h2>
        <p className="text-muted-foreground mt-3 max-w-3xl">{t('factory.body')}</p>
        <p className="mt-6 text-sm">
          <span className="text-foreground font-semibold">{t('factory.addressLabel')}&nbsp;:</span>{' '}
          <span className="text-muted-foreground">{t('factory.address')}</span>
        </p>
      </section>

      <section className="mt-16 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-semibold">{t('ctaBand.title')}</h2>
          <p className="text-muted-foreground mt-2">{t('ctaBand.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href="/devis">
              {t('ctaBand.primary')}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contact">{t('ctaBand.secondary')}</Link>
          </Button>
        </div>
      </section>
    </article>
  );
}
