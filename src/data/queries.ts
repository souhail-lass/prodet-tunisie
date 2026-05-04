import type { Locale } from '@/i18n/routing';
import type { Product, ProductCategory, ProductCategoryKey, Sector, SectorKey } from './types';
import { SEED_CATEGORIES } from './seed/categories';
import { SEED_PRODUCTS } from './seed/products';
import { SEED_SECTORS } from './seed/sectors';

/**
 * Read layer for the public site.
 *
 * Phase 0: returns from typed seed constants.
 * Phase 1+: same signatures, backed by Drizzle reads from Postgres.
 *
 * Pages should ONLY import from this module — never from `./seed/*`
 * directly — so the seed → DB swap is a one-line change.
 */

export interface ListProductsOptions {
  categoryKey?: ProductCategoryKey;
  sectorKey?: SectorKey;
}

export function listProducts(options: ListProductsOptions = {}): readonly Product[] {
  let result: readonly Product[] = SEED_PRODUCTS;
  if (options.categoryKey) {
    result = result.filter((p) => p.categoryKey === options.categoryKey);
  }
  if (options.sectorKey) {
    const sector = options.sectorKey;
    result = result.filter((p) => p.sectorKeys.includes(sector));
  }
  return result;
}

export function getProductBySlug(slug: string): Product | undefined {
  return SEED_PRODUCTS.find((p) => p.slug === slug);
}

export function listCategories(): readonly ProductCategory[] {
  return [...SEED_CATEGORIES].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getCategoryByKey(key: ProductCategoryKey): ProductCategory | undefined {
  return SEED_CATEGORIES.find((c) => c.key === key);
}

export function listSectors(): readonly Sector[] {
  return [...SEED_SECTORS].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getSectorBySlug(slug: string): Sector | undefined {
  return SEED_SECTORS.find((s) => s.slug === slug);
}

export function getSectorByKey(key: SectorKey): Sector | undefined {
  return SEED_SECTORS.find((s) => s.key === key);
}

export function getRecommendedProductsForSector(sector: Sector): readonly Product[] {
  return sector.recommendedProductSlugs
    .map((slug) => getProductBySlug(slug))
    .filter((p): p is Product => p !== undefined);
}

/* Locale-aware accessors used inside server components. */

export function localizedProductName(product: Product, locale: Locale): string {
  return product.nameByLocale[locale] ?? product.nameByLocale.fr;
}

export function localizedSectorName(sector: Sector, locale: Locale): string {
  return sector.nameByLocale[locale] ?? sector.nameByLocale.fr;
}

export function localizedCategoryName(category: ProductCategory, locale: Locale): string {
  return category.nameByLocale[locale] ?? category.nameByLocale.fr;
}
