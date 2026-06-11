'use server';

import { consumeRateLimit } from '@/lib/rate-limit';
import { requireClientPortalAccess } from '@/features/client-portal/auth';
import { createMyTicket, replyMyTicket } from '@/features/client-portal/tickets';
import { uploadSupportAttachment, type TicketAttachment } from '@/features/support/attachments';

export async function createTicketAction(input: {
  subject: string;
  body: string;
  attachments?: TicketAttachment[];
}) {
  return createMyTicket(input.subject, input.body, input.attachments ?? []);
}

export async function replyTicketAction(
  ticketId: string,
  body: string,
  attachments: TicketAttachment[] = [],
) {
  return replyMyTicket(ticketId, body, attachments);
}

export type UploadAttachmentResult =
  | { ok: true; attachment: TicketAttachment }
  | { ok: false; error: 'auth' | 'rate-limited' | 'invalid' | 'too-large' | 'mime' | 'failed' | 'unavailable' };

/** Upload one file/photo for a support message (multipart). */
export async function uploadTicketAttachmentAction(formData: FormData): Promise<UploadAttachmentResult> {
  let access;
  try {
    access = await requireClientPortalAccess();
  } catch {
    return { ok: false, error: 'auth' };
  }
  const rl = await consumeRateLimit({
    scope: 'support-upload-user',
    identifier: access.appUser.id,
    limit: 60,
    windowMs: 10 * 60_000,
  });
  if (!rl.ok) return { ok: false, error: 'rate-limited' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'invalid' };
  return uploadSupportAttachment({
    name: file.name,
    type: file.type,
    size: file.size,
    bytes: await file.arrayBuffer(),
  });
}
