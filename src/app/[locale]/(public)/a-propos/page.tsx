import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { siteContent } from '@/data/site-content';
import { isLocale } from '@/i18n/routing';
import { AboutPage } from '@/components/about/about-page';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'À propos',
    description: siteContent.about.intro,
  };
}

export default async function AboutRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  return <AboutPage />;
}
