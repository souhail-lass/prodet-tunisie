import type { ReactNode } from 'react';
import { RememberCatalogueBrowse } from '@/components/catalogue/remember-catalogue-browse';

export default function ProduitsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <RememberCatalogueBrowse />
      {children}
    </>
  );
}
