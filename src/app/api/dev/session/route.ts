import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * DEV ONLY — instant portal login, no magic link, no Supabase rate limit.
 *
 *   Visit:  http://localhost:3004/api/dev/session?email=clearsurr@gmail.com
 *
 * Mints a real session with the service-role key and writes the Supabase
 * auth cookies directly (via @supabase/ssr, so chunking matches what the app
 * reads), then redirects you straight into the portal. Stays logged in across
 * code reloads. Disabled outside NODE_ENV=development.
 *
 * Optional params:
 *   ?email=...   which portal user to log in as (required)
 *   ?next=/fr/client/factures   where to land (default /fr/client)
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Not available', { status: 403 });
  }

  const url = new URL(request.url);
  const email = url.searchParams.get('email')?.trim().toLowerCase();
  const nextParam = url.searchParams.get('next');

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const dbUrl = process.env.DATABASE_URL;
  if (!supabaseUrl || !serviceKey || !anonKey || !dbUrl) {
    return jsonError('Missing SUPABASE_URL / keys / DATABASE_URL in env', 500);
  }

  // No email → render a one-click picker of every portal account.
  if (!email?.includes('@')) {
    return renderPicker(dbUrl);
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');

    // Gate: the email must EITHER have portal access (user_customer link) OR be
    // an active admin (owner/admin/operator/reviewer). Pick the landing page
    // accordingly so admins drop into the console, clients into the portal.
    const sql = await import('postgres').then((m) => m.default(dbUrl, { max: 1 }));
    const [user] = await sql`
      select
        u.id,
        (u.role in ('owner','admin','operator','reviewer') and u.is_active) as is_admin,
        exists(select 1 from user_customer uc where uc.user_id = u.id) as is_client
      from app_user u
      where u.email = ${email}
      limit 1
    `;
    await sql.end();
    if (!user || (!user.is_admin && !user.is_client)) {
      return jsonError(`No portal or admin access for ${email}`, 404);
    }
    const next =
      nextParam || (user.is_admin && !user.is_client ? '/fr/admin/clients' : '/fr/client');

    // Admin generateLink + verifyOtp bypasses the magic-link send rate limit
    // entirely (no email is sent — the token is returned to us directly).
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });
    if (linkErr) throw linkErr;
    const tokenHash = link?.properties?.hashed_token;
    if (!tokenHash) throw new Error('generateLink returned no token');

    // Build an SSR client bound to the response cookie jar, then setSession so
    // @supabase/ssr writes the auth cookies in the exact (possibly chunked)
    // format middleware + server gates read.
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(toSet) {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    });

    const { error: otpErr } = await supabase.auth.verifyOtp({
      type: 'magiclink',
      token_hash: tokenHash,
    });
    if (otpErr) throw otpErr;

    // Cookies are now staged on cookieStore; redirect carries them to the browser.
    return NextResponse.redirect(new URL(next, url.origin), { status: 303 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return jsonError(msg, 500);
  }
}

