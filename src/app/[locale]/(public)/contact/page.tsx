import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { isLocale } from '@/i18n/routing';
import { ContactForm } from '@/components/forms/contact-form';
import { WhatsAppLink } from '@/components/whatsapp-link';
import { getPublicEnv } from '@/lib/env';

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
  const env = getPublicEnv();
  const phone = env.NEXT_PUBLIC_DEFAULT_WHATSAPP_E164;

  return (
    <div className="section-shell py-12">
      <header className="surface-panel overflow-hidden p-7 sm:p-8">
        <p className="eyebrow-label">{t('page.title')}</p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{t('page.title')}</h1>
        <p className="text-muted-foreground mt-4 max-w-3xl">{t('page.subtitle')}</p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="surface-panel h-fit p-6 lg:sticky lg:top-28">
          <ul className="space-y-6 text-sm">
            <li className="flex gap-3">
              <MapPin className="text-primary mt-0.5 h-5 w-5" aria-hidden />
              <div>
                <p className="text-foreground font-semibold">{t('channels.addressTitle')}</p>
                <p className="text-muted-foreground">{t('channels.address')}</p>
              </div>
            </li>
            {phone ? (
              <li className="flex gap-3">
                <Phone className="text-primary mt-0.5 h-5 w-5" aria-hidden />
                <div>
                  <p className="text-foreground font-semibold">{t('channels.phoneTitle')}</p>
                  <p className="text-muted-foreground">{phone}</p>
                </div>
              </li>
            ) : null}
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
                  <WhatsAppLink size="sm" className="rounded-full" />
                </div>
              </div>
            </li>
          </ul>
        </aside>

        <section>
          <ContactForm />
        </section>
      </div>
    </div>
  );
}
