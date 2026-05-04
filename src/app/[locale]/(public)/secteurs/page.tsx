import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getProductBySlug, listSectors, localizedSectorName } from '@/data/queries';
import { Link } from '@/i18n/routing';
import { isLocale } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : 'fr';
  const t = await getTranslations({
    locale: safeLocale,
    namespace: 'sectors.index',
  });
  return { title: t('title'), description: t('subtitle') };
}

export default async function SectorsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'sectors.index' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const sectors = listSectors();
  const sectionLabel =
    locale === 'ar' ? 'استعمال مهني' : locale === 'en' ? 'Professional use' : 'Usage professionnel';

  return (
    <div className="section-shell py-12">
      <header className="surface-panel overflow-hidden p-7 sm:p-8">
        <p className="eyebrow-label">Secteurs</p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{t('title')}</h1>
        <p className="text-muted-foreground mt-4 max-w-3xl">{t('subtitle')}</p>
      </header>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sectors.map((sector) => {
          const name = localizedSectorName(sector, locale);
          return (
            <li key={sector.key}>
              <Card className="flex h-full flex-col overflow-hidden p-1 transition-transform duration-200 hover:-translate-y-1">
                <CardHeader>
                  <p className="product-code text-primary">{sectionLabel}</p>
                  <CardTitle className="text-xl">
                    <Link href={`/secteurs/${sector.slug}`} className="hover:underline">
                      {name}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <p className="text-muted-foreground text-sm leading-7">
                    {sector.shortDescByLocale[locale]}
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {sector.recommendedProductSlugs.slice(0, 3).map((slug) => (
                      <li
                        key={slug}
                        className="border-border bg-secondary rounded-full border px-3 py-1 text-xs text-muted-foreground"
                      >
                        {getProductBySlug(slug)?.code ?? slug.toUpperCase().replace(/-/gu, ' ')}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/secteurs/${sector.slug}`}
                    className="text-primary mt-auto inline-flex items-center gap-1 text-sm font-medium hover:underline"
                  >
                    {t('viewSector')}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                  </Link>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>

      <p className="text-muted-foreground mt-10 text-xs">
        {tCommon('navigation.sectors')} · Phase 2 enrichira chaque secteur avec une page dédiée et
        des packs produits adaptés.
      </p>
    </div>
  );
}
