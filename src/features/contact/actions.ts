'use server';

import { generateReferenceCode } from '@/lib/reference-code';
import { ContactMessageSchema, type ContactMessageInput } from './schema';

export interface ContactSubmitResult {
  ok: boolean;
  referenceCode?: string;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
}

/**
 * Server action for the public contact form.
 *
 * v0: validate, log, return reference code.
 * Phase 1 follow-up: persist + notify operators by email.
 */
export async function submitContactMessage(
  input: ContactMessageInput,
): Promise<ContactSubmitResult> {
  const parsed = ContactMessageSchema.safeParse(input);
  if (!parsed.success) {
    const flat = parsed.error.flatten((issue) => issue.message);
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(flat.fieldErrors)) {
      if (value && value.length > 0) fieldErrors[key] = value;
    }
    if (flat.formErrors.length > 0) fieldErrors._root = flat.formErrors;
    return { ok: false, fieldErrors };
  }

  const referenceCode = generateReferenceCode('CTC');

  console.info('[contact-message:received]', {
    referenceCode,
    subject: parsed.data.subject,
    name: parsed.data.name,
    email: parsed.data.email,
    receivedAt: new Date().toISOString(),
  });

  return { ok: true, referenceCode };
}
