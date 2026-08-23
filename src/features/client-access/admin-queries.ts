import 'server-only';
import { desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/features/admin/auth';

export type AccessRequestStatus = 'new' | 'reviewing' | 'approved' | 'rejected' | 'needs_info';
export type PortalInviteStatus = 'prepared' | 'sent' | 'accepted' | 'expired' | 'revoked';
export type AdminTone = 'neutral' | 'info' | 'success' | 'danger' | 'warn';

export const accessRequestStatusLabels: Record<AccessRequestStatus, string> = {
  new: 'Nouvelle',
  reviewing: 'En cours de revue',
  approved: 'Approuvée',
  rejected: 'Refusée',
  needs_info: 'Infos manquantes',
};

export const accessRequestStatusTones: Record<AccessRequestStatus, AdminTone> = {
  new: 'info',
  reviewing: 'warn',
  approved: 'success',
  rejected: 'danger',
  needs_info: 'warn',
};

export const inviteStatusLabels: Record<PortalInviteStatus, string> = {
  prepared: 'À envoyer',
  sent: 'Envoyée',
  accepted: 'Activée',
  expired: 'Expirée',
  revoked: 'Révoquée',
};

export const inviteStatusTones: Record<PortalInviteStatus, AdminTone> = {
  prepared: 'warn',
  sent: 'info',
  accepted: 'success',
  expired: 'neutral',
  revoked: 'danger',
};

export type AdminAccessRequestRow = {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  sector: string;
  cityOrZone: string;
  needType: string;
  status: AccessRequestStatus;
  createdAt: Date;
  reviewedAt: Date | null;
  inviteStatus: PortalInviteStatus | null;
};

export type AdminAccessRequestDetail = AdminAccessRequestRow & {
  prodetReferenceOptional: string | null;
  message: string | null;
  reviewerNote: string | null;
  source: string;
  updatedAt: Date;
  invite: {
    id: string;
    status: PortalInviteStatus;
    email: string;
    expiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
};

/**
 * Every "devenir client" request, newest first, with the state of its portal
 * invite (if the request was approved). Admin-gated at the data boundary
 * rather than relying only on the route layout.
 */
export async function listAdminAccessRequests(): Promise<AdminAccessRequestRow[]> {
  await requireAdmin();
  const { db, schema } = await import('@/db/client');

  const rows = await db
    .select({
      id: schema.clientAccessRequest.id,
      name: schema.clientAccessRequest.name,
      companyName: schema.clientAccessRequest.companyName,
      email: schema.clientAccessRequest.email,
      phone: schema.clientAccessRequest.phone,
      sector: schema.clientAccessRequest.sector,
      cityOrZone: schema.clientAccessRequest.cityOrZone,
      needType: schema.clientAccessRequest.needType,
      status: schema.clientAccessRequest.status,
      createdAt: schema.clientAccessRequest.createdAt,
      reviewedAt: schema.clientAccessRequest.reviewedAt,
      inviteStatus: schema.portalInvite.status,
    })
    .from(schema.clientAccessRequest)
    .leftJoin(
      schema.portalInvite,
      eq(schema.portalInvite.accessRequestId, schema.clientAccessRequest.id),
    )
    .orderBy(desc(schema.clientAccessRequest.createdAt));

  return rows as AdminAccessRequestRow[];
}

export async function getAdminAccessRequestDetail(
  id: string,
): Promise<AdminAccessRequestDetail | null> {
  await requireAdmin();
  const { db, schema } = await import('@/db/client');

  const [row] = await db
    .select()
    .from(schema.clientAccessRequest)
    .where(eq(schema.clientAccessRequest.id, id))
    .limit(1);
  if (!row) return null;

  const [invite] = await db
    .select()
    .from(schema.portalInvite)
    .where(eq(schema.portalInvite.accessRequestId, id))
    .limit(1);

  return {
    id: row.id,
    name: row.name,
    companyName: row.companyName,
    email: row.email,
    phone: row.phone,
    sector: row.sector,
    cityOrZone: row.cityOrZone,
    needType: row.needType,
    status: row.status as AccessRequestStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    reviewedAt: row.reviewedAt,
    reviewerNote: row.reviewerNote,
    prodetReferenceOptional: row.prodetReferenceOptional,
    message: row.message,
    source: row.source,
    inviteStatus: (invite?.status as PortalInviteStatus | undefined) ?? null,
    invite: invite
      ? {
          id: invite.id,
          status: invite.status as PortalInviteStatus,
          email: invite.email,
          expiresAt: invite.expiresAt,
          createdAt: invite.createdAt,
          updatedAt: invite.updatedAt,
        }
      : null,
  };
}

/** Count of requests still awaiting a decision — drives the nav badge. */
export async function countPendingAccessRequests(): Promise<number> {
  const rows = await listAdminAccessRequests();
  return rows.filter((r) => r.status === 'new' || r.status === 'reviewing').length;
}
