/**
 * Customer document constraints. Centralised so the upload server action,
 * the upload UI hint, and any future webhook share the exact same rules.
 */

/** 25 MB hard cap. Anything larger should travel via direct email anyway. */
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

/**
 * MIME allow-list. We deliberately do not allow executables, archives, or
 * images of unknown origin. Microsoft Office formats are accepted via their
 * canonical OOXML and legacy MIME types.
 */
export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel.sheet.macroEnabled.12',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'text/plain',
  'image/png',
  'image/jpeg',
] as const;

export type AllowedDocumentMime = (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number];

export const DOCUMENT_KIND_LABELS = {
  purchase_order: 'Bon de commande',
  invoice: 'Facture',
  delivery_note: 'Bon de livraison',
  erp_export: 'Export ERP',
  spreadsheet: 'Tableur',
  other: 'Autre document',
} as const;

export type DocumentKind = keyof typeof DOCUMENT_KIND_LABELS;

export const DOCUMENT_KIND_ORDER: DocumentKind[] = [
  'purchase_order',
  'invoice',
  'delivery_note',
  'erp_export',
  'spreadsheet',
  'other',
];

/** Two minutes is enough for an end-user to click through to open a file. */
export const SIGNED_URL_EXPIRES_SECONDS = 120;
