import type { Product } from '@/data/types';
import { siteContent } from '@/data/site-content';
import { ProductCard } from '@/components/catalog/product-card';

export function RelatedProducts({ products }: { products: readonly Product[] }) {
  if (products.length === 0) return null;

  return (
    <section id="related-products" className="scroll-mt-56">
      <h2 className="text-2xl font-bold text-prodet-text">{siteContent.product.relatedTitle}</h2>
      <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <li key={product.id} className="flex justify-center">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
