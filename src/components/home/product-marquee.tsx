import { Link } from '@/i18n/routing';
import type { Product } from '@/types/product';

function initials(name = ''): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

/**
 * Continuous, GPU-friendly product carousel. The track holds the products
 * twice and translates by -50%, so the loop is seamless with a single CSS
 * animation (no JS timer). Hover pauses it; reduced-motion disables it.
 */
export function ProductMarquee({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  const loop = [...products, ...products];
  return (
    <div className="pmarquee" role="region" aria-label="Produits Prodet">
      <div className="pmarquee__track">
        {loop.map((p, i) => {
          const dupe = i >= products.length;
          return (
            <Link
              key={`${p.slug}-${i}`}
              href={`/catalogue/${p.slug}`}
              className="pmarquee__card"
              aria-hidden={dupe}
              tabIndex={dupe ? -1 : undefined}
            >
              <div className="pmarquee__stage">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={p.name} loading="lazy" />
                ) : (
                  <span className="pmarquee__mono">{initials(p.name)}</span>
                )}
              </div>
              <span className="pmarquee__name">{p.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
