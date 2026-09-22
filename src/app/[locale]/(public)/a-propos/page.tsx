import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { siteContent } from '@/data/site-content';
import { isLocale } from '@/i18n/routing';
import { AboutPage } from '@/components/about/about-page';
import { pageAlternates } from '@/lib/seo/alternates';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (locale === 'en') {
    return {
      title: 'About Prodet',
      description:
        "Prodet is a Tunisian manufacturer and distributor of professional cleaning and hygiene products, based in L'Aouina, Tunis.",
      alternates: pageAlternates(locale, '/a-propos'),
    };
  }
  return {
    title: 'À propos',
    description: siteContent.about.intro,
    alternates: pageAlternates(locale, '/a-propos'),
  };
}

export default async function AboutRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  return <AboutPage />;
}
