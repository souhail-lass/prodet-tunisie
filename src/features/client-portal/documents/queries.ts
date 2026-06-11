import 'server-only';
import { and, desc, eq, isNull } from 'drizzle-orm';
import type { DocumentKind } from './constants';

export type CustomerDocumentRecord = {
  id: string;
  customerId: string;
  uploadedByUserId: string | null;
  uploadedByName: string | null;
  uploadedByEmail: string | null;
  kind: DocumentKind;
  storagePath: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  label: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function listCustomerDocuments(
  customerId: string,
): Promise<CustomerDocumentRecord[]> {
  const { db, schema } = await import('@/db/client');

  const rows = await db
    .select({
      id: schema.customerDocument.id,
      customerId: schema.customerDocument.customerId,
      uploadedByUserId: schema.customerDocument.uploadedByUserId,
      uploadedByName: schema.user.fullName,
      uploadedByEmail: schema.user.email,
      kind: schema.customerDocument.kind,
      storagePath: schema.customerDocument.storagePath,
      fileName: schema.customerDocument.fileName,
      mimeType: schema.customerDocument.mimeType,
      byteSize: schema.customerDocument.byteSize,
      label: schema.customerDocument.label,
      notes: schema.customerDocument.notes,
      createdAt: schema.customerDocument.createdAt,
      updatedAt: schema.customerDocument.updatedAt,
    })
    .from(schema.customerDocument)
    .leftJoin(schema.user, eq(schema.customerDocument.uploadedByUserId, schema.user.id))
    .where(
      and(
        eq(schema.customerDocument.customerId, customerId),
        isNull(schema.customerDocument.deletedAt),
      ),
    )
    .orderBy(desc(schema.customerDocument.createdAt));

  return rows.map((row) => ({
    ...row,
    byteSize: Number(row.byteSize),
    kind: row.kind as DocumentKind,
  }));
}

export async function findCustomerDocumentForOwner(params: {
  documentId: string;
  customerId: string;
}): Promise<CustomerDocumentRecord | null> {
  const { db, schema } = await import('@/db/client');

  const [row] = await db
    .select({
      id: schema.customerDocument.id,
      customerId: schema.customerDocument.customerId,
      uploadedByUserId: schema.customerDocument.uploadedByUserId,
      uploadedByName: schema.user.fullName,
      uploadedByEmail: schema.user.email,
      kind: schema.customerDocument.kind,
      storagePath: schema.customerDocument.storagePath,
      fileName: schema.customerDocument.fileName,
      mimeType: schema.customerDocument.mimeType,
      byteSize: schema.customerDocument.byteSize,
      label: schema.customerDocument.label,
      notes: schema.customerDocument.notes,
      createdAt: schema.customerDocument.createdAt,
      updatedAt: schema.customerDocument.updatedAt,
    })
    .from(schema.customerDocument)
    .leftJoin(schema.user, eq(schema.customerDocument.uploadedByUserId, schema.user.id))
    .where(
      and(
        eq(schema.customerDocument.id, params.documentId),
        eq(schema.customerDocument.customerId, params.customerId),
        isNull(schema.customerDocument.deletedAt),
      ),
    )
    .limit(1);

  if (!row) return null;
  return {
    ...row,
    byteSize: Number(row.byteSize),
    kind: row.kind as DocumentKind,
  };
}

export type AttachedDocumentRecord = {
  documentId: string;
  fileName: string;
  kind: DocumentKind;
  byteSize: number;
  mimeType: string;
  attachedAt: Date;
};

export async function listDocumentsForOrderDraft(params: {
  orderDraftId: string;
  customerId: string;
}): Promise<AttachedDocumentRecord[]> {
  const { db, schema } = await import('@/db/client');

  const rows = await db
    .select({
      documentId: schema.customerDocument.id,
      fileName: schema.customerDocument.fileName,
      kind: schema.customerDocument.kind,
      byteSize: schema.customerDocument.byteSize,
      mimeType: schema.customerDocument.mimeType,
      attachedAt: schema.orderDraftDocument.createdAt,
    })
    .from(schema.orderDraftDocument)
    .innerJoin(
      schema.customerDocument,
      eq(schema.orderDraftDocument.customerDocumentId, schema.customerDocument.id),
    )
    .where(
      and(
        eq(schema.orderDraftDocument.orderDraftId, params.orderDraftId),
        eq(schema.customerDocument.customerId, params.customerId),
        isNull(schema.customerDocument.deletedAt),
      ),
    )
    .orderBy(desc(schema.orderDraftDocument.createdAt));

  return rows.map((row) => ({
    ...row,
    byteSize: Number(row.byteSize),
    kind: row.kind as DocumentKind,
  }));
}
