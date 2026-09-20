'use client';

import { useEffect } from 'react';
import { usePathname } from '@/i18n/routing';
import { rememberCatalogueBrowse } from '@/lib/catalogue-browse';

/** Remembers the last famille / sous-catégorie page so product "Retour" can go back there. */
export function RememberCatalogueBrowse() {
  const pathname = usePathname();

  useEffect(() => {
    rememberCatalogueBrowse(pathname);
  }, [pathname]);

  return null;
}
