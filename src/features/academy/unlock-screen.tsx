'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { Input } from '@/components/ds/form';

/**
 * Code-entry gate for the confidential Module 4 formulas.
 *
 * Submits the typed code to `/api/academy/unlock`; the server verifies it and
 * sets the session cookie. No hint, no password material on the client.
 */
export function UnlockScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || code.trim() === '') return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/academy/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      if (res.status === 429) {
        const data = (await res.json().catch(() => ({}))) as { retryAfter?: number };
        const secs = data.retryAfter ?? 60;
        setError(`Trop de tentatives. Réessayez dans ${secs} seconde${secs > 1 ? 's' : ''}.`);
      } else if (res.status === 503) {
        setError('Code Académie non configuré côté serveur. Contactez l’administrateur.');
      } else {
        setError('Code incorrect.');
      }
    } catch {
      setError('Erreur réseau. Réessayez.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="academy-gate">
      <form className="academy-gate__card" onSubmit={onSubmit} noValidate>
        <span className="academy-gate__icon" aria-hidden>
          <Lock size={22} />
        </span>
        <h1 className="academy-gate__title">Accès protégé</h1>
        <p className="academy-gate__sub">
          Les formules de la gamme Prodet sont confidentielles. Saisissez le code d’accès pour les afficher.
        </p>
        <Input
          label="Code d’accès"
          type="password"
          autoComplete="off"
          autoFocus
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (error) setError(null);
          }}
          error={error ?? undefined}
          disabled={pending}
        />
        <button
          type="submit"
          className="pds-btn pds-btn--primary pds-btn--md pds-btn--block"
          disabled={pending || code.trim() === ''}
        >
          <span>{pending ? 'Vérification…' : 'Déverrouiller'}</span>
        </button>
      </form>
    </div>
  );
}
