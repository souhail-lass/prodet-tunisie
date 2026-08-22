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
import { useLocale } from 'next-intl';
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
        setFormError(result.formError ?? 'Vérifiez les informations du devis.');
      }
    });
  }

  return (
    <div className="qm" onClick={onClose}>
      <div className="qm__panel" onClick={(event) => event.stopPropagation()}>
        <header className="qm__head">
          <div>
            <span className="eyebrow">Demande de devis</span>
            <h2 className="qm__title">
              {reference ? 'Demande envoyée' : step === 'list' ? 'Votre sélection' : 'Vos coordonnées'}
            </h2>
          </div>
          <button className="qm__close" onClick={onClose} aria-label="Fermer">
            <X size={20} />
          </button>
        </header>

        {reference ? (
          <div className="qm__body">
            <div className="qm__empty">
              <span className="qm__empty-icon" style={{ background: 'var(--prodet-green-tint)', color: 'var(--prodet-green)' }}>
                <Check size={26} />
              </span>
              <p>
                Merci. Votre demande <strong>{reference}</strong> a bien été transmise. Notre équipe revient
                vers vous sous 24&nbsp;heures ouvrées avec prix, dosage et conditions de livraison.
              </p>
              <Button variant="outline" onClick={onClose}>
                Fermer
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
                <p>Votre liste de devis est vide.</p>
                <Button variant="outline" onClick={onClose}>
                  <Link href="/produits/produits-nettoyage">Parcourir le catalogue</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="qm__actions-top">
                  <button type="button" className="qm__clear" onClick={clearSelection}>
                    <Trash2 size={14} /> Vider la liste
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
                        {line.category === 'manufactured' ? ' · Fabriqué par Prodet' : ''}
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
                label="Nom de l'établissement"
                placeholder="Hôtel Carthage"
                required
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              />
              <Input
                label="Email"
                type="email"
                placeholder="vous@etablissement.tn"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
              <Input
                label="Téléphone"
                placeholder="71 000 000"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
              <Select
                label="Secteur"
                placeholder="Choisir votre secteur"
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
                <Shield size={15} /> Réponse sous 24h avec prix, dosage et conditions de livraison.
              </p>
            )}
          </div>
        )}

        {!reference ? (
          <footer className="qm__foot">
            <span className="qm__total">
              {total > 0
                ? `${lines.length} référence${lines.length > 1 ? 's' : ''} · ${total} unité${total > 1 ? 's' : ''}`
                : 'Aucun produit'}
            </span>
            {step === 'list' ? (
              <Button
                variant="primary"
                size="lg"
                disabled={lines.length === 0}
                onClick={() => setStep('form')}
                iconRight={<ArrowRight size={18} />}
              >
                Continuer
              </Button>
            ) : (
              <div className="qm__foot-actions">
                <Button variant="ghost" onClick={() => setStep('list')} iconLeft={<ChevronLeft size={16} />}>
                  Retour
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  disabled={isPending}
                  onClick={submit}
                  iconRight={<Check size={18} />}
                >
                  {isPending ? 'Envoi…' : 'Envoyer la demande'}
                </Button>
              </div>
            )}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
