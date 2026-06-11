'use client';

import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { portalNavItems, type PortalNavItem } from './sidebar-nav';

function isActive(pathname: string, href: PortalNavItem['href']): boolean {
  if (href === '/client') return pathname === '/client';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Mobile bottom tab bar. Sticky to the viewport, sits below all content with
 * an `env(safe-area-inset-bottom)` cushion so iPad / notched phones don't
 * cover the labels. Use it as the canonical primary navigation pattern on
 * any viewport < lg.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation espace client (mobile)"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/96 backdrop-blur lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex h-16 max-w-[640px] items-stretch">
        {portalNavItems.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
                  active ? 'text-prodet-blue' : 'text-muted-foreground hover:text-prodet-text',
                )}
              >
                <span aria-hidden>{item.icon}</span>
                <span className="leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
