'use client';

import Image from 'next/image';
import { ArrowRight, Check, FileText, Factory, Shield, Truck, ChevronRight, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ds';
import { ProductMarquee } from '@/components/home/product-marquee';
import { ClientWall } from '@/components/home/client-wall';
import { SECTOR_ICON } from '@/components/site/sector-icons';
import { WhatsappIcon } from '@/components/site/whatsapp-icon';
import { useQuoteDrawer } from '@/components/site/quote-drawer';
import type { Product } from '@/types/product';
import type { SectorId } from '@/types/sector';
import type { FamilleId } from '@/data/familles';

type SectorLink = { id: SectorId; label: string; image: string };
type FamilleCard = { id: FamilleId; image: string; count: number };

const TRUST = [
  { key: 'local', icon: Factory },
  { key: 'delivery', icon: Truck },
  { key: 'advice', icon: Shield },
  { key: 'quote', icon: FileText },
] as const;

export function HomePage({
  showcase,
  sectors,
  familles,
}: {
  showcase: Product[];
  sectors: SectorLink[];
  familles: FamilleCard[];
}) {
  const t = useTranslations('home');
  const tf = useTranslations('familles');
  const router = useRouter();
  const { open: openQuote } = useQuoteDrawer();

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__inner">
          <div className="hero__text">
            <span className="hero__eyebrow">
              <Sparkles size={14} /> {t('hero.eyebrow')}
            </span>
            <h1 className="hero__title">{t('hero.title')}</h1>
            <p className="hero__sub">{t('hero.sub')}</p>
            <div className="hero__cta">
              <Button variant="primary" size="lg" onClick={openQuote} iconRight={<ArrowRight size={18} />}>
                {t('hero.ctaQuote')}
              </Button>
              <Button variant="dark" size="lg" onClick={() => router.push('/catalogue')}>
                {t('hero.ctaCatalogue')}
              </Button>
            </div>
            <div className="hero__meta">
              <span>
                <b>160+</b> {t('hero.metaReferences')}
              </span>
              <span className="hero__dot" />
              <span>
                <b>4</b> {t('hero.metaServices')}
              </span>
              <span className="hero__dot" />
              <span>
                <b>20</b> {t('hero.metaExperience')}
              </span>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__packshot">
              <span className="hero__made">
                <Check size={13} /> {t('hero.madeBadge')}
              </span>
              {/* LCP element — priority + optimized AVIF/WebP at display size (kit CSS sizes it to 320px). */}
              <Image
                src="/images/products/sirafan.png"
                alt="SIRAFAN"
                width={340}
                height={320}
                priority
                sizes="340px"
                style={{ height: '320px', width: 'auto' }}
              />
            </div>
            <div className="hero__visual-card">
              <strong>{t('hero.packTitle')}</strong>
              <span>{t('hero.packSub')}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="trust section-wrap">
        {TRUST.map(({ key, icon: Icon }) => (
          <div className="trust__item" key={key}>
            <span className="trust__icon">
              <Icon size={20} />
            </span>
            <div>
              <div className="trust__title">{t(`trust.${key}.title`)}</div>
              <div className="trust__body">{t(`trust.${key}.body`)}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="section-wrap home-familles">
        <div className="section-head">
          <span className="eyebrow">{tf('home.eyebrow')}</span>
          <h2 className="section-title">{tf('home.title')}</h2>
          <p className="section-lead">{tf('home.lead')}</p>
        </div>
        <div className="famille-grid famille-grid--product">
          {familles.map((famille) => (
            <button
              className="famille-card famille-card--product"
              key={famille.id}
              onClick={() => router.push(`/produits/${famille.id}`)}
            >
              <span className="famille-card__media">
                {famille.image ? (
                  <Image
                    src={famille.image}
                    alt=""
                    fill
                    sizes="(max-width: 700px) 45vw, 220px"
                    style={{ objectFit: 'contain' }}
                  />
                ) : (
                  <span className="famille-card__placeholder" aria-hidden>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/logo/prodet-logo.svg" alt="" />
                  </span>
                )}
              </span>
              <span className="famille-card__body">
                <span className="famille-card__label">{tf(`items.${famille.id}.label`)}</span>
                <span className="famille-card__tagline">{tf(`items.${famille.id}.tagline`)}</span>
                {famille.count > 0 ? (
                  <span className="famille-card__cta">
                    {tf('page.productsCount', { count: famille.count })}
                    <ChevronRight size={15} className="famille-card__arrow" />
                  </span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="section-wrap home-sectors">
        <div className="section-head">
          <span className="eyebrow">{t('sectors.eyebrow')}</span>
          <h2 className="section-title">{t('sectors.title')}</h2>
          <p className="section-lead">{t('sectors.lead')}</p>
        </div>
        <div className="sector-tile-grid">
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
              </button>
            );
          })}
        </div>
      </section>

      <section className="section-wrap">
        <div className="section-head section-head--row">
          <div>
            <span className="eyebrow">{t('featured.eyebrow')}</span>
            <h2 className="section-title">{t('featured.title')}</h2>
          </div>
          <Button variant="outline" onClick={() => router.push('/catalogue')} iconRight={<ArrowRight size={16} />}>
            {t('featured.cta')}
          </Button>
        </div>
        <ProductMarquee products={showcase} />
      </section>

      <section className="section-wrap clients">
        <div className="clients__head">
          <span className="eyebrow">{t('clients.eyebrow')}</span>
          <h2 className="clients__title">{t('clients.title')}</h2>
        </div>
        <ClientWall />
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
            <Button
              variant="ghost"
              size="lg"
              className="cta-band__ghost"
              onClick={() => router.push('/contact')}
              iconLeft={<WhatsappIcon size={18} />}
            >
              {t('cta.contact')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
