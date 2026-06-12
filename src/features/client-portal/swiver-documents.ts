import 'server-only';
import { getSwiverAdapter, type SwiverDocumentKind, type SwiverDocumentSummary } from '@/integrations/swiver';
import { resolveCurrentPortalSwiverIdentity } from './swiver-identity';

export type PortalSwiverDocuments = {
  /** False when the portal customer is not matched to a Swiver contact. */
  linked: boolean;
  documents: SwiverDocumentSummary[];
};

/**
 * LIVE fetch (no cache) of the customer's Swiver documents. Devis / factures
 * created in Swiver appear in the portal immediately on the next page load —
 * no revalidation window. One retry absorbs a transient blip. Pages are
 * `force-dynamic`, so this runs once per request and never blocks rendering
 * on stale data.
 */
export async function fetchSwiverDocuments(
  contactSwiverId: string,
  kinds: SwiverDocumentKind[],
  options?: { includeDrafts?: boolean },
): Promise<SwiverDocumentSummary[]> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await getSwiverAdapter().documents.listDocumentsForCustomer({
        customerSwiverId: contactSwiverId,
        kinds,
        includeDrafts: options?.includeDrafts,
      });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error('Swiver document fetch failed');
}

/**
 * The current client's real Swiver documents (devis / factures), newest
 * first, fetched live. Degrades to `{ linked: false, documents: [] }` when the
 * customer is not matched to a Swiver contact or Swiver is unreachable.
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
