'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { companyInfo } from '@/data/company';
import {
  isAdminAuthUnavailableError,
  isForbiddenAdminError,
  isUnauthenticatedAdminError,
  requireAdmin,
} from '@/features/admin/auth';
import {
  generateInviteToken,
  getInviteExpiresAt,
  hashInviteToken,
} from './invite-token';

const ReviewIntentSchema = z.enum([
  'save_note',
  'reviewing',
  'approved',
  'rejected',
  'needs_info',
]);

const ReviewClientAccessRequestSchema = z.object({
  requestId: z.string().uuid('invalidRequest'),
  locale: z.enum(['fr', 'ar', 'en']).default('fr'),
  intent: ReviewIntentSchema,
  reviewerNote: z.string().trim().max(2000, 'tooLong').optional(),
});

export type ClientAccessReviewStatus = Exclude<
  z.infer<typeof ReviewIntentSchema>,
  'save_note'
>;

export interface ClientAccessReviewResult {
  ok: boolean;
  authRequired?: boolean;
  forbidden?: boolean;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
  message?: string;
}

const PortalInviteActionSchema = z.object({
  inviteId: z.string().uuid('invalidInvite'),
  requestId: z.string().uuid('invalidRequest'),
  locale: z.enum(['fr', 'ar', 'en']).default('fr'),
});

export interface PortalInviteActionResult {
  ok: boolean;
  authRequired?: boolean;
  forbidden?: boolean;
  formError?: string;
  message?: string;
  activationLink?: string;
  emailDelivery?: 'sent' | 'skipped' | 'failed';
}

export async function reviewClientAccessRequest(
  _previousState: ClientAccessReviewResult,
  formData: FormData,
): Promise<ClientAccessReviewResult> {
  const parsed = ReviewClientAccessRequestSchema.safeParse({
    requestId: readFormString(formData, 'requestId'),
    locale: readFormString(formData, 'locale') || 'fr',
    intent: readFormString(formData, 'intent'),
    reviewerNote: readFormString(formData, 'reviewerNote') || undefined,
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten((issue) => issue.message);
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(flat.fieldErrors)) {
      if (value && value.length > 0) fieldErrors[key] = value;
    }
    if (flat.formErrors.length > 0) fieldErrors._root = flat.formErrors;
    return { ok: false, fieldErrors, formError: 'Vérifiez les informations de revue.' };
  }

  let currentUser;
  try {
    currentUser = await requireAdmin();
  } catch (error) {
    if (isAdminAuthUnavailableError(error)) {
      return {
        ok: false,
        authRequired: true,
        formError:
          "La revue admin exige une authentification serveur qui n'est pas encore configurée.",
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
  const reviewerNote = parsed.data.reviewerNote || null;
  const nextStatus =
    parsed.data.intent === 'save_note' ? null : parsed.data.intent;

  const result = await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(schema.clientAccessRequest)
      .where(eq(schema.clientAccessRequest.id, parsed.data.requestId))
      .limit(1);

    if (!existing) return { found: false as const };

    const updateValues: {
      status?: ClientAccessReviewStatus;
      reviewerNote: string | null;
      reviewedAt?: Date | null;
      updatedAt: Date;
    } = {
      reviewerNote,
      updatedAt: now,
    };

    if (nextStatus) {
      updateValues.status = nextStatus;
      updateValues.reviewedAt = isReviewedStatus(nextStatus) ? now : null;
    }

    const [updated] = await tx
      .update(schema.clientAccessRequest)
      .set(updateValues)
      .where(eq(schema.clientAccessRequest.id, parsed.data.requestId))
      .returning();

    let preparedInvite:
      | typeof schema.portalInvite.$inferSelect
      | null = null;

    if (nextStatus === 'approved') {
      const [invite] = await tx
        .insert(schema.portalInvite)
        .values({
          accessRequestId: existing.id,
          email: existing.email.toLowerCase(),
          companyName: existing.companyName,
          status: 'prepared',
          tokenHash: null,
          expiresAt: null,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schema.portalInvite.accessRequestId,
          set: {
            email: existing.email.toLowerCase(),
            companyName: existing.companyName,
            updatedAt: now,
          },
        })
        .returning();

      preparedInvite = invite ?? null;
    }

    await tx.insert(schema.auditLog).values({
      actorUserId: currentUser.appUser?.id ?? null,
      actorRole: currentUser.appUser?.role ?? null,
      action:
        parsed.data.intent === 'save_note'
          ? 'client_access_request.note_updated'
          : 'client_access_request.status_updated',
      entityType: 'client_access_request',
      entityId: parsed.data.requestId,
      diff: {
        before: {
          status: existing.status,
          reviewerNote: existing.reviewerNote,
          reviewedAt: existing.reviewedAt?.toISOString() ?? null,
        },
        after: {
          status: updated?.status ?? existing.status,
          reviewerNote: updated?.reviewerNote ?? null,
          reviewedAt: updated?.reviewedAt?.toISOString() ?? null,
        },
      },
      metadata: {
        intent: parsed.data.intent,
        locale: parsed.data.locale,
      },
    });

    if (preparedInvite) {
      await tx.insert(schema.auditLog).values({
        actorUserId: currentUser.appUser?.id ?? null,
        actorRole: currentUser.appUser?.role ?? null,
        action: 'portal_invite.prepared',
        entityType: 'portal_invite',
        entityId: preparedInvite.id,
        diff: {
          status: preparedInvite.status,
          email: preparedInvite.email,
          companyName: preparedInvite.companyName,
          accessRequestId: preparedInvite.accessRequestId,
        },
        metadata: {
          sourceAction: 'client_access_request.approved',
          locale: parsed.data.locale,
        },
      });
    }

    return { found: true as const };
  });

  if (!result.found) {
    return { ok: false, formError: "Cette demande d'accès n'existe plus." };
  }

  revalidatePath(`/${parsed.data.locale}/admin/demandes-acces`);
  revalidatePath(`/${parsed.data.locale}/admin/demandes-acces/${parsed.data.requestId}`);

  return {
    ok: true,
    message:
      parsed.data.intent === 'save_note'
        ? 'Note enregistrée.'
        : parsed.data.intent === 'approved'
          ? 'Demande approuvée. Invitation portail préparée.'
        : 'Statut de la demande mis à jour.',
  };
}

function readFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === 'string' ? value : undefined;
}

