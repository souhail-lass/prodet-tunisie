const LAST_CATALOGUE_BROWSE_KEY = 'prodet:last-catalogue-browse';

export function rememberCatalogueBrowse(pathname: string) {
  if (!pathname.startsWith('/produits/')) return;
  try {
    sessionStorage.setItem(LAST_CATALOGUE_BROWSE_KEY, pathname);
  } catch {
    // Private mode / disabled storage — Retour still has a sous-catégorie fallback.
  }
}

export function readLastCatalogueBrowse(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = sessionStorage.getItem(LAST_CATALOGUE_BROWSE_KEY);
    return value && value.startsWith('/produits/') ? value : null;
  } catch {
    return null;
  }
}
