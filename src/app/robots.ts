import type { MetadataRoute } from 'next';
import { resolveAuthOrigin } from '@/lib/site-origin';

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Derive the real deployment host (never the localhost-defaulted env).
  const baseUrl = (await resolveAuthOrigin()).replace(/\/$/, '');
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
