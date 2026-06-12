'use client';

import { useState, type ReactNode } from 'react';
import {
  Download,
  FileText,
  Home,
  LifeBuoy,
  PackageCheck,
  Phone,
  Plus,
  Repeat,
  Search,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';

export type PortalShellAccount = {
  name: string;
  contact: string;
  initials: string;
};

const NAV: { href: string; key: string; icon: LucideIcon; exact?: boolean }[] = [
  { href: '/client', key: 'dashboard', icon: Home, exact: true },
  { href: '/client/commandes', key: 'orders', icon: PackageCheck },
  { href: '/client/commander', key: 'reorder', icon: Repeat },
  { href: '/client/devis', key: 'quotes', icon: FileText },
  { href: '/client/livraisons', key: 'deliveries', icon: Truck },
  { href: '/client/factures', key: 'invoices', icon: Download },
  { href: '/client/support', key: 'support', icon: LifeBuoy },
];

/** Mobile bottom bar — every section reachable. Flex slots, so it scales. */
const MOBILE_NAV: { href: string; key: string; icon: LucideIcon; exact?: boolean }[] = [
  { href: '/client', key: 'dashboard', icon: Home, exact: true },
  { href: '/client/commander', key: 'reorder', icon: Repeat },
  { href: '/client/commandes', key: 'orders', icon: PackageCheck },
  { href: '/client/devis', key: 'quotes', icon: FileText },
  { href: '/client/livraisons', key: 'deliveries', icon: Truck },
  { href: '/client/factures', key: 'invoices', icon: Download },
  { href: '/client/support', key: 'support', icon: LifeBuoy },
];

const TITLES: { match: (p: string) => boolean; key: string }[] = [
  { match: (p) => p === '/client', key: 'dashboard' },
  { match: (p) => p.startsWith('/client/commandes'), key: 'orders' },
  { match: (p) => p.startsWith('/client/commander'), key: 'reorder' },
  { match: (p) => p.startsWith('/client/devis'), key: 'quotes' },
  { match: (p) => p.startsWith('/client/livraisons'), key: 'deliveries' },
  { match: (p) => p.startsWith('/client/factures'), key: 'invoices' },
  { match: (p) => p.startsWith('/client/support'), key: 'support' },
  { match: (p) => p.startsWith('/client/documents'), key: 'documents' },
  { match: (p) => p.startsWith('/client/compte'), key: 'account' },
];

export function PortalShell({ account, children }: { account: PortalShellAccount; children: ReactNode }) {
  const t = useTranslations('portal');
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const meta = TITLES.find((x) => x.match(pathname));
  const title = meta ? t(`titles.${meta.key}`) : t('nav.tag');
  const subtitle = meta ? t(`titles.${meta.key}Sub`) : undefined;

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const q = search.trim();
    if (!q) return;
    router.push(`/client/commander?q=${encodeURIComponent(q)}`);
    setSearch('');
  }

  return (
    <div className="portal">
      <aside className="portal__rail" aria-label={t('nav.tag')}>
        <div className="portal__rail-logo">
          <span className="portal__logo-chip">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo/prodet-logo-white.svg" alt="Prodet" />
          </span>
          <span className="portal__rail-tag">{t('nav.tag')}</span>
        </div>

        <div style={{ padding: '4px 0 6px' }}>
          <Link href="/client/commander" className="pds-btn pds-btn--primary pds-btn--sm pds-btn--block">
            <Plus size={15} />
            <span>{t('nav.newOrder')}</span>
          </Link>
        </div>

        <nav className="portal__nav">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`portal__nav-item${isActive(item.href, item.exact) ? ' is-active' : ''}`}
              >
                <Icon size={18} />
                <span>{t(`nav.${item.key}`)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="portal__rail-help">
          <Phone size={16} />
          <div>
            <strong>{t('nav.help')}</strong>
            <span>71 758 468</span>
          </div>
        </div>

        <Link href="/client/compte" className="portal__account">
          <span className="portal__avatar">{account.initials}</span>
          <span className="portal__account-info">
            <strong>{account.name}</strong>
            <span>{account.contact}</span>
          </span>
        </Link>
      </aside>

      <div className="portal__main">
        <header className="portal__topbar">
          <div>
            <h1 className="portal__title">{title}</h1>
            {subtitle ? <p className="portal__subtitle">{subtitle}</p> : null}
          </div>
          <div className="portal__topbar-actions">
            <form className="portal__search" onSubmit={submitSearch}>
              <Search size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('nav.search')}
                aria-label={t('nav.search')}
              />
            </form>
            <Link href="/client/compte" className="portal__avatar portal__avatar--topbar" aria-label={t('titles.account')}>
              {account.initials}
            </Link>
          </div>
        </header>
        <div className="portal__content" key={pathname}>
          {children}
        </div>
      </div>

      <nav className="portal-bottomnav" aria-label={t('nav.tag')}>
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`portal-bottomnav__item${active ? ' is-active' : ''}`}
            >
              <Icon size={19} />
              <span>{t(`navShort.${item.key}`)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
