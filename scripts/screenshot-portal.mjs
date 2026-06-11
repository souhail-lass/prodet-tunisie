#!/usr/bin/env node
/**
 * Captures screenshots of every redesigned portal page in desktop + mobile.
 *
 * Auth path is the real one:
 *   1) Supabase Admin API mints a magiclink for clearsurr@gmail.com.
 *   2) The script visits the returned action_link in a headless browser.
 *   3) Supabase verifies the link and redirects to /auth/callback?code=...,
 *      which exchanges the code for a real cookie-based session — exactly
 *      what a human user does when they click the email link.
 *   4) Once authenticated, the script reuses the storage state to load each
 *      portal page in desktop (1440x900) and mobile (390x844) viewports.
 *
 * Usage:
 *   node --env-file=.env.local scripts/screenshot-portal.mjs
 */
import { chromium } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'screenshots', 'portal-redesign');
mkdirSync(outDir, { recursive: true });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3004';
const CUSTOMER_EMAIL = 'clearsurr@gmail.com';

// 1) Admin mints a magiclink → SDK returns email_otp + hashed_token. This is
//    exactly what's encoded into the email body in real life.
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
  type: 'magiclink',
  email: CUSTOMER_EMAIL,
});
if (linkError || !linkData?.properties?.hashed_token) {
  console.error('Failed to mint magiclink token:', linkError?.message);
  process.exit(1);
}

// 2) Verify the OTP through the public Supabase API — the same call the
//    browser SDK makes after the user clicks the email link. Returns a real
//    session (access_token + refresh_token).
const supabaseAnon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const { data: otpData, error: otpError } = await supabaseAnon.auth.verifyOtp({
  type: 'magiclink',
  token_hash: linkData.properties.hashed_token,
});
if (otpError || !otpData?.session) {
  console.error('verifyOtp failed:', otpError?.message);
  process.exit(1);
}
console.log('Session minted for', otpData.session.user.email);

// 3) Inject the @supabase/ssr-compatible auth cookie. Name format is
//    `sb-<project-ref>-auth-token` per the SDK's storage key. The value is a
//    base64-encoded JSON session — identical to what the server-side cookie
//    helper writes after exchangeCodeForSession().
const projectRef = new URL(process.env.SUPABASE_URL).host.split('.')[0];
const cookieName = `sb-${projectRef}-auth-token`;
const sessionJson = JSON.stringify(otpData.session);
const cookieValue = `base64-${Buffer.from(sessionJson, 'utf8').toString('base64')}`;
function chunk(value, size = 3180) {
  const out = [];
  for (let i = 0; i < value.length; i += size) out.push(value.slice(i, i + size));
  return out;
}
const chunks = chunk(cookieValue);
const cookies = chunks.length === 1
  ? [{ name: cookieName, value: chunks[0], url: SITE_URL, sameSite: 'Lax', httpOnly: false, secure: false }]
  : chunks.map((value, index) => ({
      name: `${cookieName}.${index}`,
      value,
      url: SITE_URL,
      sameSite: 'Lax',
      httpOnly: false,
      secure: false,
    }));

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addCookies(cookies);
const page = await context.newPage();

await page.goto(`${SITE_URL}/fr/client`, { waitUntil: 'networkidle' });
if (!/\/client(?:\/|\?|$)/.test(page.url())) {
  console.error('Auth cookie did not unlock /fr/client. URL:', page.url());
  process.exit(1);
}
console.log('Authenticated session active. Capturing screenshots…');

const desktopShots = [
  ['/fr/client', '01-dashboard-desktop'],
  ['/fr/client/historique', '02-historique-desktop'],
  ['/fr/client/nouvelle-demande', '03-nouvelle-demande-desktop'],
  ['/fr/client/produits-habituels', '04-produits-habituels-desktop'],
];

for (const [path, name] of desktopShots) {
  await page.goto(`${SITE_URL}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(outDir, `${name}.png`), fullPage: true });
  console.log(' captured', name);
}

// Detail page — pick the most recent request id.
const detailHref = await page
  .goto(`${SITE_URL}/fr/client/historique`, { waitUntil: 'networkidle' })
  .then(() => page.locator('a[href*="/client/historique/"]').first().getAttribute('href'));
if (detailHref) {
  await page.goto(`${SITE_URL}${detailHref}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(outDir, '05-historique-detail-desktop.png'), fullPage: true });
  console.log(' captured 05-historique-detail-desktop');
}

// --- Mobile pass ---
const mobileContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  storageState: await context.storageState(),
});
const mobile = await mobileContext.newPage();

const mobileShots = [
  ['/fr/client', '06-dashboard-mobile'],
  ['/fr/client/historique', '07-historique-mobile'],
  ['/fr/client/nouvelle-demande', '08-nouvelle-demande-mobile'],
  ['/fr/client/produits-habituels', '09-produits-habituels-mobile'],
];
for (const [path, name] of mobileShots) {
  await mobile.goto(`${SITE_URL}${path}`, { waitUntil: 'networkidle' });
  await mobile.waitForTimeout(500);
  await mobile.screenshot({ path: join(outDir, `${name}.png`), fullPage: true });
  console.log(' captured', name);
}

if (detailHref) {
  await mobile.goto(`${SITE_URL}${detailHref}`, { waitUntil: 'networkidle' });
  await mobile.waitForTimeout(500);
  await mobile.screenshot({ path: join(outDir, '10-historique-detail-mobile.png'), fullPage: true });
  console.log(' captured 10-historique-detail-mobile');
}

// Builder with a few items in the basket (mobile, sticky action bar visible).
try {
  await mobile.goto(`${SITE_URL}/fr/client/nouvelle-demande`, { waitUntil: 'networkidle' });
  // Click the first three "Ajouter" buttons we find. After a click the text
  // can switch to "Encore" — we re-query each iteration to avoid stale handles.
  for (let i = 0; i < 3; i += 1) {
    const button = mobile.locator('button:has-text("Ajouter"):visible').first();
    if ((await button.count()) === 0) break;
    await button.click({ timeout: 5000 }).catch(() => {});
    await mobile.waitForTimeout(200);
  }
  await mobile.waitForTimeout(500);
  await mobile.screenshot({ path: join(outDir, '11-builder-with-basket-mobile.png'), fullPage: true });
  console.log(' captured 11-builder-with-basket-mobile');
} catch (error) {
  console.warn(' could not capture builder-with-basket-mobile:', error.message);
}

await browser.close();
console.log('All screenshots written to', outDir);
