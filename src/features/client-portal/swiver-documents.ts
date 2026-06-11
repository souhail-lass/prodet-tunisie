import 'server-only';
import { unstable_cache } from 'next/cache';
import { getSwiverAdapter, type SwiverDocumentKind, type SwiverDocumentSummary } from '@/integrations/swiver';
import { resolveCurrentPortalSwiverIdentity } from './swiver-identity';

export type PortalSwiverDocuments = {
  /** False when the portal customer is not matched to a Swiver contact. */
  linked: boolean;
  documents: SwiverDocumentSummary[];
};

/**
 * Per-contact, per-kind document list cache. Two hard-won rules apply here:
 *  - THROW on failure (returning [] would cache an empty portal for the whole
 *    window — see the spending-cache incident).
 *  - Cached values round-trip through JSON, so Date fields come back as
 *    strings on cache hits and must be revived before pages format them.
 */
const getCachedDocuments = unstable_cache(
  async (contactSwiverId: string, kinds: SwiverDocumentKind[]): Promise<SwiverDocumentSummary[]> =>
    getSwiverAdapter().documents.listDocumentsForCustomer({
      customerSwiverId: contactSwiverId,
      kinds,
    }),
  ['portal-swiver-documents'],
  { revalidate: 240, tags: ['swiver-documents'] },
);

function reviveDates(doc: SwiverDocumentSummary): SwiverDocumentSummary {
  return {
    ...doc,
    issueDate: new Date(doc.issueDate),
    dueDate: doc.dueDate ? new Date(doc.dueDate) : null,
  };
}

/**
 * The current client's real Swiver documents (devis / factures), newest
 * first. Degrades to `{ linked: false, documents: [] }` whenever the
 * customer is not matched to a Swiver contact or Swiver is unreachable —
 * pages render an empty state instead of erroring.
 */
export async function listMySwiverDocuments(
  kinds: SwiverDocumentKind[],
): Promise<PortalSwiverDocuments> {
  try {
    const identity = await resolveCurrentPortalSwiverIdentity();
    if (!identity.customer) return { linked: false, documents: [] };

    const documents = await getCachedDocuments(identity.customer.swiverId, kinds);
    return { linked: true, documents: documents.map(reviveDates) };
  } catch {
    return { linked: false, documents: [] };
  }
}
