import { ShieldCheck } from 'lucide-react';
import { AuthAtmosphere } from '@/components/auth/auth-atmosphere';
import { Button } from '@/components/ui/button';

type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Intermediate click-through before consuming a magic-link token.
 *
 * Gmail / corporate scanners often prefetch the raw ConfirmationURL and burn
 * the one-time token. This page only verifies when the human submits the form.
 */
export default async function AuthConfirmPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const tokenHash = first(params.token_hash);
  const type = first(params.type) ?? 'magiclink';
  const next = sanitizeNext(first(params.next));
  const isEnglish = next.startsWith('/en/');

  if (!tokenHash) {
    return (
      <main>
        <AuthAtmosphere>
          <div className="border-border bg-card rounded-xl border p-7 text-center shadow-[0_1px_2px_rgba(6,53,97,0.04),0_20px_40px_-24px_rgba(6,53,97,0.22)]">
            <p className="text-prodet-blue text-[11px] font-semibold tracking-[0.14em] uppercase">
              {isEnglish ? 'Client space' : 'Espace client'}
            </p>
            <h1 className="text-prodet-text mt-2.5 text-[22px] font-semibold">
              {isEnglish ? 'Link expired or incomplete' : 'Lien expiré ou incomplet'}
            </h1>
            <p className="text-muted-foreground mt-3 text-[14px] leading-6">
              {isEnglish
                ? 'Request a new magic link from the login page.'
                : 'Demandez un nouveau lien depuis la page de connexion.'}
            </p>
            <Button asChild size="lg" className="mt-6 w-full">
              <a href={isEnglish ? '/en/connexion-client' : '/fr/connexion-client'}>
                {isEnglish ? 'Back to login' : 'Retour à la connexion'}
              </a>
            </Button>
          </div>
        </AuthAtmosphere>
      </main>
    );
  }

  return (
    <main>
      <AuthAtmosphere>
        <div className="border-border bg-card rounded-xl border p-7 text-center shadow-[0_1px_2px_rgba(6,53,97,0.04),0_20px_40px_-24px_rgba(6,53,97,0.22)]">
          <p className="text-prodet-blue text-[11px] font-semibold tracking-[0.14em] uppercase">
            {isEnglish ? 'Client space' : 'Espace client'}
          </p>
          <h1 className="text-prodet-text mt-2.5 text-[22px] font-semibold">
            {isEnglish ? 'Confirm sign-in' : 'Confirmer la connexion'}
          </h1>
          <p className="text-muted-foreground mt-3 text-[14px] leading-6">
            {isEnglish
              ? 'Click below to finish signing in. This step blocks email scanners from burning your link.'
              : 'Cliquez ci-dessous pour finaliser la connexion. Cette étape empêche les scanners mail de consommer le lien.'}
          </p>

          <form action="/auth/callback" method="get" className="mt-6">
            <input type="hidden" name="token_hash" value={tokenHash} />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="next" value={next} />
            <Button type="submit" size="lg" className="w-full">
              {isEnglish ? 'Enter client space' : 'Entrer dans l’espace client'}
            </Button>
          </form>

          <p className="text-muted-foreground mt-5 flex items-center justify-center gap-1.5 text-[11px]">
            <ShieldCheck className="text-prodet-blue h-3.5 w-3.5" aria-hidden />
            {isEnglish
              ? 'One-time link · Prodet validated access'
              : 'Lien à usage unique · Accès validé par Prodet'}
          </p>
        </div>
      </AuthAtmosphere>
    </main>
  );
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function sanitizeNext(value?: string): string {
  if (!value) return '/fr/client';
  try {
    const decoded = decodeURIComponent(value);
    if (
      (/^\/(fr|ar|en)\/admin\//u.test(decoded) || /^\/(fr|ar|en)\/client(?:\/|$)/u.test(decoded)) &&
      !decoded.startsWith('//')
    ) {
      return decoded;
    }
  } catch {
    // fall through
  }
  if (
    (/^\/(fr|ar|en)\/admin\//u.test(value) || /^\/(fr|ar|en)\/client(?:\/|$)/u.test(value)) &&
    !value.startsWith('//')
  ) {
    return value;
  }
  return '/fr/client';
}
