'use client';

import { memo } from 'react';
import { ProductTile } from '@/components/ds';
import type { QuoteSelectionProduct } from '@/lib/quote-cart-context';
import type { CatalogueCardProduct } from '@/types/product';

type CatalogueTileProps = {
  product: CatalogueCardProduct;
  quantity: number;
  /** Stable setter from useQuoteSelection (setProductQuantity). */
  onQuantityChange: (product: QuoteSelectionProduct, quantity: number) => void;
  /** Localized "Fabriqué par Prodet" label for the manufactured badge. */
  madeLabel?: string;
};

/**
 * App-side wrapper around the design-system ProductTile (.pds-product).
 * Quantity + setter come in as props (read once at the grid level) so a
 * quote change only re-renders the affected tile, not the whole grid.
 */
export const CatalogueTile = memo(function CatalogueTile({
  product,
  quantity,
  onQuantityChange,
  madeLabel,
}: CatalogueTileProps) {
  const format = product.formats[0]?.label;

  return (
    <ProductTile
      name={product.name}
      tagline={product.tagline}
      image={product.image}
      format={format}
      manufactured={product.category === 'manufactured'}
      madeLabel={madeLabel}
      quantity={quantity}
      onQuantityChange={(n) =>
        onQuantityChange(
          {
            productId: product.id,
            productName: product.name,
            slug: product.slug,
            imageUrl: product.image,
            category: product.category,
            format,
          },
          n,
        )
      }
      href={`/catalogue/${product.slug}`}
    />
  );
});
