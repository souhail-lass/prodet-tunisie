import { setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/routing';
import { HomePage } from '@/components/home/home-page';
import { listSectors } from '@/data/queries';
import { localizeSectors } from '@/data/i18n/content';
import { getFeaturedCatalogue } from '@/features/catalogue/queries';

// Static + ISR: served from cache, regenerated in the background. Catalogue
// edits in the admin revalidate the 'catalogue' tag, so updates are instant.
export const revalidate = 300;

export default async function HomeRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  const showcase = await getFeaturedCatalogue(16);
  const sectors = localizeSectors(listSectors(), locale).map((sector) => ({
    id: sector.id,
    label: sector.label,
  }));

  return <HomePage showcase={showcase} sectors={sectors} />;
}
