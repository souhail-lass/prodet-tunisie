import { createHmac, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';
import { consumeRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Swiver webhook receiver.
 *
 * Security contract:
 *   - The endpoint is GATED on SWIVER_MODE. While the integration is
 *     `disabled` (default) the route 404s — it has no business accepting
 *     traffic, so we do not expose it as an unauthenticated DB-writer.
 *   - Inbound bodies are size-capped and rate-limited per source IP.
 *   - Authenticity is enforced with an HMAC-SHA256 signature over the raw
 *     body, keyed by SWIVER_WEBHOOK_SECRET. In production a missing/invalid
 *     signature is rejected. In dev, an unconfigured secret is allowed but
 *     the row is honestly tagged `signature_verified = false`.
 *   - We persist a durable audit row before processing; slow work is for a
 *     background poller (rows where status = 'received').
 *
 * URL to paste into the Swiver integration dashboard:
 *   `${NEXT_PUBLIC_SITE_URL}/api/webhooks/swiver`
 */

/** 256 KB hard cap — webhook events are small JSON documents. */
const MAX_BODY_BYTES = 256 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  const env = getServerEnv();

  // 1) Attack-surface reduction: the endpoint only exists when the
  //    integration is switched on. Default (`disabled`) → 404.
  if (env.SWIVER_MODE === 'disabled') {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  const sourceIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'anonymous';
  const userAgent = request.headers.get('user-agent') ?? null;

  // 2) Rate-limit per source IP (best-effort; see lib/rate-limit caveats).
  const limit = await consumeRateLimit({
    scope: 'swiver-webhook',
    identifier: sourceIp,
    limit: 120,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  // 3) Size cap (header first, then actual bytes).
  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 413 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ ok: false, error: 'unreadable_body' }, { status: 400 });
  }
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 413 });
  }

  const signatureHeader =
    request.headers.get('x-swiver-signature') ||
    request.headers.get('x-webhook-signature') ||
    request.headers.get('x-signature') ||
    null;

  // 4) Authenticity. Enforce HMAC when a secret is configured. Refuse
  //    unsigned traffic in production regardless.
  const secret = env.SWIVER_WEBHOOK_SECRET;
  let signatureVerified = false;

  if (secret) {
    signatureVerified = verifyHmacSignature(rawBody, signatureHeader, secret);
    if (!signatureVerified) {
      await safeInsert({
        payload: { raw: rawBody.slice(0, 2_000) },
        signature: signatureHeader,
        signatureVerified: false,
        sourceIp,
        userAgent,
        status: 'failed',
        error: 'signature_invalid',
        eventId: null,
        eventType: null,
      });
      return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 401 });
    }
  } else if (env.NODE_ENV === 'production') {
    // No secret in production is a misconfiguration we refuse to paper over.
    console.error('[swiver-webhook] SWIVER_WEBHOOK_SECRET is not set in production — rejecting.');
    return NextResponse.json({ ok: false, error: 'verification_unconfigured' }, { status: 503 });
  }

  let payload: unknown;
  try {
    payload = rawBody.length > 0 ? JSON.parse(rawBody) : {};
  } catch {
    await safeInsert({
      payload: { raw: rawBody.slice(0, 2_000) },
      signature: signatureHeader,
      signatureVerified,
      sourceIp,
      userAgent,
      status: 'failed',
      error: 'invalid_json',
      eventId: null,
      eventType: null,
    });
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const { eventId, eventType } = extractEventMetadata(payload);

  if (eventId) {
    const exists = await findExistingByEventId(eventId);
    if (exists) {
      return NextResponse.json({ ok: true, duplicate: true, eventId }, { status: 200 });
    }
  }

  const insertion = await safeInsert({
    payload,
    signature: signatureHeader,
    signatureVerified,
    sourceIp,
    userAgent,
    status: 'received',
    error: signatureVerified ? null : 'signature_unverified_dev_only',
    eventId,
    eventType,
  });

  if (!insertion.ok) {
    return NextResponse.json({ ok: false, error: 'storage_error' }, { status: 503 });
  }

  // A Swiver change (new/updated/paid invoice, order, delivery…) just landed:
  // bust the per-contact document/spending caches so the portal reflects it on
  // the very next load. Documents are already fetched live; this clears the
  // 20s spending + order-total windows immediately. (Real-time the moment
  // Swiver delivers the webhook — requires SWIVER_MODE on + the URL configured
  // in Swiver's integration panel.)
  try {
    revalidateTag('swiver-documents');
  } catch {
    // revalidation is best-effort; never fail the webhook ack on it
  }

  return NextResponse.json(
    { ok: true, id: insertion.id, signatureVerified },
    { status: 200 },
  );
}

export async function GET(): Promise<NextResponse> {
  const env = getServerEnv();
  if (env.SWIVER_MODE === 'disabled') {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }
  return NextResponse.json(
    {
      ok: true,
      service: 'prodet-platform.swiver-webhook',
      mode: env.SWIVER_MODE,
      signatureVerification: env.SWIVER_WEBHOOK_SECRET ? 'enforced' : 'unconfigured',
    },
    { status: 200 },
  );
}

/**
 * Constant-time HMAC-SHA256 verification over the raw request body. Accepts
 * either a bare hex digest or a `sha256=<hex>` prefixed value.
 */
function verifyHmacSignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const provided = header.startsWith('sha256=') ? header.slice(7) : header;
  if (!/^[0-9a-fA-F]{64}$/u.test(provided)) return false;

  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(provided.toLowerCase(), 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function extractEventMetadata(payload: unknown): {
  eventId: string | null;
  eventType: string | null;
} {
  if (!payload || typeof payload !== 'object') return { eventId: null, eventType: null };
  const record = payload as Record<string, unknown>;
  const eventId = pickString(record, ['event_id', 'eventId', 'id', 'uuid']);
  const eventType = pickString(record, ['event', 'event_type', 'eventType', 'type', 'topic']);
  return { eventId, eventType };
}

function pickString(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.length > 0 && value.length < 200) return value;
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return null;
}

async function findExistingByEventId(eventId: string): Promise<boolean> {
  try {
    const { db, schema } = await import('@/db/client');
    const { eq } = await import('drizzle-orm');
    const [existing] = await db
      .select({ id: schema.swiverWebhookEvent.id })
      .from(schema.swiverWebhookEvent)
      .where(eq(schema.swiverWebhookEvent.eventId, eventId))
      .limit(1);
    return Boolean(existing);
  } catch {
    return false;
  }
}

async function safeInsert(params: {
  payload: unknown;
  signature: string | null;
  signatureVerified: boolean;
  sourceIp: string | null;
  userAgent: string | null;
  status: 'received' | 'failed';
  error: string | null;
  eventId: string | null;
  eventType: string | null;
}): Promise<{ ok: true; id: string } | { ok: false }> {
  try {
    const { db, schema } = await import('@/db/client');
    const [row] = await db
      .insert(schema.swiverWebhookEvent)
      .values({
        eventId: params.eventId,
        eventType: params.eventType,
        payload: (params.payload ?? {}) as object,
        signature: params.signature,
        signatureVerified: params.signatureVerified,
        sourceIp: params.sourceIp,
        userAgent: params.userAgent,
        status: params.status,
        error: params.error,
      })
      .returning({ id: schema.swiverWebhookEvent.id });
    if (!row) return { ok: false };
    return { ok: true, id: row.id };
  } catch (error) {
    console.error('[swiver-webhook] insert failed', error);
    return { ok: false };
  }
}
