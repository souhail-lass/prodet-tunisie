import { describe, expect, it } from 'vitest';
import { defaultLocale, isLocale, locales, localeDirection } from './routing';

describe('i18n routing config', () => {
  it('exposes the two shipped locales', () => {
    expect(locales).toEqual(['fr', 'en']);
  });

  it('defaults to French', () => {
    expect(defaultLocale).toBe('fr');
  });

  it('marks every locale as LTR', () => {
    expect(localeDirection.fr).toBe('ltr');
    expect(localeDirection.en).toBe('ltr');
  });

  it('isLocale narrows correctly', () => {
    expect(isLocale('fr')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('ar')).toBe(false);
    expect(isLocale('de')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale(42)).toBe(false);
  });
});
