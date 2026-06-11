'use client';

import type { ReactNode } from 'react';
import { Boxes, Inbox, LifeBuoy, LogOut, ShieldCheck, Users, type LucideIcon } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';

export type AdminShellAccount = { name: string; email: string; initials: string };

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/admin/produits', label: 'Catalogue produits', icon: Boxes },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/demandes-portail', label: 'Demandes portail', icon: Inbox },
  { href: '/admin/support', label: 'Support', icon: LifeBuoy },
];

const TITLES: { match: (p: string) => boolean; title: string; subtitle: string }[] = [
  { match: (p) => p.startsWith('/admin/catalogue-swiver'), title: 'Catalogue produits', subtitle: 'Gérez les produits synchronisés depuis Swiver — masquez ce que vous ne vendez pas.' },
  { match: (p) => p.startsWith('/admin/clients'), title: 'Clients', subtitle: 'Vos clients du portail, leurs connexions et leurs accès.' },
  { match: (p) => p.startsWith('/admin/demandes-portail'), title: 'Demandes portail', subtitle: 'Demandes envoyées depuis l’espace client.' },
  { match: (p) => p.startsWith('/admin/support'), title: 'Support', subtitle: 'Les tickets de vos clients — répondez en direct.' },
];

export function AdminShell({ account, children }: { account: AdminShellAccount; children: ReactNode }) {
  const pathname = usePathname();
  const meta = TITLES.find((t) => t.match(pathname));

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="portal">
      <aside className="portal__rail" aria-label="Administration">
        <div className="portal__rail-logo">
          <span className="portal__logo-chip">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo/prodet-logo-white.svg" alt="Prodet" />
          </span>
          <span className="portal__rail-tag">Administration</span>
        </div>

        <nav className="portal__nav" style={{ marginTop: 14 }}>
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`portal__nav-item${isActive(item.href) ? ' is-active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="portal__rail-help">
          <ShieldCheck size={16} />
          <div>
            <strong>Console admin</strong>
            <span>AI propose · Humain valide</span>
          </div>
        </div>

        <div className="portal__account" style={{ cursor: 'default' }}>
          <span className="portal__avatar">{account.initials}</span>
          <span className="portal__account-info">
            <strong>{account.name}</strong>
            <span>{account.email}</span>
          </span>
        </div>
      </aside>

      <div className="portal__main">
        <header className="portal__topbar">
          <div>
            <h1 className="portal__title">{meta?.title ?? 'Administration'}</h1>
            {meta ? <p className="portal__subtitle">{meta.subtitle}</p> : null}
          </div>
          <div className="portal__topbar-actions">
            {/* /auth/signout is a route handler, not a page — plain anchor is correct. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/auth/signout" className="portal__icon-btn" aria-label="Se déconnecter" title="Se déconnecter">
              <LogOut size={18} />
            </a>
          </div>
        </header>
        <div className="portal__content">{children}</div>
      </div>
    </div>
  );
}
