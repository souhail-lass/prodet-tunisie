'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ds';
import { SECTOR_ICON } from '@/components/site/sector-icons';
import { useQuoteDrawer } from '@/components/site/quote-drawer';
import type { SectorId } from '@/types/sector';

type SectorLink = { id: SectorId; label: string };

export function SectorsPage({ sectors }: { sectors: SectorLink[] }) {
  const t = useTranslations('sectors');
  const router = useRouter();
  const { open: openQuote } = useQuoteDrawer();

  return (
    <div className="sectors-page">
      <div className="sectors-page__hero">
        <div className="section-wrap">
          <span className="eyebrow eyebrow--ondark">{t('hero.eyebrow')}</span>
          <h1 className="sectors-page__title">{t('hero.title')}</h1>
          <p className="sectors-page__lead">{t('hero.lead')}</p>
        </div>
      </div>

      <div className="section-wrap sectors-page__grid">
        {sectors.map((sector) => {
          const Icon = SECTOR_ICON[sector.id];
          return (
            <article className="sector-block" key={sector.id}>
              <span className="sector-block__icon">
                <Icon size={24} />
              </span>
              <h3>{sector.label}</h3>
              <p>{t(`cards.${sector.id}`)}</p>
              <button className="sector-block__link" onClick={() => router.push('/catalogue')}>
                {t('viewProducts')} <ArrowRight size={16} />
              </button>
            </article>
          );
        })}
      </div>

      <section className="cta-band">
        <div className="cta-band__inner">
          <div>
            <h2>{t('cta.title')}</h2>
            <p>{t('cta.body')}</p>
          </div>
          <div className="cta-band__actions">
            <Button variant="primary" size="lg" onClick={openQuote}>
              {t('cta.quote')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
