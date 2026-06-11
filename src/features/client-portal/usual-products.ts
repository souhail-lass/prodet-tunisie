import { and, asc, count, eq, isNull } from 'drizzle-orm';
import type { Locale } from '@/i18n/routing';

export type CustomerUsualProductItem = {
  id: string;
  productId: string;
  slug: string;
  productName: string;
  categoryName: string | null;
  conditionnement: string | null;
  unitOfSale: string | null;
  defaultQuantity: number;
  note: string | null;
  updatedAt: Date;
};

export async function listCustomerUsualProducts({
  customerId,
  locale,
}: {
  customerId: string;
  locale: Locale;
}): Promise<CustomerUsualProductItem[]> {
  const { db, schema } = await import('@/db/client');

  const rows = await db
    .select({
      id: schema.customerUsualProduct.id,
      productId: schema.product.id,
      slug: schema.product.slug,
      translatedName: schema.productTranslation.name,
      nameCanonical: schema.product.nameCanonical,
      categoryNameFr: schema.category.nameFr,
      categoryNameAr: schema.category.nameAr,
      categoryNameEn: schema.category.nameEn,
      conditionnement: schema.product.conditionnement,
      unitOfSale: schema.product.unitOfSale,
      defaultQuantity: schema.customerUsualProduct.defaultQuantity,
      note: schema.customerUsualProduct.note,
      updatedAt: schema.customerUsualProduct.updatedAt,
    })
    .from(schema.customerUsualProduct)
    .innerJoin(schema.product, eq(schema.customerUsualProduct.productId, schema.product.id))
    .leftJoin(
      schema.productTranslation,
      and(
        eq(schema.productTranslation.productId, schema.product.id),
        eq(schema.productTranslation.locale, locale),
      ),
    )
    .leftJoin(schema.category, eq(schema.product.categoryId, schema.category.id))
    .where(
      and(
        eq(schema.customerUsualProduct.customerId, customerId),
        eq(schema.customerUsualProduct.isActive, true),
        isNull(schema.product.deletedAt),
      ),
    )
    .orderBy(asc(schema.category.displayOrder), asc(schema.product.nameCanonical));

  return rows.map((row) => ({
    id: row.id,
    productId: row.productId,
    slug: row.slug,
    productName: row.translatedName || row.nameCanonical,
    categoryName: getCategoryName(row, locale),
    conditionnement: row.conditionnement,
    unitOfSale: row.unitOfSale,
    defaultQuantity: row.defaultQuantity,
    note: row.note,
    updatedAt: row.updatedAt,
  }));
}

export async function countCustomerUsualProducts(customerId: string): Promise<number> {
  const { db, schema } = await import('@/db/client');

  const [row] = await db
    .select({ value: count() })
    .from(schema.customerUsualProduct)
    .innerJoin(schema.product, eq(schema.customerUsualProduct.productId, schema.product.id))
    .where(
      and(
        eq(schema.customerUsualProduct.customerId, customerId),
        eq(schema.customerUsualProduct.isActive, true),
        isNull(schema.product.deletedAt),
      ),
    );

  return Number(row?.value ?? 0);
}

function getCategoryName(
  row: {
    categoryNameFr: string | null;
    categoryNameAr: string | null;
    categoryNameEn: string | null;
  },
  locale: Locale,
): string | null {
  if (locale === 'ar') return row.categoryNameAr || row.categoryNameFr;
  if (locale === 'en') return row.categoryNameEn || row.categoryNameFr;
  return row.categoryNameFr;
}
