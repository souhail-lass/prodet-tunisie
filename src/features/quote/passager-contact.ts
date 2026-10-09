import 'server-only';
import type { SwiverAdapter } from '@/integrations/swiver';

/** Exact Swiver contact name used for anonymous website devis. */
export const PASSAGER_CONTACT_NAME = 'CLIENT_PASSAGER';

let cachedLookupId: string | null | undefined;

/**
 * Swiver contact id for public (non-portal) devis drafts.
 *
 * Prefer `SWIVER_PASSAGER_CONTACT_ID` (set in Vercel). Falls back to a
 * once-per-process lookup of the contact named CLIENT_PASSAGER.
 */
export async function resolvePassagerContactId(swiver: SwiverAdapter): Promise<string | null> {
  const fromEnv = process.env.SWIVER_PASSAGER_CONTACT_ID?.trim();
  if (fromEnv && /^\d+$/u.test(fromEnv)) return fromEnv;

  if (cachedLookupId !== undefined) return cachedLookupId;
  if (swiver.mode === 'disabled') {
    cachedLookupId = null;
    return null;
  }

  try {
    const customers = await swiver.customers.listCustomers({});
    const hit = customers.find((c) =>
      [c.legalName, c.displayName].some(
        (name) => name?.trim().toUpperCase() === PASSAGER_CONTACT_NAME,
      ),
    );
    cachedLookupId = hit?.swiverId ?? null;
  } catch (error) {
    console.error(
      '[public-devis:passager-lookup-failed]',
      error instanceof Error ? error.message : error,
    );
    cachedLookupId = null;
  }

  return cachedLookupId;
}

/** Test helper — clears the process memo so env / lookup can be re-exercised. */
export function resetPassagerContactCacheForTests(): void {
  cachedLookupId = undefined;
}
