'use client';

import { useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FileUp, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  DOCUMENT_KIND_LABELS,
  DOCUMENT_KIND_ORDER,
  MAX_DOCUMENT_BYTES,
  type DocumentKind,
} from '@/features/client-portal/documents/constants';
import { uploadCustomerDocumentAction } from '@/features/client-portal/documents/actions';
import type { Locale } from '@/i18n/routing';

interface DocumentUploadFormProps {
  locale: Locale;
  /** When set, the uploaded document is attached to this request id. */
  attachToOrderDraftId?: string;
  /** Inline variant used inside a request detail page. */
  variant?: 'page' | 'inline';
}

const accept = ALLOWED_DOCUMENT_MIME_TYPES.join(',');

/** Map a server error code to a translation key under portal.upload.errors. */
function errorKeyFor(code: string | undefined): string {
  switch (code) {
    case 'invalid':
      return 'errors.incomplete';
    case 'too-large':
      return 'errors.tooLarge';
    case 'mime-not-allowed':
      return 'errors.badFormat';
    case 'rate-limited':
      return 'errors.rateLimited';
    case 'unavailable':
      return 'errors.storage';
    default:
      return 'errors.generic';
  }
}

export function DocumentUploadForm({
  locale,
  attachToOrderDraftId,
  variant = 'page',
}: DocumentUploadFormProps) {
  const t = useTranslations('portal.upload');
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const form = event.currentTarget;
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError('Sélectionnez un fichier à téléverser.');
      return;
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      setError(t('errors.tooLarge', { max: formatBytes(MAX_DOCUMENT_BYTES) }));
      return;
    }

    const formData = new FormData(form);
    formData.set('locale', locale);
    if (attachToOrderDraftId) {
      formData.set('attachToOrderDraftId', attachToOrderDraftId);
    }

    startTransition(async () => {
      const result = await uploadCustomerDocumentAction(formData);
      if (!result.ok) {
        setError(t(errorKeyFor(result.error), { max: formatBytes(MAX_DOCUMENT_BYTES) }));
        return;
      }
      setSuccess(
        attachToOrderDraftId
          ? t('successAttached')
          : t('success'),
      );
      setFileName(null);
      formRef.current?.reset();
      router.refresh();
    });
  }

  const sectionClass =
    variant === 'page'
      ? 'rounded-md border border-border bg-card p-5 md:p-6'
      : 'rounded-md border border-dashed border-border bg-prodet-wash/60 p-4';

  return (
    <section aria-labelledby="upload-document-title" className={sectionClass}>
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="upload-document-title" className="text-[15px] font-semibold text-prodet-text">
          {t('title')}
        </h2>
        <p className="text-[12px] text-muted-foreground">
          Max {formatBytes(MAX_DOCUMENT_BYTES)} · PDF, Excel, Word, CSV, images
        </p>
      </header>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="mt-4 space-y-3"
        encType="multipart/form-data"
      >
        <input type="hidden" name="locale" value={locale} />
        {attachToOrderDraftId ? (
          <input type="hidden" name="attachToOrderDraftId" value={attachToOrderDraftId} />
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="block text-[12px] font-medium text-prodet-text">
              {t('type')}
            </span>
            <select
              name="kind"
              defaultValue={attachToOrderDraftId ? 'purchase_order' : 'other'}
              required
              className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-[13px] text-prodet-text focus:border-prodet-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {DOCUMENT_KIND_ORDER.map((kind) => (
                <option key={kind} value={kind}>
                  {DOCUMENT_KIND_LABELS[kind as DocumentKind]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-[12px] font-medium text-prodet-text">
              {t('label')}
            </span>
            <Input
              type="text"
              name="label"
              maxLength={120}
              placeholder="Ex. BC Mars 2026"
              className="mt-1.5"
            />
          </label>
        </div>

        <label className="block">
          <span className="block text-[12px] font-medium text-prodet-text">Fichier</span>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-4 w-4" aria-hidden />
              {t('chooseFile')}
            </Button>
            <span className="text-[12px] text-muted-foreground">
              {fileName ? fileName : t('noFile')}
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            name="file"
            accept={accept}
            required
            className="sr-only"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0] ?? null;
              setFileName(file ? file.name : null);
            }}
          />
        </label>

        <label className="block">
          <span className="block text-[12px] font-medium text-prodet-text">
            {t('note')}
          </span>
          <textarea
            name="notes"
            maxLength={800}
            rows={2}
            className="mt-1.5 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-[13px] text-prodet-text focus:border-prodet-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder={t('notePlaceholder')}
          />
        </label>

        <div className="flex flex-wrap items-center justify-end gap-3">
          {error ? (
            <p
              role="alert"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-destructive"
            >
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
              {error}
            </p>
          ) : null}
          {success ? (
            <p role="status" className="text-[12px] font-medium text-prodet-green">
              {success}
            </p>
          ) : null}
          <Button type="submit" disabled={isPending} size="default">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <FileUp className="h-4 w-4" aria-hidden />
            )}
            {isPending ? t('sending') : t('submit')}
          </Button>
        </div>
      </form>
    </section>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
