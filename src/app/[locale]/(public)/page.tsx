import { setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/routing';
import { HomePage } from '@/components/home/home-page';
import { listSectors } from '@/data/queries';
import { localizeSectors } from '@/data/i18n/content';
import { familles } from '@/data/familles';
import { sectorPageCards } from '@/components/secteurs/sector-page-data';
import { getFeaturedCatalogue, getFamilleCounts } from '@/features/catalogue/queries';

// Static + ISR: served from cache, regenerated in the background. Catalogue
// edits in the admin revalidate the 'catalogue' tag, so updates are instant.
export const revalidate = 300;

export default async function HomeRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  const [showcase, familleCounts] = await Promise.all([
    getFeaturedCatalogue(16),
    getFamilleCounts(),
  ]);
  const sectors = localizeSectors(listSectors(), locale).map((sector) => ({
    id: sector.id,
    label: sector.label,
    image: sectorPageCards.find((c) => c.id === sector.id)?.image ?? '',
  }));
  const familleCards = [...familles]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((f) => ({ id: f.id, image: f.packshot, count: familleCounts[f.id] }));

  return <HomePage showcase={showcase} sectors={sectors} familles={familleCards} />;
}
