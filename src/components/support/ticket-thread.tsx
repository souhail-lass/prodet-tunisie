'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { FileText, ImageIcon, Loader2, Paperclip, Send, X } from 'lucide-react';
import { useRouter } from '@/i18n/routing';

export type ThreadAttachment = {
  url: string;
  name: string;
  type: string;
  size: number;
  isImage: boolean;
};

export type ThreadMessage = {
  id: string;
  authorRole: string;
  authorName: string | null;
  body: string;
  attachments?: ThreadAttachment[];
  createdAt: Date | string;
};

type AttachmentRef = { path: string; name: string; type: string; size: number };
type UploadResult = { ok: true; attachment: AttachmentRef } | { ok: false; error: string };

type Pending = {
  localId: string;
  name: string;
  type: string;
  size: number;
  isImage: boolean;
  previewUrl: string;
  status: 'uploading' | 'ready' | 'error';
  ref?: AttachmentRef;
};

const fmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Africa/Tunis' });
const MAX_BYTES = 25 * 1024 * 1024;
const ACCEPT = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt';

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function TicketThread({
  messages,
  viewerRole,
  closed,
  onReply,
  onUpload,
  poll = true,
}: {
  messages: ThreadMessage[];
  viewerRole: 'client' | 'admin';
  closed?: boolean;
  onReply: (body: string, attachments: AttachmentRef[]) => Promise<{ ok: boolean }>;
  onUpload: (formData: FormData) => Promise<UploadResult>;
  poll?: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [pending, setPending] = useState<Pending[]>([]);
  const [optimistic, setOptimistic] = useState<ThreadMessage[]>([]);
  const [failed, setFailed] = useState(false);
  const [lightbox, setLightbox] = useState<{ url: string; name: string } | null>(null);
  const [sending, startSend] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const lastCountRef = useRef(0);

  // Near-real-time refresh (pauses while composing).
  useEffect(() => {
    if (!poll || body.trim() || pending.length) return;
    const id = setInterval(() => router.refresh(), 12_000);
    return () => clearInterval(id);
  }, [poll, body, pending.length, router]);

  const serverKeys = useMemo(
    () => new Set(messages.map((m) => `${m.authorRole}:${m.body}:${(m.attachments ?? []).length}`)),
    [messages],
  );
  const visible = useMemo(
    () => [...messages, ...optimistic.filter((o) => !serverKeys.has(`${o.authorRole}:${o.body}:${(o.attachments ?? []).length}`))],
    [messages, optimistic, serverKeys],
  );

  useEffect(() => {
    const box = scrollRef.current;
    if (!box) return;
    if (lastCountRef.current === 0) box.scrollTop = box.scrollHeight;
    else if (visible.length > lastCountRef.current) box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
    lastCountRef.current = visible.length;
  }, [visible.length]);

  function pickFiles(files: FileList | null) {
    if (!files) return;
    setFailed(false);
    for (const file of Array.from(files).slice(0, 6)) {
      if (file.size === 0 || file.size > MAX_BYTES) {
        setFailed(true);
        continue;
      }
      const localId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const isImage = file.type.startsWith('image/');
      const item: Pending = {
        localId,
        name: file.name,
        type: file.type,
        size: file.size,
        isImage,
        previewUrl: isImage ? URL.createObjectURL(file) : '',
        status: 'uploading',
      };
      setPending((p) => [...p, item]);
      const fd = new FormData();
      fd.set('file', file);
      void onUpload(fd).then((res) => {
        setPending((p) =>
          p.map((x) =>
            x.localId === localId
              ? res.ok
                ? { ...x, status: 'ready', ref: res.attachment }
                : { ...x, status: 'error' }
              : x,
          ),
        );
      });
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  function removePending(localId: string) {
    setPending((p) => {
      const item = p.find((x) => x.localId === localId);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return p.filter((x) => x.localId !== localId);
    });
  }

  const uploading = pending.some((p) => p.status === 'uploading');
  const readyAttachments = pending.filter((p) => p.status === 'ready' && p.ref);
  const canSend = (body.trim().length > 0 || readyAttachments.length > 0) && !uploading && !sending;

  function send() {
    if (!canSend) return;
    const text = body.trim();
    const refs = readyAttachments.map((p) => p.ref!);
    const echoAttachments: ThreadAttachment[] = readyAttachments.map((p) => ({
      url: p.previewUrl || '#',
      name: p.name,
      type: p.type,
      size: p.size,
      isImage: p.isImage,
    }));
    const echo: ThreadMessage = {
      id: `optimistic-${Date.now()}`,
      authorRole: viewerRole,
      authorName: null,
      body: text,
      attachments: echoAttachments,
      createdAt: new Date(),
    };
    setBody('');
    setPending([]);
    setFailed(false);
    setOptimistic((prev) => [...prev, echo]);
    startSend(async () => {
      const r = await onReply(text, refs);
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
          const atts = m.attachments ?? [];
          return (
            <div key={m.id} className={`ticket-msg${mine ? ' ticket-msg--mine' : ''}`}>
              <div className={`ticket-bubble${mine ? ' ticket-bubble--mine' : ''}${isEcho ? ' is-echo' : ''}`}>
                <div className="ticket-bubble__meta">
                  {m.authorRole === 'admin' ? m.authorName || 'Prodet' : m.authorName || 'Client'} ·{' '}
                  {isEcho ? 'envoi…' : fmt.format(new Date(m.createdAt))}
                </div>
                {atts.length > 0 ? (
                  <div className="ticket-atts">
                    {atts.map((a, i) =>
                      a.isImage ? (
                        <button
                          key={i}
                          type="button"
                          className="ticket-att-img"
                          onClick={() => setLightbox({ url: a.url, name: a.name })}
                          title={a.name}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={a.url} alt={a.name} loading="lazy" />
                        </button>
                      ) : (
                        <a
                          key={i}
                          className={`ticket-att-file${mine ? ' ticket-att-file--mine' : ''}`}
                          href={a.url}
                          target="_blank"
                          rel="noopener"
                          title={a.name}
                        >
                          <span className="ticket-att-file__icon"><FileText size={18} /></span>
                          <span className="ticket-att-file__info">
                            <strong>{a.name}</strong>
                            <span>{humanSize(a.size)}</span>
                          </span>
                        </a>
                      ),
                    )}
                  </div>
                ) : null}
                {m.body ? <div className="ticket-bubble__body">{m.body}</div> : null}
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
        <p className="ticket-error">L’envoi a échoué (ou fichier trop volumineux, max 25 Mo). Réessayez.</p>
      ) : null}

      {pending.length > 0 ? (
        <div className="ticket-tray">
          {pending.map((p) => (
            <div key={p.localId} className={`ticket-chip${p.status === 'error' ? ' is-error' : ''}`}>
              {p.isImage && p.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.previewUrl} alt="" className="ticket-chip__thumb" />
              ) : (
                <span className="ticket-chip__thumb ticket-chip__thumb--file">
                  {p.isImage ? <ImageIcon size={16} /> : <FileText size={16} />}
                </span>
              )}
              <span className="ticket-chip__name">{p.name}</span>
              {p.status === 'uploading' ? <Loader2 size={14} className="ticket-spin" /> : null}
              <button type="button" className="ticket-chip__x" onClick={() => removePending(p.localId)} aria-label="Retirer">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="ticket-composer">
        <input ref={fileRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => pickFiles(e.target.files)} />
        <button
          type="button"
          className="ticket-composer__attach"
          onClick={() => fileRef.current?.click()}
          aria-label="Joindre un fichier"
          title="Joindre une photo ou un fichier"
        >
          <Paperclip size={18} />
        </button>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') send();
          }}
          rows={1}
          placeholder="Écrivez votre message…"
          className="ticket-composer__input"
        />
        <button type="button" className="ticket-composer__send" onClick={send} disabled={!canSend} aria-label="Envoyer">
          <Send size={18} />
        </button>
      </div>

      {lightbox ? (
        <div className="ticket-lightbox" onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
          <button className="ticket-lightbox__close" onClick={() => setLightbox(null)} aria-label="Fermer">
            <X size={22} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox.url} alt={lightbox.name} onClick={(e) => e.stopPropagation()} />
        </div>
      ) : null}
    </div>
  );
}
