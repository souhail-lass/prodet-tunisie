'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Copy, Mail, X } from 'lucide-react';
import { companyInfo } from '@/data/company';
import { siteContent } from '@/data/site-content';
import { sectors } from '@/data/sectors';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useQuoteSelection } from '@/lib/quote-cart-context';
import { cn } from '@/lib/utils';
import type { SectorId } from '@/types/sector';

type QuoteModalDefaults = {
  productName?: string;
  products?: string;
  message?: string;
  sectorId?: SectorId;
};

type QuoteFormState = {
  fullName: string;
  company: string;
  sectorId: string;
  phone: string;
  email: string;
  products: string;
  volume: string;
  message: string;
};

type QuoteModalContextValue = {
  openQuoteModal: (defaults?: QuoteModalDefaults) => void;
  closeQuoteModal: () => void;
};

const INITIAL_STATE: QuoteFormState = {
  fullName: '',
  company: '',
  sectorId: '',
  phone: '',
  email: '',
  products: '',
  volume: '',
  message: '',
};

const QuoteModalContext = createContext<QuoteModalContextValue | null>(null);

export function QuoteModalProvider({ children }: { children: ReactNode }) {
  const { clearSelection, totalItems } = useQuoteSelection();
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formState, setFormState] = useState<QuoteFormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof QuoteFormState, string>>>({});

  function openQuoteModal(defaults?: QuoteModalDefaults) {
    setSubmitted(false);
    setErrors({});
    setFormState({
      ...INITIAL_STATE,
      sectorId: defaults?.sectorId ?? '',
      products: defaults?.products ?? defaults?.productName ?? '',
      message: defaults?.message ?? '',
    });
    setIsOpen(true);
  }

  function closeQuoteModal() {
    setIsOpen(false);
    setSubmitted(false);
    setErrors({});
  }

  useEffect(() => {
    if (!isOpen) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeQuoteModal();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const value = useMemo(
    () => ({
      openQuoteModal,
      closeQuoteModal,
    }),
    [],
  );

  return (
    <QuoteModalContext.Provider value={value}>
      {children}
      <QuoteModal
        isOpen={isOpen}
        submitted={submitted}
        formState={formState}
        errors={errors}
        selectedItemsCount={totalItems}
        onClose={closeQuoteModal}
        onClearSelection={() => {
          clearSelection();
          setFormState((current) => ({ ...current, products: '' }));
        }}
        onChange={setFormState}
        onSubmit={async () => {
          const nextErrors = validateForm(formState);
          setErrors(nextErrors);
          if (Object.keys(nextErrors).length > 0) return;

          const mailPayload = buildMailPayload(formState);
          try {
            await navigator.clipboard.writeText(mailPayload.body);
          } catch {
            // Ignore clipboard failures; mailto is still the primary path.
          }
          window.location.href = `mailto:${companyInfo.email}?subject=${encodeURIComponent(mailPayload.subject)}&body=${encodeURIComponent(mailPayload.body)}`;
          setSubmitted(true);
        }}
      />
    </QuoteModalContext.Provider>
  );
}

export function QuoteButton({
  children,
  className,
  variant = 'default',
  size = 'default',
}: {
  children?: ReactNode;
  productName?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}) {
  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={className}
    >
      <Link href="/devis">{children ?? 'Demander un devis'}</Link>
    </Button>
  );
}

export function useQuoteModal() {
  const value = useContext(QuoteModalContext);
  if (!value) {
    throw new Error('useQuoteModal must be used inside QuoteModalProvider.');
  }
  return value;
}

