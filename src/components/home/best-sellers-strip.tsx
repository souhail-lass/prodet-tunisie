import type { Locale } from '@/i18n/routing';
import type { Product } from '@/data/types';
import { ProductCard } from '@/components/catalog/product-card';
import { LabelText } from '@/components/typography/label-text';
import type { HomeContent } from './content';

export function BestSellersStrip({
  locale,
  products,
  content,
}: {
  locale: Locale;
  products: readonly Product[];
  content: HomeContent;
}) {
  return (
    <section className="bg-secondary/45 border-border/70 border-b">
      <div className="section-shell py-14">
        <header className="max-w-3xl">
          <LabelText>{content.featured.eyebrow}</LabelText>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">{content.featured.title}</h2>
          <p className="text-muted-foreground mt-4">{content.featured.subtitle}</p>
        </header>

        <ul className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} locale={locale} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
