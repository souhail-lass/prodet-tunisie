import { describe, expect, it } from 'vitest';
import { defaultLocale, isLocale, locales, localeDirection } from './routing';

describe('i18n routing config', () => {
  it('exposes the three MVP locales', () => {
    expect(locales).toEqual(['fr', 'ar', 'en']);
  });

  it('defaults to French', () => {
    expect(defaultLocale).toBe('fr');
  });

  it('marks Arabic as RTL and the others as LTR', () => {
    expect(localeDirection.fr).toBe('ltr');
    expect(localeDirection.en).toBe('ltr');
    expect(localeDirection.ar).toBe('rtl');
  });

  it('isLocale narrows correctly', () => {
    expect(isLocale('fr')).toBe(true);
    expect(isLocale('ar')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('de')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale(42)).toBe(false);
  });
});
