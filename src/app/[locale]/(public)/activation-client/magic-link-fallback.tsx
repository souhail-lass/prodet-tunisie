import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { requestClientMagicLink } from '@/features/client-auth/login-actions';

/**
 * Porte de sortie quand le lien d'activation ne mène nulle part : expiré,
 * déjà utilisé, ou invalide.
 *
 * Le jeton d'activation est à usage unique — rouvrir le mail après activation
 * affiche « Invitation invalide », ce qui laissait le client sans recours et
 * obligeait à repasser par Prodet. Ici il récupère lui-même un lien de
 * connexion : son compte existe déjà dès la première activation.
 *
 * Server component : `requestClientMagicLink` est une server action qui
 * redirige, donc pas besoin d'état client. L'action est anti-énumération —
 * la même réponse est renvoyée que l'email existe ou non.
 */
export function MagicLinkFallback({
  locale,
  title,
  body,
}: {
  locale: 'fr' | 'en';
  title: string;
  body: string;
}) {
  return (
    <form
      action={requestClientMagicLink}
      className="mt-6 rounded-sm border border-border bg-prodet-wash p-4 md:p-5"
    >
      <input type="hidden" name="locale" value={locale} />
      <h2 className="font-display text-xl font-bold text-prodet-text">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="vous@societe.tn"
          aria-label="Email professionnel"
          className="sm:flex-1"
        />
        <Button type="submit" variant="navy" size="lg">
          <Mail className="h-4 w-4" aria-hidden />
          Recevoir un lien
        </Button>
      </div>
    </form>
  );
}
