import { describe, expect, it } from 'vitest';
import {
  getCategoryBySlug,
  getProductBySlug,
  getRecommendedProductsForSector,
  getRelatedProducts,
  getSectorBySlug,
  getUseCaseById,
  getUseCaseProductCount,
  listCategories,
  listProducts,
  listSectors,
  localizedCategoryName,
  localizedProductName,
  localizedSectorName,
  sanitizeProductQuery,
  searchProducts,
} from './queries';

describe('public read layer', () => {
  it('returns products with unique ids and slugs', () => {
    const products = listProducts();
    expect(products.length).toBeGreaterThan(0);
    expect(new Set(products.map((product) => product.id)).size).toBe(products.length);
    expect(new Set(products.map((product) => product.slug)).size).toBe(products.length);
  });

  it('filters by use case, sector, and category', () => {
    const laundry = listProducts({ useCaseIds: ['linge-textiles'] });
    expect(laundry.length).toBeGreaterThan(0);
    expect(laundry.every((product) => product.useCases.includes('linge-textiles'))).toBe(true);

    const restaurants = listProducts({ sectorId: 'restaurants-cafes' });
    expect(restaurants.length).toBeGreaterThan(0);
    expect(restaurants.every((product) => product.sectors.includes('restaurants-cafes'))).toBe(true);

    const manufactured = listProducts({ category: 'manufactured' });
    expect(manufactured.every((product) => product.category === 'manufactured')).toBe(true);

    const commercialized = listProducts({ category: 'commercialized' });
    expect(commercialized.length).toBeGreaterThan(0);
    expect(commercialized.every((product) => product.category === 'commercialized')).toBe(true);
  });

  it('gets products, sectors, and categories by slug or id', () => {
    expect(getProductBySlug('prolax-liquide')?.name).toBe('Prolax Liquide');
    expect(getSectorBySlug('hotels')?.label).toBe('Hôtels & hébergement');
    expect(getCategoryBySlug('sols')?.label).toBe('Nettoyage des sols');
    expect(getUseCaseById('surfaces-vitres')?.label).toBe('Surfaces & vitres');
  });

  it('returns localized labels through the public accessors', () => {
    const product = getProductBySlug('javel-prodet');
    const sector = getSectorBySlug('institutions');
    const category = listCategories()[0];

    if (!product || !sector || !category) throw new Error('seed missing');

    expect(localizedProductName(product, 'fr')).toBe(product.name);
    expect(localizedSectorName(sector, 'fr')).toBe(sector.label);
    expect(localizedCategoryName(category, 'fr')).toBe(category.label);
  });

  it('returns recommended products for a sector and related products for a product', () => {
    const sector = getSectorBySlug('restaurants-cafes');
    const product = getProductBySlug('prolav');

    if (!sector || !product) throw new Error('seed missing');

    const recommended = getRecommendedProductsForSector(sector, 4);
    expect(recommended.length).toBeGreaterThan(0);
    expect(recommended.every((candidate) => candidate.sectors.includes(sector.id))).toBe(true);

    const related = getRelatedProducts(product, 4);
    expect(related.length).toBeGreaterThan(0);
    expect(related.some((candidate) => candidate.id === product.id)).toBe(false);
  });

  it('sanitizes and searches across names, formats, use cases, and sectors', () => {
    expect(sanitizeProductQuery('  Dégraissant   ')).toBe('degraissant');
    expect(searchProducts('Prolax').length).toBeGreaterThan(1);
    expect(searchProducts('20 kg')).not.toHaveLength(0);
    expect(searchProducts('restaurants')).not.toHaveLength(0);
    expect(listProducts({ query: 'sanihand', sort: 'relevance' })[0]?.slug).toBe('sanihand');
  });

  it('sorts categories and sectors by display order', () => {
    const categories = listCategories();
    const sectors = listSectors();

    for (let i = 1; i < categories.length; i += 1) {
      const current = categories[i];
      const previous = categories[i - 1];
      if (!current || !previous) throw new Error('category order missing');
      expect(current.displayOrder).toBeGreaterThanOrEqual(previous.displayOrder);
    }

    for (let i = 1; i < sectors.length; i += 1) {
      const current = sectors[i];
      const previous = sectors[i - 1];
      if (!current || !previous) throw new Error('sector order missing');
      expect(current.displayOrder).toBeGreaterThanOrEqual(previous.displayOrder);
    }
  });

  it('exposes counts by use case', () => {
    expect(getUseCaseProductCount('linge-textiles')).toBeGreaterThan(0);
    expect(getUseCaseProductCount('surfaces-vitres')).toBeGreaterThan(0);
  });

  it('sorts products by name when requested', () => {
    const asc = listProducts({ sort: 'name-asc' });
    const desc = listProducts({ sort: 'name-desc' });

    expect(asc[0]?.name.localeCompare(asc[1]?.name ?? '', 'fr')).toBeLessThanOrEqual(0);
    expect(desc[0]?.name.localeCompare(desc[1]?.name ?? '', 'fr')).toBeGreaterThanOrEqual(0);
  });
});
