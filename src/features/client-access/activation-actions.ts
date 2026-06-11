'use server';

import { revalidatePath } from 'next/cache';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { consumeRateLimit, formatRetryAfterFr } from '@/lib/rate-limit';
import { hashInviteToken, normalizeInviteToken } from './invite-token';

const AcceptInviteSchema = z.object({
  token: z.string().trim().min(32, 'invalidToken').max(256, 'invalidToken'),
  locale: z.enum(['fr', 'ar', 'en']).default('fr'),
});

export type ActivationState =
  | { status: 'missing' }
  | { status: 'invalid' }
  | { status: 'expired' }
  | { status: 'revoked' }
  | { status: 'accepted' }
  | { status: 'valid'; expiresAt: Date };

export interface AcceptInviteResult {
  ok: boolean;
  accepted?: boolean;
  formError?: string;
  message?: string;
}

export async function getPortalInviteActivationState(
  rawToken: string | null | undefined,
): Promise<ActivationState> {
  const token = normalizeInviteToken(rawToken);
  if (!token) return { status: rawToken ? 'invalid' : 'missing' };

  const { db, schema } = await import('@/db/client');
  const [invite] = await db
    .select()
    .from(schema.portalInvite)
    .where(eq(schema.portalInvite.tokenHash, hashInviteToken(token)))
    .limit(1);

  if (!invite) return { status: 'invalid' };
  if (invite.status === 'revoked') return { status: 'revoked' };
  if (invite.status === 'accepted') return { status: 'accepted' };
  if (invite.status !== 'sent' || !invite.expiresAt) return { status: 'invalid' };
  if (invite.expiresAt.getTime() <= Date.now()) return { status: 'expired' };

  return { status: 'valid', expiresAt: invite.expiresAt };
}

