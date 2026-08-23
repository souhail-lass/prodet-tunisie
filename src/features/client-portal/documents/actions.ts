'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { consumeRateLimit } from '@/lib/rate-limit';
import { requireClientPortalAccess } from '@/features/client-portal/auth';
import { isLocale, type Locale } from '@/i18n/routing';
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  DOCUMENT_KIND_LABELS,
  MAX_DOCUMENT_BYTES,
  type DocumentKind,
} from './constants';
import {
  DocumentsStorageError,
  DocumentsStorageUnavailableError,
  assertCustomerDocumentsBucketReady,
  buildCustomerDocumentStoragePath,
  createCustomerDocumentSignedUrl,
  deleteCustomerDocumentObject,
  extensionFromFileName,
  uploadCustomerDocument,
} from './storage';
import { findCustomerDocumentForOwner } from './queries';

const KIND_VALUES = Object.keys(DOCUMENT_KIND_LABELS) as DocumentKind[];

const UploadFormSchema = z.object({
  kind: z.enum(KIND_VALUES as [DocumentKind, ...DocumentKind[]]),
  label: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value ? value : undefined)),
  notes: z
    .string()
    .trim()
    .max(800)
    .optional()
    .transform((value) => (value ? value : undefined)),
  locale: z.enum(['fr', 'en']).default('fr'),
  /** Optional: attach immediately to an existing request after upload. */
  attachToOrderDraftId: z
    .string()
    .uuid()
    .optional()
    .transform((value) => value || undefined),
});

const AttachSchema = z.object({
  documentId: z.string().uuid(),
  orderDraftId: z.string().uuid(),
  locale: z.enum(['fr', 'en']).default('fr'),
});

const DetachSchema = AttachSchema;

const DeleteSchema = z.object({
  documentId: z.string().uuid(),
  locale: z.enum(['fr', 'en']).default('fr'),
});

const DownloadSchema = z.object({
  documentId: z.string().uuid(),
});

export type UploadDocumentResult =
  | { ok: true; documentId: string }
  | { ok: false; error: 'invalid' | 'too-large' | 'mime-not-allowed' | 'rate-limited' | 'unavailable' | 'failed' };

/**
 * Upload a customer document. The bytes never touch the browser bundle —
 * they arrive as multipart/form-data, go to the service-role Storage client,
 * and the resulting metadata row is owned by the calling customer.
 */
