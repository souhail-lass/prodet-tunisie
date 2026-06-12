/**
 * "Ils nous font confiance" — trusted-clients logo wall.
 *
 * EDIT THIS LIST to match the clients you want to showcase. To use a real
 * logo image instead of a styled wordmark, drop a file in
 * `public/brand/clients/` (SVG or transparent PNG works best) and set `logo`
 * to its path, e.g. `{ name: 'Vistaprint', logo: '/brand/clients/vistaprint.svg' }`.
 * Logos render in uniform grayscale and colour-in on hover.
 */
type Client = { name: string; logo?: string };

const CLIENTS: Client[] = [
  { name: 'Vistaprint' },
  { name: 'ETAP' },
  { name: 'AGIL · SNDP' },
  { name: 'The 716' },
  { name: 'SATER' },
  { name: 'MHIRI' },
  { name: 'LAPEC' },
  { name: 'Layla Feinkost' },
];

export function ClientWall() {
  if (CLIENTS.length === 0) return null;
  const loop = [...CLIENTS, ...CLIENTS];
  return (
    <div className="cwall" role="region" aria-label="Ils nous font confiance">
      <div className="cwall__track">
        {loop.map((c, i) => {
          const dupe = i >= CLIENTS.length;
          return (
            <span className="cwall__logo" key={`${c.name}-${i}`} aria-hidden={dupe} title={c.name}>
              {c.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.logo} alt={c.name} loading="lazy" />
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
