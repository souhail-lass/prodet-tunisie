import 'server-only';
import { unstable_cache } from 'next/cache';
import {
  getSwiverAdapter,
  type SwiverDocumentKind,
  type SwiverDocumentSummary,
} from '@/integrations/swiver';
import { resolveCurrentPortalSwiverIdentity } from './swiver-identity';

export type PortalSwiverDocuments = {
  /** False when the portal customer is not matched to a Swiver contact. */
  linked: boolean;
  documents: SwiverDocumentSummary[];
};

/** JSON-safe row stored in unstable_cache (Dates → ISO, drop heavy rawShape). */
type CachedDocRow = {
  swiverId: string;
  kind: SwiverDocumentSummary['kind'];
  status: SwiverDocumentSummary['status'];
  documentNumber: string;
  customerSwiverId: string;
  issueDate: string;
  dueDate: string | null;
  totalHt: number | null;
  totalTtc: number | null;
  currency: string;
};

function toCached(docs: SwiverDocumentSummary[]): CachedDocRow[] {
  return docs.map((d) => ({
    swiverId: d.swiverId,
    kind: d.kind,
    status: d.status,
    documentNumber: d.documentNumber,
    customerSwiverId: d.customerSwiverId,
    issueDate: d.issueDate.toISOString(),
    dueDate: d.dueDate ? d.dueDate.toISOString() : null,
    totalHt: d.totalHt,
    totalTtc: d.totalTtc,
    currency: d.currency,
  }));
}

function fromCached(rows: CachedDocRow[]): SwiverDocumentSummary[] {
  return rows.map((d) => ({
    swiverId: d.swiverId,
    kind: d.kind,
    status: d.status,
    documentNumber: d.documentNumber,
    customerSwiverId: d.customerSwiverId,
    issueDate: new Date(d.issueDate),
    dueDate: d.dueDate ? new Date(d.dueDate) : null,
    totalHt: d.totalHt,
    totalTtc: d.totalTtc,
    currency: d.currency,
    rawShape: null,
  }));
}

/**
 * LIVE Swiver list with one retry. Throws on failure so unstable_cache does
 * not store an empty result for the whole revalidate window.
 */
async function fetchDocumentsLive(
  contactSwiverId: string,
  kinds: SwiverDocumentKind[],
  includeDrafts: boolean,
): Promise<CachedDocRow[]> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const docs = await getSwiverAdapter().documents.listDocumentsForCustomer({
        customerSwiverId: contactSwiverId,
        kinds,
        includeDrafts,
      });
      return toCached(docs);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error('Swiver document fetch failed');
}

/**
 * Short-lived cache so Devis / Factures / Commandes / Livraisons stay snappy
 * when the client flips between rail tabs. 45s keeps lists near-live without
 * re-hitting Swiver (often multi-second) on every navigation.
 */
const getCachedDocumentList = unstable_cache(
  async (contactSwiverId: string, kindsKey: string, includeDrafts: boolean) => {
    const kinds = kindsKey.split(',') as SwiverDocumentKind[];
    return fetchDocumentsLive(contactSwiverId, kinds, includeDrafts);
  },
  ['portal-swiver-docs-v2'],
  { revalidate: 45, tags: ['swiver-documents'] },
);

/**
 * The customer's Swiver documents for the given kinds. Cached ~45s per
 * (contact, kinds, drafts). Throws are not cached — next nav retries.
 */
export async function fetchSwiverDocuments(
  contactSwiverId: string,
  kinds: SwiverDocumentKind[],
  options?: { includeDrafts?: boolean },
): Promise<SwiverDocumentSummary[]> {
  const kindsKey = [...kinds].sort().join(',');
  const includeDrafts = Boolean(options?.includeDrafts);
  const rows = await getCachedDocumentList(contactSwiverId, kindsKey, includeDrafts);
  return fromCached(rows);
}

/**
 * The current client's real Swiver documents (devis / factures), newest
 * first. Degrades to `{ linked: false, documents: [] }` when unmatched or
 * Swiver is unreachable.
 */
export async function listMySwiverDocuments(
  kinds: SwiverDocumentKind[],
): Promise<PortalSwiverDocuments> {
  try {
    const identity = await resolveCurrentPortalSwiverIdentity();
    if (!identity.customer) return { linked: false, documents: [] };

    const documents = await fetchSwiverDocuments(identity.customer.swiverId, kinds);
    return { linked: true, documents };
  } catch {
    return { linked: false, documents: [] };
  }
}

export type SwiverDocLine = { productSwiverId: string; quantity: number; label: string };

/**
 * The line items of one of the CURRENT client's Swiver documents (e.g. a devis),
 * ownership-checked. Powers "Commander ce devis" — we re-price via a fresh
 * quote, so only product id + quantity matter. Returns null when the document
 * isn't the client's or can't be read.
 */
export async function getMyDocumentLines(
  swiverDocId: string,
): Promise<{ reference: string; lines: SwiverDocLine[] } | null> {
  if (!/^\d+$/.test(swiverDocId)) return null;
  try {
    const identity = await resolveCurrentPortalSwiverIdentity();
    if (!identity.customer) return null;
    const doc = await getSwiverAdapter().documents.getDocument(swiverDocId);
    if (!doc || doc.customerSwiverId !== identity.customer.swiverId) return null;
    const raw = doc.rawShape as {
      document_lines?: Array<{
        product?: { id?: number | string } | null;
        qty?: number | string;
        label?: string | null;
        product_label?: string | null;
      }>;
    } | null;
    const lines = (raw?.document_lines ?? [])
      .map((l) => ({
        productSwiverId: l.product?.id != null ? String(l.product.id) : '',
        quantity: Math.max(0, Math.trunc(Number(l.qty) || 0)),
        label: (l.label || l.product_label || '').toString(),
      }))
      .filter((l) => l.productSwiverId && l.quantity > 0);
    return { reference: doc.documentNumber, lines };
  } catch {
    return null;
  }
}
