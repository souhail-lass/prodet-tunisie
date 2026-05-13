'use server';

import { generateReferenceCode } from '@/lib/reference-code';
import { QuoteRequestSchema, type QuoteRequestInput } from './schema';

export interface QuoteSubmitResult {
  ok: boolean;
  referenceCode?: string;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
}

/**
 * Server action invoked by the public quote form.
 *
 * v0 (this commit):
 *   - validates with Zod
 *   - logs a structured record server-side
 *   - returns a generated reference code so the client UI can
 *     show "Reference: QUO-2026-XXXX"
 *
 * Phase 1 follow-up:
 *   - persist into the `quote_request` table (Drizzle)
 *   - send a transactional email via Resend (operator notification +
 *     customer confirmation)
 *   - rate-limit per IP (Inngest or Vercel KV)
 */
export async function submitQuoteRequest(input: QuoteRequestInput): Promise<QuoteSubmitResult> {
  if (input.website?.trim()) {
    return { ok: true, referenceCode: generateReferenceCode('QUO') };
  }

  const parsed = QuoteRequestSchema.safeParse(input);
  if (!parsed.success) {
    const flat = parsed.error.flatten((issue) => issue.message);
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(flat.fieldErrors)) {
      if (value && value.length > 0) fieldErrors[key] = value;
    }
    if (flat.formErrors.length > 0) fieldErrors._root = flat.formErrors;
    return { ok: false, fieldErrors };
  }

  const referenceCode = generateReferenceCode('QUO');

  console.info('[quote-request:received]', {
    referenceCode,
    sectorKey: parsed.data.sectorKey,
    lineCount: parsed.data.lines.length,
    receivedAt: new Date().toISOString(),
  });

  return { ok: true, referenceCode };
}
