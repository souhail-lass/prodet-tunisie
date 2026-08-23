import { sql } from 'drizzle-orm';
import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Cross-instance rate-limit counters. See ADR 0013 — the previous in-memory
 * Map was per-lambda on Vercel, so published limits were unenforced in
 * production. One row per `scope:identifier` bucket, counted with an atomic
 * upsert; expired rows are swept opportunistically.
 */
export const rateLimitBucket = pgTable(
  'rate_limit_bucket',
  {
    key: text('key').primaryKey(),
    count: integer('count').notNull().default(0),
    resetAt: timestamp('reset_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    resetAtIdx: index('rate_limit_bucket_reset_at_idx').on(t.resetAt),
  }),
);