function isReviewedStatus(status: ClientAccessReviewStatus): boolean {
  return status === 'approved' || status === 'rejected' || status === 'needs_info';
}

export async function sendPortalInvite(
  _previousState: PortalInviteActionResult,
  formData: FormData,
): Promise<PortalInviteActionResult> {
  const parsed = PortalInviteActionSchema.safeParse({
    inviteId: readFormString(formData, 'inviteId'),
    requestId: readFormString(formData, 'requestId'),
    locale: readFormString(formData, 'locale') || 'fr',
  });

  if (!parsed.success) {
    return { ok: false, formError: "L'invitation n'est pas valide." };
  }

  const currentUser = await requirePortalInviteAdmin();
  if (!('currentUser' in currentUser)) return currentUser;

  const { db, schema } = await import('@/db/client');
  const now = new Date();
  const rawToken = generateInviteToken();
  const tokenHash = hashInviteToken(rawToken);
  const expiresAt = getInviteExpiresAt(now);
  const activationLink = await buildActivationLink(parsed.data.locale, rawToken);

  const result = await db.transaction(async (tx) => {
    const [request] = await tx
      .select()
      .from(schema.clientAccessRequest)
      .where(eq(schema.clientAccessRequest.id, parsed.data.requestId))
      .limit(1);

    if (!request) return { status: 'missing_request' as const };
    if (request.status !== 'approved') return { status: 'not_approved' as const };

    const [invite] = await tx
      .select()
      .from(schema.portalInvite)
      .where(eq(schema.portalInvite.id, parsed.data.inviteId))
      .limit(1);

    if (!invite || invite.accessRequestId !== request.id) {
      return { status: 'missing_invite' as const };
    }
    if (invite.status !== 'prepared') {
      return { status: 'not_prepared' as const, inviteStatus: invite.status };
    }

    const [updatedInvite] = await tx
      .update(schema.portalInvite)
      .set({
        email: request.email.toLowerCase(),
        companyName: request.companyName,
        status: 'sent',
        tokenHash,
        expiresAt,
        updatedAt: now,
      })
      .where(eq(schema.portalInvite.id, invite.id))
      .returning();

    if (!updatedInvite) return { status: 'missing_invite' as const };

    await tx.insert(schema.auditLog).values({
      actorUserId: currentUser.currentUser.appUser?.id ?? null,
      actorRole: currentUser.currentUser.appUser?.role ?? null,
      action: 'portal_invite.activation_token_prepared',
      entityType: 'portal_invite',
      entityId: updatedInvite.id,
      diff: {
        before: {
          status: invite.status,
          expiresAt: invite.expiresAt?.toISOString() ?? null,
          tokenHashPresent: Boolean(invite.tokenHash),
        },
        after: {
          status: updatedInvite.status,
          expiresAt: updatedInvite.expiresAt?.toISOString() ?? null,
          tokenHashPresent: Boolean(updatedInvite.tokenHash),
        },
      },
      metadata: {
        accessRequestId: request.id,
        locale: parsed.data.locale,
      },
    });

    return {
      status: 'updated' as const,
      invite: updatedInvite,
      request,
    };
  });

  if (result.status === 'missing_request') {
    return { ok: false, formError: "La demande d'accès n'existe plus." };
  }
  if (result.status === 'not_approved') {
    return {
      ok: false,
      formError: "La demande doit être approuvée avant d'envoyer une invitation.",
    };
  }
  if (result.status === 'missing_invite') {
    return { ok: false, formError: "L'invitation préparée n'existe plus." };
  }
  if (result.status === 'not_prepared') {
    return {
      ok: false,
      formError: "Cette invitation n'est plus en statut préparé.",
    };
  }

  const emailDelivery = await sendPortalInviteEmail({
    to: result.invite.email,
    companyName: result.invite.companyName,
    activationLink,
    expiresAt,
    locale: parsed.data.locale,
  });

  await db.insert(schema.auditLog).values({
    actorUserId: currentUser.currentUser.appUser?.id ?? null,
    actorRole: currentUser.currentUser.appUser?.role ?? null,
    action:
      emailDelivery === 'sent'
        ? 'portal_invite.email_sent'
        : 'portal_invite.manual_delivery_prepared',
    entityType: 'portal_invite',
    entityId: result.invite.id,
    metadata: {
      accessRequestId: result.request.id,
      emailDelivery,
      locale: parsed.data.locale,
    },
  });

  revalidatePath(`/${parsed.data.locale}/admin/demandes-acces/${parsed.data.requestId}`);

  return {
    ok: true,
    emailDelivery,
    activationLink:
      emailDelivery === 'skipped' && process.env.NODE_ENV !== 'production'
        ? activationLink
        : undefined,
    message:
      emailDelivery === 'sent'
        ? 'Invitation envoyée par email.'
        : emailDelivery === 'skipped'
          ? 'Invitation générée. Email non configuré, lien disponible en développement.'
          : "Invitation générée, mais l'envoi email a échoué.",
  };
}

