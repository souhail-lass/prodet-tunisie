import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/routing';
import { ContactPage } from '@/components/contact/contact-page';
import { pageAlternates } from '@/lib/seo/alternates';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (locale === 'en') {
    return {
      title: 'Contact — Prodet Tunisie | Professional cleaning products',
      description:
        "Contact Prodet Tunisie about professional cleaning and hygiene products. Tel: +216 71 758 468 · L'Aouina, Tunis.",
      alternates: pageAlternates(locale, '/contact'),
    };
  }
  return {
    title: "Contact — Prodet Tunisie | Informations produits d'entretien",
    description:
      "Contactez Prodet Tunisie pour une question ou une information sur nos produits d'entretien professionnels. Tél: 71 758 468 · L'Aouina, Tunis.",
    alternates: pageAlternates(locale, '/contact'),
  };
}

export default async function ContactRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  return <ContactPage />;
}
