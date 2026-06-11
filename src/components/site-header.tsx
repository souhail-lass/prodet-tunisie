'use client';

import { FileText, Menu, UserRound, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState, useTransition } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);

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

  // Close the mobile menu on navigation, and lock body scroll while it is open.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <>
      <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-header__logo" aria-label="Prodet Tunisie">
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

        {/* Mobile: compact quote button + hamburger */}
        <div className="site-header__mobile">
          <button
            type="button"
            className="site-header__quote-icon"
            onClick={openQuote}
            aria-label={t('navigation.quote')}
          >
            <FileText size={19} />
            {totalProducts > 0 ? <span className="site-header__badge">{totalProducts}</span> : null}
          </button>
          <button
            type="button"
            className="site-header__burger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      </header>

      {menuOpen ? (
        <div className="site-menu" role="dialog" aria-modal="true">
          <nav className="site-menu__nav">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`site-menu__link${isActive(item.href) ? ' is-active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="site-menu__actions">
            <Link
              href="/connexion-client"
              className="pds-btn pds-btn--outline pds-btn--md pds-btn--block"
            >
              <UserRound size={16} />
              <span>{t('navigation.clientSpace')}</span>
            </Link>
            <button
              type="button"
              className="pds-btn pds-btn--primary pds-btn--md pds-btn--block"
              onClick={() => {
                setMenuOpen(false);
                openQuote();
              }}
            >
              <FileText size={16} />
              <span>
                {t('navigation.quote')}
                {totalProducts > 0 ? ` · ${totalProducts}` : ''}
              </span>
            </button>
          </div>
          <div className="site-menu__lang">
            <LangSwitch />
          </div>
        </div>
      ) : null}
    </>
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
