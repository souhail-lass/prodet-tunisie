'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePathname } from '@/i18n/routing';
import { rememberCatalogueBrowse } from '@/lib/catalogue-browse';

function RememberCatalogueBrowseInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams.toString();
    rememberCatalogueBrowse(search ? `${pathname}?${search}` : pathname);
  }, [pathname, searchParams]);

  return null;
}

/** Remembers the last browse page so product "Retour" can go back there. */
export function RememberCatalogueBrowse() {
  return (
    <Suspense fallback={null}>
      <RememberCatalogueBrowseInner />
    </Suspense>
  );
}
