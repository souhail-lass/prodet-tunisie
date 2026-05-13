import type { Metadata } from 'next';
import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { siteContent } from '@/data/site-content';
import { isLocale } from '@/i18n/routing';
import { CataloguePageClient } from './_catalogue-page-client';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: siteContent.catalogue.title,
    description: siteContent.catalogue.subtitle,
  };
}

export default async function CataloguePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<CataloguePageFallback />}>
      <CataloguePageClient />
    </Suspense>
  );
}

function CataloguePageFallback() {
  return (
    <div className="min-h-screen bg-white md:grid md:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden min-h-screen bg-white md:block" />
      <section className="px-4 py-6 md:px-6 lg:px-8">
        <div className="h-10 w-44 rounded-lg bg-[#F8F7F4]" />
        <div className="mt-6 h-10 max-w-[980px] rounded-lg bg-[#F8F7F4]" />
        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-[284px] rounded-[12px] bg-[#F8F7F4]" />
          ))}
        </div>
      </section>
    </div>
  );
}
