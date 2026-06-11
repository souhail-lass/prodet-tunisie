import 'server-only';
import { unstable_cache } from 'next/cache';
import { getSwiverAdapter, type SwiverCustomer } from '@/integrations/swiver';

/**
 * Resolves a portal customer (our DB) to its Swiver customer record by
 * matching email or phone. Read-only. The Swiver customer list (≈145 rows)
 * is cached for an hour so we don't sweep the API on every portal request.
 *
 * Swiver does NOT expose listing a customer's documents, so this identity
 * link is what we use to (a) show the real establishment in the portal and
 * (b) know which Swiver contact to attach a future order/devis to.
 */
export const getCachedSwiverCustomers = unstable_cache(
  async (): Promise<SwiverCustomer[]> => {
    try {
      return await getSwiverAdapter().customers.listCustomers({});
    } catch {
      return [];
    }
  },
  ['swiver-customers-index'],
  { revalidate: 3600, tags: ['swiver-customers'] },
);

function normEmail(value?: string | null): string | null {
  const v = value?.trim().toLowerCase();
  return v && v.includes('@') ? v : null;
}

/** Tunisian numbers are 8 digits after the +216 country code. */
function normPhone(value?: string | null): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8 ? digits.slice(-8) : null;
}

/** All phone numbers attached to a Swiver customer (mapped + raw fields). */
function customerPhones(customer: SwiverCustomer): Set<string> {
  const phones = new Set<string>();
  const push = (p?: string | null) => {
    const n = normPhone(p);
    if (n) phones.add(n);
  };
  push(customer.phone);
  const raw = customer.rawShape as
    | { phone1?: string | null; phone2?: string | null; phone3?: string | null; contact_phones?: Array<{ value?: string | null }> | null }
    | undefined;
  if (raw) {
    push(raw.phone1);
    push(raw.phone2);
    push(raw.phone3);
    for (const cp of raw.contact_phones ?? []) push(cp.value);
  }
  return phones;
}

/**
 * Direct lookup by Swiver contact id — the deterministic link for clients
 * granted from /admin/clients (customer.swiver_id is set there). Falls back
 * to a single-contact fetch when the id is missing from the cached list.
 */
export async function findSwiverCustomerById(swiverId: string): Promise<SwiverCustomer | null> {
  const customers = await getCachedSwiverCustomers();
  const hit = customers.find((c) => c.swiverId === swiverId);
  if (hit) return hit;
  try {
    return await getSwiverAdapter().customers.getCustomer(swiverId);
  } catch {
    return null;
  }
}

export async function findSwiverCustomerByContact(input: {
  email?: string | null;
  phone?: string | null;
}): Promise<SwiverCustomer | null> {
  const email = normEmail(input.email);
  const phone = normPhone(input.phone);
  if (!email && !phone) return null;

  const customers = await getCachedSwiverCustomers();
  if (customers.length === 0) return null;

  if (email) {
    const byEmail = customers.find((c) => normEmail(c.email) === email);
    if (byEmail) return byEmail;
  }
  if (phone) {
    const byPhone = customers.find((c) => customerPhones(c).has(phone));
    if (byPhone) return byPhone;
  }
  return null;
}

export type PortalSwiverIdentity = {
  matched: boolean;
  /** True when shown only because of dev demo fallback, not a real match. */
  demoFallback: boolean;
  customer: SwiverCustomer | null;
};

/**
 * Resolves the Swiver identity to show in the portal. In dev demo mode (no
 * real session) we surface the first named Swiver customer so the linked-data
 * UI is previewable; in production it strictly matches the logged-in contact.
 */
export async function getPortalSwiverIdentity(input: {
  /** Stored customer.swiver_id — wins over email/phone heuristics. */
  swiverId?: string | null;
  /** Our DB customer name — display fallback when Swiver has no record. */
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  demoMode?: boolean;
}): Promise<PortalSwiverIdentity> {
  if (input.swiverId) {
    const byId = await findSwiverCustomerById(input.swiverId);
    if (byId) return { matched: true, demoFallback: false, customer: byId };
    // Many billing contacts exist only on documents: Swiver's customers list
    // omits them and the single-GET returns an empty body. The stored id is
    // still authoritative for document/spending queries, so synthesize a
    // minimal record from our own DB instead of reporting "not linked".
    return {
      matched: true,
      demoFallback: false,
      customer: {
        swiverId: input.swiverId,
        legalName: input.name?.trim() || `(client ${input.swiverId})`,
        displayName: input.name?.trim() || null,
        externalCode: null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        addressLine1: null,
        city: null,
        postalCode: null,
        country: null,
        vatNumber: null,
        rawShape: null,
      },
    };
  }

  const match = await findSwiverCustomerByContact(input);
  if (match) return { matched: true, demoFallback: false, customer: match };

  if (input.demoMode) {
    const customers = await getCachedSwiverCustomers();
    const named = customers.find((c) => !c.legalName.startsWith('(sans nom'));
    if (named) return { matched: false, demoFallback: true, customer: named };
  }

  return { matched: false, demoFallback: false, customer: null };
}

/**
 * Resolves the Swiver identity for the CURRENT portal request — matches the
 * authenticated customer's email/phone, or falls back to the demo preview.
 * Never throws (Swiver/auth failures degrade to "not linked").
 */
export async function resolveCurrentPortalSwiverIdentity(): Promise<PortalSwiverIdentity> {
  const demoMode =
    process.env.NODE_ENV !== 'production' && process.env.PORTAL_DEMO_MODE === '1';
  try {
    const { requireClientPortalAccess } = await import('./auth');
    const access = await requireClientPortalAccess();
    return await getPortalSwiverIdentity({
      swiverId: access.customer.swiverId,
      name: access.customer.displayName || access.customer.name,
      email: access.customer.email,
      phone: access.customer.phone,
      demoMode,
    });
  } catch {
    if (demoMode) return getPortalSwiverIdentity({ demoMode: true });
    return { matched: false, demoFallback: false, customer: null };
  }
}
