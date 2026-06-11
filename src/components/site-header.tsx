'use client';

import { FileText, UserRound } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { useParams } from 'next/navigation';
import { Link, usePathname, useRouter, locales, type Locale } from '@/i18n/routing';
import { Button } from '@/components/ds';
import { useQuoteSelection } from '@/lib/quote-cart-context';
import { useQuoteDrawer } from '@/components/site/quote-drawer';

const LANG_LABEL: Record<Locale, string> = { fr: 'FR', ar: 'AR', en: 'EN' };

export function SiteHeader() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const { totalProducts } = useQuoteSelection();
  const { open: openQuote } = useQuoteDrawer();

  const nav = [
    { href: '/', label: t('navigation.home') },
    { href: '/catalogue', label: t('navigation.catalog') },
    { href: '/secteurs', label: t('navigation.sectors') },
    { href: '/a-propos', label: t('navigation.about') },
    { href: '/contact', label: t('navigation.contact') },
  ] as const;

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-header__logo" aria-label="Prodet Tunisie">
          {/* Scalable SVG wordmark (53 KB, sharp at any DPI) — kit sizes it to 30px. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo/prodet-logo.svg" alt="Prodet Tunisie" />
        </Link>

        <nav className="site-header__nav" aria-label={t('navigation.home')}>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`site-nav-link${isActive(item.href) ? ' is-active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header__actions">
          <LangSwitch />
          <Link href="/connexion-client" className="pds-btn pds-btn--outline pds-btn--sm">
            <UserRound size={16} />
            <span>{t('navigation.clientSpace')}</span>
          </Link>
          <Button variant="primary" size="sm" onClick={openQuote} iconLeft={<FileText size={16} />}>
            {t('navigation.quote')}
            {totalProducts > 0 ? ` · ${totalProducts}` : ''}
          </Button>
        </div>
      </div>
    </header>
  );
}

function LangSwitch() {
  const current = useLocale() as Locale;
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  function switchTo(locale: Locale) {
    if (locale === current) return;
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- typed routes can't validate a dynamic pathname
        { pathname, params },
        { locale },
      );
    });
  }

  return (
    <div className="lang-switch">
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          className={`lang-switch__opt${locale === current ? ' is-active' : ''}`}
          onClick={() => switchTo(locale)}
        >
          {LANG_LABEL[locale]}
        </button>
      ))}
    </div>
  );
}
