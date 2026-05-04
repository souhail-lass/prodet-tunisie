import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/routing';
import { ContactForm } from '@/components/forms/contact-form';
import { WhatsAppLink } from '@/components/whatsapp-link';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : 'fr';
  const t = await getTranslations({
    locale: safeLocale,
    namespace: 'contact.page',
  });
  return { title: t('title'), description: t('subtitle') };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'contact' });

  return (
    <div className="mx-auto max-w-(--container-2xl) px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <h1 className="text-foreground text-3xl font-semibold sm:text-4xl">{t('page.title')}</h1>
        <p className="text-muted-foreground mt-3">{t('page.subtitle')}</p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-5">
        <aside className="lg:col-span-2">
          <ul className="space-y-6 text-sm">
            <li className="flex gap-3">
              <MapPin className="text-primary mt-0.5 h-5 w-5" aria-hidden />
              <div>
                <p className="text-foreground font-semibold">{t('channels.addressTitle')}</p>
                <p className="text-muted-foreground">{t('channels.address')}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <Phone className="text-primary mt-0.5 h-5 w-5" aria-hidden />
              <div>
                <p className="text-foreground font-semibold">{t('channels.phoneTitle')}</p>
                <p className="text-muted-foreground">+216 71 000 000</p>
              </div>
            </li>
            <li className="flex gap-3">
              <Mail className="text-primary mt-0.5 h-5 w-5" aria-hidden />
              <div>
                <p className="text-foreground font-semibold">{t('channels.emailTitle')}</p>
                <p className="text-muted-foreground">contact@prodet.tn</p>
              </div>
            </li>
            <li className="flex gap-3">
              <MessageCircle className="text-primary mt-0.5 h-5 w-5" aria-hidden />
              <div>
                <p className="text-foreground font-semibold">{t('channels.whatsappTitle')}</p>
                <p className="text-muted-foreground">{t('channels.whatsappBody')}</p>
                <div className="mt-3">
                  <WhatsAppLink size="sm" />
                </div>
              </div>
            </li>
          </ul>
        </aside>

        <section className="lg:col-span-3">
          <ContactForm />
        </section>
      </div>
    </div>
  );
}
