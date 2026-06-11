import { and, asc, desc, eq, ilike, inArray, isNull, or, sql, type SQL } from 'drizzle-orm';

import {
  extractPortalRequestMetadata,
  type PortalRequestMetadata,
} from '@/features/client-portal/request-history';

export type { PortalRequestMetadata };

export const adminPortalRequestStatuses = [
  'parsing',
  'review',
  'approved',
  'exported',
  'rejected',
] as const;

export const adminPortalRequestActionStatuses = ['review', 'approved', 'rejected'] as const;

export type AdminPortalRequestStatus = (typeof adminPortalRequestStatuses)[number];
export type AdminPortalRequestActionStatus = (typeof adminPortalRequestActionStatuses)[number];
export type AdminPortalRequestStatusFilter = AdminPortalRequestStatus | 'all';

export type AdminPortalRequestLine = {
  id: string;
  lineNumber: number;
  productName: string;
  quantity: string;
  unit: string | null;
  note: string | null;
  matchedProductId: string | null;
};

export type AdminPortalRequestSummary = {
  id: string;
  referenceCode: string;
  customerName: string;
  customerEmail: string | null;
  status: AdminPortalRequestStatus;
  swiverPushed: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  lineCount: number;
  productSummary: string;
  metadata: PortalRequestMetadata;
};

export type AdminPortalRequestDetail = AdminPortalRequestSummary & {
  source: 'portal';
  swiverExportStatus: string;
  swiverDocumentRef: string | null;
  customerPhone: string | null;
  customerCity: string | null;
  customerContact: {
    name: string;
    email: string | null;
    phone: string | null;
    role: string | null;
  } | null;
  rawInbound: unknown;
  notesInternal: string | null;
  lines: AdminPortalRequestLine[];
  timeline: Array<{
    label: string;
    action: string;
    createdAt: Date;
  }>;
};

export const adminPortalStatusLabels: Record<AdminPortalRequestStatus, string> = {
  parsing: 'Brouillon',
  review: 'À vérifier',
  approved: 'Confirmée',
  exported: 'Clôturée',
  rejected: 'Annulée/refusée',
};

export const adminPortalStatusTones: Record<
  AdminPortalRequestStatus,
  'neutral' | 'info' | 'success' | 'danger'
> = {
  parsing: 'neutral',
  review: 'info',
  approved: 'success',
  exported: 'success',
  rejected: 'danger',
};