function jsonError(error: string, status: number) {
  return new NextResponse(JSON.stringify({ error }, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

type ClientRow = { email: string; customer: string | null; swiver_id: string | null };
type AdminRow = { email: string; full_name: string | null; role: string };

/** A bare HTML page listing every admin + portal account with one-click login. */
async function renderPicker(dbUrl: string) {
  let clients: ClientRow[] = [];
  let admins: AdminRow[] = [];
  try {
    const sql = await import('postgres').then((m) => m.default(dbUrl, { max: 1 }));
    clients = (await sql`
      select u.email,
             coalesce(c.display_name, c.name) as customer,
             c.swiver_id
      from app_user u
      join user_customer uc on uc.user_id = u.id
      join customer c on c.id = uc.customer_id
      order by customer nulls last, u.email
    `) as ClientRow[];
    admins = (await sql`
      select u.email, u.full_name, u.role
      from app_user u
      where u.role in ('owner','admin','operator','reviewer') and u.is_active
      order by case u.role when 'owner' then 0 when 'admin' then 1 when 'operator' then 2 else 3 end, u.email
    `) as AdminRow[];
    await sql.end();
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'DB error', 500);
  }

  const adminCards = admins
    .map(
      (r) => `
      <a class="card card--admin" href="/api/dev/session?email=${encodeURIComponent(r.email)}&next=/fr/admin/clients">
        <div class="name">${esc(r.full_name || r.email)}</div>
        <div class="email">${esc(r.email)}</div>
        <div class="role">${esc(r.role)}</div>
        <span class="go go--admin">Ouvrir la console →</span>
      </a>`,
    )
    .join('');

  const clientCards = clients
    .map(
      (r) => `
      <a class="card" href="/api/dev/session?email=${encodeURIComponent(r.email)}&next=/fr/client">
        <div class="name">${esc(r.customer || '(no customer)')}</div>
        <div class="email">${esc(r.email)}</div>
        ${r.swiver_id ? `<div class="swiver">Swiver #${esc(r.swiver_id)}</div>` : '<div class="swiver muted">not linked</div>'}
        <span class="go">Ouvrir l’espace client →</span>
      </a>`,
    )
    .join('');

  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dev login — Prodet</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; font: 15px/1.5 ui-sans-serif, system-ui, sans-serif;
    background: radial-gradient(1200px 600px at 70% -10%, #0d5294 0%, #071a30 55%, #04101f 100%);
    color: #eaf2ff; padding: 48px 24px; }
  .wrap { max-width: 820px; margin: 0 auto; }
  .kicker { letter-spacing: .14em; text-transform: uppercase; font-size: 12px; color: #6fb1ff; font-weight: 600; }
  h1 { margin: 6px 0 4px; font-size: 28px; }
  p.sub { margin: 0 0 32px; color: #9bb6d6; }
  h2.section { font-size: 13px; letter-spacing: .1em; text-transform: uppercase; color: #9bb6d6;
    margin: 30px 0 12px; display: flex; align-items: center; gap: 10px; }
  h2.section::after { content: ""; flex: 1; height: 1px; background: rgba(255,255,255,.1); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; }
  .card { display: block; text-decoration: none; color: inherit; padding: 18px 18px 16px;
    border-radius: 16px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
    transition: transform .15s ease, background .15s ease, border-color .15s ease; position: relative; }
  .card:hover { transform: translateY(-3px); background: rgba(111,177,255,.14); border-color: rgba(111,177,255,.5); }
  .card--admin { background: rgba(255,196,84,.08); border-color: rgba(255,196,84,.25); }
  .card--admin:hover { background: rgba(255,196,84,.16); border-color: rgba(255,196,84,.55); }
  .name { font-weight: 700; font-size: 16px; margin-bottom: 3px; }
  .email { color: #9bb6d6; font-size: 13px; word-break: break-all; }
  .swiver { margin-top: 8px; font-size: 12px; color: #7fd6a6; font-weight: 600; }
  .swiver.muted { color: #6c84a6; }
  .role { margin-top: 8px; font-size: 12px; color: #ffc454; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
  .go { display: inline-block; margin-top: 12px; font-size: 13px; font-weight: 600; color: #6fb1ff; }
  .go--admin { color: #ffc454; }
  .empty { padding: 24px; text-align: center; color: #9bb6d6; border: 1px dashed rgba(255,255,255,.15); border-radius: 16px; }
  footer { margin-top: 30px; font-size: 12px; color: #6c84a6; }
</style></head>
<body><div class="wrap">
  <div class="kicker">Dev only · no email sent</div>
  <h1>Connexion instantanée</h1>
  <p class="sub">Cliquez un compte pour ouvrir sa session — aucune limite Supabase, aucun lien magique.</p>

  <h2 class="section">Console admin</h2>
  ${admins.length ? `<div class="grid">${adminCards}</div>` : '<div class="empty">Aucun compte admin actif.</div>'}

  <h2 class="section">Espaces clients</h2>
  ${clients.length ? `<div class="grid">${clientCards}</div>` : '<div class="empty">Aucun compte client trouvé. Lancez d’abord le seed du portail.</div>'}

  <footer>Cet écran n’existe qu’en développement (NODE_ENV=development).</footer>
</div></body></html>`;

  return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
