import { adminCatalogueListPath, parseAdminCatalogueQuery, withAdminCatalogueQuery } from '@/lib/admin-catalogue-query';
import { ProductForm } from '../product-form';

export const dynamic = 'force-dynamic';

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseAdminCatalogueQuery(await searchParams);
  return (
    <ProductForm
      listHref={adminCatalogueListPath(query)}
      rangementHref={withAdminCatalogueQuery('/admin/produits/rangement', query)}
      initial={{
        isCustom: true,
        name: '',
        sku: '',
        baseCategory: '',
        baseImageUrl: '',
        displayName: '',
        tagline: '',
        description: '',
        howToUse: '',
        dosage: '',
        specs: [],
        technicalSheetUrl: '',
        safetySheetUrl: '',
        imageUrl: '',
        hidden: false,
        featured: false,
        familleSlug: '',
        sousCategorieSlug: '',
        extraPlacements: [],
      }}
    />
  );
}
