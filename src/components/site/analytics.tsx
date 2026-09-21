import Script from 'next/script';
import { Analytics as VercelAnalytics } from '@vercel/analytics/next';

/**
 * Audience measurement on the public site.
 *
 * Vercel Web Analytics (`@vercel/analytics`) is first-party — no cookie
 * banner. It only records in production after a deploy. Plausible is optional
 * and only loads when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set.
 */
export function Analytics() {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim();

  return (
    <>
      <VercelAnalytics />
      {plausibleDomain && process.env.NODE_ENV === 'production' ? (
        <Script
          src="https://plausible.io/js/script.js"
          data-domain={plausibleDomain}
          strategy="afterInteractive"
          defer
        />
      ) : null}
    </>
  );
}
