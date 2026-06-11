'use client';

import Image from 'next/image';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  Minus,
  PackageSearch,
  Phone,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from 'react';
import { Link, type Locale } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionHeader } from '@/components/ui/section-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { companyInfo } from '@/data/company';
import { products } from '@/data/products';
import { sectors } from '@/data/sectors';
import { submitPublicDevisRequest } from '@/features/quote/actions';
import {
  toQuoteSelectionProduct,
  useQuoteSelection,
  type QuoteSelectionItem,
} from '@/lib/quote-cart-context';
import { cn } from '@/lib/utils';
import type { Product, ProductCategory } from '@/types/product';

type DevisFormState = {
  fullName: string;
  company: string;
  sectorId: string;
  phone: string;
  email: string;
  city: string;
  message: string;
};

type HydratedSelectionItem = QuoteSelectionItem & {
  href?: string;
};

type SubmissionState =
  | { status: 'idle' }
  | { status: 'success'; referenceCode?: string }
  | { status: 'error'; message: string };

const INITIAL_FORM_STATE: DevisFormState = {
  fullName: '',
  company: '',
  sectorId: '',
  phone: '',
  email: '',
  city: '',
  message: '',
};

const fallbackEmail = 'prodet.tunisie@gmail.com';
const quoteSearchProducts = products.filter((product) => product.category === 'manufactured');

