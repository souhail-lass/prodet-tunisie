import { notFound } from 'next/navigation';
import { getAdminProduct } from '@/features/catalogue/queries';
import {
  adminCatalogueListPath,
  parseAdminCatalogueQuery,
  withAdminCatalogueQuery,
} from '@/lib/admin-catalogue-query';
import { ProductForm } from '../product-form';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = parseAdminCatalogueQuery(await searchParams);
  const row = await getAdminProduct(id);
  if (!row) notFound();

  return (
    <ProductForm
      listHref={adminCatalogueListPath(query)}
      rangementHref={withAdminCatalogueQuery('/admin/produits/rangement', query)}
      initial={{
        id: row.id,
        isCustom: row.source === 'custom',
        name: row.name,
        sku: row.sku ?? '',
        baseCategory: row.baseCategory ?? '',
        baseImageUrl: row.baseImageUrl ?? '',
        displayName: row.displayName ?? '',
        tagline: row.tagline ?? '',
        description: row.description ?? '',
        howToUse: row.howToUse ?? '',
        dosage: row.dosage ?? '',
        specs: row.specs ?? [],
        technicalSheetUrl: row.technicalSheetUrl ?? '',
        safetySheetUrl: row.safetySheetUrl ?? '',
        imageUrl: row.imageUrl ?? '',
        hidden: row.hidden,
        featured: row.featured,
        familleSlug: row.familleSlug ?? '',
        sousCategorieSlug: row.sousCategorieSlug ?? '',
        extraPlacements: row.extraPlacements,
      }}
    />
  );
}
