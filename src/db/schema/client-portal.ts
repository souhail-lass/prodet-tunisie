import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { customer } from './customers';
import { product } from './products';

export const customerUsualProduct = pgTable(
  'customer_usual_product',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customer.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => product.id, { onDelete: 'cascade' }),
    defaultQuantity: integer('default_quantity').notNull().default(1),
    note: text('note'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    customerProductIdx: uniqueIndex('customer_usual_product_customer_product_idx').on(
      t.customerId,
      t.productId,
    ),
    customerActiveIdx: index('customer_usual_product_customer_active_idx').on(
      t.customerId,
      t.isActive,
    ),
    defaultQuantityPositive: check(
      'customer_usual_product_default_quantity_positive',
      sql`${t.defaultQuantity} >= 1`,
    ),
  }),
);
