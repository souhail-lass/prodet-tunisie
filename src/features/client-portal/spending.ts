import 'server-only';
import { unstable_cache } from 'next/cache';
import { getSwiverAdapter } from '@/integrations/swiver';
import { resolveCurrentPortalSwiverIdentity } from './swiver-identity';

export type MonthlySpend = {
  /** `YYYY-MM` */
  key: string;
  total: number;
};

export type SpendingSummary = {
  /** False when the portal customer is not matched to a Swiver contact. */
  linked: boolean;
  currency: string;
  thisMonth: number;
  thisYear: number;
  allTime: number;
  /** Sum of amount_to_pay on validated, non-cancelled invoices. */
  outstanding: number;
  unpaidCount: number;
  invoiceCount: number;
  /** Last 12 months, oldest first (zero-filled). */
  monthly: MonthlySpend[];
  /** This month vs previous month, in % (null when previous month is 0). */
  momDeltaPct: number | null;
  lastInvoice: { reference: string; dateISO: string; total: number } | null;
};

type InvoiceLite = {
  reference: string;
  /** `YYYY-MM-DD` */
  dateISO: string;
  totalTtc: number | null;
  toPay: number | null;
  status: string;
};

function parseMoney(value: string | null | undefined): number | null {
  if (value == null || value === '') return null;
  const n = Number.parseFloat(value.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/**
 * Fetch + slim the customer's Swiver invoices. Throws on Swiver failure — see
 * the cache wrapper below for why that matters. One retry absorbs a single
 * transient blip within the same request.
 */
async function fetchInvoicesFromSwiver(contactSwiverId: string): Promise<InvoiceLite[]> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const docs = await getSwiverAdapter().documents.listDocumentsForCustomer({
        customerSwiverId: contactSwiverId,
        kinds: ['facture'],
      });
      return docs.map((d) => {
        const raw = d.rawShape as { amount_to_pay?: string | null } | undefined;
        return {
          reference: d.documentNumber,
          dateISO: d.issueDate.toISOString().slice(0, 10),
          totalTtc: d.totalTtc,
          toPay: parseMoney(raw?.amount_to_pay),
          status: d.status,
        };
      });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error('Swiver invoice fetch failed');
}

/**
 * The customer's Swiver invoices, slimmed to plain JSON and cached per contact
 * so the dashboard never waits on Swiver more than once per window.
 *
 * CRITICAL: the inner fetch THROWS on failure rather than returning []. A
 * caught-and-returned [] would be cached for the full 900s window, blanking
 * the whole spending UI for 15 minutes after one slow/timed-out Swiver call.
 * Letting it throw means unstable_cache stores nothing on failure, so the very
 * next navigation retries — only genuine (successful) results are cached.
 */
// Near-live: 20s window keeps the (heavy) dashboard snappy on rapid navigation
// while a new Swiver invoice reflects in the spending hero within ~20s.
const getCachedCustomerInvoices = unstable_cache(
  fetchInvoicesFromSwiver,
  ['portal-spending-invoices'],
  { revalidate: 20, tags: ['swiver-documents'] },
);

/**
 * Totals of the customer's Swiver sale orders (bons de commande), keyed by
 * document id — drafts included since portal-pushed orders stay drafts until
 * Prodet validates them. Used to show real TND amounts on order history.
 */
export const getCachedCustomerOrderTotals = unstable_cache(
  async (contactSwiverId: string): Promise<Record<string, number>> => {
    try {
      const docs = await getSwiverAdapter().documents.listDocumentsForCustomer({
        customerSwiverId: contactSwiverId,
        kinds: ['bon_de_commande'],
        includeDrafts: true,
      });
      const totals: Record<string, number> = {};
      for (const d of docs) {
        if (d.swiverId && d.totalTtc != null) totals[d.swiverId] = d.totalTtc;
      }
      return totals;
    } catch {
      return {};
    }
  },
  ['portal-order-doc-totals'],
  { revalidate: 20, tags: ['swiver-documents'] },
);

function currentMonthKey(): string {
  // en-CA gives ISO-style YYYY-MM-DD; Tunisia drives the month boundary.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Tunis',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(new Date())
    .slice(0, 7);
}

function lastTwelveMonthKeys(currentKey: string): string[] {
  const y = Number(currentKey.slice(0, 4));
  const m = Number(currentKey.slice(5, 7));
  const keys: string[] = [];
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    keys.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

const EMPTY: SpendingSummary = {
  linked: false,
  currency: 'TND',
  thisMonth: 0,
  thisYear: 0,
  allTime: 0,
  outstanding: 0,
  unpaidCount: 0,
  invoiceCount: 0,
  monthly: [],
  momDeltaPct: null,
  lastInvoice: null,
};

/**
 * Spending analytics for the current portal client, computed from their REAL
 * validated Swiver invoices (drafts and cancelled excluded). Never throws —
 * unlinked customers / Swiver downtime degrade to `linked: false`.
 */
export async function getMySpending(): Promise<SpendingSummary> {
  try {
    const identity = await resolveCurrentPortalSwiverIdentity();
    if (!identity.customer) return EMPTY;

    const all = await getCachedCustomerInvoices(identity.customer.swiverId);
    const invoices = all.filter((i) => i.status !== 'cancelled' && i.status !== 'draft');
    if (invoices.length === 0) return { ...EMPTY, linked: true };

    const monthKey = currentMonthKey();
    const yearKey = monthKey.slice(0, 4);
    const keys = lastTwelveMonthKeys(monthKey);
    const byMonth = new Map<string, number>(keys.map((k) => [k, 0]));

    let thisMonth = 0;
    let thisYear = 0;
    let allTime = 0;
    let outstanding = 0;
    let unpaidCount = 0;
    let lastInvoice: SpendingSummary['lastInvoice'] = null;

    for (const inv of invoices) {
      const total = inv.totalTtc ?? 0;
      const month = inv.dateISO.slice(0, 7);
      allTime += total;
      if (month === monthKey) thisMonth += total;
      if (month.startsWith(yearKey)) thisYear += total;
      if (byMonth.has(month)) byMonth.set(month, (byMonth.get(month) ?? 0) + total);
      if (inv.toPay != null && inv.toPay > 0.001) {
        outstanding += inv.toPay;
        unpaidCount += 1;
      }
      if (!lastInvoice || inv.dateISO > lastInvoice.dateISO) {
        lastInvoice = { reference: inv.reference, dateISO: inv.dateISO, total };
      }
    }

    const prevKey = keys[keys.length - 2];
    const prevMonth = prevKey ? (byMonth.get(prevKey) ?? 0) : 0;
    const momDeltaPct =
      prevMonth > 0 ? Math.round(((thisMonth - prevMonth) / prevMonth) * 100) : null;

    return {
      linked: true,
      currency: 'TND',
      thisMonth,
      thisYear,
      allTime,
      outstanding,
      unpaidCount,
      invoiceCount: invoices.length,
      monthly: keys.map((k) => ({ key: k, total: byMonth.get(k) ?? 0 })),
      momDeltaPct,
      lastInvoice,
    };
  } catch {
    return EMPTY;
  }
}