export async function revokePortalInvite(
  _previousState: PortalInviteActionResult,
  formData: FormData,
): Promise<PortalInviteActionResult> {
  const parsed = PortalInviteActionSchema.safeParse({
    inviteId: readFormString(formData, 'inviteId'),
    requestId: readFormString(formData, 'requestId'),
    locale: readFormString(formData, 'locale') || 'fr',
  });

  if (!parsed.success) {
    return { ok: false, formError: "L'invitation n'est pas valide." };
  }

  const currentUser = await requirePortalInviteAdmin();
  if (!('currentUser' in currentUser)) return currentUser;

  const { db, schema } = await import('@/db/client');
  const now = new Date();

  const result = await db.transaction(async (tx) => {
    const [invite] = await tx
      .select()
      .from(schema.portalInvite)
      .where(eq(schema.portalInvite.id, parsed.data.inviteId))
      .limit(1);

    if (!invite || invite.accessRequestId !== parsed.data.requestId) {
      return { status: 'missing_invite' as const };
    }
    if (invite.status === 'accepted') return { status: 'accepted' as const };
    if (invite.status === 'revoked') return { status: 'already_revoked' as const };

    const [updatedInvite] = await tx
      .update(schema.portalInvite)
      .set({
        status: 'revoked',
        tokenHash: null,
        expiresAt: null,
        updatedAt: now,
      })
      .where(eq(schema.portalInvite.id, invite.id))
      .returning();

    if (!updatedInvite) return { status: 'missing_invite' as const };

    await tx.insert(schema.auditLog).values({
      actorUserId: currentUser.currentUser.appUser?.id ?? null,
      actorRole: currentUser.currentUser.appUser?.role ?? null,
      action: 'portal_invite.revoked',
      entityType: 'portal_invite',
      entityId: updatedInvite.id,
      diff: {
        before: {
          status: invite.status,
          expiresAt: invite.expiresAt?.toISOString() ?? null,
          tokenHashPresent: Boolean(invite.tokenHash),
        },
        after: {
          status: updatedInvite.status,
          expiresAt: updatedInvite.expiresAt?.toISOString() ?? null,
          tokenHashPresent: Boolean(updatedInvite.tokenHash),
        },
      },
      metadata: {
        accessRequestId: parsed.data.requestId,
        locale: parsed.data.locale,
      },
    });

    return { status: 'revoked' as const };
  });

  if (result.status === 'missing_invite') {
    return { ok: false, formError: "L'invitation n'existe plus." };
  }
  if (result.status === 'accepted') {
    return { ok: false, formError: 'Une invitation acceptée ne peut pas être révoquée ici.' };
  }
  if (result.status === 'already_revoked') {
    return { ok: true, message: 'Invitation déjà révoquée.' };
  }

  revalidatePath(`/${parsed.data.locale}/admin/demandes-acces/${parsed.data.requestId}`);

  return { ok: true, message: 'Invitation révoquée.' };
}

