'use client';

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

      <div className="section-wrap sector-tile-grid sectors-index-grid">
        {sectors.map((sector) => {
          const Icon = SECTOR_ICON[sector.id];
          return (
            <button
              className="sector-tile"
              key={sector.id}
              onClick={() => router.push(`/secteurs/${sector.id}`)}
            >
              <span className="sector-tile__media">
                <Icon strokeWidth={1.4} />
              </span>
              <span className="sector-tile__label">{sector.label}</span>
              <span className="sector-tile__hint">{t(`cards.${sector.id}`)}</span>
            </button>
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
