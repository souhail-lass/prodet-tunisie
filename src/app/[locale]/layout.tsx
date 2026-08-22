import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, isLocale, localeDirection, localeHtmlLang, type Locale } from '@/i18n/routing';
import { getPublicEnv } from '@/lib/env';
import '../globals.css';
// Prodet design-system stylesheets (source-of-truth — see design_handoff_website).
// Order matters: tokens first, then primitives, then layout/page kits.
import '@/styles/prodet/tokens.css';
import '@/styles/prodet/primitives.css';
import '@/styles/prodet/kit.css';
import '@/styles/prodet/kit-pages.css';
import '@/styles/prodet/overrides.css';

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
  const isFrench = locale === 'fr';
  const defaultTitle = isFrench
    ? "Prodet Tunisie — Produits d'entretien professionnels fabriqués en Tunisie"
    : locale === 'ar'
      ? 'بروديت تونس'
      : 'Prodet Tunisie';
  const description = isFrench
    ? "Prodet fabrique et distribue des produits d'entretien et d'hygiène pour hôtels, restaurants, entreprises et institutions en Tunisie. Devis sur demande."
    : locale === 'ar'
      ? 'مُصنِّع تونسي لمنتجات النظافة والصيانة المهنية.'
      : 'Tunisian manufacturer of professional cleaning and hygiene products.';
  const ogTitle = isFrench
    ? "Prodet Tunisie — Fournisseur B2B de produits d'entretien"
    : defaultTitle;
  const ogDescription = isFrench
    ? 'Fabricant tunisien de produits d’entretien professionnels. Bidons 5L, 10L, 20L. Devis personnalisé.'
    : description;
  const ogLocale = isFrench ? 'fr_TN' : localeHtmlLang[locale as Locale] ?? 'fr-TN';

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: {
      default: defaultTitle,
      template: '%s · Prodet Tunisie',
    },
    description,
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
      title: ogTitle,
      description: ogDescription,
      locale: ogLocale,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
    appleWebApp: {
      capable: true,
      title: 'Prodet',
      statusBarStyle: 'default',
    },
    icons: {
      icon: '/images/logo/prodet-logo.svg',
      apple: '/brand/logo-prodet.png',
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#08233f',
  width: 'device-width',
  initialScale: 1,
};

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
