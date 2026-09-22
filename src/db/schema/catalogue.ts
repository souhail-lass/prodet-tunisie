import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { user } from './users';

export type ExtraPlacement = {
  familleSlug: string;
  sousCategorieSlug: string;
  sortOrder: number | null;
};

/**
 * The website catalogue. Each row is either mirrored from Swiver
 * (`source = 'swiver'`, keyed by `swiver_id`) or admin-created
 * (`source = 'custom'`). Base fields are refreshed by the Swiver sync;
 * the CMS override fields (tagline, description, sheet, image, …) are edited
 * by operators and PRESERVED across re-syncs. `unit_price` is private and is
 * never exposed on the public site.
 */
export const catalogueProduct = pgTable(
  'catalogue_product',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    source: text('source').notNull().default('swiver'),
    swiverId: text('swiver_id').unique(),
    sku: text('sku'),
    // base (synced from Swiver / set for custom):
    name: text('name').notNull(),
    baseImageUrl: text('base_image_url'),
    baseCategory: text('base_category'),
    baseDescription: text('base_description'),
    unitPrice: numeric('unit_price', { precision: 12, scale: 3 }),
    // CMS overrides (FR):
    displayName: text('display_name'),
    tagline: text('tagline'),
    description: text('description'),
    howToUse: text('how_to_use'),
    dosage: text('dosage'),
    specs: jsonb('specs'),
    technicalSheetUrl: text('technical_sheet_url'),
    safetySheetUrl: text('safety_sheet_url'),
    imageUrl: text('image_url'),
    // browse curation — null means "let the keyword classifier decide", which
    // is what keeps freshly synced Swiver products placing themselves:
    familleSlug: text('famille_slug'),
    sousCategorieSlug: text('sous_categorie_slug'),
    sortOrder: integer('sort_order'),
    /**
     * Additional browse listings besides the primary placement above.
     * `[{ familleSlug, sousCategorieSlug, sortOrder }]`. Empty = one home.
     */
    extraPlacements: jsonb('extra_placements')
      .$type<ExtraPlacement[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    // position in the flat "Tous les produits" listing, which is a different
    // axis from sort_order: that one is a rank inside one sous-catégorie.
    catalogueRank: integer('catalogue_rank'),
    // visibility:
    hidden: boolean('hidden').notNull().default(false),
    featured: boolean('featured').notNull().default(false),
    // meta:
    syncedAt: timestamp('synced_at', { withTimezone: true }),
    updatedByUserId: uuid('updated_by_user_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    hiddenIdx: index('catalogue_product_hidden_idx').on(t.hidden),
    categoryIdx: index('catalogue_product_category_idx').on(t.baseCategory),
    skuIdx: index('catalogue_product_sku_idx').on(t.sku),
    placementIdx: index('catalogue_product_placement_idx').on(
      t.familleSlug,
      t.sousCategorieSlug,
      t.sortOrder,
    ),
    catalogueRankIdx: index('catalogue_product_rank_idx').on(t.catalogueRank),
  }),
);
