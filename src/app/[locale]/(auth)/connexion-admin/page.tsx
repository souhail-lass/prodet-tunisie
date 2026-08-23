import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Mail, ShieldCheck } from 'lucide-react';
import { requestAdminMagicLink } from '@/features/admin/login-actions';
import { requireAdmin } from '@/features/admin/auth';

// Per-user by nature (session check + redirect). Must never be prerendered:
// the try/catch below would swallow the static-bailout signal cookies() throws
// during build and bake a form that ignores existing sessions.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Connexion admin Prodet',
  description: 'Connexion réservée aux administrateurs Prodet.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sent?: string; error?: string; next?: string }>;
}) {
  const { locale } = await params;
  const { sent, error, next } = await searchParams;
  const safeLocale = locale === 'en' ? locale : 'fr';

  // Admin with a still-valid session: skip the form and go straight to the
  // console instead of asking for a new magic link on every visit.
  let alreadySignedIn = false;
  try {
    await requireAdmin();
    alreadySignedIn = true;
  } catch {
    // No valid admin session — show the login form.
  }
  if (alreadySignedIn) {
    const target =
      next && /^\/(fr|ar|en)\/admin\//u.test(next) && !next.startsWith('//')
        ? next
        : `/${safeLocale}/admin/overview`;
    redirect(target);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-prodet-wash px-5 py-10">
      <section className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-[0_24px_70px_-60px_rgba(8,41,78,0.55)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-prodet-ink text-white">
          <ShieldCheck className="h-5 w-5" aria-hidden />
        </div>
        <p className="eyebrow-label mt-5">Admin Prodet</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-prodet-text">
          Connexion sécurisée
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Entrez l&apos;email d&apos;un compte admin déjà créé par Prodet. Aucun compte n&apos;est créé depuis cette page.
        </p>

        <form action={requestAdminMagicLink} className="mt-6 space-y-4">
          <input type="hidden" name="locale" value={safeLocale} />
          <input
            type="hidden"
            name="next"
            value={next || `/${safeLocale}/admin/overview`}
          />
          <label className="block text-sm font-semibold text-prodet-text">
            Email admin
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-2 h-11 w-full rounded-sm border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
              placeholder="admin@prodet.tn"
            />
          </label>
          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm border border-primary bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-strong"
          >
            <Mail className="h-4 w-4" aria-hidden />
            Recevoir le lien magique
          </button>
        </form>

        {sent === '1' ? (
          <p className="mt-4 rounded-sm bg-support/10 px-3 py-2 text-sm leading-6 text-support">
            Si cet email correspond à un compte admin existant, un lien magique a été envoyé.
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-sm bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">
            {mapLoginError(error)}
          </p>
        ) : null}
      </section>
    </main>
  );
}

function mapLoginError(error: string): string {
  if (error === 'invalid') return "L'adresse email n'est pas valide.";
  if (error === 'config') return "L'authentification admin n'est pas encore configurée.";
  if (error === 'missing-code' || error === 'callback') {
    return 'Le lien de connexion est invalide ou expiré.';
  }
  return "Impossible d'envoyer le lien de connexion.";
}
