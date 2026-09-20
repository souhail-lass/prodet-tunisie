export type AdminCatalogueQuery = {
  q: string;
  cat: string;
  v: 'all' | 'visible' | 'hidden';
};

const VISIBILITY = new Set(['all', 'visible', 'hidden']);

export function parseAdminCatalogueQuery(
  source: URLSearchParams | Record<string, string | string[] | undefined>,
): AdminCatalogueQuery {
  const get = (key: string): string => {
    if (source instanceof URLSearchParams) return source.get(key) ?? '';
    const raw = source[key];
    if (Array.isArray(raw)) return raw[0] ?? '';
    return raw ?? '';
  };
  const v = get('v');
  return {
    q: get('q'),
    cat: get('cat').trim() || 'all',
    v: VISIBILITY.has(v) ? (v as AdminCatalogueQuery['v']) : 'all',
  };
}

export function adminCatalogueListPath(query: AdminCatalogueQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.cat && query.cat !== 'all') params.set('cat', query.cat);
  if (query.v && query.v !== 'all') params.set('v', query.v);
  const qs = params.toString();
  return qs ? `/admin/produits?${qs}` : '/admin/produits';
}

export function withAdminCatalogueQuery(path: string, query: AdminCatalogueQuery): string {
  const qs = adminCatalogueListPath(query).split('?')[1];
  return qs ? `${path}?${qs}` : path;
}

/** next-intl Link/router drop query strings; prefix the locale and use next/link. */
export function localePrefixedPath(locale: string, path: string): string {
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}
