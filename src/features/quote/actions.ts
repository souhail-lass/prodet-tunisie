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
  const delivery = await sendOperatorEmail({
    ...emailPayload,
    replyTo: parsed.data.email?.trim() || undefined,
  });

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

  const totalUnits = input.lines.reduce((sum, line) => sum + line.quantity, 0);
  const html = buildPublicDevisHtml(referenceCode, requester, input, totalUnits);

  return { subject, text, html };
}

/** On-brand HTML for the operator devis notification (product table + contact card). */
function buildPublicDevisHtml(
  referenceCode: string,
  requester: string,
  input: z.output<typeof PublicDevisRequestSchema>,
  totalUnits: number,
): string {
  const rows = input.lines
    .map((line, index) => {
      const meta = [line.format, line.category].filter(Boolean).join(' · ');
      const bg = index % 2 === 0 ? '#ffffff' : '#f6f8fb';
      return `<tr style="background:${bg}">
        <td style="padding:9px 12px;border-bottom:1px solid #e6e8ec;font-size:13px;color:#102033">
          <strong style="font-weight:600">${escapeHtml(line.productName)}</strong>
          ${meta ? `<br /><span style="font-size:11px;color:#7a869a">${escapeHtml(meta)}</span>` : ''}
        </td>
        <td style="padding:9px 12px;border-bottom:1px solid #e6e8ec;font-size:13px;color:#102033;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums">${line.quantity}</td>
      </tr>`;
    })
    .join('');

  const contactRow = (label: string, value: string | undefined) =>
    `<tr>
      <td style="padding:4px 0;font-size:12px;color:#7a869a;width:150px;vertical-align:top">${escapeHtml(label)}</td>
      <td style="padding:4px 0;font-size:13px;color:#102033">${escapeHtml(value?.trim() || '—')}</td>
    </tr>`;

  return `<div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#102033;max-width:600px;margin:0 auto;padding:8px">
    <div style="font-weight:800;font-size:18px;color:#08233f;margin-bottom:4px">Prodet</div>
    <h1 style="font-size:18px;font-weight:700;margin:0 0 4px;color:#08233f">Nouvelle demande de devis</h1>
    <p style="margin:0 0 18px;font-size:13px;color:#7a869a">
      Réf. <strong style="color:#0B5FAE">${escapeHtml(referenceCode)}</strong> · ${escapeHtml(requester)} ·
      ${input.lines.length} référence(s), ${totalUnits} unité(s)
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e6e8ec;border-radius:8px;overflow:hidden;margin-bottom:20px">
      <thead>
        <tr style="background:#08233f">
          <th style="padding:9px 12px;text-align:left;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#cfe0f0">Produit</th>
          <th style="padding:9px 12px;text-align:right;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#cfe0f0">Qté</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <h2 style="font-size:13px;font-weight:700;margin:0 0 8px;color:#08233f">Coordonnées</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:18px">
      ${contactRow('Nom / Prénom', input.fullName)}
      ${contactRow('Société / Établissement', input.company)}
      ${contactRow('Secteur', input.sectorId)}
      ${contactRow('Téléphone', input.phone)}
      ${contactRow('Email', input.email)}
      ${contactRow('Ville / zone de livraison', input.city)}
    </table>

    ${
      input.message?.trim()
        ? `<h2 style="font-size:13px;font-weight:700;margin:0 0 6px;color:#08233f">Message</h2>
           <p style="margin:0 0 18px;font-size:13px;color:#102033;background:#f6f8fb;border-radius:8px;padding:12px 14px;white-space:pre-wrap">${escapeHtml(input.message.trim())}</p>`
        : ''
    }

    <hr style="border:none;border-top:1px solid #e6e8ec;margin:8px 0 12px" />
    <p style="font-size:12px;color:#7a869a;margin:0">Demande envoyée depuis le site prodet.com.tn · Répondez à cet email pour contacter directement le demandeur.</p>
  </div>`;
}

async function sendOperatorEmail({
  subject,
  text,
  html,
  replyTo,
}: {
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
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
        ...(replyTo ? { reply_to: replyTo } : {}),
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