export async function listAdminPortalRequests({
  query,
  status,
}: {
  query: string;
  status: AdminPortalRequestStatusFilter;
}): Promise<AdminPortalRequestSummary[]> {
  const { db, schema } = await import('@/db/client');
  const conditions: SQL[] = [
    eq(schema.orderDraft.source, 'portal'),
    isNull(schema.orderDraft.deletedAt),
  ];

  if (status !== 'all') {
    conditions.push(eq(schema.orderDraft.status, status));
  }

  if (query) {
    const pattern = `%${escapeLike(query)}%`;
    const searchCondition = or(
      ilike(schema.orderDraft.referenceCode, pattern),
      ilike(schema.customer.name, pattern),
      ilike(schema.customer.displayName, pattern),
      ilike(schema.customer.email, pattern),
      ilike(schema.user.email, pattern),
      sql`exists (
        select 1
        from "order_line"
        where "order_line"."order_draft_id" = ${schema.orderDraft.id}
          and "order_line"."raw_text" ilike ${pattern}
      )`,
    );
    if (searchCondition) conditions.push(searchCondition);
  }

  const selectedFields = {
    id: schema.orderDraft.id,
    referenceCode: schema.orderDraft.referenceCode,
    status: schema.orderDraft.status,
    swiverExportStatus: schema.orderDraft.swiverExportStatus,
    customerSnapshot: schema.orderDraft.customerSnapshot,
    rawInbound: schema.orderDraft.rawInbound,
    notesInternal: schema.orderDraft.notesInternal,
    createdAt: schema.orderDraft.createdAt,
    updatedAt: schema.orderDraft.updatedAt,
    customerName: schema.customer.name,
    customerDisplayName: schema.customer.displayName,
    customerEmail: schema.customer.email,
    createdByFullName: schema.user.fullName,
    createdByEmail: schema.user.email,
  };

  const drafts = await db
    .select(selectedFields)
    .from(schema.orderDraft)
    .leftJoin(schema.customer, eq(schema.orderDraft.customerId, schema.customer.id))
    .leftJoin(schema.user, eq(schema.orderDraft.createdBy, schema.user.id))
    .where(and(...conditions))
    .orderBy(desc(schema.orderDraft.createdAt))
    .limit(100);

  if (drafts.length === 0) return [];

  const lines = await db
    .select({
      orderDraftId: schema.orderLine.orderDraftId,
      rawText: schema.orderLine.rawText,
      lineNumber: schema.orderLine.lineNumber,
    })
    .from(schema.orderLine)
    .where(
      inArray(
        schema.orderLine.orderDraftId,
        drafts.map((draft) => draft.id),
      ),
    )
    .orderBy(asc(schema.orderLine.lineNumber));

  const linesByDraftId = new Map<string, typeof lines>();
  lines.forEach((line) => {
    const existing = linesByDraftId.get(line.orderDraftId) ?? [];
    existing.push(line);
    linesByDraftId.set(line.orderDraftId, existing);
  });

  return drafts.map((draft) => {
    const draftLines = linesByDraftId.get(draft.id) ?? [];

    return {
      id: draft.id,
      referenceCode: draft.referenceCode,
      customerName: getCustomerName(draft),
      customerEmail: draft.customerEmail ?? readSnapshotString(draft.customerSnapshot, 'email'),
      status: draft.status,
      swiverPushed: draft.swiverExportStatus === 'api_pushed',
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      createdBy: draft.createdByFullName || draft.createdByEmail || null,
      lineCount: draftLines.length,
      productSummary: summarizeProducts(draftLines.map((line) => line.rawText)),
      metadata: extractPortalRequestMetadata(draft.rawInbound, draft.notesInternal),
    };
  });
}

