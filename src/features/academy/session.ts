/**
 * Académie Prodet — server-side access-code session.
 *
 * Server-only by construction (uses `node:crypto` + `next/headers`). The access
 * code never reaches the client: the browser POSTs the typed code to
 * `/api/academy/unlock`, the server compares it to `PRODET_ACADEMY_CODE`, and on
 * success sets an httpOnly cookie holding a *signed* token (HMAC-SHA256), not the
 * code itself. A forged cookie fails signature verification.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const ACADEMY_COOKIE = 'prodet_academy';
/** Session lifetime: 8 hours. */
export const ACADEMY_SESSION_MS = 8 * 60 * 60 * 1000;

function constantTimeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * Key used to sign session tokens. A dedicated `PRODET_ACADEMY_SECRET` is used
 * if provided; otherwise we derive the key from the access code itself, so that
 * rotating `PRODET_ACADEMY_CODE` automatically invalidates every live session.
 */
function signingKey(): string {
  const code = process.env.PRODET_ACADEMY_CODE;
  if (!code) {
    throw new Error('PRODET_ACADEMY_CODE is not set');
  }
  return process.env.PRODET_ACADEMY_SECRET || `prodet-academy:${code}`;
}

function sign(payload: string): string {
  return createHmac('sha256', signingKey()).update(payload).digest('hex');
}

/** Whether the academy code is configured at all (env present and non-empty). */
export function isAcademyConfigured(): boolean {
  return Boolean(process.env.PRODET_ACADEMY_CODE);
}

/** Compares a user-submitted code to the configured one, in constant time. */
export function verifyCode(input: string): boolean {
  const code = process.env.PRODET_ACADEMY_CODE;
  if (!code) return false;
  return constantTimeEqual(input, code);
}

/** Issues a signed session token valid for {@link ACADEMY_SESSION_MS}. */
export function issueToken(now: number = Date.now()): string {
  const exp = String(now + ACADEMY_SESSION_MS);
  return `${exp}.${sign(exp)}`;
}

/** Verifies a session token: correct signature AND not expired. */
export function verifyToken(token: string | undefined, now: number = Date.now()): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!constantTimeEqual(sig, sign(payload))) return false;
  const exp = Number(payload);
  return Number.isFinite(exp) && exp > now;
}

/** Reads the academy cookie and reports whether the formulas are unlocked. */
export async function isAcademyUnlocked(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(ACADEMY_COOKIE)?.value);
}
