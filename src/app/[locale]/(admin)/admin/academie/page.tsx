import { ACADEMY_FAMILY_ORDER, ACADEMY_FAMILIES, ACADEMY_PRODUCTS } from '@/features/academy/range-data';
import { isAcademyUnlocked } from '@/features/academy/session';
import { GammeWorkspace } from '@/features/academy/gamme/gamme-workspace';
import { UnlockScreen } from '@/features/academy/unlock-screen';

export const dynamic = 'force-dynamic';

/**
 * Académie — home is the reference workspace "La Gamme".
 *
 * Server component: reads the academy session cookie. While locked it renders
 * ONLY the code-entry screen — the confidential formula data (ACADEMY_PRODUCTS)
 * is server-only and reaches the client explorer as props only once unlocked.
 */
export default async function AcademyHomePage() {
  if (!(await isAcademyUnlocked())) {
    return <UnlockScreen />;
  }

  const families = ACADEMY_FAMILY_ORDER.map((key) => ACADEMY_FAMILIES[key]);
  return <GammeWorkspace products={ACADEMY_PRODUCTS} families={families} />;
}
