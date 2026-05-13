import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { Product } from '@/data/types';
import { AnimateOnScroll } from '@/components/motion/animate-on-scroll';
import { siteContent } from '@/data/site-content';
import { ProductCard } from '@/components/catalog/product-card';
import { LabelText } from '@/components/typography/label-text';

export function BestSellersStrip({ products }: { products: readonly Product[] }) {
  const copy = siteContent.home.featured;

  return (
    <section className="bg-white">
      <div className="section-shell py-18">
        <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-3xl">
            <LabelText>{copy.label}</LabelText>
            <h2 className="mt-4 text-3xl font-bold text-prodet-text sm:text-4xl">{copy.title}</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{copy.subtitle}</p>
          </div>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-[#FAF7F0] px-5 py-3 text-sm font-semibold text-prodet-text transition-colors hover:border-primary/45 hover:text-primary"
          >
            {copy.cta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </header>

        <AnimateOnScroll
          as="ul"
          staggerChildren
          className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {products.map((product) => (
            <li key={product.slug} data-animate-child>
              <ProductCard product={product} />
            </li>
          ))}
        </AnimateOnScroll>
      </div>
    </section>
  );
}
