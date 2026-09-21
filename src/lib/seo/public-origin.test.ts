import { describe, expect, it } from 'vitest';
import { canonicalPublicOrigin, normalizePublicOrigin } from './public-origin';
import { pageAlternates } from './alternates';
import { PUBLIC_ROBOTS_DISALLOW } from './robots-rules';

describe('normalizePublicOrigin', () => {
  it('rewrites the apex host to www so canonicals are not redirects', () => {
    expect(normalizePublicOrigin('https://prodet.com.tn')).toBe('https://www.prodet.com.tn');
    expect(normalizePublicOrigin('https://prodet.com.tn/fr')).toBe('https://www.prodet.com.tn');
  });

  it('leaves www and localhost unchanged', () => {
    expect(normalizePublicOrigin('https://www.prodet.com.tn')).toBe('https://www.prodet.com.tn');
    expect(normalizePublicOrigin('http://localhost:3004')).toBe('http://localhost:3004');
  });
});

describe('canonicalPublicOrigin', () => {
  it('returns a usable origin', () => {
    expect(canonicalPublicOrigin()).toMatch(/^https?:\/\//u);
  });
});

describe('pageAlternates', () => {
  it('emits in-locale canonical plus fr/en hreflang', () => {
    expect(pageAlternates('en', '/contact')).toEqual({
      canonical: '/en/contact',
      languages: {
        'fr-TN': '/fr/contact',
        en: '/en/contact',
        'x-default': '/fr/contact',
      },
    });
  });
});

describe('robots disallow list', () => {
  it('keeps admin, portal and API out of the public crawl', () => {
    expect(PUBLIC_ROBOTS_DISALLOW).toEqual(expect.arrayContaining(['/*/admin', '/*/client', '/api/']));
  });
});
