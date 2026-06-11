import path from 'node:path';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Public site embeds Google Maps and may load Supabase Storage assets later.
// The CSP is deliberately strict but compatible with Next.js runtime needs:
// - `'unsafe-inline'` on style-src is required by Next.js client streaming
//   (it inlines small style tags for RSC payloads).
// - `'unsafe-inline'`/'unsafe-eval' on script-src is only allowed in dev so
//   the React refresh runtime works. In production we lock down script-src.
const isProd = process.env.NODE_ENV === 'production';

const scriptSrc = isProd
  ? ["'self'", "'unsafe-inline'"]
  : ["'self'", "'unsafe-inline'", "'unsafe-eval'"];

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const connectSrc = ["'self'", 'https://api.resend.com'];
if (supabaseUrl) {
  try {
    const origin = new URL(supabaseUrl).origin;
    connectSrc.push(origin);
    connectSrc.push(origin.replace(/^https?:\/\//u, 'wss://'));
  } catch {
    // Ignore malformed SUPABASE_URL — handled by env validation elsewhere.
  }
}

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSrc.join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src ${connectSrc.join(' ')}`,
  "frame-src 'self' https://www.google.com https://maps.google.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  ...(isProd
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin the workspace root so Next.js does not climb up the parent
  // directories looking for a lockfile and pick the wrong one.
  outputFileTracingRoot: path.join(__dirname),
  typedRoutes: true,
  experimental: {
    // Server Actions default to a 1 MB request body — too small for product
    // images / technical sheets. 15 MB leaves margin over the 10 MB upload cap.
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },
  images: {
    // Restrict the optimizer to known asset hosts. Unsplash powers the home
    // category / sector imagery; we want Next.js to resize and serve modern
    // formats (AVIF/WebP) instead of falling back to `unoptimized` (which
    // would ship the full 600w originals to every viewport).
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // Swiver product images (Cloudflare R2 public CDN).
      {
        protocol: 'https',
        hostname: '**.r2.dev',
        pathname: '/**',
      },
      // Supabase public Storage (product-assets bucket: custom images).
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
