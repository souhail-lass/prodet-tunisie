import { describe, expect, it } from 'vitest';
import {
  adminCatalogueListPath,
  localePrefixedPath,
  parseAdminCatalogueQuery,
  withAdminCatalogueQuery,
} from './admin-catalogue-query';

describe('parseAdminCatalogueQuery', () => {
  it('reads q, cat and visibility from search params', () => {
    expect(parseAdminCatalogueQuery(new URLSearchParams('q=javel&cat=PRODUITS+FINIS&v=hidden'))).toEqual({
      q: 'javel',
      cat: 'PRODUITS FINIS',
      v: 'hidden',
    });
  });

  it('falls back to all/all when values are missing or unknown', () => {
    expect(parseAdminCatalogueQuery({})).toEqual({ q: '', cat: 'all', v: 'all' });
    expect(parseAdminCatalogueQuery({ v: 'nope' })).toEqual({ q: '', cat: 'all', v: 'all' });
  });
});

describe('adminCatalogueListPath', () => {
  it('omits default filters so the list URL stays clean', () => {
    expect(adminCatalogueListPath({ q: '', cat: 'all', v: 'all' })).toBe('/admin/produits');
    expect(adminCatalogueListPath({ q: 'bidon', cat: 'all', v: 'visible' })).toBe(
      '/admin/produits?q=bidon&v=visible',
    );
  });

  it('keeps the same query on edit and rangement links', () => {
    const query = { q: 'bidon', cat: 'EMBALLAGE', v: 'visible' as const };
    expect(withAdminCatalogueQuery('/admin/produits/abc', query)).toBe(
      '/admin/produits/abc?q=bidon&cat=EMBALLAGE&v=visible',
    );
    expect(localePrefixedPath('fr', adminCatalogueListPath(query))).toBe(
      '/fr/admin/produits?q=bidon&cat=EMBALLAGE&v=visible',
    );
  });
});
