import 'server-only';
import { headers } from 'next/headers';
import { sql } from 'drizzle-orm';

/**
 * Cross-instance rate limiting, backed by Postgres. See ADR 0013.
 *
 * This used to be an in-process Map, which on Vercel meant one fresh counter
 * per lambda instance and per cold start — the published limits were not
 * actually enforced in production. Counting now happens in a single atomic
 * upsert so concurrent invocations cannot interleave.
 */

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

/** Probability of sweeping expired rows on any given call. */
const SWEEP_CHANCE = 0.02;

/**
 * Consume one token for `scope:identifier`, returning `{ ok: false }` once the
 * caller has spent its `limit` inside `windowMs`.
 *
 * Fails OPEN: if the counter query throws, the request is allowed and the error
 * is logged. A limiter that fails closed turns a database blip into a total
 * outage of the public forms, and this is abuse control — not an authorization
 * boundary. Nothing security-critical depends on it.
 */
export async function consumeRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const identifier = options.identifier ?? (await getClientIp());
  const scope = options.scope ?? 'default';
  const key = `${scope}:${identifier}`;
  const windowSeconds = Math.max(1, Math.ceil(options.windowMs / 1000));

  try {
    const { db } = await import('@/db/client');

    // One statement: insert-or-bump, resetting the window when it has expired.
    const rows = (await db.execute(sql`
      insert into rate_limit_bucket (key, count, reset_at, updated_at)
      values (${key}, 1, now() + make_interval(secs => ${windowSeconds}), now())
      on conflict (key) do update set
        count = case
          when rate_limit_bucket.reset_at <= now() then 1
          else rate_limit_bucket.count + 1
        end,
        reset_at = case
          when rate_limit_bucket.reset_at <= now() then excluded.reset_at
          else rate_limit_bucket.reset_at
        end,
        updated_at = now()
      returning count, reset_at
    `)) as unknown as Array<{ count: number; reset_at: string | Date }>;

    if (Math.random() < SWEEP_CHANCE) void sweepExpired();

    const row = rows?.[0];
    if (!row) return { ok: true, retryAfterMs: 0 };

    const count = Number(row.count);
    if (count > options.limit) {
      return { ok: false, retryAfterMs: retryAfterFrom(row.reset_at, options.windowMs) };
    }
    return { ok: true, retryAfterMs: 0 };
  } catch (error) {
    console.error(
      '[rate-limit:unavailable]',
      key,
      error instanceof Error ? error.message : error,
    );
    return { ok: true, retryAfterMs: 0 };
  }
}

/**
 * Milliseconds until the window reopens.
 *
 * postgres-js hands `reset_at` back as a raw timestamptz string
 * ("2026-08-23 13:55:19.778338+00") rather than a Date. V8 happens to parse
 * that, but it is not ISO-8601 and the leniency is engine-specific, so we
 * normalise it and fall back to the full window rather than risk emitting
 * "NaNs" into a user-facing retry message.
 */
function retryAfterFrom(value: string | Date, windowMs: number): number {
  const date =
    value instanceof Date
      ? value
      : new Date(String(value).replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00'));
  const ms = date.getTime();
  if (!Number.isFinite(ms)) return windowMs;
  return Math.max(0, ms - Date.now());
}

/** Best-effort cleanup so the table does not grow without bound. */
async function sweepExpired(): Promise<void> {
  try {
    const { db } = await import('@/db/client');
    await db.execute(sql`delete from rate_limit_bucket where reset_at <= now() - interval '1 hour'`);
  } catch {
    // Nothing to do — the next sweep will retry.
  }
}

/**
 * Best-effort client IP for rate limiting only. Never trust this for
 * authorization.
 *
 * Order matters. `x-forwarded-for` is a list a caller can prepend to, so its
 * FIRST entry is attacker-controlled — reading it let anyone mint a fresh
 * bucket per request. We prefer the headers our proxy sets itself
 * (`x-vercel-forwarded-for` on Vercel, `x-real-ip`, `cf-connecting-ip`) and
 * fall back to the LAST `x-forwarded-for` entry, which is the hop nearest our
 * edge and cannot be forged by prepending.
 */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();

  const trusted =
    headerList.get('x-vercel-forwarded-for')?.trim() ||
    headerList.get('x-real-ip')?.trim() ||
    headerList.get('cf-connecting-ip')?.trim();
  if (trusted) return trusted.split(',')[0]!.trim();

  const forwarded = headerList.get('x-forwarded-for');
  if (forwarded) {
    const hops = forwarded
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean);
    const nearest = hops[hops.length - 1];
    if (nearest) return nearest;
  }

  // Unattributable callers share one bucket, so they throttle each other
  // rather than each getting an unlimited allowance.
  return 'unknown';
}

/** Human-readable retry hint for French-facing form errors. */
export function formatRetryAfterFr(retryAfterMs: number): string {
  const seconds = Math.ceil(retryAfterMs / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} min`;
}
