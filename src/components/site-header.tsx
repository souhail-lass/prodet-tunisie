'use client';

import { ClipboardList, Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import { usePathname } from '@/i18n/routing';
import { Logo } from '@/components/brand/logo';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Button } from '@/components/ui/button';
import { useQuoteSelection } from '@/lib/quote-cart-context';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const t = useTranslations('common');
  const tHeader = useTranslations('header');
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isElevated, setIsElevated] = useState(false);

  const nav = [
    { href: '/catalogue', label: t('navigation.catalog') },
    { href: '/secteurs', label: t('navigation.sectors') },
    { href: '/a-propos', label: t('navigation.about') },
    { href: '/contact', label: t('navigation.contact') },
  ] as const;

  useEffect(() => {
    function handleScroll() {
      setIsElevated(window.scrollY > 60);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border/90 bg-white/96 backdrop-blur transition-[box-shadow] duration-200 ease-out',
          isElevated ? 'shadow-[0_12px_30px_-28px_rgba(11,61,115,0.45)]' : 'shadow-none',
        )}
      >
        <a
          href="#main-content"
          className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:rounded-md focus:px-3 focus:py-2"
        >
          {tHeader('skipToContent')}
        </a>
        <div className="section-shell flex min-h-[80px] items-center gap-4">
          <Link
            href="/"
            className="flex shrink-0 cursor-pointer items-center leading-none"
            aria-label={t('site.name')}
          >
            <Logo size="md" />
          </Link>
          <nav
            aria-label={tHeader('primaryNavLabel')}
            className="mx-auto hidden flex-1 justify-center lg:flex"
          >
            <ul className="flex items-center gap-7 text-[15px] font-medium text-prodet-text">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'inline-flex h-[80px] cursor-pointer items-center border-b-2 text-[12px] font-semibold uppercase tracking-[0.16em] transition-[border-color,color] duration-150 ease-out',
                      pathname === item.href || pathname.startsWith(`${item.href}/`)
                        ? 'border-primary text-primary'
                        : 'border-transparent text-prodet-text hover:border-primary/40 hover:text-primary',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ms-auto hidden items-center gap-3 lg:flex">
            <LocaleSwitcher />
            <Button asChild className="cursor-pointer rounded-xl bg-primary px-5 text-[12px] font-semibold uppercase tracking-[0.14em]">
              <Link href="/devis">{t('actions.requestQuote')}</Link>
            </Button>
            <QuoteSelectionHeaderLink />
          </div>
          <div className="ms-auto flex items-center gap-3 lg:hidden">
            <LocaleSwitcher />
            <QuoteSelectionHeaderLink />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="cursor-pointer rounded-xl bg-white"
              aria-label="Ouvrir la navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden />
            </Button>
          </div>
        </div>
      </header>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

function QuoteSelectionHeaderLink() {
  const { totalProducts } = useQuoteSelection();

  return (
    <Link
      href="/devis"
      aria-label="Ouvrir la demande de devis"
      className="relative inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-prodet-text transition-colors hover:border-primary hover:text-primary lg:px-3"
    >
      <ClipboardList className="h-5 w-5" aria-hidden />
      <span className="hidden xl:inline">Devis</span>
      {totalProducts > 0 ? (
        <span className="absolute -right-1 -top-1 rounded-full bg-[#1B5FA7] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
          {totalProducts}
        </span>
      ) : null}
    </Link>
  );
}
