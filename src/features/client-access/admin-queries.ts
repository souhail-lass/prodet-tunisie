import 'server-only';
import { desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/features/admin/auth';

export type AccessRequestStatus = 'new' | 'reviewing' | 'approved' | 'rejected' | 'needs_info';

/** Une demande d'accès telle qu'affichée dans l'admin, avec tout le contexte
 *  nécessaire pour décider sans changer de page. */
export type AdminAccessRequest = {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  sector: string;
  cityOrZone: string;
  needType: string;
  prodetReferenceOptional: string | null;
  message: string | null;
  status: AccessRequestStatus;
  createdAt: Date;
  reviewedAt: Date | null;
  /** 'sent' une fois l'invitation partie, 'accepted' quand le client a activé. */
  inviteStatus: string | null;
};

/**
 * Toutes les demandes d'accès, plus récentes d'abord. Gardée derrière
 * requireAdmin() au niveau de la donnée, pas seulement du layout.
 */
export async function listAdminAccessRequests(): Promise<AdminAccessRequest[]> {
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
      prodetReferenceOptional: schema.clientAccessRequest.prodetReferenceOptional,
      message: schema.clientAccessRequest.message,
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

  return rows as AdminAccessRequest[];
}
