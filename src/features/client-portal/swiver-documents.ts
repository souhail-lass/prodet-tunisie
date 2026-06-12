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
