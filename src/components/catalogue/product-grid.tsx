'use client';

import { CatalogueTile } from '@/components/site/catalogue-tile';
import { useQuoteSelection } from '@/lib/quote-cart-context';
import type { CatalogueCardProduct } from '@/types/product';

/**
 * Reusable product grid (famille pages, etc.) wired to the quote selection.
 * The catalogue page has its own grid because it also owns search/pagination;
 * this is the lightweight version for pre-filtered server-rendered lists.
 */
export function ProductGrid({ products }: { products: CatalogueCardProduct[] }) {
  const { getQuantity, setProductQuantity } = useQuoteSelection();
  return (
    <div className="catalogue__grid">
      {products.map((product) => (
        <CatalogueTile
          key={product.id}
          product={product}
          quantity={getQuantity(product.id)}
          onQuantityChange={setProductQuantity}
        />
      ))}
    </div>
  );
}
