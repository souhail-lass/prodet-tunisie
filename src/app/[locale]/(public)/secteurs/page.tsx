import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { siteContent } from '@/data/site-content';
import { isLocale } from '@/i18n/routing';
import { HorizontalSectorCard } from '@/components/secteurs/HorizontalSectorCard';
import { SectorsCTA } from '@/components/secteurs/SectorsCTA';
import { sectorPageCards } from '@/components/secteurs/sector-page-data';

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

  return (
    <>
      <section className="bg-[#0D3B73] py-14">
        <div className="mx-auto max-w-[1200px] px-6 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#33B5F6]">
            SECTEURS SERVIS
          </p>
          <h1 className="mx-auto mt-3 max-w-[640px] text-[34px] font-bold leading-[1.15] text-white sm:text-[44px]">
            Choisissez votre secteur, trouvez les bons produits
          </h1>
          <p className="mx-auto mt-4 max-w-[500px] text-[15px] leading-[1.7] text-[rgba(255,255,255,0.65)]">
            Une lecture rapide par métier: besoins clés, usages fréquents, accès direct au
            catalogue ou au devis.
          </p>
        </div>
      </section>

      <section className="bg-[#F8F7F4] py-16">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {sectorPageCards.map((sector) => (
              <HorizontalSectorCard key={sector.id} sector={sector} />
            ))}
          </div>
        </div>
      </section>

      <SectorsCTA />
    </>
  );
}
