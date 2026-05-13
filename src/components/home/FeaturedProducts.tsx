import { Link } from '@/i18n/routing';
import { ProductCard } from '@/components/catalogue/ProductCard';
import { products } from '@/data/products';

const requestedFeaturedSlugs = [
  'prolax-liquide',
  'eau-de-javel',
  'liquide-vaisselle',
  'savon-liquide',
] as const;

const featuredProductsByRequest = requestedFeaturedSlugs
  .map((slug) => products.find((product) => matchesRequestedSlug(product, slug)))
  .filter((product): product is NonNullable<typeof product> => Boolean(product));

const featuredProducts =
  featuredProductsByRequest.length > 0
    ? featuredProductsByRequest
    : products.filter((product) => product.category === 'manufactured').slice(0, 4);

export function FeaturedProducts() {
  return (
    <section className="bg-white py-[72px]">
      <div className="mx-auto max-w-[1400px] px-6">
        <header>
          <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#1B5FA7]">
            PRODUITS PHARES
          </p>
          <h2 className="mb-2.5 text-[30px] font-semibold leading-[1.2] text-[#1C2B3A]">
            Notre gamme fabriquée à Tunis
          </h2>
          <p className="mb-9 text-[14px] leading-[1.7] text-[#6B7280]">
            Sélection de nos produits manufacturés — disponibles sur devis.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/catalogue"
            className="inline-flex items-center justify-center rounded-lg border-[0.5px] border-[#1B5FA7] bg-transparent px-8 py-2.5 text-[13px] font-medium text-[#1B5FA7] transition-colors hover:bg-[#EFF6FF] hover:text-[#1B5FA7]"
          >
            Voir toute la gamme →
          </Link>
        </div>
      </div>
    </section>
  );
}

function matchesRequestedSlug(product: (typeof products)[number], requestedSlug: string) {
  const normalizedSlug = product.slug.trim().toLowerCase();
  const normalizedRequestedSlug = requestedSlug.trim().toLowerCase();
  const imageBasename = product.image.split('/').pop()?.replace(/\.[^.]+$/u, '').toLowerCase();

  return normalizedSlug === normalizedRequestedSlug || imageBasename === normalizedRequestedSlug;
}
