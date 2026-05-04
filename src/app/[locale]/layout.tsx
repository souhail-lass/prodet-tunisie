import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, isLocale, localeDirection, localeHtmlLang, type Locale } from '@/i18n/routing';
import { getPublicEnv } from '@/lib/env';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const env = getPublicEnv();

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: {
      default: 'Prodet Tunisie',
      template: '%s · Prodet Tunisie',
    },
    description:
      locale === 'ar'
        ? 'مُصنِّع تونسي لمنتجات النظافة والصيانة المهنية.'
        : locale === 'en'
          ? 'Tunisian manufacturer of professional cleaning and hygiene products.'
          : "Fabricant tunisien de produits d'hygiène et d'entretien professionnels.",
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'fr-TN': '/fr',
        'ar-TN': '/ar',
        en: '/en',
        'x-default': '/fr',
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Prodet Tunisie',
      locale: localeHtmlLang[locale as Locale] ?? 'fr-TN',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = localeDirection[locale];
  const lang = localeHtmlLang[locale];

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
