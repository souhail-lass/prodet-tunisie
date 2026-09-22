import { ReorderBuilder } from '@/components/portal/reorder-builder';
import type { PortalProductRef } from '@/features/client-portal/mock/portal-mock';
import { getOrderableCatalogue, type OrderableProduct } from '@/features/catalogue/queries';
import { listMySmartHabituals } from '@/features/client-portal/habituals';
import { getMyOrderDetail } from '@/features/client-portal/orders';
import { getMyDocumentLines } from '@/features/client-portal/swiver-documents';

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
    browseBucket: p.browseBucket,
  };
}

export default async function CommanderPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; add?: string; q?: string; devis?: string }>;
}) {
  const { from, add, q, devis } = await searchParams;

  const cataloguePromise = getOrderableCatalogue().then(
    (rows) => rows.map(toRef),
    () => [] as PortalProductRef[],
  );
  const orderPromise = from ? getMyOrderDetail(from).catch(() => null) : Promise.resolve(null);
  const devisPromise = devis ? getMyDocumentLines(devis).catch(() => null) : Promise.resolve(null);
  const habitualsPromise = listMySmartHabituals(24).catch(() => []);

  const catalogue = await cataloguePromise;
  const bySlug = new Map(catalogue.map((p) => [p.slug, p]));

  const initialQty: Record<string, number> = {};
  const extra: PortalProductRef[] = [];

  if (add) {
    const p = catalogue.find((c) => c.slug === add || c.swiverId === add || c.sku === add);
    if (p) {
      initialQty[p.slug] = 1;
      extra.push(p);
    }
  }

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

  const quote = await devisPromise;
  if (quote) {
    noticeFrom = quote.reference;
    for (const line of quote.lines) {
      const p = catalogue.find((c) => c.swiverId === line.productSwiverId);
      if (p) {
        initialQty[p.slug] = (initialQty[p.slug] ?? 0) + line.quantity;
        if (!extra.some((e) => e.slug === p.slug)) extra.push(p);
      }
    }
  }

  // Real purchase-history habituals (factures + portail). Never fake with
  // catalogue head — empty habituels is honest and pushes the UX buckets.
  const habituals = await habitualsPromise;
  const frequent: PortalProductRef[] = habituals.map((f) => {
    const p =
      (f.sku ? bySlug.get(f.sku) : undefined) ??
      (f.swiverId ? catalogue.find((c) => c.swiverId === f.swiverId) : undefined);
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
      browseBucket: p?.browseBucket ?? null,
      last: f.hint,
    };
  });

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
