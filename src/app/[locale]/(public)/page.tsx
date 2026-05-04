import { setRequestLocale } from 'next-intl/server';
import { listProducts, listSectors } from '@/data/queries';
import { isLocale, type Locale } from '@/i18n/routing';
import { BestSellersStrip } from '@/components/home/best-sellers-strip';
import { FinalCtaBand } from '@/components/home/final-cta-band';
import { getHomeContent } from '@/components/home/content';
import { HeroSection } from '@/components/home/hero-section';
import { HowWeWorkStrip } from '@/components/home/how-we-work-strip';
import { ManufacturerBand } from '@/components/home/manufacturer-band';
import { SectorMosaic } from '@/components/home/sector-mosaic';
import { TrustWall } from '@/components/home/trust-wall';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  const content = getHomeContent(locale as Locale);
  const featuredProducts = listProducts().slice(0, 6);
  const sectors = listSectors().slice(0, 7);

  return (
    <>
      <HeroSection content={content} />
      <BestSellersStrip locale={locale} products={featuredProducts} content={content} />
      <SectorMosaic locale={locale} sectors={sectors} content={content} />
      <ManufacturerBand content={content} />
      <HowWeWorkStrip content={content} />
      <TrustWall content={content} />
      <FinalCtaBand content={content} />
    </>
  );
}
