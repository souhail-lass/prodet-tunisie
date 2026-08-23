import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import {
  Building2,
  Calendar,
  ChevronLeft,
  Mail,
  MapPin,
  Phone,
  Tag,
  UserRound,
} from 'lucide-react';
import {
  accessRequestStatusLabels,
  accessRequestStatusTones,
  getAdminAccessRequestDetail,
  inviteStatusLabels,
  inviteStatusTones,
  type AdminTone,
} from '@/features/client-access/admin-queries';
import { Link, isLocale } from '@/i18n/routing';
import { AccessRequestReviewActions } from './review-actions';

export const metadata: Metadata = {
  title: 'Détail demande d’accès — Admin Prodet',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const TONE_STYLE: Record<AdminTone, { bg: string; fg: string }> = {
  neutral: { bg: 'var(--surface-sunken)', fg: 'var(--text-secondary)' },
  info: { bg: 'var(--prodet-blue-tint)', fg: 'var(--prodet-blue)' },
  success: { bg: 'var(--prodet-green-tint)', fg: 'var(--prodet-green)' },
  warn: { bg: 'var(--surface-sunken)', fg: 'var(--text-secondary)' },
  danger: { bg: 'var(--color-danger-bg)', fg: 'var(--color-danger)' },
};

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Africa/Tunis',
});

export default async function AdminAccessRequestDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const request = await getAdminAccessRequestDetail(id);
  if (!request) notFound();

  const tone = TONE_STYLE[accessRequestStatusTones[request.status]];
  const inviteTone = request.invite ? TONE_STYLE[inviteStatusTones[request.invite.status]] : null;

  return (
    <div className="dash">
      <div>
        <Link
          href="/admin/demandes-acces"
          className="ghost-link"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <ChevronLeft size={15} /> Retour aux demandes d’accès
        </Link>
      </div>

      <div className="admin-detail">
        <div className="admin-detail__main">
          <section className="panel">
            <div className="panel__head" style={{ marginBottom: 12 }}>
              <div>
                <p className="eyebrow">Demande d’accès portail</p>
                <h1 className="portal__title" style={{ marginTop: 6 }}>
                  {request.companyName}
                </h1>
                <p className="panel__sub">
                  {request.name} · {request.email}
                </p>
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  gap: 8,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {request.invite && inviteTone ? (
                  <span
                    className="pds-badge pds-badge--md"
                    style={{ background: inviteTone.bg, color: inviteTone.fg }}
                  >
                    Invitation : {inviteStatusLabels[request.invite.status]}
                  </span>
                ) : null}
                <span
                  className="pds-badge pds-badge--md"
                  style={{ background: tone.bg, color: tone.fg }}
                >
                  {accessRequestStatusLabels[request.status]}
                </span>
              </div>
            </div>

            <div className="admin-detail__facts">
              <Fact icon={<UserRound size={15} />} label="Contact" value={request.name} />
              <Fact icon={<Mail size={15} />} label="Email" value={request.email} />
              <Fact icon={<Phone size={15} />} label="Téléphone" value={request.phone} />
              <Fact icon={<Building2 size={15} />} label="Secteur" value={request.sector} />
              <Fact icon={<MapPin size={15} />} label="Ville / zone" value={request.cityOrZone} />
              <Fact icon={<Tag size={15} />} label="Besoin" value={request.needType} />
              <Fact
                icon={<Calendar size={15} />}
                label="Reçue le"
                value={dateFmt.format(request.createdAt)}
              />
              <Fact
                icon={<Calendar size={15} />}
                label="Revue le"
                value={request.reviewedAt ? dateFmt.format(request.reviewedAt) : '—'}
              />
            </div>

            {request.prodetReferenceOptional || request.message || request.reviewerNote ? (
              <div className="admin-detail__notes">
                {request.prodetReferenceOptional ? (
                  <NoteBlock label="Référence Prodet indiquée">
                    {request.prodetReferenceOptional}
                  </NoteBlock>
                ) : null}
                {request.message ? (
                  <NoteBlock label="Informations société / message">{request.message}</NoteBlock>
                ) : null}
                {request.reviewerNote ? (
                  <NoteBlock label="Note interne">{request.reviewerNote}</NoteBlock>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>

        <div className="admin-detail__side">
          <AccessRequestReviewActions
            locale={locale}
            requestId={request.id}
            status={request.status}
            reviewerNote={request.reviewerNote}
            email={request.email}
            invite={
              request.invite
                ? {
                    id: request.invite.id,
                    status: request.invite.status,
                    expiresAt: request.invite.expiresAt
                      ? request.invite.expiresAt.toISOString()
                      : null,
                  }
                : null
            }
          />
        </div>
      </div>
    </div>
  );
}

function Fact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="admin-fact">
      <span className="admin-fact__label">
        {icon} {label}
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
