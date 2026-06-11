import Image from 'next/image';
import { QuantityControl } from './quantity-control';

export type ProductTileProps = {
  name: string;
  tagline?: string;
  image?: string;
  format?: string;
  manufactured?: boolean;
  quantity?: number;
  onQuantityChange?: (next: number) => void;
  onOpen?: () => void;
  /** Fired on pointer enter — used to prefetch the detail route. */
  onHover?: () => void;
  className?: string;
};

function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

const isRaster = (src: string) => /\.(png|jpe?g|webp|avif)$/i.test(src);

/** Mirrors the design-system ProductCard (.pds-product) — the catalogue/home tile. */
export function ProductTile({
  name,
  tagline,
  image,
  manufactured = false,
  quantity = 0,
  onQuantityChange,
  onOpen,
  onHover,
  className = '',
}: ProductTileProps) {
  return (
    <article
      className={['pds-product', className].filter(Boolean).join(' ')}
      onPointerEnter={onHover}
    >
      <div className="pds-product__stage" onClick={onOpen}>
        {image ? (
          isRaster(image) ? (
            // next/image resizes + serves AVIF/WebP; kit CSS (.pds-product__stage img) still applies.
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 1080px) 33vw, 220px"
              style={{ objectFit: 'contain' }}
            />
          ) : (
            // SVG packshots aren't optimized by next/image — keep a plain <img>.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={name} />
          )
        ) : (
          <span className={`pds-product__initials ${manufactured ? '' : 'pds-product__initials--resold'}`}>
            {initials(name)}
          </span>
        )}
      </div>
      <div className="pds-product__body" onClick={onOpen}>
        <h3 className="pds-product__name">{name}</h3>
        <p className="pds-product__tagline">{tagline}</p>
      </div>
      <div className="pds-product__foot">
        <QuantityControl value={quantity} onChange={onQuantityChange} />
      </div>
    </article>
  );
}
