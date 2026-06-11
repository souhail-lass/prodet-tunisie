'use server';

import { revalidatePath } from 'next/cache';
import { and, asc, eq, inArray, isNull } from 'drizzle-orm';
import { generateReferenceCode } from '@/lib/reference-code';
import { consumeRateLimit, formatRetryAfterFr } from '@/lib/rate-limit';
import { requireClientPortalAccess } from './auth';
import { formatRecurrenceLabel, type PortalRecurrenceMode } from './portal-recurrence';
import type {
  PortalProductOption,
  PortalRequestPrefill,
  SubmitPortalRequestResult,
} from './request-builder.types';
import { SubmitPortalRequestSchema, type SubmitPortalRequestInput } from './request-builder.validation';
import type { Locale } from '@/i18n/routing';

export async function listPortalProductOptions(locale: Locale): Promise<PortalProductOption[]> {
  const { db, schema } = await import('@/db/client');

  const rows = await db
    .select({
      productId: schema.product.id,
      slug: schema.product.slug,
      translatedName: schema.productTranslation.name,
      nameCanonical: schema.product.nameCanonical,
      categoryNameFr: schema.category.nameFr,
      categoryNameAr: schema.category.nameAr,
      categoryNameEn: schema.category.nameEn,
      conditionnement: schema.product.conditionnement,
      unitOfSale: schema.product.unitOfSale,
    })
    .from(schema.product)
    .leftJoin(
      schema.productTranslation,
      and(
        eq(schema.productTranslation.productId, schema.product.id),
        eq(schema.productTranslation.locale, locale),
      ),
    )
    .leftJoin(schema.category, eq(schema.product.categoryId, schema.category.id))
    .where(isNull(schema.product.deletedAt))
    .orderBy(asc(schema.category.displayOrder), asc(schema.product.nameCanonical));

  return rows.map((row) => ({
    productId: row.productId,
    slug: row.slug,
    productName: row.translatedName || row.nameCanonical,
    categoryName: getCategoryName(row, locale),
    conditionnement: row.conditionnement,
    unitOfSale: row.unitOfSale,
  }));
}

export async function getPortalRequestPrefill({
  customerId,
  requestId,
  locale,
}: {
  customerId: string;
  requestId: string;
  locale: Locale;
}): Promise<PortalRequestPrefill | null> {
  const { db, schema } = await import('@/db/client');

  const [draft] = await db
    .select({
      id: schema.orderDraft.id,
      referenceCode: schema.orderDraft.referenceCode,
    })
    .from(schema.orderDraft)
    .where(
      and(
        eq(schema.orderDraft.id, requestId),
        eq(schema.orderDraft.customerId, customerId),
        eq(schema.orderDraft.source, 'portal'),
        isNull(schema.orderDraft.deletedAt),
      ),
    )
    .limit(1);

  if (!draft) return null;

  const rows = await db
    .select({
      productId: schema.product.id,
      slug: schema.product.slug,
      translatedName: schema.productTranslation.name,
      nameCanonical: schema.product.nameCanonical,
      categoryNameFr: schema.category.nameFr,
      categoryNameAr: schema.category.nameAr,
      categoryNameEn: schema.category.nameEn,
      conditionnement: schema.product.conditionnement,
      unitOfSale: schema.product.unitOfSale,
      quantity: schema.orderLine.quantity,
      note: schema.orderLine.notes,
    })
    .from(schema.orderLine)
    .innerJoin(schema.product, eq(schema.orderLine.matchedProductId, schema.product.id))
    .leftJoin(
      schema.productTranslation,
      and(
        eq(schema.productTranslation.productId, schema.product.id),
        eq(schema.productTranslation.locale, locale),
      ),
    )
    .leftJoin(schema.category, eq(schema.product.categoryId, schema.category.id))
    .where(
      and(eq(schema.orderLine.orderDraftId, draft.id), isNull(schema.product.deletedAt)),
    )
    .orderBy(asc(schema.orderLine.lineNumber));

  return {
    sourceRequestId: draft.id,
    referenceCode: draft.referenceCode,
    lines: rows.map((row) => ({
      productId: row.productId,
      slug: row.slug,
      productName: row.translatedName || row.nameCanonical,
      categoryName: getCategoryName(row, locale),
      conditionnement: row.conditionnement,
      unitOfSale: row.unitOfSale,
      quantity: parseQuantity(row.quantity),
      note: row.note,
    })),
  };
}

