import { describe, expect, it } from 'vitest';
import { pickHomepagePopular, popularLineKey } from './homepage-popular';

describe('popularLineKey', () => {
  it('collapses pack sizes of the same line', () => {
    expect(popularLineKey('JAVEL PRODET BID 5KG')).toBe(popularLineKey('JAVEL PRODET BID 20KG'));
    expect(popularLineKey('SOLITAIRE VAISSELLE CITRON 5L')).toBe(
      popularLineKey('SOLITAIRE VAISSELLE BID 20KG'),
    );
  });

  it('keeps distinct lines apart', () => {
    expect(popularLineKey('JAVEL PRODET BID 5KG')).not.toBe(popularLineKey('PROFOUR DEGRAISSANT FOUR 5KG'));
    expect(popularLineKey('PROVITRE BID 5KG')).not.toBe(popularLineKey('PROGERME VERT BID 05 KG'));
  });
});

describe('pickHomepagePopular', () => {
  const rows = [
    { id: 'a', sku: 'P-00001', name: 'SOLITAIRE VAISSELLE CITRON 5L' },
    { id: 'b', sku: 'P-00013', name: 'JAVEL PRODET BID 5KG' },
    { id: 'c', sku: 'P-00002', name: 'JAVEL PRODET BID 20KG' },
    { id: 'd', sku: 'P-00003', name: 'SOLITAIRE VAISSELLE BID 20KG' },
    { id: 'e', sku: 'P-00014', name: 'PROFOUR DEGRAISSANT FOUR 5KG' },
    { id: 'f', sku: 'P-00006', name: 'PROVITRE BID 5KG' },
    { id: 'hidden', sku: 'P-00031', name: 'SERPILLERE SONIT 0.70 LOT 12P', hidden: true },
    { id: 'noise', sku: 'P-00999', name: 'ALCOGEL ANTISEPTIQUE BID 5L' },
  ];

  it('follows the sales rank and drops later pack-size duplicates', () => {
    expect(pickHomepagePopular(rows, 16).map((row) => row.sku)).toEqual([
      'P-00001',
      'P-00013',
      'P-00014',
      'P-00006',
    ]);
  });

  it('skips a hidden SKU instead of substituting its other format', () => {
    expect(pickHomepagePopular(rows, 16).some((row) => row.sku === 'P-00031')).toBe(false);
  });

  it('ignores products that are not on the sales ranking', () => {
    expect(pickHomepagePopular(rows, 16).some((row) => row.sku === 'P-00999')).toBe(false);
  });
});
