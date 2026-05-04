import { sql } from 'drizzle-orm';
import { boolean, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { localeEnum, userCustomerRoleEnum, userRoleEnum } from './enums';
import { customer } from './customers';

/**
 * Application users (admins, operators, reviewers, customer users).
 * `auth_id` is the Supabase Auth UUID; we keep a thin profile of our own.
 */
export const user = pgTable('app_user', {
  id: uuid('id').primaryKey().defaultRandom(),
  authId: uuid('auth_id').unique(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  role: userRoleEnum('role').notNull().default('operator'),
  defaultLocale: localeEnum('default_locale').notNull().default('fr'),
  isActive: boolean('is_active').notNull().default(true),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export const userCustomer = pgTable(
  'user_customer',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customer.id, { onDelete: 'cascade' }),
    role: userCustomerRoleEnum('role').notNull().default('purchaser'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.customerId] }),
  }),
);
