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
import { ProductCard } from '@/components/catalog/product-card';
import { ProductVisual } from '@/components/catalog/product-visual';
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
  const relatedProducts = listProducts({ categoryKey: product.categoryKey })
    .filter((candidate) => candidate.slug !== product.slug)
    .slice(0, 3);
  const relatedTitle =
    locale === 'ar'
      ? 'منتجات تُطلب معها غالبًا'
      : locale === 'en'
        ? 'Often requested with this product'
        : 'Souvent demandé avec ce produit';

  const whatsappMessage =
    locale === 'ar'
      ? `مرحبًا، أرغب في طلب عرض سعر بخصوص: ${product.code} — ${name}`
      : locale === 'en'
        ? `Hello, I would like a quote for: ${product.code} — ${name}`
        : `Bonjour, je souhaite un devis pour : ${product.code} — ${name}`;

  return (
    <div className="section-shell py-12">
      <Link
        href="/catalogue"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
        {tCommon('actions.backToCatalog')}
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <ProductVisual product={product} locale={locale} priority className="aspect-[4/3]" />

          <div className="surface-panel mt-6 p-7 sm:p-8">
            <p className="product-code text-primary">{product.code}</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{name}</h1>
            <div className="text-muted-foreground mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <span>
                {tCommon('labels.conditionnement')}&nbsp;: <strong>{product.conditionnement}</strong>
              </span>
              <span>
                {tCommon('labels.unit')}&nbsp;: <strong>{product.unitOfSale}</strong>
              </span>
            </div>

            <section className="mt-8">
              <h2 className="text-foreground text-base font-semibold">
                {t('detail.descriptionTitle')}
              </h2>
              <p className="text-muted-foreground mt-3 text-sm leading-7">{description}</p>
              <p className="text-muted-foreground mt-3 text-sm leading-7">{longDescription}</p>
            </section>

            <section className="mt-8">
              <h2 className="text-foreground text-base font-semibold">{t('detail.specsTitle')}</h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="border-border bg-secondary/55 rounded-[1rem] border p-4">
                  <dt className="text-muted-foreground">{tCommon('labels.code')}</dt>
                  <dd className="text-foreground tabular mt-1 font-medium">{product.code}</dd>
                </div>
                <div className="border-border bg-secondary/55 rounded-[1rem] border p-4">
                  <dt className="text-muted-foreground">{tCommon('labels.conditionnement')}</dt>
                  <dd className="text-foreground mt-1 font-medium">{product.conditionnement}</dd>
                </div>
                <div className="border-border bg-secondary/55 rounded-[1rem] border p-4">
                  <dt className="text-muted-foreground">{tCommon('labels.unit')}</dt>
                  <dd className="text-foreground mt-1 font-medium">{product.unitOfSale}</dd>
                </div>
              </dl>
            </section>

            {sectorNames.length > 0 ? (
              <section className="mt-8">
                <h2 className="text-foreground text-base font-semibold">
                  {t('detail.alsoInTitle')}
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2 text-sm">
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

          {relatedProducts.length > 0 ? (
            <section className="mt-8">
              <h2 className="text-foreground text-2xl font-semibold">{relatedTitle}</h2>
              <ul className="mt-5 grid gap-5 xl:grid-cols-3">
                {relatedProducts.map((related) => (
                  <li key={related.slug}>
                    <ProductCard product={related} locale={locale} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside>
          <div className="surface-panel sticky top-28 p-6">
            <h2 className="text-card-foreground text-base font-semibold">
              {t('detail.addToQuoteTitle')}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">{t('detail.addToQuoteBody')}</p>
            <p className="text-muted-foreground mt-4 text-xs">{t('page.noStockNotice')}</p>
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild size="lg" className="rounded-full">
                <Link href={`/devis?product=${product.slug}`}>
                  {tCommon('actions.requestQuote')}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                </Link>
              </Button>
              <WhatsAppLink message={whatsappMessage} variant="outline" className="rounded-full" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
