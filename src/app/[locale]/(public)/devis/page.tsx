import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  listProducts,
  listSectors,
  localizedProductName,
  localizedSectorName,
} from '@/data/queries';
import { isLocale } from '@/i18n/routing';
import { QuoteForm } from '@/components/forms/quote-form';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : 'fr';
  const t = await getTranslations({ locale: safeLocale, namespace: 'devis.page' });
  return { title: t('title'), description: t('subtitle') };
}

export default async function DevisPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ product?: string; sector?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: 'devis.page' });

  const products = listProducts().map((p) => ({
    slug: p.slug,
    label: `${p.code} — ${localizedProductName(p, locale)}`,
    unit: p.unitOfSale,
  }));

  const sectors = listSectors().map((s) => ({
    key: s.key,
    label: localizedSectorName(s, locale),
  }));
  const notes =
    locale === 'ar'
      ? ['اكتب المرجع إن كنت تعرفه', 'اذكر الكميات والوتيرة', 'سنرتب الطلب معك مباشرة']
      : locale === 'en'
        ? ['Use the product code if you know it', 'Mention volumes and frequency', 'We confirm the quote directly with you']
        : ['Indiquez le code produit si vous le connaissez', 'Précisez volumes et fréquence', 'Nous confirmons le devis directement avec vous'];

  return (
    <div className="section-shell py-12">
      <header className="surface-panel overflow-hidden p-7 sm:p-8">
        <p className="eyebrow-label">{t('title')}</p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{t('title')}</h1>
        <p className="text-muted-foreground mt-4 max-w-3xl">{t('subtitle')}</p>
        <p className="text-muted-foreground mt-3 text-xs">{t('noStockNotice')}</p>
        <p className="text-muted-foreground mt-2 text-xs">{t('alreadyClient')}</p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
        <aside className="surface-panel h-fit p-6 lg:sticky lg:top-28">
          <p className="eyebrow-label">Devis</p>
          <h2 className="mt-4 text-2xl font-semibold">
            {locale === 'ar'
              ? 'Le devis commence par une demande claire'
              : locale === 'en'
                ? 'A clear quote request saves time'
                : 'Une demande claire accélère le devis'}
          </h2>
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            {notes.map((note) => (
              <li key={note} className="border-border bg-secondary/55 rounded-[1rem] border px-4 py-3">
                {note}
              </li>
            ))}
          </ul>
        </aside>

        <div>
          <QuoteForm products={products} sectors={sectors} prefilledProductSlug={sp.product} />
        </div>
      </div>
    </div>
  );
}
