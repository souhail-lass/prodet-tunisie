import frFamilles from '@/messages/fr/familles.json';
import { sousCatLabelKey, type FamilleId } from './familles';

/**
 * French labels for the browse taxonomy, read straight from the next-intl
 * messages so the admin console and the public site cannot drift apart. The
 * admin console is French-only, so there is no locale argument.
 */
export function familleLabel(familleId: FamilleId): string {
  return frFamilles.items[familleId]?.label ?? familleId;
}

export function sousCategorieLabel(slug: string): string {
  const key = sousCatLabelKey(slug) as keyof typeof frFamilles.souscats;
  return frFamilles.souscats[key] ?? slug;
}
