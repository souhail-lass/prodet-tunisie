import 'server-only';
import { headers } from 'next/headers';

// In-process sliding-window limiter. Keeps the dependency surface to
// zero while we operate from a single Next.js runtime instance. When we
// scale beyond one server (Vercel multi-region, multi-worker) we must
// swap the backing store for Redis / Upstash KV (see ADR pending).
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

function sweep(now: number): void {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterMs: number;
}

export interface RateLimitOptions {
  /** Logical bucket (e.g. 'contact', 'login-admin'). Defaults to 'default'. */
  scope?: string;
  /** Max requests allowed inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Identifier for the caller; defaults to the request IP. */
  identifier?: string;
}

/**
 * Token-bucket-style limiter; returns `{ ok: false }` once the caller has
 * spent its `limit` budget inside `windowMs`. Designed for server actions
 * (called via `headers()` to get the IP). Safe to call from route handlers.
 */
export async function consumeRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const now = Date.now();
  sweep(now);

  const identifier = options.identifier ?? (await getClientIp());
  const scope = options.scope ?? 'default';
  const key = `${scope}:${identifier}`;

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { ok: true, retryAfterMs: 0 };
  }

  if (bucket.count >= options.limit) {
    return { ok: false, retryAfterMs: Math.max(0, bucket.resetAt - now) };
  }

  bucket.count += 1;
  return { ok: true, retryAfterMs: 0 };
}

/**
 * Best-effort client IP for rate limiting only. Never trust this value
 * for authorization; the upstream proxy (Vercel / NGINX) must overwrite
 * `x-forwarded-for` to make this a meaningful key.
 */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return (
    headerList.get('x-real-ip')?.trim() ||
    headerList.get('cf-connecting-ip')?.trim() ||
    'anonymous'
  );
}

export function formatRetryAfterFr(retryAfterMs: number): string {
  const seconds = Math.ceil(retryAfterMs / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} min`;
}
