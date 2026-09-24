import 'server-only';
import { unstable_cache } from 'next/cache';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { getOrderableCatalogue } from '@/features/catalogue/queries';
import { getSwiverAdapter } from '@/integrations/swiver';
import { requireClientPortalAccess } from './auth';
import { resolveCurrentPortalSwiverIdentity } from './swiver-identity';

export type HabitualProduct = {
  slug: string;
  name: string;
  sku: string | null;
  swiverId: string | null;
  image: string | null;
  unitPrice: number | null;
  /** Human hint e.g. "8 factures · vu il y a 12 j". */
  hint: string;
  score: number;
  invoiceCount: number;
  portalCount: number;
  totalQty: number;
};

type RawInboundLine = {
  sku?: string | null;
  swiverId?: string | null;
  name?: string | null;
  quantity?: number | null;
};

type Agg = {
  key: string;
  swiverId: string | null;
  sku: string | null;
  name: string;
  invoiceAppearances: number;
  portalAppearances: number;
  totalQty: number;
  lastSeenMs: number;
};

const MS_DAY = 86_400_000;
/** Fewer docs = fewer Swiver RTTs on cold habituels (was 18). */
const INVOICE_SCAN_LIMIT = 8;
const DOC_CONCURRENCY = 6;

const getCachedHabituals = unstable_cache(
  async (customerId: string, contactSwiverId: string | null, limit: number) =>
    buildHabituals(customerId, contactSwiverId, limit),
  ['portal-habituals-v1'],
  { revalidate: 600 },
);

/**
 * Smart "Mes habituels": rank products the client actually buys.
 *
 * Signal mix (factures dominate — real purchase history):
 * - invoice line appearances
 * - volume (log of total qty)
 * - portal reorder habit (secondary)
 * - recency decay
 *
 * Cached ~10 min per customer so Commander stays snappy.
 */
export async function listMySmartHabituals(limit = 24): Promise<HabitualProduct[]> {
  const access = await requireClientPortalAccess();
  const identity = await resolveCurrentPortalSwiverIdentity().catch(() => null);
  const swiverId = identity?.customer?.swiverId ?? null;
  return getCachedHabituals(access.customer.id, swiverId, limit);
}

