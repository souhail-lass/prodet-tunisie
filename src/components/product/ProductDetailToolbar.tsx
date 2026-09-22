import { ProductQuickSearch } from '@/components/catalogue/product-quick-search';
import { ProductBackLink } from '@/components/product/ProductBackLink';
import type { CatalogueCardProduct } from '@/types/product';

export function ProductDetailToolbar({
  products,
  backLabel,
  backHref,
}: {
  products: CatalogueCardProduct[];
  backLabel: string;
  backHref: string;
}) {
  return (
    <div className="product-toolbar">
      <div className="product-toolbar__inner">
        <ProductBackLink href={backHref} label={backLabel} />
        <ProductQuickSearch products={products} align="end" className="product-toolbar__search" />
      </div>
    </div>
  );
}
