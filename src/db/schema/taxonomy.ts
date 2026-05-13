import { sql } from 'drizzle-orm';
import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Sectors served (hotels, restaurants, cafés, ...).
 * See docs/00-overview/sectors.md.
 */
export const sector = pgTable('sector', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  nameFr: text('name_fr').notNull(),
  nameAr: text('name_ar'),
  nameEn: text('name_en'),
  descriptionFr: text('description_fr'),
  descriptionAr: text('description_ar'),
  descriptionEn: text('description_en'),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

/**
 * Top-level product categories (détergents, désinfectants, accessoires, ...).
 */
export const category = pgTable('category', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  nameFr: text('name_fr').notNull(),
  nameAr: text('name_ar'),
  nameEn: text('name_en'),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

/**
 * Sub-grouping under a category (javellisants under désinfectants, etc.).
 */
export const family = pgTable('family', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => category.id, { onDelete: 'restrict' }),
  nameFr: text('name_fr').notNull(),
  nameAr: text('name_ar'),
  nameEn: text('name_en'),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});
