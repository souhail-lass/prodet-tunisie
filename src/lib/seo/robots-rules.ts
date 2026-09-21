/**
 * Paths search engines should not spend crawl budget on.
 * Google treats `*` as a wildcard in robots.txt.
 */
export const PUBLIC_ROBOTS_DISALLOW = [
  '/*/admin',
  '/*/client',
  '/*/connexion-admin',
  '/*/connexion-client',
  '/*/activation-client',
  '/api/',
] as const;