export async function uploadCustomerDocumentAction(formData: FormData): Promise<UploadDocumentResult> {
  let access;
  try {
    access = await requireClientPortalAccess();
  } catch {
    return { ok: false, error: 'failed' };
  }

  const ipLimit = await consumeRateLimit({
    scope: 'client-document-upload-ip',
    limit: 20,
    windowMs: 10 * 60_000,
  });
  if (!ipLimit.ok) return { ok: false, error: 'rate-limited' };
  const userLimit = await consumeRateLimit({
    scope: 'client-document-upload-user',
    identifier: access.appUser.id,
    limit: 40,
    windowMs: 60 * 60_000,
  });
  if (!userLimit.ok) return { ok: false, error: 'rate-limited' };

  const parsed = UploadFormSchema.safeParse({
    kind: formData.get('kind'),
    label: formData.get('label') || undefined,
    notes: formData.get('notes') || undefined,
    locale: formData.get('locale') || 'fr',
    attachToOrderDraftId: formData.get('attachToOrderDraftId') || undefined,
  });
  if (!parsed.success) return { ok: false, error: 'invalid' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'invalid' };
  }
  if (file.size > MAX_DOCUMENT_BYTES) return { ok: false, error: 'too-large' };
  if (!isAllowedMime(file.type)) return { ok: false, error: 'mime-not-allowed' };

  try {
    await assertCustomerDocumentsBucketReady();
  } catch (error) {
    if (error instanceof DocumentsStorageUnavailableError) {
      return { ok: false, error: 'unavailable' };
    }
    throw error;
  }

  const { db, schema } = await import('@/db/client');

  const documentId = crypto.randomUUID();
  const extension = extensionFromFileName(file.name);
  const storagePath = buildCustomerDocumentStoragePath({
    customerId: access.customer.id,
    documentId,
    extension,
  });

  let uploadedToStorage = false;
  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    await uploadCustomerDocument({
      storagePath,
      bytes: buffer,
      contentType: file.type,
    });
    uploadedToStorage = true;

    const now = new Date();
    await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(schema.customerDocument)
        .values({
          id: documentId,
          customerId: access.customer.id,
          uploadedByUserId: access.appUser.id,
          kind: parsed.data.kind,
          storagePath,
          fileName: file.name.slice(0, 200) || `document-${documentId}`,
          mimeType: file.type,
          byteSize: file.size,
          label: parsed.data.label ?? null,
          notes: parsed.data.notes ?? null,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: schema.customerDocument.id });
      const row = inserted[0];
      if (!row) throw new Error('customer_document insert returned no row');

      await tx.insert(schema.auditLog).values({
        actorUserId: access.appUser.id,
        actorRole: access.appUser.role,
        action: 'customer_document.uploaded',
        entityType: 'customer_document',
        entityId: row.id,
        diff: {
          kind: parsed.data.kind,
          fileName: file.name,
          mimeType: file.type,
          byteSize: file.size,
        },
        metadata: {
          customerId: access.customer.id,
          storagePath,
          label: parsed.data.label ?? null,
        },
      });

      if (parsed.data.attachToOrderDraftId) {
        const targetRows = await tx
          .select({ id: schema.orderDraft.id })
          .from(schema.orderDraft)
          .where(
            and(
              eq(schema.orderDraft.id, parsed.data.attachToOrderDraftId),
              eq(schema.orderDraft.customerId, access.customer.id),
              eq(schema.orderDraft.source, 'portal'),
              isNull(schema.orderDraft.deletedAt),
            ),
          )
          .limit(1);
        const target = targetRows[0];
        if (target) {
          await tx
            .insert(schema.orderDraftDocument)
            .values({
              orderDraftId: target.id,
              customerDocumentId: row.id,
              attachedByUserId: access.appUser.id,
              createdAt: now,
            })
            .onConflictDoNothing();
          await tx.insert(schema.auditLog).values({
            actorUserId: access.appUser.id,
            actorRole: access.appUser.role,
            action: 'customer_document.attached_to_order_draft',
            entityType: 'order_draft',
            entityId: target.id,
            diff: { documentId: row.id, kind: parsed.data.kind },
            metadata: { customerId: access.customer.id },
          });
        }
      }
    });
  } catch (error) {
    if (uploadedToStorage) {
      try {
        await deleteCustomerDocumentObject(storagePath);
      } catch {
        // Best-effort cleanup. The row insert already failed; leave the
        // object in storage for ops to clean up rather than swallow both.
      }
    }
    if (error instanceof DocumentsStorageUnavailableError) {
      return { ok: false, error: 'unavailable' };
    }
    if (error instanceof DocumentsStorageError) {
      return { ok: false, error: 'failed' };
    }
    throw error;
  }

  revalidateRelevantPaths(parsed.data.locale, parsed.data.attachToOrderDraftId);
  return { ok: true, documentId };
}

export async function deleteCustomerDocumentAction(formData: FormData): Promise<void> {
  const locale = stringOrDefault(formData.get('locale'), 'fr');
  const access = await requireClientPortalAccess();

  const parsed = DeleteSchema.safeParse({
    documentId: formData.get('documentId'),
    locale,
  });
  if (!parsed.success) {
    redirect(buildDocumentsHref(locale, 'error'));
  }

  const document = await findCustomerDocumentForOwner({
    documentId: parsed.data.documentId,
    customerId: access.customer.id,
  });
  if (!document) {
    redirect(buildDocumentsHref(locale, 'not-found'));
  }

  const { db, schema } = await import('@/db/client');
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx
      .update(schema.customerDocument)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(schema.customerDocument.id, document.id));
    await tx.insert(schema.auditLog).values({
      actorUserId: access.appUser.id,
      actorRole: access.appUser.role,
      action: 'customer_document.deleted',
      entityType: 'customer_document',
      entityId: document.id,
      diff: { fileName: document.fileName, kind: document.kind },
      metadata: { customerId: access.customer.id, storagePath: document.storagePath },
    });
  });

  try {
    await deleteCustomerDocumentObject(document.storagePath);
  } catch {
    // Soft-delete still succeeds even if the storage object cannot be
    // removed in this call (network blip). Ops can reconcile orphans later.
  }

  revalidateRelevantPaths(parsed.data.locale);
  redirect(buildDocumentsHref(locale, 'deleted'));
}

