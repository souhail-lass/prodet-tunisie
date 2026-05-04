import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { listSectors, localizedSectorName } from '@/data/queries';
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

  return (
    <div className="mx-auto max-w-(--container-2xl) px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <h1 className="text-foreground text-3xl font-semibold sm:text-4xl">{t('title')}</h1>
        <p className="text-muted-foreground mt-3">{t('subtitle')}</p>
      </header>

      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sectors.map((sector) => {
          const name = localizedSectorName(sector, locale);
          return (
            <li key={sector.key}>
              <Card className="flex h-full flex-col">
                <CardHeader>
                  <CardTitle>
                    <Link href={`/secteurs/${sector.slug}`} className="hover:underline">
                      {name}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <p className="text-muted-foreground text-sm">
                    {sector.shortDescByLocale[locale]}
                  </p>
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
