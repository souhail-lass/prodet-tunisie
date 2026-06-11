import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { QuoteSelectionProvider } from '@/lib/quote-cart-context';
import { QuoteDrawerProvider } from '@/components/site/quote-drawer';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <QuoteSelectionProvider>
      <QuoteDrawerProvider>
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