export function DevisPageClient({ locale }: { locale: Locale }) {
  const {
    items,
    addProduct,
    setProductQuantity,
    removeProduct,
  } = useQuoteSelection();
  const [formState, setFormState] = useState<DevisFormState>(INITIAL_FORM_STATE);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({ status: 'idle' });
  const [isPending, startTransition] = useTransition();

  const selectedItems = useMemo(() => hydrateSelectionItems([...items.values()]), [items]);
  const isEmpty = selectedItems.length === 0;
  const isEnglish = locale === 'en';

  function updateField(field: keyof DevisFormState, value: string) {
    setFormState((current) => ({ ...current, [field]: value }));
    setSubmissionState({ status: 'idle' });
  }

  function submitDevis() {
    if (selectedItems.length === 0 || isPending) return;

    setSubmissionState({ status: 'idle' });
    startTransition(async () => {
      try {
        const result = await submitPublicDevisRequest({
          ...formState,
          lines: selectedItems.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            slug: item.slug,
            format: item.format,
            category: item.category ? formatCategory(item.category) : undefined,
            quantity: item.quantity,
          })),
        });

        if (result.ok) {
          setSubmissionState({ status: 'success', referenceCode: result.referenceCode });
          return;
        }

        setSubmissionState({
          status: 'error',
          message: result.formError ?? 'Impossible d’envoyer la demande maintenant.',
        });
      } catch {
        setSubmissionState({
          status: 'error',
          message: 'Impossible d’envoyer la demande maintenant.',
        });
      }
    });
  }

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-prodet-ink text-white">
        <div className="section-shell py-10 lg:py-12">
          <nav aria-label={isEnglish ? 'Breadcrumb' : 'Fil d’Ariane'} className="text-xs text-white/64">
            <Link href="/" className="font-semibold text-prodet-sky hover:text-white">
              Accueil
            </Link>
            <span className="mx-2">/</span>
            <span>Demande de devis</span>
          </nav>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
            <SectionHeader
              eyebrow="Demande de devis"
              title="Sélectionnez vos produits, envoyez votre demande."
              description="Ajoutez les quantités et vos coordonnées. Prodet vous répond directement."
              tone="inverse"
              spacing="none"
              level={1}
              titleClassName="text-[2.35rem] sm:text-[3.3rem]"
            />

            <div className="rounded-lg border border-white/14 bg-white/8 p-4">
              <p className="text-xs font-semibold uppercase text-prodet-sky">Contact Prodet</p>
              <a
                href={companyInfo.phoneHref}
                className="mt-2 flex items-center gap-2 text-2xl font-bold text-white hover:text-prodet-sky"
              >
                <Phone className="h-5 w-5" aria-hidden />
                {companyInfo.phoneDisplay}
              </a>
              <a
                href={`mailto:${companyInfo.email || fallbackEmail}`}
                className="mt-2 block text-sm text-white/72 hover:text-white"
              >
                {companyInfo.email || fallbackEmail}
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="section-shell py-6 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.82fr)]">
          <section className="rounded-lg border border-border bg-white p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-xs font-semibold uppercase text-primary">Produits</p>
                <h2 className="mt-1 text-xl font-semibold text-prodet-text">
                  Sélection
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ajoutez depuis la recherche ou le catalogue.
                </p>
              </div>
              <Button asChild variant="neutral" size="sm">
                <Link href="/catalogue">Retour catalogue</Link>
              </Button>
            </div>

            <FastProductAdd
              onAdd={(product, quantity) => addProduct(toQuoteSelectionProduct(product), quantity)}
            />

            {isEmpty ? (
              <div className="mt-4 flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-white px-6 py-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-sm border border-[#DDE7EF] bg-white text-primary">
                  <PackageSearch className="h-7 w-7" aria-hidden />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-prodet-text">
                  Aucun produit sélectionné.
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  Recherchez un produit ci-dessus.
                </p>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {selectedItems.map((item) => (
                  <li key={item.productId}>
                    <SelectionRow
                      item={item}
                      onIncrement={() => setProductQuantity(item, item.quantity + 1)}
                      onDecrement={() => setProductQuantity(item, Math.max(1, item.quantity - 1))}
                      onRemove={() => removeProduct(item.productId)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className="space-y-5 lg:sticky lg:top-[118px] lg:self-start">
            <section className="rounded-lg border border-border bg-white p-5 md:p-6">
              <div>
                <p className="text-xs font-semibold uppercase text-primary">Coordonnées</p>
                <h2 className="mt-2 text-2xl font-semibold text-prodet-text">Contact</h2>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <FormField label="Nom / Prénom">
                  <Input
                    value={formState.fullName}
                    onChange={(event) => updateField('fullName', event.target.value)}
                  />
                </FormField>
                <FormField label="Société / Établissement">
                  <Input
                    value={formState.company}
                    onChange={(event) => updateField('company', event.target.value)}
                  />
                </FormField>
                <FormField label="Secteur d’activité">
                  <Select
                    value={formState.sectorId}
                    onValueChange={(value) => updateField('sectorId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un secteur" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((sector) => (
                        <SelectItem key={sector.id} value={sector.id}>
                          {sector.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Téléphone">
                  <Input
                    type="tel"
                    value={formState.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                  />
                </FormField>
                <FormField label="Email">
                  <Input
                    type="email"
                    value={formState.email}
                    onChange={(event) => updateField('email', event.target.value)}
                  />
                </FormField>
                <FormField label="Ville / zone de livraison">
                  <Input
                    value={formState.city}
                    onChange={(event) => updateField('city', event.target.value)}
                  />
                </FormField>
                <FormField label="Message complémentaire" className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
                  <Textarea
                    rows={5}
                    value={formState.message}
                    onChange={(event) => updateField('message', event.target.value)}
                    placeholder="Précisez les usages, les formats ou les volumes si nécessaire."
                  />
                </FormField>
              </div>

              <div className="mt-5">
                <Button
                  type="button"
                  disabled={isEmpty || isPending}
                  onClick={submitDevis}
                  variant="quote"
                  size="xl"
                  className="w-full"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Mail className="h-4 w-4" aria-hidden />
                  )}
                  {isPending ? 'Envoi...' : 'Envoyer'}
                </Button>
                {submissionState.status === 'success' ? (
                  <p className="mt-3 flex items-start gap-2 rounded-sm bg-support/10 px-3 py-2 text-xs font-medium leading-5 text-support">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    Demande envoyée à Prodet
                    {submissionState.referenceCode ? ` · ${submissionState.referenceCode}` : null}
                  </p>
                ) : null}
                {submissionState.status === 'error' ? (
                  <p className="mt-3 flex items-start gap-2 rounded-sm bg-red-50 px-3 py-2 text-xs font-medium leading-5 text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    {submissionState.message}
                  </p>
                ) : null}
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Téléphone ou email requis. Prix confirmés directement par Prodet.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function FastProductAdd({
  onAdd,
}: {
  onAdd: (product: Product, quantity: number) => void;
}) {
  const [query, setQuery] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const normalizedQuery = normalizeSearchText(query);

  const matchingProducts = useMemo(() => {
    if (!normalizedQuery) return [];

    return quoteSearchProducts
      .filter((product) => productMatchesQuickSearch(product, normalizedQuery))
      .slice(0, 6);
  }, [normalizedQuery]);

  function getQuantity(productId: string): number {
    return quantities[productId] ?? 1;
  }

  function setQuickQuantity(productId: string, quantity: number) {
    setQuantities((current) => ({
      ...current,
      [productId]: Math.max(1, Math.min(9999, Math.trunc(quantity))),
    }));
  }

  useEffect(() => {
    if (!suggestionsOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setSuggestionsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [suggestionsOpen]);

  return (
    <div ref={containerRef} className="mt-4">
      <label htmlFor="devis-product-search" className="sr-only">
        Rechercher un produit à ajouter
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          id="devis-product-search"
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSuggestionsOpen(Boolean(event.target.value.trim()));
          }}
          onFocus={() => setSuggestionsOpen(Boolean(query.trim()))}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setSuggestionsOpen(false);
              event.currentTarget.blur();
            }
          }}
          placeholder="Rechercher un produit à ajouter…"
          className="h-11 w-full rounded-sm border border-border bg-white pl-9 pr-10 text-sm text-prodet-text outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestionsOpen(false);
            }}
            aria-label="Effacer la recherche"
            className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:bg-prodet-wash hover:text-primary"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>

      {normalizedQuery && suggestionsOpen ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-border bg-white">
          {matchingProducts.length > 0 ? (
            <ul className="divide-y divide-border">
              {matchingProducts.map((product) => {
                const quantity = getQuantity(product.id);

                return (
                  <li
                    key={product.id}
                    className="grid gap-3 p-3 sm:grid-cols-[52px_minmax(0,1fr)_auto] sm:items-center"
                  >
                    <PlainProductThumb
                      src={product.image}
                      alt={product.name}
                      name={product.name}
                      className="h-[52px] w-[52px]"
                      imageClassName="p-1.5"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-prodet-text">
                        {product.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {[product.formats[0]?.label, formatCategory(product.category)]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                      <div className="inline-flex h-8 overflow-hidden rounded-sm border border-border bg-white">
                        <button
                          type="button"
                          aria-label="Diminuer la quantité"
                          disabled={quantity <= 1}
                          onClick={() => setQuickQuantity(product.id, quantity - 1)}
                          className="inline-flex h-8 w-8 items-center justify-center text-primary transition-colors hover:bg-prodet-mist disabled:cursor-not-allowed disabled:text-border"
                        >
                          <Minus className="h-3 w-3" aria-hidden />
                        </button>
                        <span className="flex min-w-9 items-center justify-center border-x border-border px-2 text-xs font-semibold text-prodet-text">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Augmenter la quantité"
                          onClick={() => setQuickQuantity(product.id, quantity + 1)}
                          className="inline-flex h-8 w-8 items-center justify-center text-primary transition-colors hover:bg-prodet-mist"
                        >
                          <Plus className="h-3 w-3" aria-hidden />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onAdd(product, quantity);
                          setQuery('');
                          setSuggestionsOpen(false);
                        }}
                        className="inline-flex h-8 items-center justify-center rounded-sm bg-primary px-3 text-xs font-semibold text-white transition-colors hover:bg-primary-strong"
                      >
                        Ajouter
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-3 py-4 text-xs text-muted-foreground">
              Aucun produit correspondant.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function SelectionRow({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  item: HydratedSelectionItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}) {
  return (
    <article className="grid gap-3 rounded-lg border border-border bg-white p-3 sm:grid-cols-[84px_minmax(0,1fr)_auto] sm:items-center">
      <Link
        href={item.href ?? '/catalogue'}
        className="block"
        aria-label={`Voir ${item.productName}`}
      >
        <PlainProductThumb
          src={item.imageUrl}
          alt={item.productName}
          name={item.productName}
          className="h-[84px] w-[84px]"
          imageClassName="p-2"
        />
      </Link>

      <div className="min-w-0">
        <Link
          href={item.href ?? '/catalogue'}
          className="line-clamp-2 text-sm font-semibold leading-5 text-prodet-text hover:text-primary"
        >
          {item.productName}
        </Link>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {item.format ? (
            <span className="rounded-sm bg-prodet-wash px-2.5 py-1 text-[10px] font-semibold text-prodet-text">
              {item.format}
            </span>
          ) : null}
          {item.category ? (
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px] font-semibold',
                item.category === 'manufactured'
                  ? 'bg-primary/8 text-primary'
                  : 'bg-support/8 text-support',
              )}
            >
              {formatCategory(item.category)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="inline-flex h-9 overflow-hidden rounded-sm border border-border bg-white">
          <button
            type="button"
            aria-label="Diminuer la quantité"
            disabled={item.quantity <= 1}
            onClick={onDecrement}
            className="inline-flex h-9 w-9 items-center justify-center text-primary transition-colors hover:bg-prodet-mist disabled:cursor-not-allowed disabled:text-border"
          >
            <Minus className="h-3.5 w-3.5" aria-hidden />
          </button>
          <span className="flex min-w-10 items-center justify-center border-x border-border px-3 text-sm font-semibold text-prodet-text">
            {item.quantity}
          </span>
          <button
            type="button"
            aria-label="Augmenter la quantité"
            onClick={onIncrement}
            className="inline-flex h-9 w-9 items-center justify-center text-primary transition-colors hover:bg-prodet-mist"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>

        <button
          type="button"
          aria-label={`Retirer ${item.productName}`}
          onClick={onRemove}
          className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </article>
  );
}

function PlainProductThumb({
  src,
  alt,
  name,
  className,
  imageClassName,
}: {
  src?: string;
  alt: string;
  name: string;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#E3E7EC] bg-white',
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="96px"
          className={cn('object-contain', imageClassName)}
        />
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary text-xs font-semibold text-white">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}

function FormField({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-xs font-semibold text-prodet-text">{label}</Label>
      {children}
    </div>
  );
}

function hydrateSelectionItems(items: QuoteSelectionItem[]): HydratedSelectionItem[] {
  const productsById = new Map(products.map((product) => [product.id, product]));

  return items.map((item) => {
    const product = productsById.get(item.productId);

    return {
      ...item,
      slug: item.slug ?? product?.slug,
      productName: item.productName || product?.name || item.productId,
      imageUrl: item.imageUrl ?? product?.image,
      category: item.category ?? product?.category,
      format: item.format ?? product?.formats[0]?.label,
      href: item.slug || product?.slug ? `/catalogue/${item.slug ?? product?.slug}` : undefined,
    };
  });
}

function productMatchesQuickSearch(product: Product, normalizedQuery: string): boolean {
  const searchableValue = [
    product.id,
    product.slug,
    product.name,
    product.tagline,
    formatCategory(product.category),
    ...product.formats.map((format) => format.label),
  ].join(' ');

  return normalizeSearchText(searchableValue).includes(normalizedQuery);
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLowerCase()
    .trim();
}

function formatCategory(category: ProductCategory): string {
  return category === 'manufactured' ? 'Fabriqué Prodet' : 'Commercialisé';
}

function getInitials(value: string): string {
  return value
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