export async function submitPortalRequest(
  input: SubmitPortalRequestInput,
): Promise<SubmitPortalRequestResult> {
  const parsed = SubmitPortalRequestSchema.safeParse(input);

  if (!parsed.success) {
    const flat = parsed.error.flatten((issue) => issue.message);
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(flat.fieldErrors)) {
      if (value && value.length > 0) fieldErrors[key] = value;
    }
    if (flat.formErrors.length > 0) fieldErrors._root = flat.formErrors;

    const recurrenceHint = parsed.error.issues.some(
      (issue) =>
        issue.path[0] === 'recurrenceDetail' && issue.message === 'recurrenceCustomRequired',
    );

    return {
      ok: false,
      fieldErrors,
      formError: recurrenceHint
        ? 'Précisez la cadence de livraison (champ obligatoire).'
        : 'Vérifiez les lignes produit et quantités.',
    };
  }

  const access = await requireClientPortalAccess();
  if (access.membership.role === 'viewer') {
    return {
      ok: false,
      formError: "Votre accès ne permet pas d'envoyer une demande.",
    };
  }

  const limit = await consumeRateLimit({
    scope: 'portal-request',
    limit: 10,
    windowMs: 5 * 60_000,
    identifier: access.appUser.id,
  });
  if (!limit.ok) {
    return {
      ok: false,
      formError: `Trop de demandes récentes. Réessayez dans ${formatRetryAfterFr(limit.retryAfterMs)}.`,
    };
  }

  const { db, schema } = await import('@/db/client');
  const productIds = parsed.data.lines.map((line) => line.productId);
  const now = new Date();

  if (parsed.data.duplicatedFromOrderDraftId) {
    const [sourceRequest] = await db
      .select({ id: schema.orderDraft.id })
      .from(schema.orderDraft)
      .where(
        and(
          eq(schema.orderDraft.id, parsed.data.duplicatedFromOrderDraftId),
          eq(schema.orderDraft.customerId, access.customer.id),
          eq(schema.orderDraft.source, 'portal'),
          isNull(schema.orderDraft.deletedAt),
        ),
      )
      .limit(1);

    if (!sourceRequest) {
      return {
        ok: false,
        formError: "La demande reprise n'est plus disponible pour ce compte.",
      };
    }
  }

  const products = await db
    .select({
      productId: schema.product.id,
      slug: schema.product.slug,
      translatedName: schema.productTranslation.name,
      nameCanonical: schema.product.nameCanonical,
      unitOfSale: schema.product.unitOfSale,
      conditionnement: schema.product.conditionnement,
      categoryNameFr: schema.category.nameFr,
      categoryNameAr: schema.category.nameAr,
      categoryNameEn: schema.category.nameEn,
    })
    .from(schema.product)
    .leftJoin(
      schema.productTranslation,
      and(
        eq(schema.productTranslation.productId, schema.product.id),
        eq(schema.productTranslation.locale, parsed.data.locale),
      ),
    )
    .leftJoin(schema.category, eq(schema.product.categoryId, schema.category.id))
    .where(and(inArray(schema.product.id, productIds), isNull(schema.product.deletedAt)));

  const productsById = new Map(products.map((product) => [product.productId, product]));
  if (productsById.size !== productIds.length) {
    return {
      ok: false,
      formError:
        "Un produit sélectionné n'est plus disponible. Retirez-le puis réessayez.",
    };
  }

  const referenceCode = generateReferenceCode('ORD');
  const recurrenceSummary =
    summarizeRecurrenceForStorage(parsed.data.recurrenceMode, parsed.data.recurrenceDetail) ??
    undefined;
  const notesInternal = buildRequestNotes({
    deliveryText: parsed.data.deliveryText,
    preferredTiming: parsed.data.preferredTiming,
    message: parsed.data.message,
    recurrenceSummary,
  });

  const result = await db.transaction(async (tx) => {
    const [draft] = await tx
      .insert(schema.orderDraft)
      .values({
        referenceCode,
        customerId: access.customer.id,
        customerSnapshot: {
          id: access.customer.id,
          name: access.customer.name,
          displayName: access.customer.displayName,
          email: access.customer.email,
          phone: access.customer.phone,
          city: access.customer.city,
          sectorKey: access.customer.sectorKey,
        },
        source: 'portal',
        status: 'review',
        swiverExportStatus: 'none',
        rawInbound: {
          kind: 'portal_request',
          locale: parsed.data.locale,
          submittedByAppUserId: access.appUser.id,
          submittedByEmail: access.appUser.email,
          customerId: access.customer.id,
          deliveryText: parsed.data.deliveryText || null,
          preferredTiming: parsed.data.preferredTiming || null,
          message: parsed.data.message || null,
          recurrenceMode: parsed.data.recurrenceMode,
          recurrenceDetail: parsed.data.recurrenceDetail?.trim() || null,
          recurrenceSummary: recurrenceSummary ?? null,
          lineCount: parsed.data.lines.length,
          duplicatedFromOrderDraftId: parsed.data.duplicatedFromOrderDraftId || null,
        },
        notesInternal,
        createdBy: access.appUser.id,
        updatedAt: now,
      })
      .returning();

    if (!draft) return null;

    await tx.insert(schema.orderLine).values(
      parsed.data.lines.map((line, index) => {
        const product = productsById.get(line.productId);
        if (!product) {
          throw new Error('Validated product disappeared during portal request creation.');
        }

        const productName = product.translatedName || product.nameCanonical;

        return {
          orderDraftId: draft.id,
          lineNumber: index + 1,
          rawText: productName,
          quantity: String(line.quantity),
          unit: product.unitOfSale,
          matchedProductId: product.productId,
          matchConfidence: '1.000',
          candidates: {
            source: 'client_portal_selection',
            productName,
            conditionnement: product.conditionnement,
            categoryName: getCategoryName(product, parsed.data.locale),
          },
          notes: line.note || null,
          updatedAt: now,
        };
      }),
    );

    await tx.insert(schema.auditLog).values({
      actorUserId: access.appUser.id,
      actorRole: access.appUser.role,
      action: 'portal_request.submitted',
      entityType: 'order_draft',
      entityId: draft.id,
      diff: {
        referenceCode: draft.referenceCode,
        source: draft.source,
        status: draft.status,
        swiverExportStatus: draft.swiverExportStatus,
        lineCount: parsed.data.lines.length,
      },
      metadata: {
        locale: parsed.data.locale,
        customerId: access.customer.id,
        userCustomerRole: access.membership.role,
        duplicatedFromOrderDraftId: parsed.data.duplicatedFromOrderDraftId || null,
      },
    });

    if (parsed.data.duplicatedFromOrderDraftId) {
      await tx.insert(schema.auditLog).values({
        actorUserId: access.appUser.id,
        actorRole: access.appUser.role,
        action: 'portal_request.submitted_from_previous',
        entityType: 'order_draft',
        entityId: draft.id,
        diff: {
          newReferenceCode: draft.referenceCode,
          duplicatedFromOrderDraftId: parsed.data.duplicatedFromOrderDraftId,
          lineCount: parsed.data.lines.length,
        },
        metadata: {
          locale: parsed.data.locale,
          customerId: access.customer.id,
          sourceRequestId: parsed.data.duplicatedFromOrderDraftId,
        },
      });
    }

    return draft;
  });

  if (!result) {
    return {
      ok: false,
      formError: "La demande n'a pas pu être créée. Réessayez dans quelques instants.",
    };
  }

  revalidatePath(`/${parsed.data.locale}/client`);
  revalidatePath(`/${parsed.data.locale}/client/nouvelle-demande`);
  revalidatePath(`/${parsed.data.locale}/client/historique`);

  return {
    ok: true,
    referenceCode: result.referenceCode,
    orderDraftId: result.id,
  };
}

