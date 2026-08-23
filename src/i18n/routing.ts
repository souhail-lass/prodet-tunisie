import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr';

/**
 * Request header the middleware uses to hand the pathname locale to
 * `getRequestConfig` (see src/i18n/request.ts for why this is needed).
 */
export const LOCALE_HEADER = 'x-prodet-locale';

export const localeDirection: Record<Locale, 'ltr' | 'rtl'> = {
  fr: 'ltr',
  en: 'ltr',
};

export const localeLabels: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
};

export const localeHtmlLang: Record<Locale, string> = {
  fr: 'fr-TN',
  en: 'en',
};

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'always',
});

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
