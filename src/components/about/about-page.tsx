'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ds';
import { useQuoteDrawer } from '@/components/site/quote-drawer';

const STATS = ['references', 'services', 'experience', 'delay'] as const;

export function AboutPage() {
  const t = useTranslations('about');
  const { open: openQuote } = useQuoteDrawer();

  return (
    <div className="about">
      <div className="about__hero">
        <div className="section-wrap">
          <span className="eyebrow eyebrow--ondark">{t('hero.eyebrow')}</span>
          <h1 className="about__title">{t('hero.title')}</h1>
          <p className="about__lead">{t('hero.lead')}</p>
        </div>
      </div>

      <div className="section-wrap about__body">
        <div>
          <p>{t('body.p1')}</p>
          <p>{t('body.p2')}</p>
          <p>{t('body.p3')}</p>
          <div style={{ marginTop: '24px' }}>
            <Button variant="primary" size="lg" onClick={openQuote} iconRight={<ArrowRight size={18} />}>
              {t('cta')}
            </Button>
          </div>
        </div>
        <div className="about__stats">
          {STATS.map((key) => (
            <div className="about__stat" key={key}>
              <b>{t(`stats.${key}.value`)}</b>
              <span>{t(`stats.${key}.label`)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
