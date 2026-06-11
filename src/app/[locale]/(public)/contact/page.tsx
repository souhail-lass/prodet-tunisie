import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/routing';
import { ContactPage } from '@/components/contact/contact-page';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Contact — Prodet Tunisie | Informations produits d'entretien",
    description:
      "Contactez Prodet Tunisie pour une question ou une information sur nos produits d'entretien professionnels. Tél: 71 758 468 · L'Aouina, Tunis.",
  };
}

export default async function ContactRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  return <ContactPage />;
}