async function requirePortalInviteAdmin(): Promise<
  | { currentUser: Awaited<ReturnType<typeof requireAdmin>> }
  | PortalInviteActionResult
> {
  try {
    const currentUser = await requireAdmin();
    return { currentUser };
  } catch (error) {
    if (isAdminAuthUnavailableError(error)) {
      return {
        ok: false,
        authRequired: true,
        formError:
          "L'envoi d'invitation exige une authentification serveur configurée.",
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
}

async function buildActivationLink(locale: 'fr' | 'ar' | 'en', rawToken: string): Promise<string> {
  const headersList = await headers();
  const origin =
    headersList.get('origin') ||
    (headersList.get('host')
      ? `${headersList.get('x-forwarded-proto') ?? 'http'}://${headersList.get('host')}`
      : process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3004');
  const safeOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
  return `${safeOrigin}/${locale}/activation-client?token=${encodeURIComponent(rawToken)}`;
}

async function sendPortalInviteEmail(input: {
  to: string;
  companyName: string;
  activationLink: string;
  expiresAt: Date;
  locale: 'fr' | 'ar' | 'en';
}): Promise<'sent' | 'skipped' | 'failed'> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn('[portal-invite:email-skipped]', {
      to: input.to,
      reason: 'missing-resend-api-key',
    });
    return 'skipped';
  }

  const from =
    process.env.QUOTE_EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'Prodet Website <onboarding@resend.dev>';
  const subject = 'Activation de votre accès client Prodet';
  const expiry = new Intl.DateTimeFormat(
    input.locale === 'ar' ? 'ar-TN' : input.locale === 'en' ? 'en-GB' : 'fr-TN',
    { dateStyle: 'medium', timeStyle: 'short' },
  ).format(input.expiresAt);
  const text = [
    'Bonjour,',
    '',
    `Prodet a validé la demande d'accès client pour ${input.companyName}.`,
    'Utilisez le lien ci-dessous pour confirmer cette invitation:',
    input.activationLink,
    '',
    `Ce lien expire le ${expiry}.`,
    '',
    "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
    '',
    companyInfo.name,
  ].join('\n');
  const html = `<div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#102033">
    <p>Bonjour,</p>
    <p>Prodet a validé votre demande d'accès client.</p>
    <p><a href="${escapeHtml(input.activationLink)}" style="display:inline-block;background:#0F5DA8;color:#ffffff;padding:12px 16px;text-decoration:none;border-radius:6px;font-weight:700">Activer l'accès client</a></p>
    <p>Ce lien expire le ${escapeHtml(expiry)}.</p>
    <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
  </div>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[portal-invite:email-failed]', {
        to: input.to,
        status: response.status,
        errorText,
      });
      return 'failed';
    }

    return 'sent';
  } catch (error) {
    console.error('[portal-invite:email-error]', { to: input.to, error });
    return 'failed';
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, '&amp;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;')
    .replace(/"/gu, '&quot;')
    .replace(/'/gu, '&#39;');
}
