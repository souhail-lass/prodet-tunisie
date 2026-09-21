import type { MetadataRoute } from 'next';
import { canonicalPublicOrigin } from '@/lib/seo/public-origin';
import { PUBLIC_ROBOTS_DISALLOW } from '@/lib/seo/robots-rules';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = canonicalPublicOrigin();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [...PUBLIC_ROBOTS_DISALLOW],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
