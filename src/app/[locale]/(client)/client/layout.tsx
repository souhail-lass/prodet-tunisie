import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PortalShell, type PortalShellAccount } from '@/components/portal/portal-shell';
import {
  ClientAuthUnavailableError,
  ForbiddenClientError,
  UnauthenticatedClientError,
  requireClientPortalAccess,
} from '@/features/client-portal/auth';
import { setRequestLocale } from 'next-intl/server';
import { account as mockAccount } from '@/features/client-portal/mock/portal-mock';
import { resolveCurrentPortalSwiverIdentity } from '@/features/client-portal/swiver-identity';
import { isLocale } from '@/i18n/routing';
import '@/styles/prodet/portal.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const SWIVER_IDENTITY_TIMEOUT_MS = 1200;

function initialsFrom(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'PR'
  );
}

export default async function ClientLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : 'fr';
  setRequestLocale(safeLocale);
  await cookies();

  // Dev preview: without a real Supabase session, render the portal with demo
  // data so the UI is fully viewable. Requires an EXPLICIT opt-in
  // (PORTAL_DEMO_MODE=1) AND a non-production build — never activates in
  // production. Mirrors the matching gate in src/middleware.ts.
  const demoMode =
    process.env.NODE_ENV !== 'production' && process.env.PORTAL_DEMO_MODE === '1';
  const demoAccount: PortalShellAccount = {
    name: mockAccount.name,
    contact: mockAccount.contact,
    initials: mockAccount.initials,
  };

  let shellAccount: PortalShellAccount;

  try {
    const access = await requireClientPortalAccess();
    const name = access.customer.displayName || access.customer.name;
    shellAccount = {
      name,
      contact: access.appUser.fullName || access.customer.email || access.customer.phone || '',
      initials: initialsFrom(name),
    };
  } catch (error) {
    if (error instanceof ClientAuthUnavailableError) {
      shellAccount = demoAccount;
    } else if (
      demoMode &&
      (error instanceof UnauthenticatedClientError || error instanceof ForbiddenClientError)
    ) {
      shellAccount = demoAccount;
    } else if (error instanceof UnauthenticatedClientError) {
      redirect(`/${safeLocale}/connexion-client?next=/${safeLocale}/client`);
    } else if (error instanceof ForbiddenClientError) {
      return (
        <main className="flex min-h-dvh items-center justify-center bg-[var(--surface-page)] px-5 py-10">
          <div className="w-full max-w-md rounded-[var(--radius-panel)] border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--prodet-blue-tint)] text-[var(--prodet-blue)]">
              <ShieldAlert className="h-5 w-5" aria-hidden />
            </div>
            <p className="eyebrow" style={{ marginTop: 16 }}>
              Espace client
            </p>
            <h1 className="mt-1 text-[20px] font-semibold text-[var(--text-primary)]">Accès client non activé</h1>
            <p className="mt-2 text-[13px] leading-6 text-[var(--text-secondary)]">
              Votre session existe, mais aucun client validé Prodet n&rsquo;est lié à ce compte.
            </p>
          </div>
        </main>
      );
    } else {
      throw error;
    }
  }

  // Enrich the rail with the real Swiver establishment when the portal
  // customer matches a Swiver contact (degrades silently if unavailable).
  // Bounded: a cold or slow Swiver API must never delay portal navigation —
  // past the deadline we render the base account and let the in-flight fetch
  // warm the cache for the next request.
  try {
    const identity = await Promise.race([
      resolveCurrentPortalSwiverIdentity(),
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), SWIVER_IDENTITY_TIMEOUT_MS);
      }),
    ]);
    if (identity?.customer) {
      shellAccount = {
        name: identity.customer.legalName,
        contact: identity.customer.city ?? identity.customer.externalCode ?? shellAccount.contact,
        initials: initialsFrom(identity.customer.legalName),
      };
    }
  } catch {
    // Keep the base account if Swiver is unreachable.
  }

  return <PortalShell account={shellAccount}>{children}</PortalShell>;
}
