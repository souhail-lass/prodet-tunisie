import path from 'node:path';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin the workspace root so Next.js does not climb up the parent
  // directories looking for a lockfile and pick the wrong one.
  outputFileTracingRoot: path.join(__dirname),
  typedRoutes: true,
  images: {
    remotePatterns: [
      // Supabase Storage public buckets will be configured here once
      // the project URL is known. Placeholder.
    ],
  },
};

export default withNextIntl(nextConfig);
