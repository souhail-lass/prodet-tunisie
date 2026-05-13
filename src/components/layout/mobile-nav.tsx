'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Logo } from '@/components/brand/logo';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const t = useTranslations('common');
  const pathname = usePathname();

  const nav = [
    { href: '/catalogue', label: t('navigation.catalog') },
    { href: '/secteurs', label: t('navigation.sectors') },
    { href: '/a-propos', label: t('navigation.about') },
    { href: '/contact', label: t('navigation.contact') },
  ] as const;

  return (
    <div className={cn('fixed inset-0 z-[65] lg:hidden', open ? 'pointer-events-auto' : 'pointer-events-none')}>
      <div
        className={cn('absolute inset-0 bg-slate-950/52 transition-opacity', open ? 'opacity-100' : 'opacity-0')}
        aria-hidden
        onClick={onClose}
      />
      <aside
        className={cn(
          'absolute end-0 top-0 flex h-full w-[88vw] max-w-sm flex-col bg-white shadow-2xl transition-transform',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Logo size="md" />
          <button
            type="button"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            onClick={onClose}
            aria-label="Fermer la navigation"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-6 px-5 py-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Navigation
            </span>
            <LocaleSwitcher />
          </div>
          <nav aria-label="Navigation mobile">
            <ul className="space-y-2">
              {nav.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'block cursor-pointer rounded-2xl border px-4 py-3 text-base font-medium transition-all duration-150 ease-out',
                        isActive
                          ? 'border-primary/45 bg-prodet-blue/5 text-primary'
                          : 'border-border text-prodet-text hover:border-primary/30 hover:text-primary',
                      )}
                      onClick={onClose}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <Link
            href="/devis"
            onClick={onClose}
            className="mt-auto inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#1650A0]"
          >
            {t('actions.requestQuote')}
          </Link>
        </div>
      </aside>
    </div>
  );
}
