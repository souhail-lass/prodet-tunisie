import { and, asc, desc, eq, inArray, isNull } from 'drizzle-orm';

import { formatRecurrenceLabel } from './portal-recurrence';

export type PortalOrderStatus = 'parsing' | 'review' | 'approved' | 'exported' | 'rejected';

export type PortalRequestMetadata = {
  deliveryText: string | null;
  preferredTiming: string | null;
  message: string | null;
  recurrenceSummary: string | null;
  duplicatedFromOrderDraftId: string | null;
};

export type PortalRequestLine = {
  id: string;
  lineNumber: number;
  productName: string;
  quantity: string;
  unit: string | null;
  note: string | null;
};

export type PortalRequestSummary = {
  id: string;
  referenceCode: string;
  createdAt: Date;
  updatedAt: Date;
  status: PortalOrderStatus;
  lineCount: number;
  productSummary: string;
  metadata: PortalRequestMetadata;
};

export type PortalRequestDetail = PortalRequestSummary & {
  lines: PortalRequestLine[];
  timeline: PortalRequestTimelineEvent[];
  copyText: string;
};

export type PortalRequestOverview = {
  count: number;
  lastRequest: {
    id: string;
    referenceCode: string;
    status: PortalOrderStatus;
    createdAt: Date;
  } | null;
};

export type PortalRequestTimelineEvent = {
  label: string;
  createdAt: Date;
};

export const portalStatusLabels: Record<PortalOrderStatus, string> = {
  parsing: 'Brouillon',
  review: 'Envoyée à Prodet',
  approved: 'Confirmée',
  exported: 'Clôturée',
  rejected: 'Annulée/refusée',
};

export const portalStatusTones: Record<PortalOrderStatus, 'neutral' | 'info' | 'success' | 'danger'> =
  {
    parsing: 'neutral',
    review: 'info',
    approved: 'success',
    exported: 'success',
    rejected: 'danger',
  };

export async function getPortalRequestOverview(customerId: string): Promise<PortalRequestOverview> {
  const summaries = await listPortalRequestSummaries(customerId);
  const lastRequest = summaries[0] ?? null;

  return {
    count: summaries.length,
    lastRequest: lastRequest
      ? {
          id: lastRequest.id,
          referenceCode: lastRequest.referenceCode,
          status: lastRequest.status,
          createdAt: lastRequest.createdAt,
        }
      : null,
  };
}

export async function listPortalRequestSummaries(
  customerId: string,
): Promise<PortalRequestSummary[]> {
  const { db, schema } = await import('@/db/client');

  const drafts = await db
    .select()
    .from(schema.orderDraft)
    .where(
      and(
        eq(schema.orderDraft.customerId, customerId),
        eq(schema.orderDraft.source, 'portal'),
        isNull(schema.orderDraft.deletedAt),
      ),
    )
    .orderBy(desc(schema.orderDraft.createdAt));

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
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      status: draft.status,
      lineCount: draftLines.length,
      productSummary: summarizeProducts(draftLines.map((line) => line.rawText)),
      metadata: extractPortalRequestMetadata(draft.rawInbound, draft.notesInternal),
    };
  });
}

