import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/routing';
import { ContactForm } from '@/components/contact/ContactForm';
import { ContactHero } from '@/components/contact/ContactHero';
import { ContactInfo } from '@/components/contact/ContactInfo';
import { ContactMapSection } from '@/components/contact/ContactMapSection';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Contact — Prodet Tunisie | Informations produits d'entretien",
    description:
      "Contactez Prodet Tunisie pour une question ou une information sur nos produits d'entretien professionnels. Tél: 71 758 468 · L'Aouina, Tunis.",
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <>
      <ContactHero />
      <section className="bg-[#F8F7F4] py-16">
        <div className="mx-auto grid max-w-[1200px] gap-6 px-6 lg:grid-cols-[1fr_380px] lg:items-start">
          <ContactForm />
          <ContactInfo whatsappNumber={whatsappNumber} />
        </div>
      </section>
      <ContactMapSection />
    </>
  );
}
