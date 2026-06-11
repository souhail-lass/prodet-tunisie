import { Factory, Mail, MapPin, Phone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { companyInfo } from '@/data/company';

export async function SiteFooter() {
  const t = await getTranslations('footer');
  const tc = await getTranslations('common');

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <div className="site-footer__logo-chip">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo/prodet-logo-white.svg" alt="Prodet Tunisie" />
          </div>
          <p className="site-footer__tag">{companyInfo.footerTagline}</p>
          <span className="site-footer__made">
            <Factory size={15} /> Fabriqué en Tunisie
          </span>
        </div>

        <div className="site-footer__col">
          <h4>{t('catalog')}</h4>
          <Link href="/catalogue">Restauration &amp; cuisine</Link>
          <Link href="/catalogue">Buanderie</Link>
          <Link href="/catalogue">Étage / housekeeping</Link>
          <Link href="/catalogue">Articles ménagers</Link>
        </div>

        <div className="site-footer__col">
          <h4>{t('company')}</h4>
          <Link href="/a-propos">{tc('navigation.about')}</Link>
          <Link href="/secteurs">{tc('navigation.sectors')}</Link>
          <Link href="/contact">{tc('navigation.contact')}</Link>
          <Link href="/catalogue">Demander un devis</Link>
        </div>

        <div className="site-footer__col">
          <h4>{t('contact')}</h4>
          <a className="site-footer__contact" href={companyInfo.phoneHref}>
            <Phone size={15} /> {companyInfo.phoneDisplay}
          </a>
          <a className="site-footer__contact" href={companyInfo.emailHref}>
            <Mail size={15} /> {companyInfo.email}
          </a>
          <span className="site-footer__contact">
            <MapPin size={15} /> {t('address')}
          </span>
        </div>
      </div>

      <div className="site-footer__bar">
        <span>{t('rights', { year: 2026 })}</span>
        <div className="site-footer__legal">
          <Link href="/mentions-legales">{t('legalLinks.mentions')}</Link>
          <Link href="/confidentialite">{t('legalLinks.privacy')}</Link>
        </div>
      </div>
    </footer>
  );
}