export async function getPortalRequestDetail({
  customerId,
  requestId,
}: {
  customerId: string;
  requestId: string;
}): Promise<PortalRequestDetail | null> {
  const { db, schema } = await import('@/db/client');

  const [draft] = await db
    .select()
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

  const lines = await db
    .select({
      id: schema.orderLine.id,
      lineNumber: schema.orderLine.lineNumber,
      rawText: schema.orderLine.rawText,
      quantity: schema.orderLine.quantity,
      unit: schema.orderLine.unit,
      notes: schema.orderLine.notes,
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

  const metadata = extractPortalRequestMetadata(draft.rawInbound, draft.notesInternal);
  const detailLines = lines.map((line) => ({
    id: line.id,
    lineNumber: line.lineNumber,
    productName: line.rawText,
    quantity: formatQuantity(line.quantity),
    unit: line.unit,
    note: line.notes,
  }));

  const summary: PortalRequestSummary = {
    id: draft.id,
    referenceCode: draft.referenceCode,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
    status: draft.status,
    lineCount: detailLines.length,
    productSummary: summarizeProducts(detailLines.map((line) => line.productName)),
    metadata,
  };

  return {
    ...summary,
    lines: detailLines,
    timeline: buildTimeline({
      status: draft.status,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      approvedAt: draft.approvedAt,
      exportedAt: draft.exportedAt,
      rejectedAt: draft.rejectedAt,
      auditEvents,
    }),
    copyText: buildErpCopyText({
      referenceCode: draft.referenceCode,
      createdAt: draft.createdAt,
      status: draft.status,
      metadata,
      lines: detailLines,
    }),
  };
}

export function extractPortalRequestMetadata(
  rawInbound: unknown,
  notesInternal: string | null,
): PortalRequestMetadata {
  const inbound = isRecord(rawInbound) ? rawInbound : {};

  const inboundRecurrenceSummary = readString(inbound.recurrenceSummary);
  const recurrenceFromFields =
    inboundRecurrenceSummary ||
    formatRecurrenceLabel(readString(inbound.recurrenceMode) ?? 'once', readString(inbound.recurrenceDetail));

  return {
    deliveryText:
      readString(inbound.deliveryText) ||
      extractPrefixedLine(notesInternal, 'Zone ou adresse souhaitée:'),
    preferredTiming:
      readString(inbound.preferredTiming) ||
      extractPrefixedLine(notesInternal, 'Délai souhaité:'),
    message:
      readString(inbound.message) ||
      extractPrefixedLine(notesInternal, 'Message client:'),
    recurrenceSummary:
      recurrenceFromFields ||
      extractPrefixedLine(notesInternal, 'Cadence livraisons:'),
    duplicatedFromOrderDraftId: readString(inbound.duplicatedFromOrderDraftId),
  };
}

function buildTimeline({
  status,
  createdAt,
  updatedAt,
  approvedAt,
  exportedAt,
  rejectedAt,
  auditEvents,
}: {
  status: PortalOrderStatus;
  createdAt: Date;
  updatedAt: Date;
  approvedAt: Date | null;
  exportedAt: Date | null;
  rejectedAt: Date | null;
  auditEvents: Array<{ action: string; createdAt: Date }>;
}): PortalRequestTimelineEvent[] {
  const events: PortalRequestTimelineEvent[] = [
    {
      label: 'Demande envoyée à Prodet',
      createdAt,
    },
  ];

  auditEvents.forEach((event) => {
    const label = mapAuditAction(event.action);
    if (!label) return;
    const alreadyListed = events.some(
      (existing) =>
        existing.label === label &&
        Math.abs(existing.createdAt.getTime() - event.createdAt.getTime()) < 1000,
    );
    if (!alreadyListed) events.push({ label, createdAt: event.createdAt });
  });

  if (status === 'approved' && approvedAt) {
    events.push({ label: 'Demande confirmée par Prodet', createdAt: approvedAt });
  }
  if (status === 'exported' && exportedAt) {
    events.push({ label: 'Demande clôturée par Prodet', createdAt: exportedAt });
  }
  if (status === 'rejected' && rejectedAt) {
    events.push({ label: 'Demande annulée ou refusée', createdAt: rejectedAt });
  }
  if (updatedAt.getTime() !== createdAt.getTime() && events.length === 1) {
    events.push({ label: 'Statut mis à jour', createdAt: updatedAt });
  }

  return events.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

function mapAuditAction(action: string): string | null {
  if (action === 'portal_request.submitted') return 'Demande envoyée à Prodet';
  if (action === 'portal_request.submitted_from_previous') {
    return 'Demande reprise depuis une demande précédente';
  }
  if (action === 'order_draft.status_updated') return 'Statut mis à jour par Prodet';
  return null;
}

function buildErpCopyText({
  referenceCode,
  createdAt,
  status,
  metadata,
  lines,
}: {
  referenceCode: string;
  createdAt: Date;
  status: PortalOrderStatus;
  metadata: PortalRequestMetadata;
  lines: PortalRequestLine[];
}): string {
  const content = [
    'Fournisseur: Prodet',
    `Référence demande: ${referenceCode}`,
    `Date: ${formatDateForCopy(createdAt)}`,
    `Statut: ${portalStatusLabels[status]}`,
    metadata.deliveryText ? `Zone/adresse: ${metadata.deliveryText}` : null,
    metadata.preferredTiming ? `Délai souhaité: ${metadata.preferredTiming}` : null,
    metadata.recurrenceSummary ? `Cadence livraisons: ${metadata.recurrenceSummary}` : null,
    metadata.message ? `Message: ${metadata.message}` : null,
    '',
    'Produits:',
    ...lines.map((line) => {
      const unit = line.unit ? ` ${line.unit}` : '';
      const note = line.note ? ` | Note: ${line.note}` : '';
      return `${line.lineNumber}. ${line.productName} - Qté: ${line.quantity}${unit}${note}`;
    }),
  ].filter((line): line is string => line !== null);

  return content.join('\n');
}

export function summarizeProducts(productNames: string[]): string {
  if (productNames.length === 0) return 'Aucun produit';
  const visible = productNames.slice(0, 3).join(', ');
  const remaining = productNames.length - 3;
  return remaining > 0 ? `${visible} +${remaining}` : visible;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function extractPrefixedLine(value: string | null, prefix: string): string | null {
  if (!value) return null;
  const match = value
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith(prefix));

  return match ? match.slice(prefix.length).trim() || null : null;
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

function formatDateForCopy(value: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}