export async function getAdminPortalRequestDetail(
  requestId: string,
): Promise<AdminPortalRequestDetail | null> {
  const { db, schema } = await import('@/db/client');

  const [draft] = await db
    .select({
      id: schema.orderDraft.id,
      referenceCode: schema.orderDraft.referenceCode,
      source: schema.orderDraft.source,
      status: schema.orderDraft.status,
      swiverExportStatus: schema.orderDraft.swiverExportStatus,
      swiverDocumentRef: schema.orderDraft.swiverDocumentRef,
      customerId: schema.orderDraft.customerId,
      customerSnapshot: schema.orderDraft.customerSnapshot,
      rawInbound: schema.orderDraft.rawInbound,
      notesInternal: schema.orderDraft.notesInternal,
      createdAt: schema.orderDraft.createdAt,
      updatedAt: schema.orderDraft.updatedAt,
      customerName: schema.customer.name,
      customerDisplayName: schema.customer.displayName,
      customerEmail: schema.customer.email,
      customerPhone: schema.customer.phone,
      customerCity: schema.customer.city,
      createdByFullName: schema.user.fullName,
      createdByEmail: schema.user.email,
    })
    .from(schema.orderDraft)
    .leftJoin(schema.customer, eq(schema.orderDraft.customerId, schema.customer.id))
    .leftJoin(schema.user, eq(schema.orderDraft.createdBy, schema.user.id))
    .where(
      and(
        eq(schema.orderDraft.id, requestId),
        eq(schema.orderDraft.source, 'portal'),
        isNull(schema.orderDraft.deletedAt),
      ),
    )
    .limit(1);

  if (!draft || draft.source !== 'portal') return null;

  const lines = await db
    .select({
      id: schema.orderLine.id,
      lineNumber: schema.orderLine.lineNumber,
      rawText: schema.orderLine.rawText,
      quantity: schema.orderLine.quantity,
      unit: schema.orderLine.unit,
      notes: schema.orderLine.notes,
      matchedProductId: schema.orderLine.matchedProductId,
    })
    .from(schema.orderLine)
    .where(eq(schema.orderLine.orderDraftId, draft.id))
    .orderBy(asc(schema.orderLine.lineNumber));

  const auditEvents = await db
    .select({
      action: schema.auditLog.action,
      createdAt: schema.auditLog.createdAt,
    })
    .from(schema.auditLog)
    .where(
      and(
        eq(schema.auditLog.entityType, 'order_draft'),
        eq(schema.auditLog.entityId, draft.id),
      ),
    )
    .orderBy(asc(schema.auditLog.createdAt));

  const [contact] = draft.customerId
    ? await db
        .select({
          name: schema.customerContact.name,
          email: schema.customerContact.email,
          phone: schema.customerContact.phone,
          role: schema.customerContact.role,
        })
        .from(schema.customerContact)
        .where(eq(schema.customerContact.customerId, draft.customerId))
        .orderBy(desc(schema.customerContact.isPrimary), asc(schema.customerContact.createdAt))
        .limit(1)
    : [];

  const detailLines = lines.map((line) => ({
    id: line.id,
    lineNumber: line.lineNumber,
    productName: line.rawText,
    quantity: formatQuantity(line.quantity),
    unit: line.unit,
    note: line.notes,
    matchedProductId: line.matchedProductId,
  }));
  const metadata = extractPortalRequestMetadata(draft.rawInbound, draft.notesInternal);

  return {
    id: draft.id,
    referenceCode: draft.referenceCode,
    source: 'portal',
    swiverExportStatus: draft.swiverExportStatus,
    swiverDocumentRef: draft.swiverDocumentRef,
    customerName: getCustomerName(draft),
    customerEmail: draft.customerEmail ?? readSnapshotString(draft.customerSnapshot, 'email'),
    customerPhone: draft.customerPhone ?? readSnapshotString(draft.customerSnapshot, 'phone'),
    customerCity: draft.customerCity ?? readSnapshotString(draft.customerSnapshot, 'city'),
    customerContact: contact ?? null,
    status: draft.status,
    swiverPushed: draft.swiverExportStatus === 'api_pushed',
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
    createdBy: draft.createdByFullName || draft.createdByEmail || null,
    lineCount: detailLines.length,
    productSummary: summarizeProducts(detailLines.map((line) => line.productName)),
    metadata,
    rawInbound: draft.rawInbound,
    notesInternal: draft.notesInternal,
    lines: detailLines,
    timeline: auditEvents.map((event) => ({
      label: mapAuditAction(event.action),
      action: event.action,
      createdAt: event.createdAt,
    })),
  };
}

export function normalizeAdminPortalStatusFilter(
  value: string | undefined,
): AdminPortalRequestStatusFilter {
  if (value && adminPortalRequestStatuses.includes(value as AdminPortalRequestStatus)) {
    return value as AdminPortalRequestStatus;
  }
  return 'all';
}

export function normalizeAdminPortalSearch(value: string | undefined): string {
  return value?.trim().slice(0, 120) ?? '';
}


function getCustomerName(row: {
  customerName: string | null;
  customerDisplayName: string | null;
  customerSnapshot: unknown;
}): string {
  return (
    row.customerDisplayName ||
    row.customerName ||
    readSnapshotString(row.customerSnapshot, 'displayName') ||
    readSnapshotString(row.customerSnapshot, 'name') ||
    'Client non renseigné'
  );
}

function readSnapshotString(value: unknown, key: string): string | null {
  if (!isRecord(value)) return null;
  return readString(value[key]);
}

function summarizeProducts(productNames: string[]): string {
  if (productNames.length === 0) return 'Aucun produit';
  const visible = productNames.slice(0, 3).join(', ');
  const remaining = productNames.length - 3;
  return remaining > 0 ? `${visible} +${remaining}` : visible;
}

function mapAuditAction(action: string): string {
  if (action === 'portal_request.submitted') return 'Demande envoyée par le client';
  if (action === 'portal_request.submitted_from_previous') {
    return 'Demande reprise depuis une demande précédente';
  }
  if (action === 'order_draft.status_updated') return 'Statut mis à jour par Prodet';
  return action;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatQuantity(value: string): string {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return value;
  return numberValue.toLocaleString('fr-FR', {
    maximumFractionDigits: 3,
  });
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/gu, '\\$&');
}
