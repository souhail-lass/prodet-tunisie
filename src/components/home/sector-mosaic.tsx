import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import type { Sector } from '@/data/types';
import { getProductBySlug, localizedSectorName } from '@/data/queries';
import { LabelText } from '@/components/typography/label-text';
import type { HomeContent } from './content';

const tileLabels = {
  fr: {
    featured: 'Secteur prioritaire',
    standard: 'Usage professionnel',
  },
  en: {
    featured: 'Priority sector',
    standard: 'Professional use',
  },
  ar: {
    featured: 'قطاع أساسي',
    standard: 'استعمال مهني',
  },
} as const;

export function SectorMosaic({
  locale,
  sectors,
  content,
}: {
  locale: Locale;
  sectors: readonly Sector[];
  content: HomeContent;
}) {
  const t = useTranslations('sectors.index');
  const copy = tileLabels[locale];

  return (
    <section className="catalog-divider border-border/80 border-b">
      <div className="section-shell py-14">
        <header className="max-w-3xl">
          <LabelText>{content.sectors.eyebrow}</LabelText>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">{content.sectors.title}</h2>
          <p className="text-muted-foreground mt-4">{content.sectors.subtitle}</p>
        </header>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
          {sectors.map((sector, index) => {
            const featured = index < 2;
            return (
              <li
                key={sector.key}
                className={featured ? 'lg:col-span-6' : 'lg:col-span-4'}
              >
                <Link
                  href={`/secteurs/${sector.slug}`}
                  className={
                    featured
                      ? 'surface-panel-strong block h-full overflow-hidden p-6'
                      : 'surface-panel block h-full p-6 transition-transform duration-200 hover:-translate-y-0.5'
                  }
                >
                  <p
                    className={
                      featured
                        ? 'product-code text-white/72'
                        : 'product-code text-primary'
                    }
                  >
                    {featured ? copy.featured : copy.standard}
                  </p>
                  <h3 className="font-display mt-4 text-2xl font-semibold leading-tight">
                    {localizedSectorName(sector, locale)}
                  </h3>
                  <p className={featured ? 'mt-3 text-sm text-white/84' : 'text-muted-foreground mt-3 text-sm'}>
                    {sector.shortDescByLocale[locale]}
                  </p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {sector.recommendedProductSlugs.slice(0, 3).map((slug) => (
                      <li
                        key={slug}
                        className={
                          featured
                            ? 'rounded-full border border-white/22 bg-white/10 px-3 py-1 text-xs text-white/84'
                            : 'rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground'
                        }
                      >
                        {getProductBySlug(slug)?.code ?? slug.toUpperCase().replace(/-/gu, ' ')}
                      </li>
                    ))}
                  </ul>
                  <div
                    className={
                      featured
                        ? 'mt-6 inline-flex items-center gap-2 text-sm font-medium text-white'
                        : 'text-primary mt-6 inline-flex items-center gap-2 text-sm font-medium'
                    }
                  >
                    {t('viewSector')}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
