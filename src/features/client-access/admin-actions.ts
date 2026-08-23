'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { resolveAuthOrigin } from '@/lib/site-origin';
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

/** Une seule décision admin : accepter (= accès envoyé) ou refuser. */
const DecisionSchema = z.object({
  requestId: z.string().uuid('invalidRequest'),
  locale: z.enum(['fr', 'en']).default('fr'),
  intent: z.enum(['accept', 'reject']),
});

export interface AccessDecisionResult {
  ok: boolean;
  authRequired?: boolean;
  forbidden?: boolean;
  formError?: string;
  message?: string;
  /** Surfaced only when the invitation email could not be delivered. */
  activationLink?: string;
  emailDelivery?: 'sent' | 'skipped' | 'failed';
}

/**
 * Accepter ou refuser une demande d'accès, en une seule action.
 *
 * « Accepter » fait tout d'un coup : la demande passe en `approved`, une
 * invitation est créée (ou re-créée), un jeton à usage unique est généré et
 * l'email d'activation part. Accepter une demande déjà acceptée renvoie une
 * nouvelle invitation — c'est le mécanisme de renvoi, sans bouton séparé.
 *
 * Le client Swiver n'est PAS créé : l'API Swiver est en lecture seule sur les
 * clients (`/open_api/customers/` → Allow: GET). Il reste à créer à la main.
 */
export async function decideAccessRequest(
  _previousState: AccessDecisionResult,
  formData: FormData,
): Promise<AccessDecisionResult> {
  const parsed = DecisionSchema.safeParse({
    requestId: readFormString(formData, 'requestId'),
    locale: readFormString(formData, 'locale') || 'fr',
    intent: readFormString(formData, 'intent'),
  });
  if (!parsed.success) return { ok: false, formError: 'Demande invalide.' };

  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (isAdminAuthUnavailableError(error)) {
      return { ok: false, authRequired: true, formError: "L'authentification admin n'est pas configurée." };
    }
    if (isUnauthenticatedAdminError(error)) {
      return { ok: false, authRequired: true, formError: 'Connectez-vous avec un compte admin Prodet.' };
    }
    if (isForbiddenAdminError(error)) {
      return { ok: false, forbidden: true, formError: "Votre compte n'a pas le rôle requis." };
    }
    throw error;
  }

  const { db, schema } = await import('@/db/client');
  const now = new Date();
  const actor = { actorUserId: admin.appUser?.id ?? null, actorRole: admin.appUser?.role ?? null };

  const [request] = await db
    .select()
    .from(schema.clientAccessRequest)
    .where(eq(schema.clientAccessRequest.id, parsed.data.requestId))
    .limit(1);
  if (!request) return { ok: false, formError: "Cette demande n'existe plus." };

  // ---------- REFUS ----------
  if (parsed.data.intent === 'reject') {
    await db.transaction(async (tx) => {
      await tx
        .update(schema.clientAccessRequest)
        .set({ status: 'rejected', reviewedAt: now, updatedAt: now })
        .where(eq(schema.clientAccessRequest.id, request.id));
      // Neutralise toute invitation encore active.
      await tx
        .update(schema.portalInvite)
        .set({ status: 'revoked', tokenHash: null, expiresAt: null, updatedAt: now })
        .where(eq(schema.portalInvite.accessRequestId, request.id));
      await tx.insert(schema.auditLog).values({
        ...actor,
        action: 'client_access_request.rejected',
        entityType: 'client_access_request',
        entityId: request.id,
        diff: { before: { status: request.status }, after: { status: 'rejected' } },
        metadata: {},
      });
    });
    revalidatePath(`/${parsed.data.locale}/admin/demandes-acces`);
    return { ok: true, message: 'Demande refusée.' };
  }

  // ---------- ACCEPTATION ----------
  const rawToken = generateInviteToken();
  const tokenHash = hashInviteToken(rawToken);
  const expiresAt = getInviteExpiresAt(now);
  const activationLink = await buildActivationLink(parsed.data.locale, rawToken);

  const invite = await db.transaction(async (tx) => {
    await tx
      .update(schema.clientAccessRequest)
      .set({ status: 'approved', reviewedAt: now, updatedAt: now })
      .where(eq(schema.clientAccessRequest.id, request.id));

    const [row] = await tx
      .insert(schema.portalInvite)
      .values({
        accessRequestId: request.id,
        email: request.email.toLowerCase(),
        companyName: request.companyName,
        status: 'sent',
        tokenHash,
        expiresAt,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: schema.portalInvite.accessRequestId,
        set: {
          email: request.email.toLowerCase(),
          companyName: request.companyName,
          status: 'sent',
          tokenHash,
          expiresAt,
          updatedAt: now,
        },
      })
      .returning();

    await tx.insert(schema.auditLog).values({
      ...actor,
      action: 'client_access_request.accepted_and_invited',
      entityType: 'client_access_request',
      entityId: request.id,
      diff: { before: { status: request.status }, after: { status: 'approved' } },
      metadata: { inviteId: row?.id ?? null, locale: parsed.data.locale },
    });

    return row ?? null;
  });

  if (!invite) return { ok: false, formError: "L'invitation n'a pas pu être créée." };

  const emailDelivery = await sendPortalInviteEmail({
    to: invite.email,
    companyName: invite.companyName,
    activationLink,
    expiresAt,
    locale: parsed.data.locale,
  });

  await db.insert(schema.auditLog).values({
    ...actor,
    action: emailDelivery === 'sent' ? 'portal_invite.email_sent' : 'portal_invite.manual_delivery_prepared',
    entityType: 'portal_invite',
    entityId: invite.id,
    metadata: { accessRequestId: request.id, emailDelivery },
  });

  revalidatePath(`/${parsed.data.locale}/admin/demandes-acces`);

  return {
    ok: true,
    emailDelivery,
    message:
      emailDelivery === 'sent'
        ? `Accès accordé — invitation envoyée à ${invite.email}.`
        : `Accès accordé, mais l'email n'est pas parti. Transmettez le lien ci-dessous.`,
    // Le lien n'est révélé que si l'email a échoué : sinon il n'a rien à faire
    // dans une réponse HTTP, c'est un secret à usage unique.
    activationLink: emailDelivery === 'sent' ? undefined : activationLink,
  };
}

function readFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === 'string' ? value : undefined;
}

async function buildActivationLink(locale: 'fr' | 'en', rawToken: string): Promise<string> {
  const origin = await resolveAuthOrigin();
  return `${origin}/${locale}/activation-client?token=${encodeURIComponent(rawToken)}`;
}

async function sendPortalInviteEmail(input: {
  to: string;
  companyName: string;
  activationLink: string;
  expiresAt: Date;
  locale: 'fr' | 'en';
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
    input.locale === 'en' ? 'en-GB' : 'fr-TN',
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
