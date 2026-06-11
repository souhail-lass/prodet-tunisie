'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { Send } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

export type ThreadMessage = {
  id: string;
  authorRole: string;
  authorName: string | null;
  body: string;
  createdAt: Date | string;
};

const fmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Africa/Tunis' });

export function TicketThread({
  messages,
  viewerRole,
  closed,
  onReply,
  poll = true,
}: {
  messages: ThreadMessage[];
  viewerRole: 'client' | 'admin';
  closed?: boolean;
  onReply: (body: string) => Promise<{ ok: boolean }>;
  poll?: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState('');
  // Messages sent this session, echoed instantly while the server confirms.
  const [optimistic, setOptimistic] = useState<ThreadMessage[]>([]);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);

  // Near-real-time refresh of the conversation (pauses while typing a reply).
  useEffect(() => {
    if (!poll || body.trim()) return;
    const id = setInterval(() => router.refresh(), 12_000);
    return () => clearInterval(id);
  }, [poll, body, router]);

  // Drop optimistic copies once the server render includes them.
  const serverBodies = useMemo(() => new Set(messages.map((m) => `${m.authorRole}:${m.body}`)), [messages]);
  const visible = useMemo(
    () => [...messages, ...optimistic.filter((o) => !serverBodies.has(`${o.authorRole}:${o.body}`))],
    [messages, optimistic, serverBodies],
  );

  // Messenger-style: the box opens already scrolled to the latest message,
  // then follows new ones smoothly inside its own scroll area.
  useEffect(() => {
    const box = scrollRef.current;
    if (!box) return;
    if (lastCountRef.current === 0) {
      box.scrollTop = box.scrollHeight;
    } else if (visible.length > lastCountRef.current) {
      box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
    }
    lastCountRef.current = visible.length;
  }, [visible.length]);

  function send() {
    const text = body.trim();
    if (!text || pending) return;
    setBody('');
    setFailed(false);
    const echo: ThreadMessage = {
      id: `optimistic-${Date.now()}`,
      authorRole: viewerRole,
      authorName: null,
      body: text,
      createdAt: new Date(),
    };
    setOptimistic((prev) => [...prev, echo]);
    startTransition(async () => {
      const r = await onReply(text);
      if (!r.ok) {
        setOptimistic((prev) => prev.filter((m) => m.id !== echo.id));
        setBody(text);
        setFailed(true);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <div className="ticket-scroll" ref={scrollRef}>
        {visible.map((m) => {
          const mine = m.authorRole === viewerRole;
          const isEcho = m.id.startsWith('optimistic-');
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
              <div
                className="ticket-bubble"
                style={{
                  maxWidth: '76%',
                  background: mine ? 'var(--prodet-blue)' : 'var(--surface-card)',
                  color: mine ? '#fff' : 'var(--text-primary)',
                  border: mine ? 'none' : '1px solid var(--border-default)',
                  borderRadius: 14,
                  padding: '10px 14px',
                  boxShadow: 'var(--shadow-card)',
                  opacity: isEcho ? 0.75 : 1,
                }}
              >
                <div style={{ fontSize: 'var(--text-2xs)', opacity: 0.8, marginBottom: 3, fontWeight: 'var(--fw-semibold)' }}>
                  {m.authorRole === 'admin' ? m.authorName || 'Prodet' : m.authorName || 'Client'} ·{' '}
                  {isEcho ? 'envoi…' : fmt.format(new Date(m.createdAt))}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{m.body}</div>
              </div>
            </div>
          );
        })}
      </div>

      {closed ? (
        <p className="panel__sub" style={{ marginTop: 14, textAlign: 'center' }}>
          Ce ticket est clôturé. Répondez pour le rouvrir.
        </p>
      ) : null}
      {failed ? (
        <p style={{ marginTop: 10, fontSize: 'var(--text-sm)', color: 'var(--color-danger)', fontWeight: 'var(--fw-medium)' }}>
          L’envoi a échoué — votre message a été restauré, réessayez.
        </p>
      ) : null}

      <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'flex-end' }}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') send();
          }}
          rows={2}
          placeholder="Écrivez votre message…"
          style={{
            flex: 1,
            resize: 'vertical',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-button)',
            padding: '10px 12px',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-sm)',
            outline: 'none',
          }}
        />
        <button className="pds-btn pds-btn--primary pds-btn--md" onClick={send} disabled={!body.trim()}>
          <Send size={16} /> <span>Envoyer</span>
        </button>
      </div>
    </div>
  );
}
