'use client';

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ds';
import { useQuoteDrawer } from '@/components/site/quote-drawer';
import type { SectorId } from '@/types/sector';

type SectorCard = {
  id: SectorId;
  label: string;
  image: string;
  supplies: string[];
};

export function SectorsPage({ sectors }: { sectors: SectorCard[] }) {
  const t = useTranslations('sectors');
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

      <section className="section-wrap sectors-showcase">
        <div className="sectors-grid">
          {sectors.map((sector, index) => {
            const feature = index === 0;
            return (
              <Link
                key={sector.id}
                href={`/secteurs/${sector.id}`}
                className={`sector-cover${feature ? ' sector-cover--feature' : ''}`}
              >
                <span className="sector-cover__photo">
                  <Image
                    src={sector.image}
                    alt=""
                    fill
                    sizes={
                      feature
                        ? '(max-width: 760px) 100vw, 46vw'
                        : '(max-width: 760px) 100vw, (max-width: 1080px) 50vw, 33vw'
                    }
                  />
                  <span className="sector-cover__scrim" aria-hidden />
                  <span className="sector-cover__name">{sector.label}</span>
                </span>
                <span className="sector-cover__body">
                  <span className="sector-cover__hint">{t(`cards.${sector.id}`)}</span>
                  {sector.supplies.length > 0 ? (
                    <span className="sector-cover__supplies">
                      {sector.supplies.map((supply) => (
                        <span className="sector-cover__chip" key={supply}>
                          {supply}
                        </span>
                      ))}
                    </span>
                  ) : null}
                  <span className="sector-cover__cta">
                    {t('index.viewSector')}
                    <ArrowRight size={15} aria-hidden />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

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
