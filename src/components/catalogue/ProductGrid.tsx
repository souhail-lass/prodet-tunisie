import { PackageSearch } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { Product } from '@/types/product';
import type { CatalogueViewMode } from './CatalogueToolbar';
import { ProductCard } from './ProductCard';
import { ProductListItem } from './ProductListItem';

interface ProductGridProps {
  products: readonly Product[];
  viewMode: CatalogueViewMode;
  onResetFilters: () => void;
}

export function ProductGrid({ products, viewMode, onResetFilters }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[12px] bg-white/40 px-6 py-14 text-center">
        <div>
          <PackageSearch className="mx-auto h-12 w-12 text-[#9CA3AF]" aria-hidden />
          <h2 className="mt-5 text-[16px] font-medium text-[#1C2B3A]">Aucun produit trouvé</h2>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-6 text-[#6B7280]">
            Modifiez vos filtres ou contactez-nous pour trouver le bon produit.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-[#1B5FA7] px-4 text-[12px] font-medium text-[#1B5FA7] transition-colors hover:bg-[#1B5FA7] hover:text-white"
            >
              Réinitialiser les filtres
            </button>
            <Link
              href="/contact"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[#1B5FA7] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#0D3B73] hover:text-white"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {products.map((product) => (
          <ProductListItem key={product.id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
