import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { QuoteSelectionProvider } from '@/lib/quote-cart-context';
import { QuoteDrawerProvider } from '@/components/site/quote-drawer';
import { getCatalogueSearchCards } from '@/features/catalogue/queries';
import type { CatalogueCardProduct } from '@/types/product';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  let searchCards: CatalogueCardProduct[] = [];
  try {
    searchCards = await getCatalogueSearchCards();
  } catch {
    // Drawer search is an enhancement; a missing DB must not blank the public site.
  }

  return (
    <QuoteSelectionProvider>
      <QuoteDrawerProvider products={searchCards}>
        <div className="site-app" style={{ minHeight: '100dvh' }}>
          <SiteHeader />
          <main id="main-content" style={{ flex: 1 }}>
            {children}
          </main>
          <SiteFooter />
        </div>
      </QuoteDrawerProvider>
    </QuoteSelectionProvider>
  );
}
