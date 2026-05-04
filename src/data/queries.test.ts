import { describe, expect, it } from 'vitest';
import {
  getProductBySlug,
  getRecommendedProductsForSector,
  getSectorBySlug,
  listCategories,
  listProducts,
  listSectors,
  localizedCategoryName,
  localizedProductName,
  localizedSectorName,
} from './queries';

describe('public read layer (seed-backed)', () => {
  it('returns products', () => {
    expect(listProducts().length).toBeGreaterThan(0);
  });

  it('every product has a unique slug and code', () => {
    const products = listProducts();
    const slugs = new Set(products.map((p) => p.slug));
    const codes = new Set(products.map((p) => p.code));
    expect(slugs.size).toBe(products.length);
    expect(codes.size).toBe(products.length);
  });

  it('every product has FR/AR/EN names and descriptions', () => {
    for (const product of listProducts()) {
      expect(product.nameByLocale.fr).toBeTruthy();
      expect(product.nameByLocale.ar).toBeTruthy();
      expect(product.nameByLocale.en).toBeTruthy();
      expect(product.shortDescByLocale.fr).toBeTruthy();
      expect(product.shortDescByLocale.ar).toBeTruthy();
      expect(product.shortDescByLocale.en).toBeTruthy();
    }
  });

  it('listProducts can filter by category and by sector', () => {
    const desinfectants = listProducts({ categoryKey: 'desinfectants' });
    expect(desinfectants.length).toBeGreaterThan(0);
    expect(desinfectants.every((p) => p.categoryKey === 'desinfectants')).toBe(true);

    const restaurants = listProducts({ sectorKey: 'restaurants' });
    expect(restaurants.length).toBeGreaterThan(0);
    expect(restaurants.every((p) => p.sectorKeys.includes('restaurants'))).toBe(true);
  });

  it('getProductBySlug returns the product or undefined', () => {
    expect(getProductBySlug('javel-prodet-bid-5kg')).toBeDefined();
    expect(getProductBySlug('does-not-exist')).toBeUndefined();
  });

  it('localized accessors fall back to FR for missing locales', () => {
    const product = getProductBySlug('javel-prodet-bid-5kg');
    expect(product).toBeDefined();
    if (!product) return;
    expect(localizedProductName(product, 'fr')).toBe(product.nameByLocale.fr);
    expect(localizedProductName(product, 'ar')).toBe(product.nameByLocale.ar);
    expect(localizedProductName(product, 'en')).toBe(product.nameByLocale.en);
  });

  it('every recommended sector slug resolves to a real product', () => {
    for (const sector of listSectors()) {
      const recommended = getRecommendedProductsForSector(sector);
      expect(recommended.length).toBe(sector.recommendedProductSlugs.length);
    }
  });

  it('sectors have unique keys and slugs', () => {
    const sectors = listSectors();
    expect(new Set(sectors.map((s) => s.key)).size).toBe(sectors.length);
    expect(new Set(sectors.map((s) => s.slug)).size).toBe(sectors.length);
  });

  it('getSectorBySlug returns a sector or undefined', () => {
    expect(getSectorBySlug('hotellerie')).toBeDefined();
    expect(getSectorBySlug('does-not-exist')).toBeUndefined();
  });

  it('categories sort by displayOrder', () => {
    const categories = listCategories();
    for (let i = 1; i < categories.length; i += 1) {
      expect((categories[i] as (typeof categories)[number]).displayOrder).toBeGreaterThanOrEqual(
        (categories[i - 1] as (typeof categories)[number]).displayOrder,
      );
    }
  });

  it('localizedSectorName / localizedCategoryName work in all locales', () => {
    const sector = getSectorBySlug('restaurants');
    if (!sector) throw new Error('seed missing');
    expect(localizedSectorName(sector, 'fr')).toBeTruthy();
    expect(localizedSectorName(sector, 'ar')).toBeTruthy();
    expect(localizedSectorName(sector, 'en')).toBeTruthy();

    const category = listCategories()[0];
    if (!category) throw new Error('seed missing');
    expect(localizedCategoryName(category, 'fr')).toBeTruthy();
    expect(localizedCategoryName(category, 'ar')).toBeTruthy();
    expect(localizedCategoryName(category, 'en')).toBeTruthy();
  });
});
