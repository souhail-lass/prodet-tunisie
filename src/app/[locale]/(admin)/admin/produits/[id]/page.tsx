import { notFound } from 'next/navigation';
import { getAdminProduct } from '@/features/catalogue/queries';
import { ProductForm } from '../product-form';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getAdminProduct(id);
  if (!row) notFound();

  return (
    <ProductForm
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
      }}
    />
  );
}
