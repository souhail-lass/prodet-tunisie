import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, isLocale, localeDirection, localeHtmlLang } from '@/i18n/routing';
import { getPublicEnv } from '@/lib/env';
import { pageAlternates } from '@/lib/seo/alternates';
import { Analytics } from '@/components/site/analytics';
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
  const copy =
    locale === 'en'
      ? {
          defaultTitle: 'Prodet — Professional cleaning products manufactured in Tunisia',
          description:
            'Prodet manufactures and supplies professional cleaning and hygiene products for hotels, restaurants, cleaning companies and institutions in Tunisia. Quotes on request.',
          ogTitle: 'Prodet — B2B cleaning products manufacturer in Tunisia',
          ogDescription:
            'Tunisian manufacturer of professional detergents and hygiene supplies. 5L, 10L and 20L formats. Custom quotes.',
          ogLocale: 'en_GB',
        }
      : {
          defaultTitle: "Prodet — Produits d'entretien professionnels fabriqués en Tunisie",
          description:
            "Prodet fabrique et distribue des produits d'entretien et d'hygiène pour hôtels, restaurants, entreprises et institutions en Tunisie. Devis sur demande.",
          ogTitle: "Prodet — Fournisseur B2B de produits d'entretien",
          ogDescription:
            'Fabricant tunisien de produits d’entretien professionnels. Bidons 5L, 10L, 20L. Devis personnalisé.',
          ogLocale: 'fr_TN',
        };

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: {
      default: copy.defaultTitle,
      template: '%s · Prodet',
    },
    description: copy.description,
    alternates: pageAlternates(locale),
    openGraph: {
      type: 'website',
      siteName: 'Prodet',
      title: copy.ogTitle,
      description: copy.ogDescription,
      locale: copy.ogLocale,
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.ogTitle,
      description: copy.ogDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
    ...(env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { verification: { google: env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
      : {}),
    appleWebApp: {
      capable: true,
      title: 'Prodet',
      statusBarStyle: 'default',
    },
    // v=20260921e: full Prodet wordmark in white disc (aspect preserved, no clip).
    icons: {
      icon: [
        { url: '/favicon.ico?v=20260921e', sizes: '48x48' },
        { url: '/brand/favicon.svg?v=20260921e', type: 'image/svg+xml' },
        { url: '/brand/favicon-32.png?v=20260921e', sizes: '32x32', type: 'image/png' },
        { url: '/brand/favicon-48.png?v=20260921e', sizes: '48x48', type: 'image/png' },
        { url: '/brand/favicon-96.png?v=20260921e', sizes: '96x96', type: 'image/png' },
        { url: '/brand/icon-192.png?v=20260921e', sizes: '192x192', type: 'image/png' },
      ],
      apple: [{ url: '/brand/apple-touch-icon.png?v=20260921e', sizes: '180x180' }],
      shortcut: '/brand/favicon-48.png?v=20260921e',
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
        <Analytics />
      </body>
    </html>
  );
}
