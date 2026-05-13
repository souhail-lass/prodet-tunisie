import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { TopUtilityBar } from '@/components/site/top-utility-bar';
import { QuoteSelectionProvider } from '@/lib/quote-cart-context';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <QuoteSelectionProvider>
      <div className="flex min-h-dvh flex-col bg-background">
        <TopUtilityBar />
        <SiteHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>
    </QuoteSelectionProvider>
  );
}
