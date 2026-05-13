import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  vector,
} from 'drizzle-orm/pg-core';
import {
  aliasScopeEnum,
  aliasValidationStatusEnum,
  localeEnum,
  productAssetKindEnum,
} from './enums';
import { category, family, sector } from './taxonomy';
import { customer } from './customers';
import { user } from './users';

/**
 * Canonical product, mirrored from Swiver and enriched in Prodet Platform.
 * `name_canonical` is the official Swiver name; localized names live in
 * `product_translation`.
 */
export const product = pgTable(
  'product',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    swiverId: text('swiver_id').unique(),
    code: text('code').notNull().unique(),
    slug: text('slug').notNull().unique(),
    nameCanonical: text('name_canonical').notNull(),
    categoryId: uuid('category_id').references(() => category.id, {
      onDelete: 'restrict',
    }),
    familyId: uuid('family_id').references(() => family.id, {
      onDelete: 'set null',
    }),
    isManufacturedByProdet: boolean('is_manufactured_by_prodet').notNull().default(false),
    isVisiblePublic: boolean('is_visible_public').notNull().default(false),
    conditionnement: text('conditionnement'),
    unitOfSale: text('unit_of_sale'),
    /**
     * Generated normalized search column used by pg_trgm.
     * Defined here as a regular text column; the migration adds the
     * `GENERATED ALWAYS AS (lower(unaccent(...))) STORED` semantics via SQL.
     */
    searchText: text('search_text').notNull().default(''),
    notesInternal: text('notes_internal'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    visibleCategoryIdx: index('product_visible_category_idx').on(t.isVisiblePublic, t.categoryId),
    searchTrgmIdx: index('product_search_trgm_idx').using('gin', sql`${t.searchText} gin_trgm_ops`),
  }),
);

export const productTranslation = pgTable(
  'product_translation',
  {
    productId: uuid('product_id')
      .notNull()
      .references(() => product.id, { onDelete: 'cascade' }),
    locale: localeEnum('locale').notNull(),
    name: text('name').notNull(),
    shortDescription: text('short_description'),
    longDescription: text('long_description'),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.productId, t.locale] }),
  }),
);

/**
 * Customer- or globally-scoped alias for a product.
 * The matching engine's load-bearing table.
 */
export const productAlias = pgTable(
  'product_alias',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => product.id, { onDelete: 'cascade' }),
    aliasText: text('alias_text').notNull(),
    aliasTextNormalized: text('alias_text_normalized').notNull().default(''),
    scope: aliasScopeEnum('scope').notNull(),
    customerId: uuid('customer_id').references(() => customer.id, {
      onDelete: 'cascade',
    }),
    validationStatus: aliasValidationStatusEnum('validation_status').notNull().default('proposed'),
    confidence: numeric('confidence', { precision: 4, scale: 3 }),
    createdBy: uuid('created_by').references(() => user.id, {
      onDelete: 'set null',
    }),
    validatedBy: uuid('validated_by').references(() => user.id, {
      onDelete: 'set null',
    }),
    sourceOrderDraftId: uuid('source_order_draft_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    validatedAt: timestamp('validated_at', { withTimezone: true }),
  },
  (t) => ({
    aliasNormalizedTrgmIdx: index('alias_normalized_trgm_idx').using(
      'gin',
      sql`${t.aliasTextNormalized} gin_trgm_ops`,
    ),
    scopeCustomerIdx: index('alias_scope_customer_idx').on(t.scope, t.customerId),
  }),
);

export const productAsset = pgTable('product_asset', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .notNull()
    .references(() => product.id, { onDelete: 'cascade' }),
  kind: productAssetKindEnum('kind').notNull(),
  locale: localeEnum('locale'),
  storagePath: text('storage_path').notNull(),
  mimeType: text('mime_type'),
  byteSize: integer('byte_size'),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

/**
 * Per-product embedding for vector search.
 * 1536 dims matches text-embedding-3-small. Adjust if the embedding
 * model changes (record in source_text_hash whether re-embed needed).
 */
export const productEmbedding = pgTable('product_embedding', {
  productId: uuid('product_id')
    .primaryKey()
    .references(() => product.id, { onDelete: 'cascade' }),
  model: text('model').notNull(),
  dimensions: integer('dimensions').notNull(),
  vector: vector('vector', { dimensions: 1536 }).notNull(),
  sourceTextHash: text('source_text_hash').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

/**
 * Product <-> sector many-to-many recommendation.
 */
export const productSector = pgTable(
  'product_sector',
  {
    productId: uuid('product_id')
      .notNull()
      .references(() => product.id, { onDelete: 'cascade' }),
    sectorId: uuid('sector_id')
      .notNull()
      .references(() => sector.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.productId, t.sectorId] }),
  }),
);
