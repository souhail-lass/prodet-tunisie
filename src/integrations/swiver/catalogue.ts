import 'server-only';
import { unstable_cache } from 'next/cache';
import { getSwiverAdapter, type SwiverProduct } from '.';

/**
 * The synced Swiver product catalogue (all enabled products), cached for an
 * hour so the public catalogue / admin don't sweep the API on every request.
 * Read-only. Call `revalidateTag('swiver-products')` after an admin action to
 * force a refresh.
 */
export const getSwiverCatalogueProducts = unstable_cache(
  async (): Promise<SwiverProduct[]> => {
    try {
      return await getSwiverAdapter().products.listProducts({});
    } catch {
      return [];
    }
  },
  ['swiver-catalogue-products'],
  { revalidate: 3600, tags: ['swiver-products'] },
);

export const SWIVER_PRODUCTS_TAG = 'swiver-products';
