import { ReorderBuilder } from '@/components/portal/reorder-builder';
import type { PortalProductRef } from '@/features/client-portal/mock/portal-mock';
import { getOrderableCatalogue, type OrderableProduct } from '@/features/catalogue/queries';
import { getMyOrderDetail, listMyFrequentProducts } from '@/features/client-portal/orders';

export const dynamic = 'force-dynamic';

function toRef(p: OrderableProduct): PortalProductRef {
  return {
    slug: p.sku || p.swiverId,
    name: p.name,
    tagline: '',
    image: p.image || undefined,
    format: '',
    made: true,
    swiverId: p.swiverId,
    sku: p.sku,
    unitPrice: p.unitPrice,
    category: p.categoryLabel,
  };
}

export default async function CommanderPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; add?: string; q?: string }>;
}) {
  const { from, add, q } = await searchParams;

  // Kick all three fetches off in parallel — catalogue is tag-cached, the
  // other two hit the DB; serializing them cost a full round-trip each.
  const cataloguePromise = getOrderableCatalogue().then(
    (rows) => rows.map(toRef),
    () => [] as PortalProductRef[],
  );
  const orderPromise = from ? getMyOrderDetail(from).catch(() => null) : Promise.resolve(null);
  const frequentPromise = listMyFrequentProducts(9).catch(() => []);

  const catalogue = await cataloguePromise;
  const bySlug = new Map(catalogue.map((p) => [p.slug, p]));

  const initialQty: Record<string, number> = {};
  const extra: PortalProductRef[] = [];

  // ?add=<sku|swiverId> — pre-select one product (quick reorder shortcut).
  if (add) {
    const p = catalogue.find((c) => c.slug === add || c.swiverId === add || c.sku === add);
    if (p) {
      initialQty[p.slug] = 1;
      extra.push(p);
    }
  }

  // ?from=<orderId> — pre-fill the full line list of a past order.
  let noticeFrom: string | undefined;
  const order = await orderPromise;
  if (order) {
    noticeFrom = order.reference;
    for (const line of order.lines) {
      const p = line.sku ? bySlug.get(line.sku) : undefined;
      if (p && line.quantity > 0) {
        initialQty[p.slug] = Math.trunc(line.quantity);
        if (!extra.some((e) => e.slug === p.slug)) extra.push(p);
      }
    }
  }

  // Frequent products from real order history; falls back to the catalogue
  // head so the grid is never empty for first-time clients.
  let frequent: PortalProductRef[] = [];
  {
    const freq = await frequentPromise;
    frequent = freq.map((f) => {
      const p = (f.sku ? bySlug.get(f.sku) : undefined) ?? (f.swiverId ? catalogue.find((c) => c.swiverId === f.swiverId) : undefined);
      return {
        slug: p?.slug ?? f.slug,
        name: f.name,
        tagline: '',
        image: (p?.image ?? f.image) || undefined,
        format: '',
        made: true,
        swiverId: p?.swiverId ?? f.swiverId,
        sku: p?.sku ?? f.sku,
        unitPrice: p?.unitPrice ?? f.unitPrice,
        category: p?.category ?? null,
        last: f.orderCount > 1 ? `Commandé ${f.orderCount}×` : undefined,
      };
    });
  }
  if (frequent.length === 0) frequent = catalogue.slice(0, 12);

  return (
    <ReorderBuilder
      catalogue={catalogue}
      frequent={frequent}
      initialQty={initialQty}
      initialExtra={extra}
      noticeFrom={noticeFrom}
      initialQuery={q}
    />
  );
}
