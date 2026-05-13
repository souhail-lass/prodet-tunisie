'use client';

import Image from 'next/image';
import { Mail, Minus, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { Link, type Locale } from '@/i18n/routing';
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
import { companyInfo } from '@/data/company';
import { products } from '@/data/products';
import { sectors } from '@/data/sectors';
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

// Public visitors stay on mailto. TODO(portal/Swiver): authenticated client requests
// can later use a separate reviewed API bridge to Swiver.
export function DevisPageClient({ locale }: { locale: Locale }) {
  const {
    items,
    addProduct,
    setProductQuantity,
    removeProduct,
    totalItems,
    totalProducts,
  } = useQuoteSelection();
  const [formState, setFormState] = useState<DevisFormState>(INITIAL_FORM_STATE);

  const selectedItems = useMemo(() => hydrateSelectionItems([...items.values()]), [items]);
  const isEmpty = selectedItems.length === 0;
  const isEnglish = locale === 'en';

  function updateField(field: keyof DevisFormState, value: string) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function prepareEmail() {
    if (selectedItems.length === 0) return;

    const mailPayload = buildMailPayload(formState, selectedItems);
    window.location.href = `mailto:${companyInfo.email || fallbackEmail}?subject=${encodeURIComponent(
      mailPayload.subject,
    )}&body=${encodeURIComponent(mailPayload.body)}`;
  }

  return (
    <div className="bg-[#F4F6F8] py-10 md:py-14">
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6">
        <nav aria-label={isEnglish ? 'Breadcrumb' : 'Fil d’Ariane'} className="text-[12px] text-[#6B7280]">
          <Link href="/" className="font-medium text-[#1B5FA7] hover:text-[#0D3B73]">
            Accueil
          </Link>
          <span className="mx-2 text-[#9CA3AF]">/</span>
          <span className="font-medium text-[#1C2B3A]">Demande de devis</span>
        </nav>

        <header className="mt-5 overflow-hidden rounded-[28px] border border-[#E5E7EB] bg-white p-6 shadow-[0_22px_70px_-56px_rgba(13,59,115,0.48)] md:p-8">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B5FA7]">
              Demande de devis
            </p>
            <h1 className="public-display-title-compact mt-3">
              Votre demande de devis
            </h1>
            <p className="mt-4 text-[14px] leading-7 text-[#6B7280]">
              Ajoutez les produits souhaités, ajustez les quantités, puis envoyez votre demande.
              L’équipe Prodet vous contactera avec une offre adaptée.
            </p>
          </div>
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
              <div>
                <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#1C2B3A]">
                  Votre sélection
                </h2>
                <p className="mt-1 text-[12px] text-[#6B7280]">
                  {totalProducts > 0
                    ? `${totalProducts} produit${totalProducts > 1 ? 's' : ''} sélectionné${totalProducts > 1 ? 's' : ''} · ${totalItems} unité${totalItems > 1 ? 's' : ''}`
                    : 'Aucun produit sélectionné pour le moment.'}
                </p>
              </div>
            </div>

            <FastProductAdd
              onAdd={(product, quantity) => addProduct(toQuoteSelectionProduct(product), quantity)}
            />

            {isEmpty ? (
              <div className="mt-4 flex min-h-[220px] flex-col items-center justify-center rounded-[18px] border border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-6 py-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF] text-[#1B5FA7]">
                  <Mail className="h-7 w-7" aria-hidden />
                </div>
                <h3 className="mt-5 text-[18px] font-semibold text-[#1C2B3A]">
                  Aucun produit sélectionné pour le moment.
                </h3>
                <p className="mt-2 max-w-sm text-[13px] leading-6 text-[#6B7280]">
                  Utilisez la recherche ci-dessus pour ajouter rapidement les produits à inclure
                  dans votre demande.
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

          <section className="rounded-[24px] border border-[#E5E7EB] bg-white p-5 md:p-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9CA3AF]">
                Coordonnées
              </p>
              <h2 className="mt-2 text-[21px] font-semibold tracking-[-0.03em] text-[#1C2B3A]">
                Informations de contact
              </h2>
              <p className="mt-2 text-[12px] leading-6 text-[#6B7280]">
                Ces informations servent uniquement à préparer votre demande de devis.
              </p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
              <FormField label="Message complémentaire" className="sm:col-span-2">
                <Textarea
                  rows={5}
                  value={formState.message}
                  onChange={(event) => updateField('message', event.target.value)}
                  placeholder="Précisez les usages, les formats ou les volumes si nécessaire."
                />
              </FormField>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                disabled={isEmpty}
                onClick={prepareEmail}
                className="h-11 flex-1 rounded-full bg-[#1B5FA7] text-[13px] font-semibold hover:bg-[#1650A0]"
              >
                <Mail className="h-4 w-4" aria-hidden />
                Préparer le mail
              </Button>
            </div>
          </section>
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
  const normalizedQuery = normalizeSearchText(query);

  const matchingProducts = useMemo(() => {
    if (!normalizedQuery) return [];

    return products
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

  return (
    <div className="mt-4 rounded-[18px] border border-[#E5E7EB] bg-[#F9FAFB] p-3">
      <label htmlFor="devis-product-search" className="sr-only">
        Rechercher un produit à ajouter
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]"
          aria-hidden
        />
        <input
          id="devis-product-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un produit à ajouter…"
          className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white pl-9 pr-3 text-[13px] text-[#1C2B3A] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#1B5FA7] focus:ring-2 focus:ring-[#1B5FA7]/10"
        />
      </div>

      {normalizedQuery ? (
        <div className="mt-3 overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white">
          {matchingProducts.length > 0 ? (
            <ul className="divide-y divide-[#E5E7EB]">
              {matchingProducts.map((product) => {
                const quantity = getQuantity(product.id);

                return (
                  <li
                    key={product.id}
                    className="grid gap-3 p-3 sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="relative h-11 w-11 overflow-hidden rounded-[10px] bg-[#F4F6F8]">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="44px"
                          className="object-contain p-1.5"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-[#1B5FA7]">
                          {getInitials(product.name)}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[#1C2B3A]">
                        {product.name}
                      </p>
                      <p className="mt-1 truncate text-[11px] text-[#6B7280]">
                        {[product.formats[0]?.label, formatCategory(product.category)]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                      <div className="inline-flex h-8 overflow-hidden rounded-full border border-[#D1D5DB] bg-white">
                        <button
                          type="button"
                          aria-label="Diminuer la quantité"
                          disabled={quantity <= 1}
                          onClick={() => setQuickQuantity(product.id, quantity - 1)}
                          className="inline-flex h-8 w-8 items-center justify-center text-[#1B5FA7] transition-colors hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:text-[#D1D5DB]"
                        >
                          <Minus className="h-3 w-3" aria-hidden />
                        </button>
                        <span className="flex min-w-9 items-center justify-center border-x border-[#E5E7EB] px-2 text-[12px] font-semibold text-[#1C2B3A]">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Augmenter la quantité"
                          onClick={() => setQuickQuantity(product.id, quantity + 1)}
                          className="inline-flex h-8 w-8 items-center justify-center text-[#1B5FA7] transition-colors hover:bg-[#EFF6FF]"
                        >
                          <Plus className="h-3 w-3" aria-hidden />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onAdd(product, quantity)}
                        className="inline-flex h-8 items-center justify-center rounded-full bg-[#1B5FA7] px-3 text-[11px] font-semibold text-white transition-colors hover:bg-[#1650A0]"
                      >
                        Ajouter
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-3 py-4 text-[12px] text-[#6B7280]">
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
    <article className="grid gap-3 rounded-[18px] border border-[#E5E7EB] bg-white p-3 sm:grid-cols-[76px_minmax(0,1fr)_auto] sm:items-center">
      <Link
        href={item.href ?? '/catalogue'}
        className="relative flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-[14px] bg-[#F4F6F8]"
        aria-label={`Voir ${item.productName}`}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            sizes="76px"
            className="object-contain p-2"
          />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B5FA7] text-[12px] font-semibold text-white">
            {getInitials(item.productName)}
          </span>
        )}
      </Link>

      <div className="min-w-0">
        <Link
          href={item.href ?? '/catalogue'}
          className="line-clamp-2 text-[14px] font-semibold leading-5 text-[#1C2B3A] hover:text-[#1B5FA7]"
        >
          {item.productName}
        </Link>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {item.format ? (
            <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[10px] font-semibold text-[#374151]">
              {item.format}
            </span>
          ) : null}
          {item.category ? (
            <span
              className={cn(
                'rounded-full px-2.5 py-1 text-[10px] font-semibold',
                item.category === 'manufactured'
                  ? 'bg-[#EFF6FF] text-[#1B5FA7]'
                  : 'bg-[#F0FDF4] text-[#1F9C49]',
              )}
            >
              {formatCategory(item.category)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="inline-flex h-9 overflow-hidden rounded-full border border-[#D1D5DB] bg-white">
          <button
            type="button"
            aria-label="Diminuer la quantité"
            disabled={item.quantity <= 1}
            onClick={onDecrement}
            className="inline-flex h-9 w-9 items-center justify-center text-[#1B5FA7] transition-colors hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:text-[#D1D5DB]"
          >
            <Minus className="h-3.5 w-3.5" aria-hidden />
          </button>
          <span className="flex min-w-10 items-center justify-center border-x border-[#E5E7EB] px-3 text-[13px] font-semibold text-[#1C2B3A]">
            {item.quantity}
          </span>
          <button
            type="button"
            aria-label="Augmenter la quantité"
            onClick={onIncrement}
            className="inline-flex h-9 w-9 items-center justify-center text-[#1B5FA7] transition-colors hover:bg-[#EFF6FF]"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>

        <button
          type="button"
          aria-label={`Retirer ${item.productName}`}
          onClick={onRemove}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </article>
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
      <Label className="text-[12px] font-semibold text-[#1C2B3A]">{label}</Label>
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

function buildMailPayload(formState: DevisFormState, selectedItems: HydratedSelectionItem[]) {
  const sectorLabel =
    sectors.find((sector) => sector.id === formState.sectorId)?.label || formState.sectorId || 'Non précisé';
  const requester = formState.company.trim() || formState.fullName.trim() || 'Site web';
  const selectedProducts = selectedItems
    .map((item) => {
      const details = [
        item.format ? `Format: ${item.format}` : null,
        item.category ? `Type: ${formatCategory(item.category)}` : null,
        `Quantité: ${item.quantity}`,
      ].filter(Boolean);

      return `- ${item.productName}${details.length > 0 ? ` — ${details.join(' — ')}` : ''}`;
    })
    .join('\n');

  const subject = `Demande de devis - ${requester}`;
  const body = [
    'Bonjour Prodet Tunisie,',
    '',
    'Je souhaite recevoir un devis pour les produits suivants:',
    selectedProducts,
    '',
    'Informations client:',
    `Nom / Prénom: ${formState.fullName || 'Non précisé'}`,
    `Société / Établissement: ${formState.company || 'Non précisé'}`,
    `Secteur d'activité: ${sectorLabel}`,
    `Téléphone: ${formState.phone || 'Non précisé'}`,
    `Email: ${formState.email || 'Non précisé'}`,
    `Ville / zone de livraison: ${formState.city || 'Non précisé'}`,
    `Message complémentaire: ${formState.message || 'Aucun message complémentaire.'}`,
  ].join('\n');

  return { subject, body };
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
