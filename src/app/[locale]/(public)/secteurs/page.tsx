import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { siteContent } from '@/data/site-content';
import { isLocale } from '@/i18n/routing';
import { listSectors } from '@/data/queries';
import { localizeSectors } from '@/data/i18n/content';
import { SectorsPage } from '@/components/sectors/sectors-page';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: siteContent.sectors.title,
    description: siteContent.sectors.subtitle,
  };
}

export default async function SectorsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  const sectors = localizeSectors(listSectors(), locale).map((sector) => ({
    id: sector.id,
    label: sector.label,
    image: `/images/sectors/${sector.id}.jpg`,
    supplies: sector.supplyHighlights.slice(0, 3),
  }));

  return <SectorsPage sectors={sectors} />;
}
