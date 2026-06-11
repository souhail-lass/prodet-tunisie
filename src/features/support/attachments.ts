import 'server-only';
import { getServerEnv } from '@/lib/env';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { TicketAttachment } from '@/db/schema/support';

export type { TicketAttachment };

/** A support attachment enriched with a stable, ownership-checked serve URL. */
export type TicketAttachmentView = TicketAttachment & {
  /** `/api/support/attachment/<messageId>?i=<idx>` — streams via the proxy route. */
  url: string;
  isImage: boolean;
};

/** 25 MB cap, same as customer documents. */
export const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_MESSAGE = 6;

/** Images (incl. iPhone HEIC) + the usual business document types. */
export const ALLOWED_ATTACHMENT_MIME = new Set<string>([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'text/plain',
]);

export function isAllowedAttachmentMime(type: string): boolean {
  return ALLOWED_ATTACHMENT_MIME.has(type);
}

export function isImageType(type: string): boolean {
  return type.startsWith('image/');
}

function bucket(): string {
  return getServerEnv().SUPABASE_CUSTOMER_DOCUMENTS_BUCKET;
}

function extFromName(name: string): string {
  const dot = name.lastIndexOf('.');
  if (dot <= 0 || dot === name.length - 1) return '';
  return name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
}

export type UploadResult =
  | { ok: true; attachment: TicketAttachment }
  | { ok: false; error: 'too-large' | 'mime' | 'failed' | 'unavailable' };

/**
 * Validate + store one support attachment. Path is uuid-based (not tied to a
 * ticket): authorization is enforced at serve time via the message→ticket→
 * customer chain, so the storage path never needs to encode ownership.
 */
export async function uploadSupportAttachment(file: {
  name: string;
  type: string;
  size: number;
  bytes: ArrayBuffer | Uint8Array;
}): Promise<UploadResult> {
  if (file.size <= 0 || file.size > MAX_ATTACHMENT_BYTES) return { ok: false, error: 'too-large' };
  if (!isAllowedAttachmentMime(file.type)) return { ok: false, error: 'mime' };

  const admin = createSupabaseAdminClient();
  const ext = extFromName(file.name);
  const path = `support/${crypto.randomUUID()}${ext ? `.${ext}` : ''}`;
  const bytes = file.bytes instanceof Uint8Array ? file.bytes : new Uint8Array(file.bytes);

  const { error } = await admin.storage.from(bucket()).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    return { ok: false, error: /not found|bucket/i.test(error.message) ? 'unavailable' : 'failed' };
  }

  return {
    ok: true,
    attachment: { path, name: file.name.slice(0, 200) || 'fichier', type: file.type, size: file.size },
  };
}

/** Download the raw bytes of a stored attachment (for the proxy route). */
export async function downloadSupportAttachment(
  path: string,
): Promise<{ bytes: Uint8Array; type: string } | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from(bucket()).download(path);
  if (error || !data) return null;
  return { bytes: new Uint8Array(await data.arrayBuffer()), type: data.type || 'application/octet-stream' };
}

/** Best-effort cleanup (e.g. when a ticket/message insert fails after upload). */
export async function deleteSupportAttachments(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  try {
    await createSupabaseAdminClient().storage.from(bucket()).remove(paths);
  } catch {
    // leave orphans for ops rather than throw on cleanup
  }
}

/** Only our own uuid-named support objects — never a customer-document path. */
const SUPPORT_PATH_RE = /^support\/[0-9a-f-]{36}(\.[a-z0-9]{1,8})?$/i;

/**
 * Re-validate attachment refs that came back from the browser before they are
 * persisted on a message. Without this a client could submit an arbitrary
 * `path` (e.g. someone else's document) or a disallowed MIME. Paths are
 * restricted to the unguessable `support/<uuid>` objects this server minted.
 */
export function sanitizeIncomingAttachments(raw: unknown): TicketAttachment[] {
  if (!Array.isArray(raw)) return [];
  const out: TicketAttachment[] = [];
  for (const item of raw.slice(0, MAX_ATTACHMENTS_PER_MESSAGE)) {
    if (!item || typeof item !== 'object') continue;
    const { path, name, type, size } = item as Record<string, unknown>;
    if (typeof path !== 'string' || !SUPPORT_PATH_RE.test(path)) continue;
    if (typeof type !== 'string' || !isAllowedAttachmentMime(type)) continue;
    if (typeof size !== 'number' || !Number.isFinite(size) || size <= 0 || size > MAX_ATTACHMENT_BYTES) continue;
    out.push({ path, name: typeof name === 'string' && name.trim() ? name.slice(0, 200) : 'fichier', type, size });
  }
  return out;
}

/** Build the proxy serve URLs for a message's attachments. */
export function viewAttachments(
  messageId: string,
  attachments: TicketAttachment[] | null | undefined,
): TicketAttachmentView[] {
  if (!attachments?.length) return [];
  return attachments.map((a, i) => ({
    ...a,
    url: `/api/support/attachment/${messageId}?i=${i}`,
    isImage: isImageType(a.type),
  }));
}
