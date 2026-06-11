import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { LockKeyhole, ShieldAlert } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  AdminAuthUnavailableError,
  ForbiddenAdminError,
  UnauthenticatedAdminError,
  requireAdmin,
} from '@/features/admin/auth';
import { AdminShell, type AdminShellAccount } from '@/components/admin/admin-shell';
import { isLocale } from '@/i18n/routing';
import '@/styles/prodet/portal.css';
import '@/styles/prodet/admin.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function initialsFrom(value: string): string {
  return (
    value
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'AD'
  );
}

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : 'fr';
  await cookies();

  let account: AdminShellAccount;
  try {
    const session = await requireAdmin();
    const name = session.appUser?.fullName || session.appUser?.email || 'Admin';
    account = {
      name,
      email: session.appUser?.email ?? '',
      initials: initialsFrom(name),
    };
  } catch (error) {
    if (error instanceof UnauthenticatedAdminError) {
      redirect(`/${safeLocale}/connexion-admin?next=/${safeLocale}/admin/catalogue-swiver`);
    }
    if (error instanceof ForbiddenAdminError) {
      return (
        <AdminBlock
          icon={<ShieldAlert size={20} aria-hidden />}
          title="Accès refusé"
          message="Ce compte n’a pas de rôle admin Prodet actif. Connectez-vous avec votre compte propriétaire (slassoued500@gmail.com) via /connexion-admin."
        />
      );
    }
    if (error instanceof AdminAuthUnavailableError) {
      return (
        <AdminBlock
          icon={<LockKeyhole size={20} aria-hidden />}
          title="Authentification admin non configurée"
          message="Configurez Supabase Auth et le premier compte admin avant d’ouvrir cette zone."
        />
      );
    }
    throw error;
  }

  return <AdminShell account={account}>{children}</AdminShell>;
}

function AdminBlock({ icon, title, message }: { icon: ReactNode; title: string; message: string }) {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--surface-page)',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-panel)',
          boxShadow: 'var(--shadow-panel)',
          padding: 32,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-button)',
            background: 'var(--surface-navy)',
            color: '#fff',
          }}
        >
          {icon}
        </span>
        <p className="eyebrow" style={{ marginTop: 18 }}>
          Administration
        </p>
        <h1 style={{ marginTop: 8, fontSize: 'var(--text-h3)', fontWeight: 'var(--fw-bold)' }}>{title}</h1>
        <p style={{ marginTop: 10, fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          {message}
        </p>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/fr/connexion-admin"
          className="pds-btn pds-btn--primary pds-btn--md"
          style={{ marginTop: 20, display: 'inline-flex' }}
        >
          <span>Connexion admin</span>
        </a>
      </div>
    </main>
  );
}
