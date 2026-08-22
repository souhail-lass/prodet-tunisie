'use client';

import Image from 'next/image';
import { ArrowRight, Check, FileText, Factory, Shield, Truck, ChevronRight, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ds';
import { ProductMarquee } from '@/components/home/product-marquee';
import { ClientWall } from '@/components/home/client-wall';
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

/** Interim hero "range" — a Prodet formula + real consommables we source.
 * Says the positioning visually: fabricant + fournisseur. Swap for one shot photo later. */
const HERO_SUPPLIED = [
  { src: '/images/products/resell/sac-poubelle-mm-noir.jpg', label: 'Sacs poubelle' },
  { src: '/images/products/resell/lavette-microfibre.png', label: 'Lavettes microfibre' },
  { src: '/images/products/resell/gant-latex.jpg', label: 'Gants' },
  { src: '/images/products/resell/papier-hygienique-lilas-48.jpg', label: 'Papier hygiénique' },
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
              <Button variant="primary" size="xl" onClick={openQuote} iconRight={<ArrowRight size={18} />}>
                {t('hero.ctaQuote')}
              </Button>
              <Button variant="dark" size="xl" onClick={() => router.push('/produits/produits-nettoyage')}>
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
            <div className="hero__range">
              <div className="hero__range-made">
                <span className="hero__made">
                  <Check size={13} /> {t('hero.madeBadge')}
                </span>
                {/* LCP element — the Prodet formula (what we fabricate). */}
                <Image
                  src="/images/products/sirafan.png"
                  alt="Désinfectant fabriqué par Prodet"
                  width={240}
                  height={220}
                  priority
                  sizes="240px"
                  style={{ height: '220px', width: 'auto' }}
                />
              </div>
              <div className="hero__range-supplied">
                <span className="hero__range-label">{t('hero.suppliedLabel')}</span>
                <div className="hero__range-items">
                  {HERO_SUPPLIED.map((item) => (
                    <span className="hero__range-item" key={item.src} title={item.label}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.src} alt={item.label} loading="eager" />
                    </span>
                  ))}
                </div>
              </div>
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
            <Link
              key={famille.id}
              href={`/produits/${famille.id}`}
              className="famille-card famille-card--product"
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
            </Link>
          ))}
        </div>
      </section>

      <section className="home-band home-band--white">
        <div className="section-wrap">
          <div className="section-head">
            <span className="eyebrow">{t('sectors.eyebrow')}</span>
            <h2 className="section-title">{t('sectors.title')}</h2>
            <p className="section-lead">{t('sectors.lead')}</p>
          </div>
          <div className="home-sector-grid">
            {sectors.map((sector) => (
              <Link
                key={sector.id}
                href={`/secteurs/${sector.id}`}
                className="home-sector"
                aria-label={sector.label}
              >
                {sector.image ? (
                  <Image
                    src={sector.image}
                    alt=""
                    fill
                    sizes="(max-width: 620px) 100vw, (max-width: 1080px) 50vw, 33vw"
                  />
                ) : null}
                <span className="home-sector__scrim" aria-hidden />
                <span className="home-sector__name">
                  {sector.label}
                  <ChevronRight size={18} aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrap">
        <div className="section-head section-head--row">
          <div>
            <span className="eyebrow">{t('featured.eyebrow')}</span>
            <h2 className="section-title">{t('featured.title')}</h2>
          </div>
          <Button variant="outline" onClick={() => router.push('/produits/produits-nettoyage')} iconRight={<ArrowRight size={16} />}>
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