function QuoteModal({
  isOpen,
  submitted,
  formState,
  errors,
  selectedItemsCount,
  onClose,
  onClearSelection,
  onChange,
  onSubmit,
}: {
  isOpen: boolean;
  submitted: boolean;
  formState: QuoteFormState;
  errors: Partial<Record<keyof QuoteFormState, string>>;
  selectedItemsCount: number;
  onClose: () => void;
  onClearSelection: () => void;
  onChange: (next: QuoteFormState) => void;
  onSubmit: () => void;
}) {
  if (!isOpen) return null;

  const copy = siteContent.quoteModal;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/58 px-4 py-6 sm:items-center">
      <div
        className="absolute inset-0"
        aria-hidden
        onClick={onClose}
      />
      <div className="surface-panel relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 sm:p-8">
        <button
          type="button"
          className="absolute end-4 top-4 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          onClick={onClose}
          aria-label={copy.close}
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

        {submitted ? (
          <div className="space-y-5 pe-10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-prodet-blue/10 text-primary">
              <Mail className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-prodet-text">{copy.successTitle}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                {copy.successBody}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={onClose} className="rounded-full px-6">
                {copy.close}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full px-6"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(buildMailPayload(formState).body);
                  } catch {
                    return;
                  }
                }}
              >
                <Copy className="h-4 w-4" aria-hidden />
                {copy.copyCta}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pe-10">
            <div>
              <p className="eyebrow-label">Devis</p>
              <h2 className="mt-3 text-3xl font-bold text-prodet-text">{copy.title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                {copy.subtitle}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label={copy.fields.fullName}
                error={errors.fullName}
                input={
                  <Input
                    value={formState.fullName}
                    onChange={(event) =>
                      onChange({ ...formState, fullName: event.target.value })
                    }
                  />
                }
              />
              <Field
                label={copy.fields.company}
                error={errors.company}
                input={
                  <Input
                    value={formState.company}
                    onChange={(event) => onChange({ ...formState, company: event.target.value })}
                  />
                }
              />
              <Field
                label={copy.fields.sector}
                error={errors.sectorId}
                input={
                  <Select
                    value={formState.sectorId}
                    onValueChange={(value) => onChange({ ...formState, sectorId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={copy.placeholders.sector} />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((sector) => (
                        <SelectItem key={sector.id} value={sector.id}>
                          {sector.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                }
              />
              <Field
                label={copy.fields.volume}
                error={errors.volume}
                input={
                  <Select
                    value={formState.volume}
                    onValueChange={(value) => onChange({ ...formState, volume: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={copy.fields.volume} />
                    </SelectTrigger>
                    <SelectContent>
                      {copy.volumeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                }
              />
              <Field
                label={copy.fields.phone}
                error={errors.phone}
                input={
                  <Input
                    type="tel"
                    value={formState.phone}
                    onChange={(event) => onChange({ ...formState, phone: event.target.value })}
                  />
                }
              />
              <Field
                label={copy.fields.email}
                error={errors.email}
                input={
                  <Input
                    type="email"
                    value={formState.email}
                    onChange={(event) => onChange({ ...formState, email: event.target.value })}
                  />
                }
              />
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <Label>{copy.fields.products}</Label>
                  {selectedItemsCount > 0 ? (
                    <button
                      type="button"
                      onClick={onClearSelection}
                      className="text-[12px] font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Vider le devis
                    </button>
                  ) : null}
                </div>
                <Textarea
                  rows={4}
                  placeholder={copy.placeholders.products}
                  value={formState.products}
                  onChange={(event) => onChange({ ...formState, products: event.target.value })}
                />
                {errors.products ? <p className="text-sm text-destructive">{errors.products}</p> : null}
              </div>
              <Field
                className="sm:col-span-2"
                label={copy.fields.message}
                error={errors.message}
                input={
                  <Textarea
                    rows={4}
                    placeholder={copy.placeholders.message}
                    value={formState.message}
                    onChange={(event) => onChange({ ...formState, message: event.target.value })}
                  />
                }
              />
            </div>

            <p className="text-center text-[12px] text-[#9CA3AF]">{copy.reassurance}</p>

            <div className="flex flex-wrap gap-3">
              <Button type="button" className="rounded-full px-6" onClick={onSubmit}>
                <Mail className="h-4 w-4" aria-hidden />
                {copy.submit}
              </Button>
              <Button type="button" variant="outline" className="rounded-full px-6" onClick={onClose}>
                {copy.close}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  input,
  className,
}: {
  label: string;
  error?: string;
  input: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label>{label}</Label>
      {input}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function validateForm(formState: QuoteFormState) {
  const validation = siteContent.quoteModal.validation;
  const nextErrors: Partial<Record<keyof QuoteFormState, string>> = {};

  if (!formState.fullName.trim()) nextErrors.fullName = validation.required;
  if (!formState.company.trim()) nextErrors.company = validation.required;
  if (!formState.sectorId.trim()) nextErrors.sectorId = validation.required;
  if (!formState.phone.trim()) nextErrors.phone = validation.required;
  if (!formState.email.trim()) {
    nextErrors.email = validation.required;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(formState.email)) {
    nextErrors.email = validation.email;
  }
  if (!formState.products.trim()) nextErrors.products = validation.required;
  if (!formState.volume.trim()) nextErrors.volume = validation.required;

  return nextErrors;
}

function buildMailPayload(formState: QuoteFormState) {
  const sectorLabel = sectors.find((sector) => sector.id === formState.sectorId)?.label ?? formState.sectorId;
  const subject = `Demande de devis - ${formState.company || companyInfo.name}`;
  const body = [
    'Bonjour Prodet Tunisie,',
    '',
    'Je souhaite recevoir un devis.',
    '',
    `Nom / Prenom: ${formState.fullName}`,
    `Societe / Etablissement: ${formState.company}`,
    `Secteur d'activite: ${sectorLabel}`,
    `Telephone: ${formState.phone}`,
    `Email: ${formState.email}`,
    `Produits souhaites: ${formState.products}`,
    `Volume estime: ${formState.volume}`,
    `Message complementaire: ${formState.message || 'Aucun message complementaire.'}`,
  ].join('\n');

  return { subject, body };
}
