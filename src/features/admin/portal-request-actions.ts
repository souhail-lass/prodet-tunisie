'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import {
  isAdminAuthUnavailableError,
  isForbiddenAdminError,
  isUnauthenticatedAdminError,
  requireAdmin,
} from '@/features/admin/auth';
import {
  adminPortalRequestActionStatuses,
  type AdminPortalRequestActionStatus,
  adminPortalStatusLabels,
} from './portal-requests';

const UpdatePortalRequestStatusSchema = z.object({
  requestId: z.string().uuid('invalidRequest'),
  locale: z.enum(['fr', 'ar', 'en']).default('fr'),
  nextStatus: z.enum(adminPortalRequestActionStatuses),
});

export interface PortalRequestStatusActionResult {
  ok: boolean;
  authRequired?: boolean;
  forbidden?: boolean;
  formError?: string;
  message?: string;
}

export async function updatePortalRequestStatus(
  _previousState: PortalRequestStatusActionResult,
  formData: FormData,
): Promise<PortalRequestStatusActionResult> {
  const parsed = UpdatePortalRequestStatusSchema.safeParse({
    requestId: readFormString(formData, 'requestId'),
    locale: readFormString(formData, 'locale') || 'fr',
    nextStatus: readFormString(formData, 'nextStatus'),
  });

  if (!parsed.success) {
    return { ok: false, formError: "Le changement de statut n'est pas valide." };
  }

  let currentUser;
  try {
    currentUser = await requireAdmin();
  } catch (error) {
    if (isAdminAuthUnavailableError(error)) {
      return {
        ok: false,
        authRequired: true,
        formError: "L'authentification admin serveur n'est pas configurée.",
      };
    }
    if (isUnauthenticatedAdminError(error)) {
      return {
        ok: false,
        authRequired: true,
        formError: 'Connectez-vous avec un compte admin Prodet.',
      };
    }
    if (isForbiddenAdminError(error)) {
      return {
        ok: false,
        forbidden: true,
        formError: "Votre compte n'a pas le rôle requis pour cette action.",
      };
    }
    throw error;
  }

  const { db, schema } = await import('@/db/client');
  const now = new Date();

  const result = await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(schema.orderDraft)
      .where(
        and(
          eq(schema.orderDraft.id, parsed.data.requestId),
          eq(schema.orderDraft.source, 'portal'),
          isNull(schema.orderDraft.deletedAt),
        ),
      )
      .limit(1);

    if (!existing) return { found: false as const };

    const terminalDates = getTerminalDates(parsed.data.nextStatus, now);
    const [updated] = await tx
      .update(schema.orderDraft)
      .set({
        status: parsed.data.nextStatus,
        updatedAt: now,
        approvedAt: terminalDates.approvedAt,
        rejectedAt: terminalDates.rejectedAt,
      })
      .where(eq(schema.orderDraft.id, existing.id))
      .returning();

    if (!updated) return { found: false as const };

    await tx.insert(schema.auditLog).values({
      actorUserId: currentUser.appUser?.id ?? null,
      actorRole: currentUser.appUser?.role ?? null,
      action: 'order_draft.status_updated',
      entityType: 'order_draft',
      entityId: updated.id,
      diff: {
        before: {
          status: existing.status,
          approvedAt: existing.approvedAt?.toISOString() ?? null,
          rejectedAt: existing.rejectedAt?.toISOString() ?? null,
        },
        after: {
          status: updated.status,
          approvedAt: updated.approvedAt?.toISOString() ?? null,
          rejectedAt: updated.rejectedAt?.toISOString() ?? null,
        },
      },
      metadata: {
        locale: parsed.data.locale,
        source: 'portal',
        swiverExportStatus: updated.swiverExportStatus,
      },
    });

    return { found: true as const, status: updated.status };
  });

  if (!result.found) {
    return { ok: false, formError: "Cette demande portail n'existe plus." };
  }

  revalidatePath(`/${parsed.data.locale}/admin/demandes-portail`);
  revalidatePath(`/${parsed.data.locale}/admin/demandes-portail/${parsed.data.requestId}`);
  revalidatePath(`/${parsed.data.locale}/client/historique`);

  return {
    ok: true,
    message: `Statut mis à jour: ${adminPortalStatusLabels[result.status]}.`,
  };
}

function readFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === 'string' ? value : undefined;
}

function getTerminalDates(
  status: AdminPortalRequestActionStatus,
  now: Date,
): { approvedAt: Date | null; rejectedAt: Date | null } {
  if (status === 'approved') return { approvedAt: now, rejectedAt: null };
  if (status === 'rejected') return { approvedAt: null, rejectedAt: now };
  return { approvedAt: null, rejectedAt: null };
}
