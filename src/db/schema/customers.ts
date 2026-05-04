import { sql } from 'drizzle-orm';
import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { customerStatusEnum, localeEnum } from './enums';

export const customer = pgTable(
  'customer',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    swiverId: text('swiver_id').unique(),
    name: text('name').notNull(),
    displayName: text('display_name'),
    email: text('email'),
    phone: text('phone'),
    whatsapp: text('whatsapp'),
    addressLine1: text('address_line1'),
    addressLine2: text('address_line2'),
    city: text('city'),
    postalCode: text('postal_code'),
    country: text('country').notNull().default('Tunisia'),
    defaultLocale: localeEnum('default_locale').notNull().default('fr'),
    sectorKey: text('sector_key'),
    status: customerStatusEnum('status').notNull().default('prospect'),
    tags: text('tags').array(),
    notesInternal: text('notes_internal'),
    needsReview: boolean('needs_review').notNull().default(false),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    statusIdx: index('customer_status_idx').on(t.status),
  }),
);

export const customerContact = pgTable('customer_contact', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customer.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  role: text('role'),
  email: text('email'),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  isPrimary: boolean('is_primary').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});