export async function attachDocumentToRequestAction(formData: FormData): Promise<void> {
  const locale = stringOrDefault(formData.get('locale'), 'fr');
  const access = await requireClientPortalAccess();
  const parsed = AttachSchema.safeParse({
    documentId: formData.get('documentId'),
    orderDraftId: formData.get('orderDraftId'),
    locale,
  });
  if (!parsed.success) redirect(buildDocumentsHref(locale, 'error'));

  const document = await findCustomerDocumentForOwner({
    documentId: parsed.data.documentId,
    customerId: access.customer.id,
  });
  if (!document) redirect(buildDocumentsHref(locale, 'not-found'));

  const { db, schema } = await import('@/db/client');

  const [target] = await db
    .select({ id: schema.orderDraft.id })
    .from(schema.orderDraft)
    .where(
      and(
        eq(schema.orderDraft.id, parsed.data.orderDraftId),
        eq(schema.orderDraft.customerId, access.customer.id),
        eq(schema.orderDraft.source, 'portal'),
        isNull(schema.orderDraft.deletedAt),
      ),
    )
    .limit(1);

  if (!target) redirect(`/${locale}/client/historique`);

  const now = new Date();
  await db.transaction(async (tx) => {
    await tx
      .insert(schema.orderDraftDocument)
      .values({
        orderDraftId: target.id,
        customerDocumentId: document.id,
        attachedByUserId: access.appUser.id,
        createdAt: now,
      })
      .onConflictDoNothing();
    await tx.insert(schema.auditLog).values({
      actorUserId: access.appUser.id,
      actorRole: access.appUser.role,
      action: 'customer_document.attached_to_order_draft',
      entityType: 'order_draft',
      entityId: target.id,
      diff: { documentId: document.id, kind: document.kind, fileName: document.fileName },
      metadata: { customerId: access.customer.id },
    });
  });

  revalidateRelevantPaths(locale, target.id);
  redirect(`/${locale}/client/historique/${target.id}`);
}

export async function detachDocumentFromRequestAction(formData: FormData): Promise<void> {
  const locale = stringOrDefault(formData.get('locale'), 'fr');
  const access = await requireClientPortalAccess();
  const parsed = DetachSchema.safeParse({
    documentId: formData.get('documentId'),
    orderDraftId: formData.get('orderDraftId'),
    locale,
  });
  if (!parsed.success) redirect(`/${locale}/client/historique`);

  const { db, schema } = await import('@/db/client');

  // Verify ownership of the draft before touching the link row. We do not
  // want a forged docId+draftId combo to detach somebody else's link.
  const [target] = await db
    .select({ id: schema.orderDraft.id })
    .from(schema.orderDraft)
    .where(
      and(
        eq(schema.orderDraft.id, parsed.data.orderDraftId),
        eq(schema.orderDraft.customerId, access.customer.id),
        eq(schema.orderDraft.source, 'portal'),
        isNull(schema.orderDraft.deletedAt),
      ),
    )
    .limit(1);
  if (!target) redirect(`/${locale}/client/historique`);

  await db
    .delete(schema.orderDraftDocument)
    .where(
      and(
        eq(schema.orderDraftDocument.orderDraftId, target.id),
        eq(schema.orderDraftDocument.customerDocumentId, parsed.data.documentId),
      ),
    );

  await db.insert(schema.auditLog).values({
    actorUserId: access.appUser.id,
    actorRole: access.appUser.role,
    action: 'customer_document.detached_from_order_draft',
    entityType: 'order_draft',
    entityId: target.id,
    diff: { documentId: parsed.data.documentId },
    metadata: { customerId: access.customer.id },
  });

  revalidateRelevantPaths(locale, target.id);
  redirect(`/${locale}/client/historique/${target.id}`);
}

/**
 * Returns a short-lived signed URL for an owned document. Never returns the
 * raw storage path; never returns a URL for a document we do not own.
 */
export async function getCustomerDocumentSignedUrlAction(input: { documentId: string }) {
  const parsed = DownloadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: 'invalid' as const };
  }
  const access = await requireClientPortalAccess();
  const document = await findCustomerDocumentForOwner({
    documentId: parsed.data.documentId,
    customerId: access.customer.id,
  });
  if (!document) return { ok: false as const, error: 'not-found' as const };

  try {
    const url = await createCustomerDocumentSignedUrl(document.storagePath, {
      downloadFileName: document.fileName,
    });
    return { ok: true as const, url };
  } catch {
    return { ok: false as const, error: 'failed' as const };
  }
}

function isAllowedMime(value: string): value is (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number] {
  return (ALLOWED_DOCUMENT_MIME_TYPES as readonly string[]).includes(value);
}

function buildDocumentsHref(locale: string, hint: string): string {
  const safeLocale = isLocale(locale) ? locale : 'fr';
  return `/${safeLocale}/client/documents?status=${encodeURIComponent(hint)}`;
}

function revalidateRelevantPaths(locale: Locale | string, orderDraftId?: string): void {
  const safeLocale = isLocale(locale) ? locale : 'fr';
  revalidatePath(`/${safeLocale}/client/documents`);
  revalidatePath(`/${safeLocale}/client`);
  if (orderDraftId) {
    revalidatePath(`/${safeLocale}/client/historique/${orderDraftId}`);
    revalidatePath(`/${safeLocale}/client/historique`);
  }
}

function stringOrDefault(value: FormDataEntryValue | null, fallback: string): string {
  if (typeof value === 'string') return value;
  return fallback;
}