async function buildHabituals(
  customerId: string,
  contactSwiverId: string | null,
  limit: number,
): Promise<HabitualProduct[]> {
  const agg = new Map<string, Agg>();

  const [portalSignal, invoiceSignal] = await Promise.all([
    collectPortalOrderSignal(customerId),
    contactSwiverId ? collectInvoiceSignal(contactSwiverId) : Promise.resolve([] as InvoiceHit[]),
  ]);

  for (const hit of invoiceSignal) {
    const key = hit.swiverId || hit.sku || hit.name;
    if (!key) continue;
    const entry = agg.get(key) ?? {
      key,
      swiverId: hit.swiverId,
      sku: hit.sku,
      name: hit.name,
      invoiceAppearances: 0,
      portalAppearances: 0,
      totalQty: 0,
      lastSeenMs: 0,
    };
    entry.invoiceAppearances += 1;
    entry.totalQty += hit.quantity;
    entry.lastSeenMs = Math.max(entry.lastSeenMs, hit.issuedAtMs);
    if (hit.swiverId) entry.swiverId = hit.swiverId;
    if (hit.sku) entry.sku = hit.sku;
    if (hit.name) entry.name = hit.name;
    agg.set(key, entry);
  }

  for (const hit of portalSignal) {
    const key = hit.swiverId || hit.sku || hit.name;
    if (!key) continue;
    const entry = agg.get(key) ?? {
      key,
      swiverId: hit.swiverId,
      sku: hit.sku,
      name: hit.name,
      invoiceAppearances: 0,
      portalAppearances: 0,
      totalQty: 0,
      lastSeenMs: 0,
    };
    entry.portalAppearances += hit.appearances;
    entry.totalQty += hit.totalQty;
    entry.lastSeenMs = Math.max(entry.lastSeenMs, hit.lastSeenMs);
    if (hit.swiverId) entry.swiverId = hit.swiverId;
    if (hit.sku) entry.sku = hit.sku;
    if (hit.name) entry.name = hit.name;
    agg.set(key, entry);
  }

  if (agg.size === 0) return [];

  const now = Date.now();
  const scored = [...agg.values()]
    .map((a) => {
      const daysAgo = a.lastSeenMs > 0 ? (now - a.lastSeenMs) / MS_DAY : 365;
      const recency = Math.max(0, 40 - daysAgo * 0.35);
      const score =
        a.invoiceAppearances * 28 + a.portalAppearances * 14 + Math.log1p(a.totalQty) * 9 + recency;
      return { ...a, score, daysAgo };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Reuse the 5-min catalogue cache instead of a second uncached full SELECT.
  const catalogue = await getOrderableCatalogue();
  const byKey = new Map<string, (typeof catalogue)[number]>();
  for (const r of catalogue) {
    byKey.set(r.swiverId, r);
    if (r.sku) byKey.set(r.sku, r);
  }

  const result: HabitualProduct[] = [];
  for (const item of scored) {
    const product =
      (item.swiverId ? byKey.get(item.swiverId) : undefined) ??
      (item.sku ? byKey.get(item.sku) : undefined) ??
      byKey.get(item.key);
    if (!product) continue;

    const days = Math.max(0, Math.round(item.daysAgo));
    const hintParts: string[] = [];
    if (item.invoiceAppearances > 0) {
      hintParts.push(
        item.invoiceAppearances === 1 ? '1 facture' : `${item.invoiceAppearances} factures`,
      );
    }
    if (item.portalAppearances > 0) {
      hintParts.push(
        item.portalAppearances === 1
          ? '1 commande portail'
          : `${item.portalAppearances} commandes portail`,
      );
    }
    if (days <= 45 && item.lastSeenMs > 0) {
      hintParts.push(days <= 1 ? 'vu hier' : `vu il y a ${days} j`);
    }

    result.push({
      slug: product.sku || product.swiverId || item.key,
      name: product.name || item.name,
      sku: product.sku ?? item.sku,
      swiverId: product.swiverId ?? item.swiverId,
      image: product.image || null,
      unitPrice: product.unitPrice,
      hint: hintParts.join(' · ') || 'Produit habituel',
      score: item.score,
      invoiceCount: item.invoiceAppearances,
      portalCount: item.portalAppearances,
      totalQty: item.totalQty,
    });
  }

  return result;
}

type PortalHit = {
  swiverId: string | null;
  sku: string | null;
  name: string;
  appearances: number;
  totalQty: number;
  lastSeenMs: number;
};

async function collectPortalOrderSignal(customerId: string): Promise<PortalHit[]> {
  const { db, schema } = await import('@/db/client');
  const drafts = await db
    .select({
      rawInbound: schema.orderDraft.rawInbound,
      status: schema.orderDraft.status,
      createdAt: schema.orderDraft.createdAt,
    })
    .from(schema.orderDraft)
    .where(
      and(
        eq(schema.orderDraft.customerId, customerId),
        eq(schema.orderDraft.source, 'portal'),
        isNull(schema.orderDraft.deletedAt),
      ),
    )
    .orderBy(desc(schema.orderDraft.createdAt))
    .limit(80);

  const map = new Map<string, PortalHit>();
  for (const draft of drafts) {
    if (draft.status === 'rejected') continue;
    const raw = draft.rawInbound as { lines?: RawInboundLine[] } | null;
    const seenInDraft = new Set<string>();
    for (const line of raw?.lines ?? []) {
      const key = line.swiverId || line.sku || line.name;
      if (!key || !line.name) continue;
      const k = String(key);
      const qty = Math.max(0, Number(line.quantity) || 0);
      const entry = map.get(k) ?? {
        swiverId: line.swiverId ?? null,
        sku: line.sku ?? null,
        name: line.name,
        appearances: 0,
        totalQty: 0,
        lastSeenMs: 0,
      };
      if (!seenInDraft.has(k)) {
        entry.appearances += 1;
        seenInDraft.add(k);
      }
      entry.totalQty += qty || 1;
      entry.lastSeenMs = Math.max(entry.lastSeenMs, draft.createdAt?.getTime() ?? 0);
      map.set(k, entry);
    }
  }
  return [...map.values()];
}

type InvoiceHit = {
  swiverId: string | null;
  sku: string | null;
  name: string;
  quantity: number;
  issuedAtMs: number;
};

async function collectInvoiceSignal(contactSwiverId: string): Promise<InvoiceHit[]> {
  const adapter = getSwiverAdapter();
  let docs;
  try {
    docs = await adapter.documents.listDocumentsForCustomer({
      customerSwiverId: contactSwiverId,
      kinds: ['facture'],
    });
  } catch {
    return [];
  }

  const usable = docs
    .filter((d) => d.status !== 'cancelled' && d.status !== 'draft')
    .sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime())
    .slice(0, INVOICE_SCAN_LIMIT);

  const hits: InvoiceHit[] = [];
  for (let i = 0; i < usable.length; i += DOC_CONCURRENCY) {
    const batch = usable.slice(i, i + DOC_CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (doc) => {
        try {
          const full = await adapter.documents.getDocument(doc.swiverId);
          if (!full || full.customerSwiverId !== contactSwiverId) return [] as InvoiceHit[];
          const raw = full.rawShape as {
            document_lines?: Array<{
              product?: { id?: number | string; reference?: string | null } | null;
              qty?: number | string;
              label?: string | null;
              product_label?: string | null;
            }>;
          } | null;
          const issuedAtMs = doc.issueDate.getTime();
          return (raw?.document_lines ?? [])
            .map((l) => {
              const swiverId = l.product?.id != null ? String(l.product.id) : null;
              const sku =
                typeof l.product?.reference === 'string' && l.product.reference.trim()
                  ? l.product.reference.trim()
                  : null;
              const name = (l.label || l.product_label || '').toString().trim();
              const quantity = Math.max(0, Math.trunc(Number(l.qty) || 0));
              if ((!swiverId && !sku) || quantity <= 0) return null;
              return {
                swiverId,
                sku,
                name: name || sku || swiverId || 'Produit',
                quantity,
                issuedAtMs,
              } satisfies InvoiceHit;
            })
            .filter((x): x is InvoiceHit => Boolean(x));
        } catch {
          return [] as InvoiceHit[];
        }
      }),
    );
    for (const part of results) hits.push(...part);
  }
  return hits;
}
