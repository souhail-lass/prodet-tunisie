import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  UserRound,
} from 'lucide-react';
import {
  adminPortalStatusLabels,
  adminPortalStatusTones,
  getAdminPortalRequestDetail,
} from '@/features/admin/portal-requests';
import { Link, isLocale } from '@/i18n/routing';
import { PortalRequestStatusActions } from './status-actions';

export const metadata: Metadata = {
  title: 'Détail demande portail — Admin Prodet',
  description: 'Détail protégé d’une demande portail client Prodet.',
};

export const dynamic = 'force-dynamic';

const TONE_STYLE: Record<string, { bg: string; fg: string }> = {
  neutral: { bg: 'var(--surface-sunken)', fg: 'var(--text-secondary)' },
  info: { bg: 'var(--prodet-blue-tint)', fg: 'var(--prodet-blue)' },
  success: { bg: 'var(--prodet-green-tint)', fg: 'var(--prodet-green)' },
  danger: { bg: 'var(--color-danger-bg)', fg: 'var(--color-danger)' },
};

export default async function AdminPortalRequestDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  if (!isUuid(id)) notFound();
  setRequestLocale(locale);
  await connection();

  const request = await getAdminPortalRequestDetail(id);
  if (!request) notFound();

  const tone = TONE_STYLE[adminPortalStatusTones[request.status]] ?? TONE_STYLE.neutral!;
  const pushed = request.swiverExportStatus === 'api_pushed';

  return (
    <div className="dash">
      <div>
        <Link
          href="/admin/demandes-portail"
          className="ghost-link"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <ChevronLeft size={15} /> Retour aux demandes portail
        </Link>
      </div>

      <div className="admin-detail">
        <div className="admin-detail__main">
          {/* ---- header ---- */}
          <section className="panel">
            <div className="panel__head" style={{ marginBottom: 12 }}>
              <div>
                <p className="eyebrow">Demande portail</p>
                <h1 className="portal__title" style={{ marginTop: 6 }}>{request.referenceCode}</h1>
                <p className="panel__sub">
                  {request.customerName}
                  {request.customerEmail ? ` · ${request.customerEmail}` : ''}
                </p>
              </div>
              <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {pushed ? (
                  <span
                    className="pds-badge pds-badge--md"
                    style={{ background: 'var(--prodet-green-tint)', color: 'var(--prodet-green)' }}
                  >
                    <CheckCircle2 size={13} /> Poussée vers Swiver
                  </span>
                ) : null}
                <span className="pds-badge pds-badge--md" style={{ background: tone.bg, color: tone.fg }}>
                  {adminPortalStatusLabels[request.status]}
                </span>
              </div>
            </div>

            <div className="admin-detail__facts">
              <Fact icon={<UserRound size={15} />} label="Client" value={request.customerName} />
              <Fact icon={<Mail size={15} />} label="Email" value={request.customerEmail || '—'} />
              <Fact icon={<Phone size={15} />} label="Téléphone" value={request.customerPhone || '—'} />
              <Fact icon={<MapPin size={15} />} label="Ville" value={request.customerCity || '—'} />
              <Fact icon={<Clock3 size={15} />} label="Créée le" value={formatDateTime(request.createdAt, locale)} />
              <Fact
                icon={<PackageCheck size={15} />}
                label="Document Swiver"
                value={request.swiverDocumentRef ? `#${request.swiverDocumentRef}` : 'Aucun'}
              />
            </div>

            {(request.metadata.recurrenceSummary ||
              request.metadata.deliveryText ||
              request.metadata.preferredTiming ||
              request.metadata.message) ? (
              <div className="admin-detail__notes">
                {request.metadata.recurrenceSummary ? (
                  <NoteBlock label="Cadence livraisons">{request.metadata.recurrenceSummary}</NoteBlock>
                ) : null}
                {request.metadata.deliveryText ? (
                  <NoteBlock label="Zone / adresse souhaitée">{request.metadata.deliveryText}</NoteBlock>
                ) : null}
                {request.metadata.preferredTiming ? (
                  <NoteBlock label="Délai souhaité">{request.metadata.preferredTiming}</NoteBlock>
                ) : null}
                {request.metadata.message ? (
                  <NoteBlock label="Message client">{request.metadata.message}</NoteBlock>
                ) : null}
              </div>
            ) : null}
          </section>

          {/* ---- lines ---- */}
          <section className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="panel__head" style={{ padding: '18px 20px 0', marginBottom: 12 }}>
              <div>
                <h2 className="panel__title">Lignes demandées</h2>
                <p className="panel__sub">
                  {request.lineCount} ligne{request.lineCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="admin-table" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <div className="admin-table__head" style={{ gridTemplateColumns: '36px 3fr 1fr 1.4fr' }}>
                <span>#</span>
                <span>Produit</span>
                <span>Quantité</span>
                <span>Note</span>
              </div>
              {request.lines.map((line) => (
                <div className="admin-row" key={line.id} style={{ gridTemplateColumns: '36px 3fr 1fr 1.4fr' }}>
                  <span className="admin-cell-num" style={{ textAlign: 'left' }}>{line.lineNumber}</span>
                  <span className="admin-cell admin-cell-strong">{line.productName}</span>
                  <span className="admin-cell-num" style={{ textAlign: 'left' }}>
                    {line.quantity}
                    {line.unit ? ` ${line.unit}` : ''}
                  </span>
                  <span className="admin-cell-muted">{line.note || '—'}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ---- sidebar ---- */}
        <aside className="admin-detail__side">
          <PortalRequestStatusActions locale={locale} requestId={request.id} status={request.status} />

          <section className="panel">
            <div className="panel__head" style={{ marginBottom: 12 }}>
              <div>
                <h2 className="panel__title">Contact client</h2>
                <p className="panel__sub">{request.customerContact?.role || 'Contact principal'}</p>
              </div>
            </div>
            <dl className="admin-detail__contact">
              <Fact
                icon={<UserRound size={15} />}
                label="Nom"
                value={request.customerContact?.name || request.customerName}
              />
              <Fact
                icon={<Mail size={15} />}
                label="Email"
                value={request.customerContact?.email || request.customerEmail || '—'}
              />
              <Fact
                icon={<Phone size={15} />}
                label="Téléphone"
                value={request.customerContact?.phone || request.customerPhone || '—'}
              />
            </dl>
          </section>

          <section className="panel">
            <div className="panel__head" style={{ marginBottom: 12 }}>
              <div>
                <h2 className="panel__title">Chronologie</h2>
                <p className="panel__sub">Audit interne</p>
              </div>
            </div>
            <ol className="admin-timeline">
              {request.timeline.length > 0 ? (
                request.timeline.map((event) => (
                  <li key={`${event.action}-${event.createdAt.toISOString()}`}>
                    <span className="admin-timeline__dot" />
                    <span>
                      <strong>{event.label}</strong>
                      <small>{formatDateTime(event.createdAt, locale)}</small>
                    </span>
                  </li>
                ))
              ) : (
                <li className="admin-cell-muted">Aucun audit enregistré.</li>
              )}
            </ol>
          </section>
        </aside>
      </div>

      <div>
        <Link
          href="/admin/demandes-portail"
          className="pds-btn pds-btn--ghost pds-btn--sm"
        >
          <ArrowLeft size={15} />
          <span>Retour à la liste</span>
        </Link>
      </div>
    </div>
  );
}

function Fact({ icon, label, value }: { icon?: ReactNode; label: string; value: string }) {
  return (
    <div className="admin-fact">
      <span className="admin-fact__label">
        {icon}
        {label}
      </span>
      <span className="admin-fact__value">{value}</span>
    </div>
  );
}

function NoteBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="admin-note">
      <span className="admin-fact__label">{label}</span>
      <p>{children}</p>
    </div>
  );
}

function formatDateTime(value: Date, locale: string): string {
  const formatterLocale = locale === 'en' ? 'en-GB' : 'fr-TN';
  return new Intl.DateTimeFormat(formatterLocale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(
    value,
  );
}
