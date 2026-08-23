'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Check, ChevronLeft, FileText, Shield, Trash2, X } from 'lucide-react';
import { Button, Input, QuantityControl, Select } from '@/components/ds';
import { listSectors } from '@/data/queries';
import { localizeSectors } from '@/data/i18n/content';
import { submitPublicDevisRequest } from '@/features/quote/actions';
import { useQuoteSelection } from '@/lib/quote-cart-context';
import { Link, type Locale } from '@/i18n/routing';

type QuoteDrawerContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const QuoteDrawerContext = createContext<QuoteDrawerContextValue | null>(null);

type FormState = {
  company: string;
  email: string;
  phone: string;
  sectorId: string;
};

const INITIAL_FORM: FormState = { company: '', email: '', phone: '', sectorId: '' };

export function QuoteDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo<QuoteDrawerContextValue>(
    () => ({ open: () => setIsOpen(true), close: () => setIsOpen(false), isOpen }),
    [isOpen],
  );

  return (
    <QuoteDrawerContext.Provider value={value}>
      {children}
      <QuoteDrawer open={isOpen} onClose={() => setIsOpen(false)} />
    </QuoteDrawerContext.Provider>
  );
}

export function useQuoteDrawer() {
  const value = useContext(QuoteDrawerContext);
  if (!value) throw new Error('useQuoteDrawer must be used inside QuoteDrawerProvider.');
  return value;
}

function QuoteDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, setProductQuantity, clearSelection } = useQuoteSelection();
  const t = useTranslations('devis.drawer');
  const locale = useLocale() as Locale;
  const [step, setStep] = useState<'list' | 'form'>('list');
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [reference, setReference] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sectorOptions = useMemo(
    () => localizeSectors(listSectors(), locale).map((sector) => ({ value: sector.id, label: sector.label })),
    [locale],
  );

  const lines = useMemo(
    () => [...items.values()].filter((item) => item.quantity > 0),
    [items],
  );
  const total = lines.reduce((sum, line) => sum + line.quantity, 0);

  // Reset to the list step + clear any prior result each time the drawer opens.
  useEffect(() => {
    if (open) {
      setStep('list');
      setReference(null);
      setFormError(null);
    }
  }, [open]);

  // Lock body scroll + close on Escape while the drawer is open.
  useEffect(() => {
    if (!open) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  function submit() {
    setFormError(null);
    startTransition(async () => {
      const result = await submitPublicDevisRequest({
        company: form.company,
        email: form.email,
        phone: form.phone,
        sectorId: form.sectorId,
        lines: lines.map((line) => ({
          productId: line.productId,
          productName: line.productName,
          slug: line.slug,
          format: line.format,
          category: line.category,
          quantity: line.quantity,
        })),
      });

      if (result.ok) {
        setReference(result.referenceCode ?? null);
      } else {
        setFormError(result.formError ?? t('formError'));
      }
    });
  }

  return (
    <div className="qm" onClick={onClose}>
      <div className="qm__panel" onClick={(event) => event.stopPropagation()}>
        <header className="qm__head">
          <div>
            <span className="eyebrow">{t('eyebrow')}</span>
            <h2 className="qm__title">
              {reference ? t('sentTitle') : step === 'list' ? t('selectionTitle') : t('contactTitle')}
            </h2>
          </div>
          <button className="qm__close" onClick={onClose} aria-label={t('close')}>
            <X size={20} />
          </button>
        </header>

        {reference ? (
          <div className="qm__body">
            <div className="qm__empty">
              <span className="qm__empty-icon" style={{ background: 'var(--prodet-green-tint)', color: 'var(--prodet-green)' }}>
                <Check size={26} />
              </span>
              <p>{t('successBody', { ref: reference ?? '' })}</p>
              <Button variant="outline" onClick={onClose}>
                {t('close')}
              </Button>
            </div>
          </div>
        ) : step === 'list' ? (
          <div className="qm__body">
            {lines.length === 0 ? (
              <div className="qm__empty">
                <span className="qm__empty-icon">
                  <FileText size={26} />
                </span>
                <p>{t('empty')}</p>
                <Button variant="outline" onClick={onClose}>
                  <Link href="/produits/produits-nettoyage">{t('browseCatalogue')}</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="qm__actions-top">
                  <button type="button" className="qm__clear" onClick={clearSelection}>
                    <Trash2 size={14} /> {t('clearList')}
                  </button>
                </div>
                <div className="qm__lines">
                  {lines.map((line) => (
                  <div className="qm__line" key={line.productId}>
                    <div className="qm__line-thumb">
                      {line.imageUrl ? (
                        /\.(png|jpe?g|webp|avif)$/i.test(line.imageUrl) ? (
                          <Image
                            src={line.imageUrl}
                            alt=""
                            width={48}
                            height={48}
                            sizes="48px"
                            style={{ width: 'auto', height: 'auto', maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }}
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={line.imageUrl} alt="" />
                        )
                      ) : (
                        <span>{line.productName.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="qm__line-info">
                      <strong>{line.productName}</strong>
                      <span>
                        {line.format ?? '—'}
                        {line.category === 'manufactured' ? ` · ${t('manufactured')}` : ''}
                      </span>
                    </div>
                    <div className="qm__line-qty">
                      <QuantityControl
                        className="pds-qty--compact"
                        value={line.quantity}
                        onChange={(n) =>
                          setProductQuantity({ productId: line.productId, productName: line.productName }, n)
                        }
                      />
                    </div>
                  </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="qm__body">
            <div className="qm__form">
              <Input
                label={t('fields.company')}
                placeholder={t('placeholders.company')}
                required
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              />
              <Input
                label={t('fields.email')}
                type="email"
                placeholder={t('placeholders.email')}
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
              <Input
                label={t('fields.phone')}
                placeholder="71 000 000"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
              <Select
                label={t('fields.sector')}
                placeholder={t('placeholders.sector')}
                options={sectorOptions}
                value={form.sectorId}
                onChange={(e) => setForm((f) => ({ ...f, sectorId: e.target.value }))}
              />
            </div>
            {formError ? (
              <p className="qm__reassure" style={{ color: 'var(--color-danger)' }}>
                {formError}
              </p>
            ) : (
              <p className="qm__reassure">
                <Shield size={15} /> {t('reassure')}
              </p>
            )}
          </div>
        )}

        {!reference ? (
          <footer className="qm__foot">
            <span className="qm__total">
              {total > 0 ? t('summary', { refs: lines.length, units: total }) : t('noProducts')}
            </span>
            {step === 'list' ? (
              <Button
                variant="primary"
                size="lg"
                disabled={lines.length === 0}
                onClick={() => setStep('form')}
                iconRight={<ArrowRight size={18} />}
              >
                {t('continue')}
              </Button>
            ) : (
              <div className="qm__foot-actions">
                <Button variant="ghost" onClick={() => setStep('list')} iconLeft={<ChevronLeft size={16} />}>
                  {t('back')}
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  disabled={isPending}
                  onClick={submit}
                  iconRight={<Check size={18} />}
                >
                  {isPending ? t('submitting') : t('submit')}
                </Button>
              </div>
            )}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
