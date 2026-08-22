/**
 * Schema.org structured data (JSON-LD) builders.
 *
 * These produce plain objects that are rendered into the page via the
 * <JsonLd> component. They give Google explicit, machine-readable facts about
 * the company, the website, and each product — which is what powers the brand
 * Knowledge Panel ("prodet tunisie"), breadcrumb rich results, and product
 * understanding for generic queries.
 *
 * Absolute URLs are required by schema.org, so everything is built off the
 * stable canonical site URL (NEXT_PUBLIC_SITE_URL) rather than the request
 * host — keeping pages statically renderable.
 */
import { companyInfo } from '@/data/company';
import { getPublicEnv } from '@/lib/env';

/** Stable canonical origin, no trailing slash (e.g. https://prodet.com.tn). */
export function siteUrl(): string {
  return getPublicEnv().NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
}

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path: string): string {
  const base = siteUrl();
  if (!path) return base;
  return path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

const ORGANIZATION_ID = '#organization';
const WEBSITE_ID = '#website';

/** Non-null official profile URLs — drives schema.org `sameAs`. */
function sameAs(): string[] {
  return Object.values(companyInfo.social).filter((url): url is string => Boolean(url));
}

function postalAddress() {
  return {
    '@type': 'PostalAddress',
    streetAddress: '20 Rue de Somalie',
    addressLocality: "L'Aouina, Tunis",
    postalCode: '2045',
    addressCountry: 'TN',
  } as const;
}

/**
 * The company as both an Organization and a manufacturer/distributor with a
 * physical location. Emitted once, on the homepage, as the canonical entity
 * every other node references by @id.
 */
export function organizationNode() {
  const base = siteUrl();
  return {
    '@type': ['Organization', 'LocalBusiness'],
    '@id': `${base}/${ORGANIZATION_ID}`,
    name: companyInfo.name,
    legalName: companyInfo.name,
    url: base,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/brand/logo-prodet.png'),
    },
    image: absoluteUrl('/brand/logo-prodet.png'),
    description:
      "Fabricant et distributeur tunisien de produits d'entretien et d'hygiène professionnels pour hôtels, restaurants, entreprises et institutions.",
    email: companyInfo.email,
    telephone: companyInfo.phoneHref.replace('tel:', ''),
    address: postalAddress(),
    areaServed: companyInfo.areaServed,
    hasMap: companyInfo.mapHref,
    knowsLanguage: ['fr', 'ar'],
    sameAs: sameAs(),
  };
}

/** The website itself — anchors the brand search query to this domain. */
export function websiteNode() {
  const base = siteUrl();
  return {
    '@type': 'WebSite',
    '@id': `${base}/${WEBSITE_ID}`,
    url: base,
    name: companyInfo.name,
    inLanguage: 'fr-TN',
    publisher: { '@id': `${base}/${ORGANIZATION_ID}` },
  };
}

/**
 * Homepage graph: company entity + website in one @graph block. This is the
 * single most important structured-data payload on the site.
 */
export function siteGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationNode(), websiteNode()],
  };
}

export type ProductSchemaInput = {
  name: string;
  description?: string;
  slug: string;
  image?: string;
  category?: string;
  manufactured?: boolean;
};

/**
 * Product node. No price/offer is emitted on purpose — Prodet is B2B/devis with
 * no public pricing, so we describe the product and its maker without faking an
 * Offer (which would risk a structured-data penalty for missing price).
 */
export function productSchema(input: ProductSchemaInput) {
  const base = siteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description || undefined,
    image: input.image ? absoluteUrl(input.image) : undefined,
    category: input.category || undefined,
    url: absoluteUrl(`/fr/catalogue/${input.slug}`),
    brand: { '@type': 'Brand', name: companyInfo.name },
    ...(input.manufactured
      ? { manufacturer: { '@id': `${base}/${ORGANIZATION_ID}` } }
      : {}),
  };
}

export type BreadcrumbItem = { name: string; path: string };

/** Breadcrumb trail — wins the breadcrumb display in search results. */
export function breadcrumbSchema(items: readonly BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
