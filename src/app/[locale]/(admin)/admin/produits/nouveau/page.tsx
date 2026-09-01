import { ProductForm } from '../product-form';

export const dynamic = 'force-dynamic';

export default function NewProductPage() {
  return (
    <ProductForm
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
      }}
    />
  );
}
