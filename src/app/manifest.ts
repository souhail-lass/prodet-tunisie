import type { MetadataRoute } from 'next';

/**
 * PWA manifest — makes the portal installable ("Ajouter à l'écran d'accueil")
 * and opens it full-screen like a native app. Next auto-links this at
 * /manifest.webmanifest.
 *
 * TODO(polish): drop square PNG icons (192×192, 512×512 + a 512 maskable) in
 * /public/brand/ and point the entries below at them for a crisp install icon.
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
      { src: '/brand/logo-prodet.png', sizes: 'any', type: 'image/png', purpose: 'any' },
      { src: '/images/logo/prodet-logo.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
