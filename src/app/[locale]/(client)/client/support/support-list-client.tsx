'use client';

import { useState, useTransition } from 'react';
import { LifeBuoy, MessageSquarePlus, Plus, Send } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { createTicketAction } from './actions';

export type SupportRow = {
  id: string;
  subject: string;
  status: string;
  lastAuthorRole: string;
  dateLabel: string;
};

export function SupportListClient({ tickets }: { tickets: SupportRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [pending, startTransition] = useTransition();
  const [createError, setCreateError] = useState(false);

  function create() {
    if (!subject.trim() || !body.trim()) return;
    setCreateError(false);
    startTransition(async () => {
      const r = await createTicketAction({ subject, body });
      if (r.ok && r.id) {
        router.push(`/client/support/${r.id}`);
        router.refresh();
      } else {
        setCreateError(true);
      }
    });
  }

  return (
    <div className="dash">
      <div className="panel__head" style={{ background: 'none', padding: 0 }}>
        <div>
          <h2 className="panel__title" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <LifeBuoy size={18} /> Support
          </h2>
          <p className="panel__sub">Une question, un souci sur une commande ? Écrivez-nous, nous répondons ici.</p>
        </div>
        <button className="pds-btn pds-btn--primary pds-btn--sm" onClick={() => setOpen((o) => !o)}>
          <Plus size={15} /> <span>Nouveau ticket</span>
        </button>
      </div>

      {open ? (
        <section className="panel">
          <div className="panel__head">
            <h2 className="panel__title" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <MessageSquarePlus size={17} /> Nouveau ticket
            </h2>
          </div>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Sujet (ex. Problème sur ma commande ORD-…)"
            style={inputStyle}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Décrivez votre demande…"
            style={{ ...inputStyle, marginTop: 10, resize: 'vertical' }}
          />
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
            {createError ? (
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-danger)', fontWeight: 'var(--fw-medium)' }}>
                L’envoi a échoué — reconnectez-vous à votre espace client et réessayez.
              </span>
            ) : null}
            <button className="pds-btn pds-btn--primary pds-btn--md" onClick={create} disabled={pending}>
              <Send size={15} /> <span>{pending ? 'Envoi…' : 'Envoyer'}</span>
            </button>
          </div>
        </section>
      ) : null}

      <div className="orders__list">
        {tickets.map((t) => (
          <Link key={t.id} href={`/client/support/${t.id}`} className="order-row" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="order-row__main">
              <div className="order-row__id-block">
                <span className="order-row__id">{t.subject}</span>
                <span className="order-row__date">Dernier message · {t.dateLabel}</span>
              </div>
              <span
                className="pds-badge"
                style={
                  t.status === 'closed'
                    ? { background: 'var(--surface-sunken)', color: 'var(--text-secondary)' }
                    : t.lastAuthorRole === 'admin'
                      ? { background: 'var(--prodet-green-tint)', color: 'var(--prodet-green)' }
                      : { background: 'var(--prodet-blue-tint)', color: 'var(--prodet-blue)' }
                }
              >
                {t.status === 'closed' ? 'Clôturé' : t.lastAuthorRole === 'admin' ? 'Réponse Prodet' : 'En attente'}
              </span>
            </div>
          </Link>
        ))}
        {tickets.length === 0 && !open ? (
          <div className="admin-empty">
            <LifeBuoy size={26} style={{ marginBottom: 8, opacity: 0.5 }} />
            <div>Aucun ticket. Cliquez sur « Nouveau ticket » pour nous écrire.</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-button)',
  padding: '10px 12px',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)',
  outline: 'none',
};
