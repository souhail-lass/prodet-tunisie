import { Suspense } from 'react';
import { ReorderBuilder } from '@/components/portal/reorder-builder';
import type { PortalProductRef } from '@/features/client-portal/mock/portal-mock';
import { getOrderableCatalogue, type OrderableProduct } from '@/features/catalogue/queries';
import { listMySmartHabituals } from '@/features/client-portal/habituals';
import { getMyOrderDetail } from '@/features/client-portal/orders';
import { getMyDocumentLines } from '@/features/client-portal/swiver-documents';

export const dynamic = 'force-dynamic';

/** Cap of packshots shipped in the RSC payload (search still has name/sku). */
const IMAGE_SEED_CAP = 60;

function toRef(p: OrderableProduct, withImage: boolean): PortalProductRef {
  return {
    slug: p.sku || p.swiverId,
    name: p.name,
    tagline: '',
    image: withImage && p.image ? p.image : undefined,
    format: '',
    made: true,
    swiverId: p.swiverId,
    sku: p.sku,
    unitPrice: p.unitPrice,
    category: p.categoryLabel,
    browseBucket: p.browseBucket,
  };
}

function mapCatalogue(rows: OrderableProduct[], imageSlugs: Set<string>): PortalProductRef[] {
  return rows.map((p) => {
    const slug = p.sku || p.swiverId;
    return toRef(p, imageSlugs.has(slug));
  });
}

function seedImageSlugs(rows: OrderableProduct[]): Set<string> {
  const imageSlugs = new Set<string>();
  for (const p of rows.slice(0, IMAGE_SEED_CAP)) {
    imageSlugs.add(p.sku || p.swiverId);
  }
  return imageSlugs;
}

export default async function CommanderPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; add?: string; q?: string; devis?: string }>;
}) {
  const params = await searchParams;

  // Catalogue is warm-cached (5 min) — paint the desk without waiting on Swiver.
  const catalogueRows = await getOrderableCatalogue().catch(() => [] as OrderableProduct[]);
  const seedCatalogue = mapCatalogue(catalogueRows, seedImageSlugs(catalogueRows));

  return (
    <Suspense
      fallback={
        <ReorderBuilder
          catalogue={seedCatalogue}
          frequent={[]}
          initialQty={{}}
          initialExtra={[]}
          initialQuery={params.q}
          habitualsPending
        />
      }
    >
      <CommanderLoaded catalogueRows={catalogueRows} params={params} />
    </Suspense>
  );
}

async function CommanderLoaded({
  catalogueRows,
  params,
}: {
  catalogueRows: OrderableProduct[];
  params: { from?: string; add?: string; q?: string; devis?: string };
}) {
  const { from, add, q, devis } = params;

  const [habituals, order, quote] = await Promise.all([
    listMySmartHabituals(24).catch(() => []),
    from ? getMyOrderDetail(from).catch(() => null) : Promise.resolve(null),
    devis ? getMyDocumentLines(devis).catch(() => null) : Promise.resolve(null),
  ]);

  const bySku = new Map(catalogueRows.map((p) => [p.sku || p.swiverId, p]));
  const bySwiver = new Map(catalogueRows.map((p) => [p.swiverId, p]));

  const initialQty: Record<string, number> = {};
  const extra: PortalProductRef[] = [];
  const imageSlugs = seedImageSlugs(catalogueRows);

  if (add) {
    const p =
      catalogueRows.find((c) => c.sku === add || c.swiverId === add) ??
      bySku.get(add) ??
      bySwiver.get(add);
    if (p) {
      const slug = p.sku || p.swiverId;
      initialQty[slug] = 1;
      imageSlugs.add(slug);
      extra.push(toRef(p, true));
    }
  }

  let noticeFrom: string | undefined;
  if (order) {
    noticeFrom = order.reference;
    for (const line of order.lines) {
      const p = line.sku ? bySku.get(line.sku) : undefined;
      if (p && line.quantity > 0) {
        const slug = p.sku || p.swiverId;
        initialQty[slug] = Math.trunc(line.quantity);
        imageSlugs.add(slug);
        if (!extra.some((e) => e.slug === slug)) extra.push(toRef(p, true));
      }
    }
  }

  if (quote) {
    noticeFrom = quote.reference;
    for (const line of quote.lines) {
      const p = bySwiver.get(line.productSwiverId);
      if (p) {
        const slug = p.sku || p.swiverId;
        initialQty[slug] = (initialQty[slug] ?? 0) + line.quantity;
        imageSlugs.add(slug);
        if (!extra.some((e) => e.slug === slug)) extra.push(toRef(p, true));
      }
    }
  }

  for (const f of habituals) {
    if (f.sku) imageSlugs.add(f.sku);
    if (f.swiverId) {
      const hit = bySwiver.get(f.swiverId);
      if (hit) imageSlugs.add(hit.sku || hit.swiverId);
      else imageSlugs.add(f.swiverId);
    }
  }

  const catalogue = mapCatalogue(catalogueRows, imageSlugs);

  const frequent: PortalProductRef[] = habituals.map((f) => {
    const p =
      (f.sku ? bySku.get(f.sku) : undefined) ?? (f.swiverId ? bySwiver.get(f.swiverId) : undefined);
    return {
      slug: p ? p.sku || p.swiverId : f.slug,
      name: f.name,
      tagline: '',
      image: (p?.image ?? f.image) || undefined,
      format: '',
      made: true,
      swiverId: p?.swiverId ?? f.swiverId,
      sku: p?.sku ?? f.sku,
      unitPrice: p?.unitPrice ?? f.unitPrice,
      category: p?.categoryLabel ?? null,
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
