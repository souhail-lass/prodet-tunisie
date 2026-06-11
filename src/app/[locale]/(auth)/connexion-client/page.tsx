import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { KeyRound, LockKeyhole, MailCheck, ShieldAlert } from 'lucide-react';
import { Button, Input } from '@/components/ds';
import { isLocale } from '@/i18n/routing';
import { requestClientMagicLink } from '@/features/client-auth/login-actions';
import { requireClientPortalAccess } from '@/features/client-portal/auth';

// Per-user by nature (session check + redirect). Must never be prerendered:
// the try/catch below would swallow the static-bailout signal cookies() throws
// during build and bake a form that ignores existing sessions.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Connexion espace client Prodet',
    description: 'Connexion par lien magique pour les clients Prodet invités.',
    robots: { index: false, follow: false },
  };
}

type PageSearchParams = Record<string, string | string[] | undefined>;

export default async function ClientLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<PageSearchParams>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) redirect('/fr/connexion-client');

  const rawSearchParams = searchParams ? await searchParams : {};
  const error = firstParam(rawSearchParams.error);
  const sent = firstParam(rawSearchParams.sent);
  const next = sanitizeNext(locale, firstParam(rawSearchParams.next));

  // Returning client with a still-valid session: skip the form entirely and
  // go straight to the portal. The magic link is only for the FIRST login on
  // a device (or after sign-out) — never a per-visit requirement.
  let alreadySignedIn = false;
  try {
    await requireClientPortalAccess();
    alreadySignedIn = true;
  } catch {
    // No valid session (or no activated portal access) — show the form.
  }
  if (alreadySignedIn) redirect(next);

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--surface-page)',
        padding: '40px 20px',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'var(--surface-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-panel)',
          boxShadow: 'var(--shadow-panel)',
          padding: 32,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-button)',
            background: 'var(--surface-navy)',
            color: '#fff',
          }}
        >
          <LockKeyhole size={20} aria-hidden />
        </span>
        <p className="eyebrow" style={{ marginTop: 18 }}>
          Espace client
        </p>
        <h1
          style={{
            marginTop: 8,
            fontSize: 'var(--text-h2)',
            fontWeight: 'var(--fw-bold)',
            letterSpacing: 'var(--tracking-tight)',
          }}
        >
          Connexion espace client
        </h1>
        <p style={{ marginTop: 10, fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          Entrez l’email utilisé pour votre accès Prodet. Le lien de connexion est envoyé uniquement si cet email
          dispose déjà d’un accès client activé par Prodet (invitation ou activation).
        </p>

        <form action={requestClientMagicLink} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="next" value={next} />
          <Input
            label="Email professionnel"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="nom@societe.tn"
          />
          <Button type="submit" variant="primary" size="lg" block iconLeft={<KeyRound size={16} />}>
            Recevoir le lien de connexion
          </Button>
        </form>

        {sent === '1' ? (
          <p
            role="status"
            style={{
              marginTop: 18,
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
              background: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              borderRadius: 'var(--radius-card)',
              padding: '12px 14px',
              fontSize: 'var(--text-sm)',
              lineHeight: 1.55,
            }}
          >
            <MailCheck size={16} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
            Merci. Si cet email dispose d’un accès client activé chez Prodet, vous recevrez sous peu un lien de
            connexion — vérifiez aussi les courriers indésirables.
          </p>
        ) : null}

        {error ? (
          <p
            role="alert"
            style={{
              marginTop: 18,
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              borderRadius: 'var(--radius-card)',
              padding: '12px 14px',
              fontSize: 'var(--text-sm)',
              lineHeight: 1.55,
            }}
          >
            <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
            {clientLoginErrorMessage(error)}
          </p>
        ) : null}
      </section>
    </main>
  );
}

function clientLoginErrorMessage(error: string): string {
  switch (error) {
    case 'invalid':
      return "L'adresse email n'est pas valide.";
    case 'not-activated':
      return "Cet email n'a pas encore d'accès client activé par Prodet.";
    case 'config':
      return "La connexion client n'est pas configurée côté serveur.";
    case 'failed':
      return "Impossible d'envoyer le lien de connexion pour le moment.";
    case 'missing-code':
    case 'callback':
      return "Le lien magique n'a pas pu être validé. Demandez un nouveau lien.";
    default:
      return 'Connexion impossible pour le moment.';
  }
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function sanitizeNext(locale: 'fr' | 'ar' | 'en', value?: string): string {
  if (!value) return `/${locale}/client`;

  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith(`/${locale}/client`) && !decoded.startsWith('//')) {
      return decoded;
    }
  } catch {
    // Fall through to default.
  }

  if (value.startsWith(`/${locale}/client`) && !value.startsWith('//')) return value;

  return `/${locale}/client`;
}
