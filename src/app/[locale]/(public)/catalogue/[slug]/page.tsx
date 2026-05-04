import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  getProductBySlug,
  getSectorByKey,
  listProducts,
  localizedProductName,
  localizedSectorName,
} from '@/data/queries';
import { Link } from '@/i18n/routing';
import { isLocale } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { WhatsAppLink } from '@/components/whatsapp-link';

export async function generateStaticParams() {
  return listProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const safeLocale = isLocale(locale) ? locale : 'fr';
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: localizedProductName(product, safeLocale),
    description: product.shortDescByLocale[safeLocale],
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return null;
  setRequestLocale(locale);

  const product = getProductBySlug(slug);
  if (!product) notFound();

  const t = await getTranslations({ locale, namespace: 'catalogue' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const name = localizedProductName(product, locale);
  const description = product.shortDescByLocale[locale];
  const longDescription = product.longDescByLocale[locale];
  const sectorNames = product.sectorKeys
    .map((key) => getSectorByKey(key))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .map((s) => ({ slug: s.slug, label: localizedSectorName(s, locale) }));

  const whatsappMessage =
    locale === 'ar'
      ? `مرحبًا، أرغب في طلب عرض سعر بخصوص: ${product.code} — ${name}`
      : locale === 'en'
        ? `Hello, I would like a quote for: ${product.code} — ${name}`
        : `Bonjour, je souhaite un devis pour : ${product.code} — ${name}`;

  return (
    <div className="mx-auto max-w-(--container-2xl) px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/catalogue"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
        {tCommon('actions.backToCatalog')}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="text-primary text-xs font-medium tracking-wider uppercase">
            {t('page.manufacturedBadge')}
          </p>
          <h1 className="text-foreground mt-2 text-3xl font-semibold sm:text-4xl">{name}</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {tCommon('labels.code')}&nbsp;: {product.code} · {tCommon('labels.conditionnement')}
            &nbsp;: {product.conditionnement}
          </p>

          <section className="mt-8">
            <h2 className="text-foreground text-base font-semibold">
              {t('detail.descriptionTitle')}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">{description}</p>
            <p className="text-muted-foreground mt-3 text-sm">{longDescription}</p>
          </section>

          <section className="mt-8">
            <h2 className="text-foreground text-base font-semibold">{t('detail.specsTitle')}</h2>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">{tCommon('labels.code')}</dt>
                <dd className="text-foreground font-medium">{product.code}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{tCommon('labels.conditionnement')}</dt>
                <dd className="text-foreground font-medium">{product.conditionnement}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{tCommon('labels.unit')}</dt>
                <dd className="text-foreground font-medium">{product.unitOfSale}</dd>
              </div>
            </dl>
          </section>

          {sectorNames.length > 0 ? (
            <section className="mt-8">
              <h2 className="text-foreground text-base font-semibold">{t('detail.alsoInTitle')}</h2>
              <ul className="mt-3 flex flex-wrap gap-2 text-sm">
                {sectorNames.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/secteurs/${s.slug}`}
                      className="border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground inline-flex items-center rounded-full border px-3 py-1 transition-colors"
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="lg:col-span-1">
          <div className="border-border bg-card sticky top-24 rounded-lg border p-6 shadow-sm">
            <h2 className="text-card-foreground text-base font-semibold">
              {t('detail.addToQuoteTitle')}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">{t('detail.addToQuoteBody')}</p>
            <p className="text-muted-foreground mt-4 text-xs">{t('page.noStockNotice')}</p>
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild size="lg">
                <Link href={`/devis?product=${product.slug}`}>
                  {tCommon('actions.requestQuote')}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                </Link>
              </Button>
              <WhatsAppLink message={whatsappMessage} variant="outline" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
