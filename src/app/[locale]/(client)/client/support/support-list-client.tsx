'use client';

import { useTranslations } from 'next-intl';

import { useRef, useState, useTransition } from 'react';
import { FileText, Loader2, LifeBuoy, MessageSquarePlus, Paperclip, Plus, Send, X } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { createTicketAction, uploadTicketAttachmentAction } from './actions';

type Pending = {
  localId: string;
  name: string;
  isImage: boolean;
  previewUrl: string;
  status: 'uploading' | 'ready' | 'error';
  ref?: { path: string; name: string; type: string; size: number };
};

const ACCEPT = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt';

export type SupportRow = {
  id: string;
  subject: string;
  status: string;
  lastAuthorRole: string;
  dateLabel: string;
};

export function SupportListClient({ tickets }: { tickets: SupportRow[] }) {
  const tr = useTranslations('portal.support');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [pending, startTransition] = useTransition();
  const [createError, setCreateError] = useState(false);
  const [files, setFiles] = useState<Pending[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const ready = files.filter((f) => f.status === 'ready' && f.ref);
  const uploading = files.some((f) => f.status === 'uploading');

  function pickFiles(list: FileList | null) {
    if (!list) return;
    setCreateError(false);
    for (const file of Array.from(list).slice(0, 6)) {
      if (file.size === 0 || file.size > 25 * 1024 * 1024) {
        setCreateError(true);
        continue;
      }
      const localId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const isImage = file.type.startsWith('image/');
      setFiles((p) => [
        ...p,
        { localId, name: file.name, isImage, previewUrl: isImage ? URL.createObjectURL(file) : '', status: 'uploading' },
      ]);
      const fd = new FormData();
      fd.set('file', file);
      void uploadTicketAttachmentAction(fd).then((res) => {
        setFiles((p) =>
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

  function create() {
    if (!subject.trim() || (!body.trim() && ready.length === 0) || uploading) return;
    setCreateError(false);
    startTransition(async () => {
      const r = await createTicketAction({ subject, body, attachments: ready.map((f) => f.ref!) });
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
          <p className="panel__sub">{tr('lead')}</p>
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
            placeholder={tr('subjectPlaceholder')}
            style={inputStyle}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder={tr('bodyPlaceholder')}
            style={{ ...inputStyle, marginTop: 10, resize: 'vertical' }}
          />
          {files.length > 0 ? (
            <div className="ticket-tray">
              {files.map((f) => (
                <div key={f.localId} className={`ticket-chip${f.status === 'error' ? ' is-error' : ''}`}>
                  {f.isImage && f.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.previewUrl} alt="" className="ticket-chip__thumb" />
                  ) : (
                    <span className="ticket-chip__thumb ticket-chip__thumb--file"><FileText size={16} /></span>
                  )}
                  <span className="ticket-chip__name">{f.name}</span>
                  {f.status === 'uploading' ? <Loader2 size={14} className="ticket-spin" /> : null}
                  <button
                    type="button"
                    className="ticket-chip__x"
                    onClick={() => setFiles((p) => p.filter((x) => x.localId !== f.localId))}
                    aria-label="Retirer"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <input ref={fileRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => pickFiles(e.target.files)} />
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              className="pds-btn pds-btn--ghost pds-btn--md"
              onClick={() => fileRef.current?.click()}
              title={tr('attach')}
            >
              <Paperclip size={16} /> <span>Joindre</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {createError ? (
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-danger)', fontWeight: 'var(--fw-medium)' }}>
                  {tr('uploadFailed')}
                </span>
              ) : null}
              <button className="pds-btn pds-btn--primary pds-btn--md" onClick={create} disabled={pending || uploading}>
                <Send size={15} /> <span>{pending ? 'Envoi…' : 'Envoyer'}</span>
              </button>
            </div>
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
                {t.status === 'closed' ? tr('closed') : t.lastAuthorRole === 'admin' ? tr('prodetReply') : tr('pending')}
              </span>
            </div>
          </Link>
        ))}
        {tickets.length === 0 && !open ? (
          <div className="admin-empty">
            <LifeBuoy size={26} style={{ marginBottom: 8, opacity: 0.5 }} />
            <div>{tr('empty')}</div>
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
