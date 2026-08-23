import type { Metadata } from 'next';
import { CloudOff } from 'lucide-react';
import { notFound } from 'next/navigation';
import { listAdminAccessRequests } from '@/features/client-access/admin-queries';
import { isLocale } from '@/i18n/routing';
import { AccessRequestsClient, type AccessRequestRow } from './access-requests-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Demandes d’accès — Admin Prodet',
  robots: { index: false, follow: false },
};

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Africa/Tunis',
});

export default async function AdminAccessRequestsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  let rows: AccessRequestRow[] = [];
  let error: string | null = null;

  try {
    const requests = await listAdminAccessRequests();
    rows = requests.map((r) => ({
      id: r.id,
      name: r.name,
      company: r.companyName,
      email: r.email,
      phone: r.phone,
      sector: r.sector,
      city: r.cityOrZone,
      needType: r.needType,
      reference: r.prodetReferenceOptional,
      message: r.message,
      status: r.status,
      activated: r.inviteStatus === 'accepted',
      invited: r.inviteStatus === 'sent' || r.inviteStatus === 'accepted',
      dateLabel: dateFmt.format(r.createdAt),
    }));
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  if (error) {
    return (
      <section className="panel" style={{ maxWidth: 560 }}>
        <div className="panel__head">
          <h2
            className="panel__title"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <CloudOff size={18} /> Données indisponibles
          </h2>
        </div>
        <p className="panel__sub">Impossible de charger les demandes d’accès.</p>
        <p style={{ marginTop: 10, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
          {error}
        </p>
      </section>
    );
  }

  return <AccessRequestsClient requests={rows} locale={locale} />;
}
