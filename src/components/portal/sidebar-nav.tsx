'use client';

import type { ReactNode } from 'react';
import {
  FileText,
  FolderArchive,
  History,
  LayoutDashboard,
  PackageCheck,
} from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export type PortalNavItem = {
  label: string;
  href:
    | '/client'
    | '/client/nouvelle-demande'
    | '/client/historique'
    | '/client/produits-habituels'
    | '/client/documents';
  icon: ReactNode;
};

export const portalNavItems: readonly PortalNavItem[] = [
  {
    label: 'Accueil',
    href: '/client',
    icon: <LayoutDashboard className="h-4 w-4" aria-hidden />,
  },
  {
    label: 'Nouvelle demande',
    href: '/client/nouvelle-demande',
    icon: <FileText className="h-4 w-4" aria-hidden />,
  },
  {
    label: 'Historique',
    href: '/client/historique',
    icon: <History className="h-4 w-4" aria-hidden />,
  },
  {
    label: 'Habituels',
    href: '/client/produits-habituels',
    icon: <PackageCheck className="h-4 w-4" aria-hidden />,
  },
  {
    label: 'Documents',
    href: '/client/documents',
    icon: <FolderArchive className="h-4 w-4" aria-hidden />,
  },
] as const;

function isActive(pathname: string, href: PortalNavItem['href']): boolean {
  if (href === '/client') return pathname === '/client';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Vertical desktop sidebar nav. Active state is a 2px left brand accent +
 * tinted background — never a coloured icon-square or capitalised label.
 */
export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation espace client" className="flex flex-col gap-0.5">
      {portalNavItems.map((item) => {
        const active = isActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group relative flex h-9 items-center gap-3 rounded-sm px-3 text-[13px] font-medium transition-colors',
              active
                ? 'bg-prodet-mist text-prodet-text'
                : 'text-muted-foreground hover:bg-prodet-wash hover:text-prodet-text',
            )}
          >
            <span
              className={cn(
                'absolute inset-y-1 start-0 w-[2px] rounded-full transition-opacity',
                active ? 'bg-prodet-blue opacity-100' : 'opacity-0',
              )}
              aria-hidden
            />
            <span className={active ? 'text-prodet-blue' : 'text-muted-foreground'}>
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
