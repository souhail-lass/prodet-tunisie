'use client';

/**
 * "Ils nous font confiance" — trusted-clients logo wall.
 *
 * EDIT THIS LIST to match the clients you want to showcase. Logos live in
 * `public/brand/clients/` — drop a new file there (transparent PNG or SVG works
 * best) and add an entry below. Each logo is shown in a uniform white chip,
 * grayscale by default, and colours in on hover.
 */
import Image from 'next/image';
import { useTranslations } from 'next-intl';

type Client = { name: string; logo?: string };

const CLIENTS: Client[] = [
  { name: 'Vistaprint', logo: '/brand/clients/vistaprint.png' },
  { name: 'The Cliff', logo: '/brand/clients/the-cliff.png' },
  { name: 'The 716', logo: '/brand/clients/the-716.jpg' },
  { name: 'Hôtel Le Pacha', logo: '/brand/clients/hotel-le-pacha.png' },
  { name: 'Gourmandise', logo: '/brand/clients/gourmandise.png' },
  { name: 'The Big Dip', logo: '/brand/clients/big-dip.png' },
  { name: 'Slayta', logo: '/brand/clients/slayta.jpg' },
  { name: 'Tunisie Catering', logo: '/brand/clients/tunisie-catering.png' },
  { name: 'Lycée Pierre Mendès France', logo: '/brand/clients/lycee-pmf.jpg' },
];

export function ClientWall() {
  const t = useTranslations('home');
  if (CLIENTS.length === 0) return null;
  const loop = [...CLIENTS, ...CLIENTS];
  return (
    <div className="cwall" role="region" aria-label={t('clients.ariaLabel')}>
      <div className="cwall__track">
        {loop.map((c, i) => {
          const dupe = i >= CLIENTS.length;
          return (
            <span className="cwall__logo" key={`${c.name}-${i}`} aria-hidden={dupe} title={c.name}>
              {c.logo ? (
                // Chip content box is 128x60 (176x96 minus 24/18px padding).
                // object-fit:contain comes from .cwall__logo img.
                <Image
                  src={c.logo}
                  alt={c.name}
                  width={128}
                  height={60}
                  sizes="128px"
                  loading="lazy"
                />
              ) : (
                <span className="cwall__wordmark">{c.name}</span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
