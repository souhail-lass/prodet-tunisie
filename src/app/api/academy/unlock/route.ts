import { NextResponse } from 'next/server';
import { requireAdmin } from '@/features/admin/auth';
import {
  ACADEMY_COOKIE,
  ACADEMY_SESSION_MS,
  isAcademyConfigured,
  issueToken,
  verifyCode,
} from '@/features/academy/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Académie Prodet — access-code unlock endpoint.
 *
 *   POST   { code }  → verify code, set httpOnly session cookie on success
 *   DELETE           → clear the session cookie (lock again)
 *
 * Defense in depth: this route is reachable only by an authenticated Prodet
 * admin (the whole /admin area is gated). The code is a *second* factor that
 * unlocks the confidential formulas specifically.
 */

/** Brute-force guard (basic, per-IP, in-memory). */
const WINDOW_MS = 10 * 60 * 1000; // attempts counter resets after 10 min idle
const FREE_ATTEMPTS = 4; // attempts before lockouts kick in
const BASE_DELAY_MS = 350; // small delay on every attempt to slow scripting
const attempts = new Map<string, { count: number; lockUntil: number; seen: number }>();

function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Escalating lockout once the free attempts are spent. */
function lockoutMs(count: number): number {
  const over = count - FREE_ATTEMPTS;
  if (over <= 0) return 0;
  return Math.min(30_000 * 2 ** (over - 1), 15 * 60 * 1000); // 30s, 60s, … capped 15 min
}

async function requireAdminOr401(): Promise<NextResponse | null> {
  try {
    await requireAdmin();
    return null;
  } catch {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const denied = await requireAdminOr401();
  if (denied) return denied;

  if (!isAcademyConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'not_configured', message: 'Code Académie non configuré (PRODET_ACADEMY_CODE).' },
      { status: 503 },
    );
  }

  const ip = clientIp(request);
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && now - entry.seen > WINDOW_MS) {
    attempts.delete(ip);
  }
  const state = attempts.get(ip);
  if (state && state.lockUntil > now) {
    const retryAfter = Math.ceil((state.lockUntil - now) / 1000);
    return NextResponse.json(
      { ok: false, error: 'locked', retryAfter },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  let code = '';
  try {
    const body = (await request.json()) as { code?: unknown };
    code = typeof body.code === 'string' ? body.code : '';
  } catch {
    code = '';
  }

  // Constant base delay on every attempt (slows automated guessing).
  await sleep(BASE_DELAY_MS);

  if (code && verifyCode(code)) {
    attempts.delete(ip);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ACADEMY_COOKIE, issueToken(now), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: Math.floor(ACADEMY_SESSION_MS / 1000),
    });
    return response;
  }

  // Wrong code → record the failure and possibly lock out.
  const count = (state?.count ?? 0) + 1;
  const lock = lockoutMs(count);
  attempts.set(ip, { count, lockUntil: lock > 0 ? now + lock : 0, seen: now });

  if (lock > 0) {
    const retryAfter = Math.ceil(lock / 1000);
    return NextResponse.json(
      { ok: false, error: 'locked', retryAfter },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }
  return NextResponse.json({ ok: false, error: 'invalid' }, { status: 401 });
}

export async function DELETE(): Promise<NextResponse> {
  const denied = await requireAdminOr401();
  if (denied) return denied;
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACADEMY_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return response;
}
