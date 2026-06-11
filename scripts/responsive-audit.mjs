#!/usr/bin/env node
/**
 * Automated responsive audit. For every page × breakpoint it reports:
 *  - horizontal overflow (document scrollWidth > viewport)
 *  - the specific elements wider than the viewport (the culprits)
 *  - interactive controls below the 44px touch-target minimum
 *
 * Auth: mints a magiclink token via the Admin API and logs in through the real
 * /auth/otp route, so client + admin pages are audited as a signed-in user.
 *
 *   node --env-file=.env scripts/responsive-audit.mjs
 */
import { chromium } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SITE = process.env.AUDIT_SITE || 'http://localhost:3004';
const CLIENT_EMAIL = 'clearsurr@gmail.com';
const ADMIN_EMAIL = 'slassoued500@gmail.com';

const WIDTHS = [320, 375, 390, 414, 430, 768, 1024, 1280, 1440, 1920];

const PUBLIC_PAGES = [
  ['home', '/fr'],
  ['catalogue', '/fr/catalogue'],
  ['secteurs', '/fr/secteurs'],
  ['a-propos', '/fr/a-propos'],
  ['contact', '/fr/contact'],
  ['devis', '/fr/devis'],
  ['connexion-client', '/fr/connexion-client'],
  ['connexion-admin', '/fr/connexion-admin'],
];
const CLIENT_PAGES = [
  ['client-dash', '/fr/client'],
  ['client-commander', '/fr/client/commander'],
  ['client-commandes', '/fr/client/commandes'],
  ['client-devis', '/fr/client/devis'],
  ['client-factures', '/fr/client/factures'],
  ['client-support', '/fr/client/support'],
  ['client-compte', '/fr/client/compte'],
];
const ADMIN_PAGES = [
  ['admin-produits', '/fr/admin/produits'],
  ['admin-clients', '/fr/admin/clients'],
  ['admin-demandes', '/fr/admin/demandes-portail'],
  ['admin-support', '/fr/admin/support'],
];

const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function tokenFor(email) {
  const { data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
  if (error) throw new Error(`generateLink ${email}: ${error.message}`);
  return data.properties.hashed_token;
}

/** Runs in the page: detect overflow + culprits + tiny tap targets. */
function probe() {
  const vw = window.innerWidth;
  const docW = document.documentElement.scrollWidth;
  const overflow = docW - vw;
  const culprits = [];
  if (overflow > 0) {
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      // element extends past the right edge or starts left of 0
      if (r.right > vw + 1 || r.left < -1) {
        const cls = (typeof el.className === 'string' ? el.className : '').slice(0, 40);
        culprits.push(`${el.tagName.toLowerCase()}.${cls.replace(/\s+/g, '.')} w=${Math.round(r.width)} right=${Math.round(r.right)}`);
      }
    }
  }
  // de-dup, keep widest few
  const uniq = [...new Set(culprits)].slice(0, 6);
  // tiny touch targets (visible interactive elements < 40px in either axis)
  const small = [];
  for (const el of document.querySelectorAll('a, button, input, select, [role=button], [role=tab]')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const style = getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') continue;
    if (r.height < 40 || r.width < 24) {
      const label = (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 22);
      small.push(`${el.tagName.toLowerCase()}[${label}] ${Math.round(r.width)}x${Math.round(r.height)}`);
    }
  }
  return { overflow, docW, vw, culprits: uniq, small: [...new Set(small)].slice(0, 8) };
}

async function login(context, email, landing) {
  const th = await tokenFor(email);
  const page = await context.newPage();
  await page.goto(`${SITE}/auth/otp?token_hash=${th}&next=${encodeURIComponent(landing)}`, {
    waitUntil: 'networkidle',
  });
  await page.close();
}

async function auditSet(context, label, pages, widths) {
  const issues = [];
  const page = await context.newPage();
  for (const [name, path] of pages) {
    let loaded = true;
    try {
      await page.goto(`${SITE}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
    } catch {
      loaded = false;
    }
    if (!loaded) {
      issues.push({ page: name, width: '-', note: 'FAILED TO LOAD' });
      continue;
    }
    for (const w of widths) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(180);
      const r = await page.evaluate(probe);
      const tag = r.overflow > 1 ? `OVERFLOW +${r.overflow}px` : 'ok';
      if (r.overflow > 1 || r.small.length) {
        issues.push({ page: name, width: w, overflow: r.overflow, culprits: r.culprits, small: r.small });
      }
      const flag = r.overflow > 1 ? '❌' : '  ';
      console.log(`${flag} [${label}] ${name} @${w} ${tag}${r.small.length ? ` · ${r.small.length} tiny-targets` : ''}`);
      if (r.culprits.length) console.log(`       ↳ ${r.culprits.join(' | ')}`);
    }
  }
  await page.close();
  return issues;
}

const browser = await chromium.launch();
const all = [];

// Public (no auth)
{
  const ctx = await browser.newContext();
  all.push(...(await auditSet(ctx, 'PUB', PUBLIC_PAGES, WIDTHS)));
  await ctx.close();
}
// Client
{
  const ctx = await browser.newContext();
  await login(ctx, CLIENT_EMAIL, '/fr/client');
  all.push(...(await auditSet(ctx, 'CLI', CLIENT_PAGES, WIDTHS)));
  await ctx.close();
}
// Admin
{
  const ctx = await browser.newContext();
  await login(ctx, ADMIN_EMAIL, '/fr/admin/produits');
  all.push(...(await auditSet(ctx, 'ADM', ADMIN_PAGES, WIDTHS)));
  await ctx.close();
}

await browser.close();

const overflows = all.filter((i) => i.overflow > 1 || i.note);
console.log('\n================ SUMMARY ================');
console.log(`Overflow/load issues: ${overflows.length}`);
for (const i of overflows) {
  console.log(`  ${i.page} @${i.width}: ${i.note || `+${i.overflow}px`} ${i.culprits ? '→ ' + i.culprits.slice(0, 3).join(' | ') : ''}`);
}
process.exit(0);
