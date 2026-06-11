import 'server-only';
import { getServerEnv } from '@/lib/env';
import { SIGNED_URL_EXPIRES_SECONDS } from './constants';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export class DocumentsStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DocumentsStorageError';
  }
}

export class DocumentsStorageUnavailableError extends DocumentsStorageError {
  constructor(
    message = 'Supabase Storage bucket for customer documents is not configured.',
  ) {
    super(message);
    this.name = 'DocumentsStorageUnavailableError';
  }
}

function bucketName(): string {
  return getServerEnv().SUPABASE_CUSTOMER_DOCUMENTS_BUCKET;
}

/**
 * Probe the bucket. We do not auto-create — bucket creation is an explicit,
 * one-time ops step so we keep policies and naming under human control.
 */
export async function assertCustomerDocumentsBucketReady(): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.getBucket(bucketName());
  if (error || !data) {
    throw new DocumentsStorageUnavailableError(
      `Storage bucket "${bucketName()}" is missing. Create it as private in Supabase Storage.`,
    );
  }
}

export async function uploadCustomerDocument(params: {
  storagePath: string;
  bytes: ArrayBuffer | Uint8Array;
  contentType: string;
}): Promise<void> {
  const admin = createSupabaseAdminClient();
  const buffer = params.bytes instanceof Uint8Array ? params.bytes : new Uint8Array(params.bytes);
  const { error } = await admin.storage.from(bucketName()).upload(params.storagePath, buffer, {
    contentType: params.contentType,
    upsert: false,
  });
  if (error) {
    throw new DocumentsStorageError(error.message);
  }
}

export async function deleteCustomerDocumentObject(storagePath: string): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.storage.from(bucketName()).remove([storagePath]);
  if (error) {
    throw new DocumentsStorageError(error.message);
  }
}

export async function createCustomerDocumentSignedUrl(
  storagePath: string,
  options?: { expiresIn?: number; downloadFileName?: string },
): Promise<string> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage
    .from(bucketName())
    .createSignedUrl(storagePath, options?.expiresIn ?? SIGNED_URL_EXPIRES_SECONDS, {
      download: options?.downloadFileName,
    });
  if (error || !data?.signedUrl) {
    throw new DocumentsStorageError(error?.message ?? 'Could not create signed URL.');
  }
  return data.signedUrl;
}

/**
 * Canonical storage path. We never trust user-supplied filenames in the
 * path — the actual file name is preserved only on the DB row.
 */
export function buildCustomerDocumentStoragePath(params: {
  customerId: string;
  documentId: string;
  extension: string;
}): string {
  const ext = sanitiseExtension(params.extension);
  return `${params.customerId}/${params.documentId}${ext ? `.${ext}` : ''}`;
}

function sanitiseExtension(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8);
}

export function extensionFromFileName(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  if (dot <= 0 || dot === fileName.length - 1) return '';
  return fileName.slice(dot + 1);
}
