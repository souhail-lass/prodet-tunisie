import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import {
  extractionStatusEnum,
  matchReasonEnum,
  orderAttachmentKindEnum,
  orderSourceEnum,
  orderStatusEnum,
  swiverExportStatusEnum,
} from './enums';
import { customer } from './customers';
import { product } from './products';
import { user } from './users';

/**
 * Order draft — created from email/PDF/web/phone, awaiting human approval.
 * Becomes `exported` once the operator copies it into Swiver.
 */
export const orderDraft = pgTable(
  'order_draft',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    referenceCode: text('reference_code').notNull().unique(),
    customerId: uuid('customer_id').references(() => customer.id, {
      onDelete: 'set null',
    }),
    customerSnapshot: jsonb('customer_snapshot'),
    source: orderSourceEnum('source').notNull(),
    status: orderStatusEnum('status').notNull().default('parsing'),
    swiverExportStatus: swiverExportStatusEnum('swiver_export_status').notNull().default('none'),
    swiverDocumentRef: text('swiver_document_ref'),
    rawInbound: jsonb('raw_inbound'),
    extractionConfidence: numeric('extraction_confidence', {
      precision: 4,
      scale: 3,
    }),
    requestedDeliveryAt: timestamp('requested_delivery_at', {
      withTimezone: true,
    }),
    notesInternal: text('notes_internal'),
    createdBy: uuid('created_by').references(() => user.id, {
      onDelete: 'set null',
    }),
    approvedBy: uuid('approved_by').references(() => user.id, {
      onDelete: 'set null',
    }),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    exportedAt: timestamp('exported_at', { withTimezone: true }),
    rejectedAt: timestamp('rejected_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    statusCreatedIdx: index('order_draft_status_created_idx').on(t.status, t.createdAt),
    customerIdx: index('order_draft_customer_idx').on(t.customerId),
  }),
);

export const orderLine = pgTable(
  'order_line',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderDraftId: uuid('order_draft_id')
      .notNull()
      .references(() => orderDraft.id, { onDelete: 'cascade' }),
    lineNumber: integer('line_number').notNull(),
    rawText: text('raw_text').notNull(),
    quantity: numeric('quantity', { precision: 12, scale: 3 }).notNull(),
    unit: text('unit'),
    matchedProductId: uuid('matched_product_id').references(() => product.id, {
      onDelete: 'set null',
    }),
    matchConfidence: numeric('match_confidence', { precision: 4, scale: 3 }),
    matchReason: matchReasonEnum('match_reason'),
    candidates: jsonb('candidates'),
    operatorOverride: jsonb('operator_override'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    draftLineIdx: index('order_line_draft_line_idx').on(t.orderDraftId, t.lineNumber),
  }),
);

export const orderAttachment = pgTable('order_attachment', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderDraftId: uuid('order_draft_id')
    .notNull()
    .references(() => orderDraft.id, { onDelete: 'cascade' }),
  kind: orderAttachmentKindEnum('kind').notNull(),
  storagePath: text('storage_path').notNull(),
  mimeType: text('mime_type'),
  byteSize: integer('byte_size'),
  fileName: text('file_name'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export const extractionJob = pgTable('extraction_job', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderDraftId: uuid('order_draft_id')
    .notNull()
    .references(() => orderDraft.id, { onDelete: 'cascade' }),
  inputHash: text('input_hash').notNull(),
  modelName: text('model_name').notNull(),
  promptVersion: text('prompt_version').notNull(),
  rawOutput: jsonb('raw_output'),
  zodErrors: jsonb('zod_errors'),
  status: extractionStatusEnum('status').notNull(),
  durationMs: integer('duration_ms'),
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),
  costUsd: numeric('cost_usd', { precision: 10, scale: 4 }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});
