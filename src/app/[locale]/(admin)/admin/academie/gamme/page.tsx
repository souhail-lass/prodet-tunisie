import { ACADEMY_FAMILY_ORDER, ACADEMY_FAMILIES, ACADEMY_PRODUCTS } from '@/features/academy/range-data';
import { isAcademyUnlocked } from '@/features/academy/session';
import { RangeExplorer } from '@/features/academy/range-explorer';
import { UnlockScreen } from '@/features/academy/unlock-screen';

export const dynamic = 'force-dynamic';

/**
 * Module 4 — the confidential range.
 *
 * Server component: it reads the academy session cookie. While locked it renders
 * ONLY the code-entry screen — the formula data (`ACADEMY_PRODUCTS`) is never
 * imported into the client bundle and is passed to the explorer as props only
 * once the code has been verified.
 */
export default async function AcademyRangePage() {
  if (!(await isAcademyUnlocked())) {
    return <UnlockScreen />;
  }

  const families = ACADEMY_FAMILY_ORDER.map((key) => ACADEMY_FAMILIES[key]);
  return <RangeExplorer products={ACADEMY_PRODUCTS} families={families} />;
}
