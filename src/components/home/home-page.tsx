'use client';

import Image from 'next/image';
import { ArrowRight, Check, FileText, Factory, Shield, Truck, ChevronRight, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ds';
import { CatalogueTile } from '@/components/site/catalogue-tile';
import { SECTOR_ICON } from '@/components/site/sector-icons';
import { WhatsappIcon } from '@/components/site/whatsapp-icon';
import { useQuoteDrawer } from '@/components/site/quote-drawer';
import { useQuoteSelection } from '@/lib/quote-cart-context';
import type { Product } from '@/types/product';
import type { SectorId } from '@/types/sector';

type SectorLink = { id: SectorId; label: string };

const TRUST = [
  { key: 'local', icon: Factory },
  { key: 'delivery', icon: Truck },
  { key: 'advice', icon: Shield },
  { key: 'quote', icon: FileText },
] as const;

export function HomePage({ featured, sectors }: { featured: Product[]; sectors: SectorLink[] }) {
  const t = useTranslations('home');
  const router = useRouter();
  const { open: openQuote } = useQuoteDrawer();
  const { getQuantity, setProductQuantity } = useQuoteSelection();

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

      <section className="section-wrap home-sectors">
        <div className="section-head">
          <span className="eyebrow">{t('sectors.eyebrow')}</span>
          <h2 className="section-title">{t('sectors.title')}</h2>
          <p className="section-lead">{t('sectors.lead')}</p>
        </div>
        <div className="sector-grid">
          {sectors.map((sector) => {
            const Icon = SECTOR_ICON[sector.id];
            return (
              <button className="sector-card" key={sector.id} onClick={() => router.push('/secteurs')}>
                <span className="sector-card__icon">
                  <Icon size={22} />
                </span>
                <span className="sector-card__label">{sector.label}</span>
                <ChevronRight size={18} className="sector-card__arrow" />
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
        <div className="featured-grid">
          {featured.map((product) => (
            <CatalogueTile
              key={product.slug}
              product={product}
              quantity={getQuantity(product.id)}
              onQuantityChange={setProductQuantity}
            />
          ))}
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