function getCategoryName(
  row: {
    categoryNameFr: string | null;
    categoryNameAr: string | null;
    categoryNameEn: string | null;
  },
  locale: Locale,
): string | null {
  if (locale === 'ar') return row.categoryNameAr || row.categoryNameFr;
  if (locale === 'en') return row.categoryNameEn || row.categoryNameFr;
  return row.categoryNameFr;
}

function parseQuantity(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.max(1, Math.min(9999, Math.trunc(parsed)));
}

function buildRequestNotes({
  deliveryText,
  preferredTiming,
  message,
  recurrenceSummary,
}: {
  deliveryText?: string;
  preferredTiming?: string;
  message?: string;
  recurrenceSummary?: string;
}): string {
  const lines = [
    'Demande portail client.',
    deliveryText ? `Zone ou adresse souhaitée: ${deliveryText}` : null,
    preferredTiming ? `Délai souhaité: ${preferredTiming}` : null,
    recurrenceSummary ? `Cadence livraisons: ${recurrenceSummary}` : null,
    message ? `Message client: ${message}` : null,
  ].filter(Boolean);

  return lines.join('\n');
}

function summarizeRecurrenceForStorage(mode: PortalRecurrenceMode, detail: string | undefined) {
  return formatRecurrenceLabel(mode, detail);
}
