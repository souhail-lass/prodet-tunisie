import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * Locale codes used across product translations and customer defaults.
 * Mirrors src/i18n/routing.ts.
 */
export const localeEnum = pgEnum('locale', ['fr', 'ar', 'en']);

export const orderSourceEnum = pgEnum('order_source', [
  'phone',
  'email',
  'pdf',
  'web_quote',
  'portal',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'parsing',
  'review',
  'approved',
  'exported',
  'rejected',
]);

export const swiverExportStatusEnum = pgEnum('swiver_export_status', [
  'none',
  'manual_pending',
  'manual_done',
  'api_pushed',
  'failed',
]);

export const aliasScopeEnum = pgEnum('alias_scope', ['global', 'customer']);

export const aliasValidationStatusEnum = pgEnum('alias_validation_status', [
  'proposed',
  'confirmed',
  'rejected',
]);

export const productAssetKindEnum = pgEnum('product_asset_kind', [
  'image',
  'fiche_technique',
  'sds',
  'other',
]);

export const orderAttachmentKindEnum = pgEnum('order_attachment_kind', [
  'email_pdf',
  'email_image',
  'web_upload',
  'other',
]);

export const customerStatusEnum = pgEnum('customer_status', ['active', 'inactive', 'prospect']);

export const userRoleEnum = pgEnum('user_role', [
  'owner',
  'admin',
  'operator',
  'reviewer',
  'customer_user',
]);

export const userCustomerRoleEnum = pgEnum('user_customer_role', ['owner', 'purchaser', 'viewer']);

export const extractionStatusEnum = pgEnum('extraction_status', ['success', 'failure', 'partial']);

export const matchReasonEnum = pgEnum('match_reason', [
  'alias',
  'exact_code',
  'trigram',
  'vector',
  'llm_rerank',
]);
