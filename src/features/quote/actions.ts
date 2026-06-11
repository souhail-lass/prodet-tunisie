'use server';

import { z } from 'zod';
import { companyInfo } from '@/data/company';
import { generateReferenceCode } from '@/lib/reference-code';
import { consumeRateLimit, formatRetryAfterFr } from '@/lib/rate-limit';
import { QuoteRequestSchema, type QuoteRequestInput } from './schema';

export interface QuoteSubmitResult {
  ok: boolean;
  referenceCode?: string;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
}

const PublicDevisLineSchema = z.object({
  productId: z.string().trim().min(1, 'required').max(120, 'tooLong'),
  productName: z.string().trim().min(1, 'required').max(180, 'tooLong'),
  slug: z.string().trim().max(180, 'tooLong').optional(),
  format: z.string().trim().max(80, 'tooLong').optional(),
  category: z.string().trim().max(80, 'tooLong').optional(),
  quantity: z.number().int().min(1, 'invalidQuantity').max(9999, 'invalidQuantity'),
});

const PublicDevisRequestSchema = z
  .object({
    fullName: z.string().trim().max(120, 'tooLong').optional(),
    company: z.string().trim().max(120, 'tooLong').optional(),
    sectorId: z.string().trim().max(80, 'tooLong').optional(),
    phone: z.string().trim().max(60, 'tooLong').optional(),
    email: z.union([z.literal(''), z.string().trim().email('invalidEmail')]).optional(),
    city: z.string().trim().max(120, 'tooLong').optional(),
    message: z.string().trim().max(2000, 'tooLong').optional(),
    website: z.string().trim().max(200, 'tooLong').optional(),
    lines: z.array(PublicDevisLineSchema).min(1, 'atLeastOneItem').max(40, 'tooLong'),
  })
  .superRefine((input, context) => {
    if (!input.phone?.trim() && !input.email?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone'],
        message: 'contactRequired',
      });
    }
  });

export type PublicDevisRequestInput = z.input<typeof PublicDevisRequestSchema>;

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

  const limit = await consumeRateLimit({
    scope: 'quote',
    limit: 5,
    windowMs: 10 * 60_000,
  });
  if (!limit.ok) {
    return {
      ok: false,
      formError: `Trop de demandes récentes. Réessayez dans ${formatRetryAfterFr(limit.retryAfterMs)}.`,
    };
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

export async function submitPublicDevisRequest(
  input: PublicDevisRequestInput,
): Promise<QuoteSubmitResult> {
  if (input.website?.trim()) {
    return { ok: true, referenceCode: generateReferenceCode('QUO') };
  }

  const limit = await consumeRateLimit({
    scope: 'public-devis',
    limit: 5,
    windowMs: 10 * 60_000,
  });
  if (!limit.ok) {
    return {
      ok: false,
      formError: `Trop de demandes récentes. Réessayez dans ${formatRetryAfterFr(limit.retryAfterMs)}.`,
    };
  }

  const parsed = PublicDevisRequestSchema.safeParse(input);
  if (!parsed.success) {
    const flat = parsed.error.flatten((issue) => issue.message);
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(flat.fieldErrors)) {
      if (value && value.length > 0) fieldErrors[key] = value;
    }
    if (flat.formErrors.length > 0) fieldErrors._root = flat.formErrors;
    return { ok: false, fieldErrors, formError: mapDevisError(fieldErrors) };
  }

  const referenceCode = generateReferenceCode('QUO');
  const emailPayload = buildPublicDevisEmail(referenceCode, parsed.data);
  const delivery = await sendOperatorEmail(emailPayload);

  console.info('[public-devis:received]', {
    referenceCode,
    lineCount: parsed.data.lines.length,
    deliveryStatus: delivery.ok ? 'sent' : delivery.error,
    receivedAt: new Date().toISOString(),
  });

  if (!delivery.ok) {
    return {
      ok: false,
      referenceCode,
      formError:
        delivery.error === 'missing-provider'
          ? "L'envoi automatique n'est pas encore configuré. Ajoutez RESEND_API_KEY côté serveur."
          : "Impossible d'envoyer la demande maintenant. Réessayez ou contactez Prodet directement.",
    };
  }

  return { ok: true, referenceCode };
}

function buildPublicDevisEmail(
  referenceCode: string,
  input: z.output<typeof PublicDevisRequestSchema>,
) {
  const requester = input.company || input.fullName || 'Site web Prodet';
  const subject = `Demande de devis ${referenceCode} - ${requester}`;
  const lines = input.lines
    .map((line) => {
      const details = [
        line.format ? `Format: ${line.format}` : null,
        line.category ? `Type: ${line.category}` : null,
        line.slug ? `Slug: ${line.slug}` : null,
        `Quantité: ${line.quantity}`,
      ].filter(Boolean);

      return `- ${line.productName}${details.length > 0 ? ` | ${details.join(' | ')}` : ''}`;
    })
    .join('\n');

  const text = [
    `Référence: ${referenceCode}`,
    '',
    'Produits demandés:',
    lines,
    '',
    'Coordonnées:',
    `Nom / Prénom: ${input.fullName || 'Non précisé'}`,
    `Société / Établissement: ${input.company || 'Non précisé'}`,
    `Secteur: ${input.sectorId || 'Non précisé'}`,
    `Téléphone: ${input.phone || 'Non précisé'}`,
    `Email: ${input.email || 'Non précisé'}`,
    `Ville / zone de livraison: ${input.city || 'Non précisé'}`,
    '',
    'Message:',
    input.message || 'Aucun message complémentaire.',
  ].join('\n');

  const html = `<pre style="font-family:Inter,Arial,sans-serif;white-space:pre-wrap;line-height:1.55;color:#102033">${escapeHtml(text)}</pre>`;

  return { subject, text, html };
}

async function sendOperatorEmail({
  subject,
  text,
  html,
}: {
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false, error: 'missing-provider' };

  const from =
    process.env.QUOTE_EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'Prodet Website <onboarding@resend.dev>';
  const to = process.env.QUOTE_NOTIFICATION_EMAIL?.trim() || companyInfo.email;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[public-devis:email-failed]', {
        status: response.status,
        errorText,
      });
      return { ok: false, error: 'provider-failed' };
    }

    return { ok: true };
  } catch (error) {
    console.error('[public-devis:email-error]', error);
    return { ok: false, error: 'provider-failed' };
  }
}

function mapDevisError(fieldErrors: Record<string, string[]>): string {
  const messages = Object.values(fieldErrors).flat();

  if (messages.includes('contactRequired')) {
    return 'Ajoutez au moins un téléphone ou un email.';
  }

  if (messages.includes('invalidEmail')) {
    return "L'adresse email n'est pas valide.";
  }

  if (messages.includes('atLeastOneItem')) {
    return 'Ajoutez au moins un produit au devis.';
  }

  return 'Vérifiez les informations du devis.';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, '&amp;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;')
    .replace(/"/gu, '&quot;')
    .replace(/'/gu, '&#39;');
}
