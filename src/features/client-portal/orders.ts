import 'server-only';
import { and, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { getSwiverAdapter, type SwiverDocumentSummary } from '@/integrations/swiver';
import { requireClientPortalAccess } from './auth';
import { getCachedCustomerOrderTotals } from './spending';
import { fetchSwiverDocuments } from './swiver-documents';

export type PortalOrderRow = {
  id: string;
  reference: string;
  status: string;
  createdAt: Date;
  lineCount: number;
  swiverPushed: boolean;
  cancellable: boolean;
  /** Real TND total from the pushed Swiver order document (null when unknown). */
  totalTtc: number | null;
  /** 'portal' = client-submitted (actionable). 'swiver' = created in Swiver (read-only). */
  origin: 'portal' | 'swiver';
};

/** A Swiver CDC state mapped onto the portal's status vocabulary. */
function swiverOrderStatus(s: SwiverDocumentSummary['status']): string {
  if (s === 'cancelled') return 'rejected';
  if (s === 'draft') return 'review';
  return 'approved';
}

/**
 * The client's orders, newest first. Always includes their portal-submitted
 * orders; with `includeSwiverSaleOrders` it ALSO merges sale orders (bons de
 * commande) created directly in Swiver — fetched LIVE and de-duplicated
 * against portal orders already pushed to Swiver. The dashboard leaves it off
 * (fast, cached totals); the Commandes page turns it on (complete + live).
 */
export async function listMyOrders(opts?: {
  includeSwiverSaleOrders?: boolean;
}): Promise<PortalOrderRow[]> {
  const access = await requireClientPortalAccess();
  const { db, schema } = await import('@/db/client');
  const rows = await db
    .select({
      id: schema.orderDraft.id,
      reference: schema.orderDraft.referenceCode,
      status: schema.orderDraft.status,
      createdAt: schema.orderDraft.createdAt,
      swiverExportStatus: schema.orderDraft.swiverExportStatus,
      swiverDocumentRef: schema.orderDraft.swiverDocumentRef,
      lineCount: sql<number>`(select count(*) from order_line where order_line.order_draft_id = ${schema.orderDraft.id})`,
    })
    .from(schema.orderDraft)
    .where(
      and(
        eq(schema.orderDraft.customerId, access.customer.id),
        eq(schema.orderDraft.source, 'portal'),
        isNull(schema.orderDraft.deletedAt),
      ),
    )
    .orderBy(desc(schema.orderDraft.createdAt))
    .limit(100);

  const wantSwiver = Boolean(opts?.includeSwiverSaleOrders && access.customer.swiverId);
  const hasPushed = rows.some((r) => r.swiverDocumentRef);

  // One source for both portal totals and native-CDC rows.
  let cdcs: SwiverDocumentSummary[] = [];
  let totals: Record<string, number> = {};
  if (wantSwiver) {
    try {
      cdcs = await fetchSwiverDocuments(access.customer.swiverId!, ['bon_de_commande'], { includeDrafts: true });
      for (const d of cdcs) if (d.swiverId && d.totalTtc != null) totals[d.swiverId] = d.totalTtc;
    } catch {
      cdcs = [];
    }
  } else if (hasPushed && access.customer.swiverId) {
    totals = await getCachedCustomerOrderTotals(access.customer.swiverId);
  }

  const portalRows: PortalOrderRow[] = rows.map((r) => ({
    id: r.id,
    reference: r.reference,
    status: r.status,
    createdAt: r.createdAt,
    lineCount: Number(r.lineCount),
    swiverPushed: r.swiverExportStatus === 'api_pushed',
    cancellable: r.status !== 'rejected' && r.status !== 'exported',
    totalTtc: r.swiverDocumentRef ? (totals[r.swiverDocumentRef] ?? null) : null,
    origin: 'portal',
  }));

  let swiverRows: PortalOrderRow[] = [];
  if (wantSwiver) {
    const pushedRefs = new Set(rows.map((r) => r.swiverDocumentRef).filter(Boolean) as string[]);
    swiverRows = cdcs
      // Confirmed sale orders only: drafts are internal WIP (and portal-pushed
      // orders, which live as drafts, are already shown via the portal rows).
      .filter((d) => d.swiverId && d.status !== 'draft' && !pushedRefs.has(d.swiverId))
      .map((d) => ({
        id: d.swiverId,
        reference: d.documentNumber || `CDC-${d.swiverId}`,
        status: swiverOrderStatus(d.status),
        createdAt: d.issueDate,
        lineCount: 0,
        swiverPushed: d.status !== 'cancelled',
        cancellable: false,
        totalTtc: d.totalTtc,
        origin: 'swiver',
      }));
  }

  return [...portalRows, ...swiverRows].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export type PortalOrderLineDetail = {
  lineNumber: number;
  name: string;
  sku: string | null;
  quantity: number;
  note: string | null;
  image: string | null;
};

export type PortalOrderDetail = PortalOrderRow & {
  lines: PortalOrderLineDetail[];
};

type RawInboundLine = {
  swiverId?: string | null;
  sku?: string | null;
  name?: string | null;
  qty?: number | null;
};

/** One of the client's own orders, with its lines (ownership-checked). */
export async function getMyOrderDetail(orderDraftId: string): Promise<PortalOrderDetail | null> {
  const access = await requireClientPortalAccess();
  const { db, schema } = await import('@/db/client');

  const [order] = await db
    .select({
      id: schema.orderDraft.id,
      reference: schema.orderDraft.referenceCode,
      status: schema.orderDraft.status,
      createdAt: schema.orderDraft.createdAt,
      swiverExportStatus: schema.orderDraft.swiverExportStatus,
      swiverDocumentRef: schema.orderDraft.swiverDocumentRef,
      rawInbound: schema.orderDraft.rawInbound,
    })
    .from(schema.orderDraft)
    .where(
      and(
        eq(schema.orderDraft.id, orderDraftId),
        eq(schema.orderDraft.customerId, access.customer.id),
        eq(schema.orderDraft.source, 'portal'),
        isNull(schema.orderDraft.deletedAt),
      ),
    )
    .limit(1);
  if (!order) return null;

  const dbLines = await db
    .select({
      lineNumber: schema.orderLine.lineNumber,
      rawText: schema.orderLine.rawText,
      quantity: schema.orderLine.quantity,
      note: schema.orderLine.notes,
    })
    .from(schema.orderLine)
    .where(eq(schema.orderLine.orderDraftId, order.id))
    .orderBy(schema.orderLine.lineNumber);

  // The quote flow stores richer line data (sku, swiverId) in raw_inbound —
  // use it to enrich names and resolve catalogue images when available.
  const raw = order.rawInbound as { lines?: RawInboundLine[] } | null;
  const rawLines = Array.isArray(raw?.lines) ? raw.lines : [];

  const skus = rawLines.map((l) => l.sku).filter((s): s is string => Boolean(s));
  const imageBySku = new Map<string, string>();
  if (skus.length > 0) {
    const products = await db
      .select({
        sku: schema.catalogueProduct.sku,
        imageUrl: schema.catalogueProduct.imageUrl,
        baseImageUrl: schema.catalogueProduct.baseImageUrl,
      })
      .from(schema.catalogueProduct)
      .where(inArray(schema.catalogueProduct.sku, skus));
    for (const p of products) {
      const img = p.imageUrl || p.baseImageUrl;
      if (p.sku && img) imageBySku.set(p.sku, img);
    }
  }

  const lines: PortalOrderLineDetail[] = dbLines.map((l, i) => {
    const rawLine = rawLines[i];
    const name = rawLine?.name?.trim() || l.rawText;
    const sku = rawLine?.sku ?? null;
    return {
      lineNumber: l.lineNumber,
      name,
      sku,
      quantity: Number(l.quantity),
      note: l.note,
      image: sku ? (imageBySku.get(sku) ?? null) : null,
    };
  });

  let totalTtc: number | null = null;
  if (order.swiverDocumentRef && access.customer.swiverId) {
    const totals = await getCachedCustomerOrderTotals(access.customer.swiverId);
    totalTtc = totals[order.swiverDocumentRef] ?? null;
  }

  return {
    id: order.id,
    reference: order.reference,
    status: order.status,
    createdAt: order.createdAt,
    lineCount: lines.length,
    swiverPushed: order.swiverExportStatus === 'api_pushed',
    cancellable: order.status !== 'rejected' && order.status !== 'exported',
    totalTtc,
    origin: 'portal',
    lines,
  };
}

export type FrequentProduct = {
  slug: string;
  name: string;
  sku: string | null;
  swiverId: string | null;
  image: string | null;
  unitPrice: number | null;
  /** How many past orders contained this product. */
  orderCount: number;
};

/**
 * The client's most frequently ordered products, derived from their past
 * portal orders' raw lines and joined against the orderable catalogue.
 */
export async function listMyFrequentProducts(limit = 8): Promise<FrequentProduct[]> {
  const access = await requireClientPortalAccess();
  const { db, schema } = await import('@/db/client');

  const drafts = await db
    .select({ rawInbound: schema.orderDraft.rawInbound, status: schema.orderDraft.status })
    .from(schema.orderDraft)
    .where(
      and(
        eq(schema.orderDraft.customerId, access.customer.id),
        eq(schema.orderDraft.source, 'portal'),
        isNull(schema.orderDraft.deletedAt),
      ),
    )
    .orderBy(desc(schema.orderDraft.createdAt))
    .limit(60);

  const counts = new Map<string, { sku: string | null; name: string; count: number }>();
  for (const draft of drafts) {
    if (draft.status === 'rejected') continue;
    const raw = draft.rawInbound as { lines?: RawInboundLine[] } | null;
    for (const line of raw?.lines ?? []) {
      const key = line.swiverId || line.sku || line.name;
      if (!key || !line.name) continue;
      const entry = counts.get(String(key));
      if (entry) entry.count += 1;
      else counts.set(String(key), { sku: line.sku ?? null, name: line.name, count: 1 });
    }
  }
  if (counts.size === 0) return [];

  const ranked = [...counts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit);

  const rows = await db
    .select({
      swiverId: schema.catalogueProduct.swiverId,
      sku: schema.catalogueProduct.sku,
      name: schema.catalogueProduct.name,
      displayName: schema.catalogueProduct.displayName,
      imageUrl: schema.catalogueProduct.imageUrl,
      baseImageUrl: schema.catalogueProduct.baseImageUrl,
      unitPrice: schema.catalogueProduct.unitPrice,
      hidden: schema.catalogueProduct.hidden,
    })
    .from(schema.catalogueProduct)
    .where(eq(schema.catalogueProduct.hidden, false));
  const byKey = new Map(rows.flatMap((r) => {
    const entries: Array<[string, typeof r]> = [];
    if (r.swiverId) entries.push([r.swiverId, r]);
    if (r.sku) entries.push([r.sku, r]);
    return entries;
  }));

  const result: FrequentProduct[] = [];
  for (const [key, info] of ranked) {
    const product = byKey.get(key) ?? (info.sku ? byKey.get(info.sku) : undefined);
    result.push({
      slug: product?.sku || product?.swiverId || key,
      name: product ? product.displayName || product.name : info.name,
      sku: product?.sku ?? info.sku,
      swiverId: product?.swiverId ?? null,
      image: product ? product.imageUrl || product.baseImageUrl || null : null,
      unitPrice: product?.unitPrice != null ? Number(product.unitPrice) : null,
      orderCount: info.count,
    });
  }
  return result;
}

/**
 * Cancel one of the client's own orders. If it was pushed to Swiver, the
 * Swiver draft is set to `to_canceled` too. Ownership-checked; audit-logged.
 */
export async function cancelMyOrder(orderDraftId: string): Promise<{ ok: boolean; swiverCanceled?: boolean }> {
  const access = await requireClientPortalAccess();
  const { db, schema } = await import('@/db/client');
  const [order] = await db
    .select({
      id: schema.orderDraft.id,
      status: schema.orderDraft.status,
      swiverDocumentRef: schema.orderDraft.swiverDocumentRef,
    })
    .from(schema.orderDraft)
    .where(
      and(
        eq(schema.orderDraft.id, orderDraftId),
        eq(schema.orderDraft.customerId, access.customer.id),
        eq(schema.orderDraft.source, 'portal'),
        isNull(schema.orderDraft.deletedAt),
      ),
    )
    .limit(1);
  if (!order) return { ok: false };
  if (order.status === 'rejected') return { ok: true };

  let swiverCanceled = false;
  if (order.swiverDocumentRef) {
    try {
      swiverCanceled = await getSwiverAdapter().documents.setDocumentState(order.swiverDocumentRef, 'to_canceled');
    } catch {
      // Still cancel on our side; admin can reconcile Swiver.
    }
  }

  const now = new Date();
  await db.update(schema.orderDraft).set({ status: 'rejected', updatedAt: now }).where(eq(schema.orderDraft.id, order.id));
  await db.insert(schema.auditLog).values({
    actorUserId: access.appUser.id,
    actorRole: access.appUser.role,
    action: 'order_draft.canceled_by_client',
    entityType: 'order_draft',
    entityId: order.id,
    diff: { swiverCanceled },
    metadata: {},
  });
  return { ok: true, swiverCanceled };
}