export async function acceptPortalInvite(
  _previousState: AcceptInviteResult,
  formData: FormData,
): Promise<AcceptInviteResult> {
  const limit = await consumeRateLimit({
    scope: 'accept-invite',
    limit: 10,
    windowMs: 10 * 60_000,
  });
  if (!limit.ok) {
    return {
      ok: false,
      formError: `Trop de tentatives. Réessayez dans ${formatRetryAfterFr(limit.retryAfterMs)}.`,
    };
  }

  const parsed = AcceptInviteSchema.safeParse({
    token: readFormString(formData, 'token'),
    locale: readFormString(formData, 'locale') || 'fr',
  });

  if (!parsed.success) {
    return { ok: false, formError: "Le lien d'activation n'est pas valide." };
  }

  const tokenHash = hashInviteToken(parsed.data.token);
  const { db, schema } = await import('@/db/client');
  const now = new Date();

  const result = await db.transaction(async (tx) => {
    const [invite] = await tx
      .select()
      .from(schema.portalInvite)
      .where(eq(schema.portalInvite.tokenHash, tokenHash))
      .limit(1);

    if (!invite) return { status: 'invalid' as const };
    if (invite.status === 'revoked') return { status: 'revoked' as const };
    if (invite.status === 'accepted') return { status: 'accepted' as const };
    if (invite.status !== 'sent' || !invite.expiresAt) return { status: 'invalid' as const };

    if (invite.expiresAt.getTime() <= now.getTime()) {
      const [expiredInvite] = await tx
        .update(schema.portalInvite)
        .set({
          status: 'expired',
          tokenHash: null,
          updatedAt: now,
        })
        .where(eq(schema.portalInvite.id, invite.id))
        .returning();

      if (expiredInvite) {
        await tx.insert(schema.auditLog).values({
          action: 'portal_invite.expired',
          entityType: 'portal_invite',
          entityId: expiredInvite.id,
          diff: {
            before: {
              status: invite.status,
              tokenHashPresent: Boolean(invite.tokenHash),
            },
            after: {
              status: expiredInvite.status,
              tokenHashPresent: Boolean(expiredInvite.tokenHash),
            },
          },
          metadata: {
            locale: parsed.data.locale,
            accessRequestId: expiredInvite.accessRequestId,
          },
        });
      }

      return { status: 'expired' as const };
    }

    const [request] = await tx
      .select()
      .from(schema.clientAccessRequest)
      .where(eq(schema.clientAccessRequest.id, invite.accessRequestId))
      .limit(1);

    if (!request || request.status !== 'approved') {
      return { status: 'invalid' as const };
    }

    const email = invite.email.trim().toLowerCase();

    const [existingUser] = await tx
      .select()
      .from(schema.user)
      .where(sql`lower(${schema.user.email}) = ${email}`)
      .limit(1);

    if (existingUser && existingUser.role !== 'customer_user') {
      return { status: 'email_role_conflict' as const };
    }

    const [customerByEmail] = await tx
      .select()
      .from(schema.customer)
      .where(sql`lower(${schema.customer.email}) = ${email}`)
      .limit(1);

    const customer =
      customerByEmail ??
      (
        await tx
          .insert(schema.customer)
          .values({
            name: request.companyName,
            displayName: request.companyName,
            email,
            phone: request.phone,
            city: request.cityOrZone,
            sectorKey: request.sector,
            status: 'active',
            needsReview: true,
            notesInternal: buildCustomerNotes(request.prodetReferenceOptional),
            updatedAt: now,
          })
          .returning()
      )[0];

    if (!customer) return { status: 'invalid' as const };

    if (!customerByEmail) {
      await tx.insert(schema.customerContact).values({
        customerId: customer.id,
        name: request.name,
        role: 'Contact portail',
        email,
        phone: request.phone,
        isPrimary: true,
      });

      await tx.insert(schema.auditLog).values({
        action: 'customer.created_from_portal_invite',
        entityType: 'customer',
        entityId: customer.id,
        diff: {
          name: customer.name,
          email: customer.email,
          status: customer.status,
          needsReview: customer.needsReview,
        },
        metadata: {
          locale: parsed.data.locale,
          accessRequestId: request.id,
          portalInviteId: invite.id,
        },
      });
    } else {
      await tx
        .update(schema.customer)
        .set({
          phone: customer.phone || request.phone,
          city: customer.city || request.cityOrZone,
          sectorKey: customer.sectorKey || request.sector,
          updatedAt: now,
        })
        .where(eq(schema.customer.id, customer.id));

      await tx.insert(schema.auditLog).values({
        action: 'customer.linked_from_portal_invite',
        entityType: 'customer',
        entityId: customer.id,
        metadata: {
          locale: parsed.data.locale,
          accessRequestId: request.id,
          portalInviteId: invite.id,
        },
      });
    }

    const appUser =
      existingUser ??
      (
        await tx
          .insert(schema.user)
          .values({
            email,
            fullName: request.name,
            role: 'customer_user',
            defaultLocale: parsed.data.locale,
            isActive: true,
            updatedAt: now,
          })
          .returning()
      )[0];

    if (!appUser) return { status: 'invalid' as const };

    if (!existingUser) {
      await tx.insert(schema.auditLog).values({
        action: 'app_user.created_from_portal_invite',
        entityType: 'app_user',
        entityId: appUser.id,
        diff: {
          email: appUser.email,
          role: appUser.role,
          isActive: appUser.isActive,
        },
        metadata: {
          locale: parsed.data.locale,
          accessRequestId: request.id,
          portalInviteId: invite.id,
          customerId: customer.id,
        },
      });
    }

    const [existingMembership] = await tx
      .select()
      .from(schema.userCustomer)
      .where(
        sql`${schema.userCustomer.userId} = ${appUser.id} and ${schema.userCustomer.customerId} = ${customer.id}`,
      )
      .limit(1);

    if (!existingMembership) {
      await tx.insert(schema.userCustomer).values({
        userId: appUser.id,
        customerId: customer.id,
        role: 'owner',
      });

      await tx.insert(schema.auditLog).values({
        action: 'user_customer.linked_from_portal_invite',
        entityType: 'customer',
        entityId: customer.id,
        diff: {
          userId: appUser.id,
          customerId: customer.id,
          role: 'owner',
        },
        metadata: {
          locale: parsed.data.locale,
          accessRequestId: request.id,
          portalInviteId: invite.id,
        },
      });
    }

    const [acceptedInvite] = await tx
      .update(schema.portalInvite)
      .set({
        status: 'accepted',
        tokenHash: null,
        updatedAt: now,
      })
      .where(eq(schema.portalInvite.id, invite.id))
      .returning();

    if (!acceptedInvite) return { status: 'invalid' as const };

    await tx.insert(schema.auditLog).values({
      action: 'portal_invite.accepted',
      entityType: 'portal_invite',
      entityId: acceptedInvite.id,
      diff: {
        before: {
          status: invite.status,
          tokenHashPresent: Boolean(invite.tokenHash),
        },
        after: {
          status: acceptedInvite.status,
          tokenHashPresent: Boolean(acceptedInvite.tokenHash),
        },
      },
      metadata: {
        locale: parsed.data.locale,
        accessRequestId: acceptedInvite.accessRequestId,
        customerId: customer.id,
        appUserId: appUser.id,
      },
    });

    await tx.insert(schema.auditLog).values({
      action: 'client_portal.activated',
      entityType: 'customer',
      entityId: customer.id,
      metadata: {
        locale: parsed.data.locale,
        accessRequestId: request.id,
        portalInviteId: acceptedInvite.id,
        appUserId: appUser.id,
      },
    });

    return { status: 'accepted_now' as const };
  });

  revalidatePath(`/${parsed.data.locale}/activation-client`);

  if (result.status === 'accepted_now') {
    return {
      ok: true,
      accepted: true,
      message:
        "Invitation acceptée. Vous pouvez maintenant demander un lien magique avec l'email invité.",
    };
  }
  if (result.status === 'expired') {
    return { ok: false, formError: "Ce lien d'activation a expiré." };
  }
  if (result.status === 'revoked') {
    return { ok: false, formError: "Cette invitation a été révoquée par Prodet." };
  }
  if (result.status === 'accepted') {
    return { ok: false, formError: 'Cette invitation a déjà été acceptée.' };
  }
  if (result.status === 'email_role_conflict') {
    return {
      ok: false,
      formError:
        "Cet email est déjà associé à un compte Prodet interne. Contactez Prodet pour activer l'accès client.",
    };
  }

  return { ok: false, formError: "Le lien d'activation n'est pas valide." };
}

function buildCustomerNotes(reference: string | null): string {
  const lines = ['Client créé depuis invitation portail Prodet.'];
  if (reference) {
    lines.push(`Référence fournie: ${reference}`);
  }
  lines.push('Lien Swiver non créé automatiquement.');
  return lines.join('\n');
}

function readFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === 'string' ? value : undefined;
}
