import { setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/routing';
import { ContactMap } from '@/components/home/ContactMap';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { FinalCTA } from '@/components/home/FinalCTA';
import { HomeCategories } from '@/components/home/HomeCategories';
import { HomeHero } from '@/components/home/HomeHero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { TrustedClients } from '@/components/home/TrustedClients';
import { TrustStrip } from '@/components/home/TrustStrip';
import { WhyProdet } from '@/components/home/WhyProdet';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  return (
    <>
      <HomeHero />
      <TrustStrip />
      <WhyProdet />
      <HomeCategories />
      <FeaturedProducts />
      <HowItWorks />
      <TrustedClients />
      <ContactMap />
      <FinalCTA />
    </>
  );
}
