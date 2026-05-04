import type { Locale } from '@/i18n/routing';

/**
 * Shapes returned by the public read layer (`src/data/queries.ts`).
 * Today these come from typed seed constants. When the DB is wired in
 * the next session we just swap the implementation behind these types
 * — pages do not change.
 */

export type SectorKey =
  | 'hotels'
  | 'restaurants'
  | 'cafes'
  | 'cleaning_companies'
  | 'wholesalers'
  | 'institutions'
  | 'industry'
  | 'shops';

export interface Sector {
  key: SectorKey;
  slug: string;
  nameByLocale: Record<Locale, string>;
  shortDescByLocale: Record<Locale, string>;
  longDescByLocale: Record<Locale, string>;
  recommendedProductSlugs: readonly string[];
  displayOrder: number;
}

export type ProductCategoryKey =
  | 'detergents_surfaces'
  | 'desinfectants'
  | 'lessives'
  | 'soin_personnel'
  | 'cuisine'
  | 'sanitaires'
  | 'sols';

export interface ProductCategory {
  key: ProductCategoryKey;
  slug: string;
  nameByLocale: Record<Locale, string>;
  displayOrder: number;
}

export interface Product {
  slug: string;
  code: string;
  nameCanonical: string;
  nameByLocale: Record<Locale, string>;
  shortDescByLocale: Record<Locale, string>;
  longDescByLocale: Record<Locale, string>;
  categoryKey: ProductCategoryKey;
  conditionnement: string;
  unitOfSale: string;
  isManufacturedByProdet: boolean;
  /** Sectors where this product is typically used. */
  sectorKeys: readonly SectorKey[];
}
