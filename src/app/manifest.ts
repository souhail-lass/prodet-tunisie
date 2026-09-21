import type { MetadataRoute } from 'next';

/**
 * PWA manifest — makes the portal installable ("Ajouter à l'écran d'accueil")
 * and opens it full-screen like a native app. Next auto-links this at
 * /manifest.webmanifest.
 *
 * Icons: full Prodet wordmark on a white disc. Aspect ratio preserved and
 * scaled to fit inside the circle (no squash, no edge clipping).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Prodet — Espace client',
    short_name: 'Prodet',
    description: 'Espace client Prodet : commandes, factures, devis et support, en direct.',
    start_url: '/fr/client',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    lang: 'fr',
    dir: 'ltr',
    background_color: '#f7f6f3',
    theme_color: '#08233f',
    categories: ['business', 'productivity'],
    icons: [
      { src: '/brand/favicon.svg?v=20260921e', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/brand/icon-192.png?v=20260921e', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/brand/icon-512.png?v=20260921e', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/brand/icon-512-maskable.png?v=20260921e',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
