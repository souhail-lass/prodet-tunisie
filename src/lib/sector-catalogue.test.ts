import { describe, expect, it } from 'vitest';
import {
  findCatalogueByBrandKey,
  matchCatalogueByBrandKey,
  productMatchesBrandKey,
  resolveZoneProducts,
} from './sector-catalogue';

type Card = { id: string; name: string; slug: string; category?: string };

function card(partial: Card): Card {
  return partial;
}

const catalogue: Card[] = [
  card({ id: 'v5', name: 'PROVITRE BID 5KG', slug: 'provitre-bid-5kg', category: 'manufactured' }),
  card({ id: 'v750', name: 'PROVITRE PULVERISATEUR 750ML', slug: 'provitre-pulverisateur-750ml', category: 'manufactured' }),
  card({ id: 'df', name: 'DEOFRESH 750ML', slug: 'deofresh-750ml', category: 'manufactured' }),
  card({ id: 'dfl', name: 'DEOFRESH LINGE BID 05 KG', slug: 'deofresh-linge-bid-05-kg', category: 'manufactured' }),
  card({ id: 'pn', name: 'PRONET DEGRAISSANT SOLS BID6KG', slug: 'pronet-degraissant-sols-bid6kg', category: 'manufactured' }),
  card({ id: 'pb', name: 'PROLAX BLANC SAC 25 KG', slug: 'prolax-blanc-sac-25-kg', category: 'manufactured' }),
  card({ id: 'pl', name: 'PROLAX LIQUIDE BID 20KG', slug: 'prolax-liquide-bid-20kg', category: 'manufactured' }),
  card({ id: 'si', name: 'SIRAFAN DESINFECTANT SANS RINÇAGE BID 05KG', slug: 'sirafan-desinfectant-sans-rincage-bid-05kg', category: 'manufactured' }),
  card({ id: 'jv', name: 'JAVEL PRODET BID 5KG', slug: 'javel-prodet-bid-5kg', category: 'manufactured' }),
  card({ id: 'unrelated', name: 'CACHEMIRE BLANC LOT 25P', slug: 'cachemire-blanc-lot-25p', category: 'commercialized' }),
];

describe('productMatchesBrandKey', () => {
  it('matches a brand stem inside the live catalogue name', () => {
    expect(productMatchesBrandKey(catalogue[0]!, 'provitre')).toBe(true);
    expect(productMatchesBrandKey(catalogue[0]!, 'pro')).toBe(false);
  });

  it('keeps ambient Deofresh out of the linge key and vice versa', () => {
    expect(productMatchesBrandKey(catalogue[2]!, 'deofresh')).toBe(true);
    expect(productMatchesBrandKey(catalogue[3]!, 'deofresh')).toBe(false);
    expect(productMatchesBrandKey(catalogue[3]!, 'deofresh-linge')).toBe(true);
    expect(productMatchesBrandKey(catalogue[2]!, 'deofresh-linge')).toBe(false);
  });
});

describe('matchCatalogueByBrandKey', () => {
  it('returns every live SKU for that brand, not the old fixture singleton', () => {
    expect(matchCatalogueByBrandKey(catalogue, 'provitre').map((p) => p.id)).toEqual(['v5', 'v750']);
  });

  it('aliases retired fixture keys onto the current brand', () => {
    expect(matchCatalogueByBrandKey(catalogue, 'pronet-plus').map((p) => p.id)).toEqual(['pn']);
    expect(matchCatalogueByBrandKey(catalogue, 'vit-net').map((p) => p.id)).toEqual(['v5', 'v750']);
    expect(matchCatalogueByBrandKey(catalogue, 'prolax-couleur').map((p) => p.id)).toEqual(['pb']);
  });

  it('matches hyphenated fixture keys like sirafan-desinfectant', () => {
    expect(matchCatalogueByBrandKey(catalogue, 'sirafan-desinfectant').map((p) => p.id)).toEqual(['si']);
    expect(matchCatalogueByBrandKey(catalogue, 'javel-prodet').map((p) => p.id)).toEqual(['jv']);
  });
});

describe('resolveZoneProducts', () => {
  it('keeps key order and drops unknown brands without blanking the zone', () => {
    expect(
      resolveZoneProducts(catalogue, ['provitre', 'missing-brand', 'deofresh']).map((p) => p.id),
    ).toEqual(['v5', 'v750', 'df']);
  });

  it('does not repeat a product listed under two keys', () => {
    expect(resolveZoneProducts(catalogue, ['provitre', 'vit-net']).map((p) => p.id)).toEqual([
      'v5',
      'v750',
    ]);
  });
});

describe('findCatalogueByBrandKey', () => {
  it('picks the first live SKU so old /catalogue/provitre URLs can redirect', () => {
    expect(findCatalogueByBrandKey(catalogue, 'provitre')?.id).toBe('v5');
    expect(findCatalogueByBrandKey(catalogue, 'inconnu')).toBeUndefined();
  });
});
