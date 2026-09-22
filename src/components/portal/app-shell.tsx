import type { ReactNode } from 'react';
import { Mail, Phone, Plus } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { companyInfo } from '@/data/company';
import { Link } from '@/i18n/routing';
import { BottomNav } from './bottom-nav';
import { SidebarNav } from './sidebar-nav';
import { StatusPill } from './status-pill';

interface AppShellProps {
  customer: {
    name: string;
    city: string | null;
    sector: string | null;
  };
  children: ReactNode;
}

/**
 * Persistent shell for the client portal. The shell carries identity, status,
 * and primary CTA. Pages own the rest of the surface.
 *
 * Layout:
 *  - Desktop ≥ lg: 240px fixed left sidebar (logo, primary CTA, nav, account
 *    card with contact). Content fills the rest.
 *  - Mobile < lg: 56px top bar (logo + customer initial) + scrolling content +
 *    64px bottom tab bar. Content gets a bottom padding so the tab bar never
 *    eats the last list row.
 */
export function AppShell({ customer, children }: AppShellProps) {
  const customerInitial = customer.name.trim().charAt(0).toUpperCase() || 'P';

  return (
    <div className="bg-prodet-wash text-prodet-text min-h-dvh">
      <MobileTopBar customerName={customer.name} customerInitial={customerInitial} />

      <div className="lg:flex lg:min-h-dvh">
        <aside
          aria-label="Espace client"
          className="border-border bg-card hidden w-[240px] shrink-0 flex-col border-e lg:sticky lg:top-0 lg:flex lg:h-dvh"
        >
          <div className="border-border flex h-14 items-center border-b px-4">
            <Link href="/client" className="inline-flex items-center gap-2">
              <Logo size="sm" />
              <span className="text-muted-foreground text-[12px] font-semibold tracking-[0.06em] uppercase">
                Espace client
              </span>
            </Link>
          </div>

          <div className="px-3 py-3">
            <Button asChild size="sm" className="h-9 w-full justify-center text-[13px]">
              <Link href="/client/nouvelle-demande">
                <Plus className="h-4 w-4" aria-hidden />
                Nouvelle demande
              </Link>
            </Button>
          </div>

          <div className="px-3">
            <SidebarNav />
          </div>

          <div className="border-border mt-auto border-t p-3">
            <AccountCard customer={customer} />
          </div>
        </aside>

        <main className="flex-1 pb-24 lg:pb-10">
          <div className="mx-auto w-full max-w-[1180px] px-4 pt-5 md:px-6 lg:px-10 lg:pt-8">
            {children}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}

function MobileTopBar({
  customerName,
  customerInitial,
}: {
  customerName: string;
  customerInitial: string;
}) {
  return (
    <header className="border-border sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white/96 px-4 backdrop-blur lg:hidden">
      <Link href="/client" className="inline-flex items-center gap-2">
        <Logo size="sm" />
        <span className="sr-only">Espace client Prodet</span>
      </Link>
      <div className="inline-flex items-center gap-2">
        <span
          className="text-muted-foreground hidden max-w-[160px] truncate text-[12px] font-medium sm:inline"
          title={customerName}
        >
          {customerName}
        </span>
        <span
          aria-label={`Compte ${customerName}`}
          className="border-border bg-prodet-mist text-prodet-blue inline-flex h-8 w-8 items-center justify-center rounded-full border text-[12px] font-semibold"
        >
          {customerInitial}
        </span>
      </div>
    </header>
  );
}

function AccountCard({ customer }: { customer: AppShellProps['customer'] }) {
  const context = [customer.sector, customer.city].filter(Boolean).join(' · ');

  return (
    <div className="space-y-3 text-[12px]">
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-prodet-text truncate text-[13px] font-semibold" title={customer.name}>
            {customer.name}
          </p>
          <StatusPill tone="success" label="Activé" />
        </div>
        {context ? (
          <p className="text-muted-foreground mt-1 truncate" title={context}>
            {context}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5 text-[12px]">
        <a
          href={companyInfo.phoneHref}
          className="text-muted-foreground hover:text-prodet-blue inline-flex items-center gap-2"
        >
          <Phone className="h-3.5 w-3.5" aria-hidden />
          <span className="truncate">{companyInfo.phoneDisplay}</span>
        </a>
        <a
          href={companyInfo.emailHref}
          className="text-muted-foreground hover:text-prodet-blue inline-flex items-center gap-2"
        >
          <Mail className="h-3.5 w-3.5" aria-hidden />
          <span className="truncate">{companyInfo.email}</span>
        </a>
      </div>
    </div>
  );
}
