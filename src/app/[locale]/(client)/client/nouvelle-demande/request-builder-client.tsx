'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import type { ReactNode } from 'react';
import {
  AlertCircle,
  ArrowDown,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Layers3,
  MapPin,
  MessageSquare,
  Minus,
  PackageCheck,
  Plus,
  RotateCcw,
  Search,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { Panel } from '@/components/portal/panel';
import { StatusPill } from '@/components/portal/status-pill';
import { PortalRequestProductThumb } from '@/components/client-portal/portal-request-product-thumb';
import { Button } from '@/components/ui/button';
import { getProductBySlug } from '@/data/queries';
import {
  recurrenceSelectOptionsFr,
  type PortalRecurrenceMode,
} from '@/features/client-portal/portal-recurrence';
import { submitPortalRequest } from '@/features/client-portal/request-builder';
import type {
  PortalProductOption,
  PortalRequestPrefill,
  SubmitPortalRequestResult,
} from '@/features/client-portal/request-builder.types';
import type { CustomerUsualProductItem } from '@/features/client-portal/usual-products';
import type { Locale } from '@/i18n/routing';
import {
  portalProductMatchesQuery,
  portalProductSearchRank,
} from '@/lib/portal-product-search';
import { cn } from '@/lib/utils';

type BuilderProduct = {
  productId: string;
  slug: string;
  productName: string;
  categoryName: string | null;
  conditionnement: string | null;
  unitOfSale: string | null;
  defaultQuantity: number;
  note: string | null;
};

type BuilderLine = BuilderProduct & {
  quantity: number;
  lineNote: string;
};

type CatalogueGroup = { categoryLabel: string; products: PortalProductOption[] };

type PickerTab = 'usual' | 'all';

export function RequestBuilderClient({
  locale,
  usualProducts,
  productOptions,
  prefill,
}: {
  locale: Locale;
  usualProducts: CustomerUsualProductItem[];
  productOptions: PortalProductOption[];
  prefill: PortalRequestPrefill | null;
}) {
  // --- Business state. Logic identical to the previous implementation. ---
  const usualBuilderProducts = useMemo(
    () =>
      usualProducts.map((product) => ({
        productId: product.productId,
        slug: product.slug,
        productName: product.productName,
        categoryName: product.categoryName,
        conditionnement: product.conditionnement,
        unitOfSale: product.unitOfSale,
        defaultQuantity: product.defaultQuantity,
        note: product.note,
      })),
    [usualProducts],
  );

  const productById = useMemo(() => {
    const map = new Map<string, BuilderProduct>();
    productOptions.forEach((product) =>
      map.set(product.productId, { ...product, defaultQuantity: 1, note: null }),
    );
    usualBuilderProducts.forEach((product) => map.set(product.productId, product));
    return map;
  }, [productOptions, usualBuilderProducts]);

  const catalogueGroups = useMemo(() => groupProductsByCategory(productOptions), [productOptions]);

  const [usualQuantities, setUsualQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      usualBuilderProducts.map((product) => [product.productId, product.defaultQuantity]),
    ),
  );
  const [lines, setLines] = useState<BuilderLine[]>(() =>
    prefill
      ? prefill.lines.map((line) => ({
          productId: line.productId,
          slug: line.slug,
          productName: line.productName,
          categoryName: line.categoryName,
          conditionnement: line.conditionnement,
          unitOfSale: line.unitOfSale,
          defaultQuantity: line.quantity,
          note: null,
          quantity: line.quantity,
          lineNote: line.note ?? '',
        }))
      : [],
  );
  const [query, setQuery] = useState('');
  const [deliveryText, setDeliveryText] = useState('');
  const [preferredTiming, setPreferredTiming] = useState('');
  const [message, setMessage] = useState('');
  const [recurrenceMode, setRecurrenceMode] = useState<PortalRecurrenceMode>('once');
  const [recurrenceDetail, setRecurrenceDetail] = useState('');
  const [result, setResult] = useState<SubmitPortalRequestResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<PickerTab>(
    usualBuilderProducts.length > 0 ? 'usual' : 'all',
  );

  const selectedProductIds = useMemo(
    () => new Set(lines.map((line) => line.productId)),
    [lines],
  );

  const searchHits = useMemo(() => {
    const raw = query.trim();
    if (!raw) return [];
    return productOptions
      .filter((product) => portalProductMatchesQuery(product, raw))
      .sort(
        (left, right) =>
          portalProductSearchRank(right, raw) - portalProductSearchRank(left, raw) ||
          left.productName.localeCompare(right.productName, 'fr'),
      );
  }, [productOptions, query]);

  const browseProducts = useMemo(() => {
    return [...productOptions]
      .sort((left, right) => left.productName.localeCompare(right.productName, 'fr'))
      .slice(0, 48);
  }, [productOptions]);

  const gridProducts = useMemo(
    () => (query.trim() ? searchHits : browseProducts),
    [query, browseProducts, searchHits],
  );

  const lineCount = lines.length;
  const totalQuantity = lines.reduce((total, line) => total + line.quantity, 0);
  const canSubmit =
    lines.length > 0 &&
    !isPending &&
    (recurrenceMode !== 'custom' || recurrenceDetail.trim().length >= 2);

  function addProduct(product: BuilderProduct, quantity = product.defaultQuantity) {
    setResult(null);
    setLines((current) => {
      const existing = current.find((line) => line.productId === product.productId);
      if (existing) {
        return current.map((line) =>
          line.productId === product.productId
            ? { ...line, quantity: clampQuantity(line.quantity + quantity) }
            : line,
        );
      }
      return [
        ...current,
        { ...product, quantity: clampQuantity(quantity), lineNote: '' },
      ];
    });
  }

  function replaceLineProduct(productIdToReplace: string, nextProduct: PortalProductOption) {
    if (productIdToReplace === nextProduct.productId) return;
    if (
      selectedProductIds.has(nextProduct.productId) &&
      nextProduct.productId !== productIdToReplace
    ) {
      return;
    }
    const template = productById.get(nextProduct.productId);
    const builder: BuilderProduct = template ?? {
      ...nextProduct,
      defaultQuantity: 1,
      note: null,
    };

    setResult(null);
    setLines((current) =>
      current.map((line) =>
        line.productId === productIdToReplace
          ? {
              ...line,
              productId: builder.productId,
              slug: builder.slug,
              productName: builder.productName,
              categoryName: builder.categoryName,
              conditionnement: builder.conditionnement,
              unitOfSale: builder.unitOfSale,
              defaultQuantity: builder.defaultQuantity,
              note: builder.note,
            }
          : line,
      ),
    );
  }

  function addAllUsualProducts() {
    usualBuilderProducts.forEach((product) => {
      addProduct(product, usualQuantities[product.productId] ?? product.defaultQuantity);
    });
  }

  function updateLineQuantity(productId: string, quantity: number) {
    setResult(null);
    setLines((current) =>
      current.map((line) =>
        line.productId === productId ? { ...line, quantity: clampQuantity(quantity) } : line,
      ),
    );
  }

  function updateLineNote(productId: string, note: string) {
    setResult(null);
    setLines((current) =>
      current.map((line) => (line.productId === productId ? { ...line, lineNote: note } : line)),
    );
  }

  function removeLine(productId: string) {
    setResult(null);
    setLines((current) => current.filter((line) => line.productId !== productId));
  }

  function submitRequest() {
    setResult(null);
    startTransition(async () => {
      const response = await submitPortalRequest({
        locale,
        deliveryText,
        preferredTiming,
        message,
        recurrenceMode,
        recurrenceDetail: recurrenceDetail.trim() || undefined,
        lines: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          note: line.lineNote || undefined,
        })),
        duplicatedFromOrderDraftId: prefill?.sourceRequestId,
      });

      setResult(response);
      if (response.ok) {
        setLines([]);
        setDeliveryText('');
        setPreferredTiming('');
        setMessage('');
        setRecurrenceMode('once');
        setRecurrenceDetail('');
      }
    });
  }

  return (
    <>
      <div
        className={cn(
          'grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)] lg:items-start',
          // Reserve room for the floating mobile action bar so the last form
          // input stays scrollable into view. Desktop has its own sticky sidebar.
          lineCount > 0 ? 'pb-16 lg:pb-0' : null,
        )}
      >
        {/* LEFT — Picker */}
        <div className="flex flex-col gap-4">
          <PickerPanel
            activeTab={activeTab}
            onTabChange={setActiveTab}
            usualCount={usualBuilderProducts.length}
            allCount={productOptions.length}
            query={query}
            onQueryChange={setQuery}
            showSearch={activeTab === 'all'}
          >
            {activeTab === 'usual' ? (
              <UsualTab
                products={usualBuilderProducts}
                usualQuantities={usualQuantities}
                onUsualQuantityChange={(id, q) =>
                  setUsualQuantities((current) => ({ ...current, [id]: clampQuantity(q) }))
                }
                selectedProductIds={selectedProductIds}
                onAddOne={(product) =>
                  addProduct(product, usualQuantities[product.productId] ?? product.defaultQuantity)
                }
                onAddAll={addAllUsualProducts}
              />
            ) : (
              <AllProductsTab
                gridProducts={gridProducts}
                productById={productById}
                lines={lines}
                productOptionsCount={productOptions.length}
                query={query}
                onAdd={(product) => addProduct(product, 1)}
                onCommitQuantity={(productId, quantity, builder) => {
                  if (!lines.find((l) => l.productId === productId)) {
                    addProduct(builder, quantity);
                  } else if (quantity < 1) {
                    removeLine(productId);
                  } else {
                    updateLineQuantity(productId, quantity);
                  }
                }}
                onRemove={removeLine}
              />
            )}
          </PickerPanel>
        </div>

        {/* RIGHT — Order summary (sticky desktop, inline mobile) */}
        <div
          id="order-summary"
          className="flex flex-col gap-4 lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto"
        >
          <Panel
            title="Votre demande"
            description={
              lineCount > 0
                ? `${lineCount} ligne${lineCount > 1 ? 's' : ''} · ${totalQuantity} unité${totalQuantity > 1 ? 's' : ''}`
                : 'Aucune ligne pour le moment.'
            }
            padding="flush"
          >
            {lines.length > 0 ? (
              <ul className="divide-y divide-border">
                {lines.map((line) => (
                  <li key={line.productId}>
                    <BasketLineRow
                      line={line}
                      catalogueGroups={catalogueGroups}
                      selectedProductIds={selectedProductIds}
                      onQuantityChange={(quantity) => updateLineQuantity(line.productId, quantity)}
                      onNoteChange={(note) => updateLineNote(line.productId, note)}
                      onReplace={(next) => replaceLineProduct(line.productId, next)}
                      onRemove={() => removeLine(line.productId)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-5 py-10 text-center">
                <p className="text-[13px] text-muted-foreground">
                  Ajoutez des références depuis la liste à gauche pour démarrer.
                </p>
              </div>
            )}
          </Panel>

          <Panel title="Détails de livraison" description="Optionnel, mais facilite la préparation.">
            <div className="flex flex-col gap-4">
              <FormField label="Cadence">
                <select
                  value={recurrenceMode}
                  onChange={(event) =>
                    setRecurrenceMode(event.target.value as PortalRecurrenceMode)
                  }
                  className="h-10 w-full rounded-md border border-border bg-card px-3 text-[13px] text-prodet-text outline-none transition-colors focus:border-prodet-blue focus:ring-2 focus:ring-prodet-blue/15"
                >
                  {recurrenceSelectOptionsFr.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {recurrenceMode === 'custom' ? (
                  <input
                    value={recurrenceDetail}
                    onChange={(event) => setRecurrenceDetail(event.target.value)}
                    maxLength={180}
                    placeholder="Ex. tous les mercredis"
                    className="mt-2 h-10 w-full rounded-md border border-border bg-card px-3 text-[13px] text-prodet-text outline-none transition-colors focus:border-prodet-blue focus:ring-2 focus:ring-prodet-blue/15"
                  />
                ) : null}
              </FormField>

              <FormField
                label="Lieu / livraison"
                icon={<MapPin className="h-3.5 w-3.5" aria-hidden />}
              >
                <input
                  value={deliveryText}
                  onChange={(event) => setDeliveryText(event.target.value)}
                  maxLength={700}
                  placeholder="Adresse, point de contact"
                  className="h-10 w-full rounded-md border border-border bg-card px-3 text-[13px] text-prodet-text outline-none transition-colors focus:border-prodet-blue focus:ring-2 focus:ring-prodet-blue/15"
                />
              </FormField>

              <FormField label="Délai" icon={<Clock3 className="h-3.5 w-3.5" aria-hidden />}>
                <input
                  value={preferredTiming}
                  onChange={(event) => setPreferredTiming(event.target.value)}
                  maxLength={160}
                  placeholder="Ex. cette semaine, avant vendredi"
                  className="h-10 w-full rounded-md border border-border bg-card px-3 text-[13px] text-prodet-text outline-none transition-colors focus:border-prodet-blue focus:ring-2 focus:ring-prodet-blue/15"
                />
              </FormField>

              <FormField
                label="Message libre"
                icon={<MessageSquare className="h-3.5 w-3.5" aria-hidden />}
              >
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="Précisions à transmettre à Prodet"
                  className="block w-full resize-none rounded-md border border-border bg-card px-3 py-2 text-[13px] leading-6 text-prodet-text outline-none transition-colors focus:border-prodet-blue focus:ring-2 focus:ring-prodet-blue/15"
                />
              </FormField>

              {result ? <SubmissionState result={result} /> : null}

              <Button
                type="button"
                size="lg"
                className="w-full"
                disabled={!canSubmit}
                onClick={submitRequest}
              >
                <Send className="h-4 w-4" aria-hidden />
                {isPending ? 'Envoi…' : 'Envoyer la demande'}
              </Button>
            </div>
          </Panel>
        </div>
      </div>

      {/* Mobile/tablet sticky action bar — only visible when there are lines.
       *  Sits above the BottomNav (which is 64px tall) using safe-area-aware
       *  bottom offset. Disappears on desktop where the sticky sidebar takes over. */}
      {lineCount > 0 ? <MobileActionBar lineCount={lineCount} totalQuantity={totalQuantity} /> : null}
    </>
  );
}

// ----------------------------- Picker shell -----------------------------

function PickerPanel({
  activeTab,
  onTabChange,
  usualCount,
  allCount,
  query,
  onQueryChange,
  showSearch,
  children,
}: {
  activeTab: PickerTab;
  onTabChange: (tab: PickerTab) => void;
  usualCount: number;
  allCount: number;
  query: string;
  onQueryChange: (value: string) => void;
  showSearch: boolean;
  children: ReactNode;
}) {
  return (
    <section className="rounded-md border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-3.5 md:flex-row md:items-center md:justify-between md:px-6">
        <div role="tablist" aria-label="Sélecteur de produits" className="inline-flex rounded-md bg-prodet-wash p-0.5">
          <TabButton
            active={activeTab === 'usual'}
            onClick={() => onTabChange('usual')}
            count={usualCount}
          >
            Habituels
          </TabButton>
          <TabButton
            active={activeTab === 'all'}
            onClick={() => onTabChange('all')}
            count={allCount}
          >
            Tous les produits
          </TabButton>
        </div>
        <Button asChild variant="ghost" size="xs">
          <Link href="/catalogue" className="inline-flex items-center gap-1.5 text-muted-foreground">
            Catalogue web
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </Button>
      </div>

      {showSearch ? (
        <div className="border-b border-border px-5 py-3 md:px-6">
          <label className="flex h-11 items-center gap-2.5 rounded-md border border-border bg-card px-3 transition-colors focus-within:border-prodet-blue focus-within:ring-2 focus-within:ring-prodet-blue/15">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Rechercher une référence, un format, un usage…"
              className="min-w-0 flex-1 border-0 bg-transparent text-[14px] text-prodet-text outline-none placeholder:text-muted-foreground"
            />
            {query ? (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                aria-label="Effacer la recherche"
                className="inline-flex h-6 w-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-prodet-wash hover:text-prodet-text"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            ) : null}
          </label>
        </div>
      ) : null}

      {children}
    </section>
  );
}

function TabButton({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 items-center gap-2 rounded-md px-3 text-[12px] font-semibold transition-colors',
        active
          ? 'bg-card text-prodet-text shadow-sm'
          : 'text-muted-foreground hover:text-prodet-text',
      )}
    >
      <span>{children}</span>
      <span
        className={cn(
          'inline-flex h-4 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums',
          active ? 'bg-prodet-mist text-prodet-blue' : 'bg-card text-muted-foreground',
        )}
      >
        {count}
      </span>
    </button>
  );
}

// ----------------------------- Usual products tab -----------------------------

function UsualTab({
  products,
  usualQuantities,
  onUsualQuantityChange,
  selectedProductIds,
  onAddOne,
  onAddAll,
}: {
  products: BuilderProduct[];
  usualQuantities: Record<string, number>;
  onUsualQuantityChange: (productId: string, quantity: number) => void;
  selectedProductIds: Set<string>;
  onAddOne: (product: BuilderProduct) => void;
  onAddAll: () => void;
}) {
  if (products.length === 0) {
    return (
      <div className="px-5 py-10 text-center md:px-6">
        <PackageCheck className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden />
        <p className="mt-3 text-[14px] font-medium text-prodet-text">
          Aucun produit habituel
        </p>
        <p className="mx-auto mt-1 max-w-md text-[12px] leading-5 text-muted-foreground">
          Demandez à Prodet de configurer vos références récurrentes, ou utilisez l&apos;onglet
          « Tous les produits ».
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-2.5 md:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          {products.length} référence{products.length > 1 ? 's' : ''} pré-enregistrée
          {products.length > 1 ? 's' : ''}
        </p>
        <Button type="button" variant="outline" size="xs" onClick={onAddAll}>
          <Layers3 className="h-3.5 w-3.5" aria-hidden />
          Tout ajouter
        </Button>
      </div>

      <ul className="divide-y divide-border">
        {products.map((product) => {
          const quantity = usualQuantities[product.productId] ?? product.defaultQuantity;
          const inBasket = selectedProductIds.has(product.productId);
          return (
            <li key={product.productId}>
              <UsualProductRow
                product={product}
                quantity={quantity}
                inBasket={inBasket}
                onQuantityChange={(q) => onUsualQuantityChange(product.productId, q)}
                onAdd={() => onAddOne(product)}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
}

function UsualProductRow({
  product,
  quantity,
  inBasket,
  onQuantityChange,
  onAdd,
}: {
  product: BuilderProduct;
  quantity: number;
  inBasket: boolean;
  onQuantityChange: (quantity: number) => void;
  onAdd: () => void;
}) {
  const format = [product.conditionnement, product.unitOfSale].filter(Boolean).join(' · ');

  return (
    <div className="grid grid-cols-1 gap-3 px-5 py-3 md:grid-cols-[44px_minmax(0,1fr)_auto_auto] md:items-center md:gap-4 md:px-6">
      <div className="hidden md:block">
        <PortalRequestProductThumb slug={product.slug} name={product.productName} size="sm" />
      </div>

      <div className="min-w-0">
        <Link
          href={`/catalogue/${product.slug}`}
          className="text-[14px] font-medium text-prodet-text hover:text-prodet-blue"
        >
          {product.productName}
        </Link>
        <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
          {[product.categoryName, format].filter(Boolean).join(' · ') || '\u00A0'}
        </p>
        {product.note ? (
          <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
            <span className="font-semibold text-muted-foreground">Note · </span>
            {product.note}
          </p>
        ) : null}
      </div>

      <QuantityStepper value={quantity} onChange={onQuantityChange} ariaLabel={`Quantité ${product.productName}`} />

      <Button
        type="button"
        size="sm"
        variant={inBasket ? 'outline' : 'default'}
        onClick={onAdd}
        className="min-w-[100px] justify-center"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
        {inBasket ? 'Encore' : 'Ajouter'}
      </Button>
    </div>
  );
}

// ----------------------------- All products tab -----------------------------

function AllProductsTab({
  gridProducts,
  productById,
  lines,
  productOptionsCount,
  query,
  onAdd,
  onCommitQuantity,
  onRemove,
}: {
  gridProducts: PortalProductOption[];
  productById: Map<string, BuilderProduct>;
  lines: BuilderLine[];
  productOptionsCount: number;
  query: string;
  onAdd: (product: BuilderProduct) => void;
  onCommitQuantity: (productId: string, quantity: number, builder: BuilderProduct) => void;
  onRemove: (productId: string) => void;
}) {
  if (productOptionsCount === 0) {
    return (
      <div className="px-5 py-10 text-center md:px-6">
        <p className="text-[13px] text-muted-foreground">
          Aucun produit dans la base. Contactez Prodet pour configurer le catalogue.
        </p>
      </div>
    );
  }

  if (gridProducts.length === 0) {
    return (
      <div className="px-5 py-10 text-center md:px-6">
        <Search className="mx-auto h-5 w-5 text-muted-foreground" aria-hidden />
        <p className="mt-3 text-[14px] font-medium text-prodet-text">
          Aucun résultat pour « {query.trim()} »
        </p>
        <p className="mx-auto mt-1 max-w-md text-[12px] leading-5 text-muted-foreground">
          Essayez un autre mot-clé, un format (5L, 20L), ou ouvrez le catalogue.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {gridProducts.map((option) => {
          const builder =
            productById.get(option.productId) ??
            ({ ...option, defaultQuantity: 1, note: null } as BuilderProduct);
          const lineQty = lines.find((l) => l.productId === option.productId)?.quantity;
          const staticProduct = getProductBySlug(option.slug);
          return (
            <li key={option.productId}>
              <CatalogProductRow
                option={option}
                tagline={staticProduct?.tagline}
                lineQuantity={lineQty}
                onAdd={() => onAdd(builder)}
                onCommitQuantity={(q) => onCommitQuantity(option.productId, q, builder)}
                onRemove={() => onRemove(option.productId)}
              />
            </li>
          );
        })}
      </ul>
      {!query.trim() && productOptionsCount > 48 ? (
        <p className="border-t border-border px-5 py-3 text-[11px] text-muted-foreground md:px-6">
          48 références par ordre alphabétique. Utilisez la recherche pour voir le reste.
        </p>
      ) : null}
    </>
  );
}

function CatalogProductRow({
  option,
  tagline,
  lineQuantity,
  onAdd,
  onCommitQuantity,
  onRemove,
}: {
  option: PortalProductOption;
  tagline?: string;
  lineQuantity?: number;
  onAdd: () => void;
  onCommitQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  const format = [option.conditionnement, option.unitOfSale].filter(Boolean).join(' · ');
  const inBasket = lineQuantity !== undefined;

  return (
    <div className="grid grid-cols-1 gap-3 px-5 py-3 md:grid-cols-[44px_minmax(0,1fr)_auto] md:items-center md:gap-4 md:px-6">
      <div className="hidden md:block">
        <PortalRequestProductThumb slug={option.slug} name={option.productName} size="sm" />
      </div>
      <div className="min-w-0">
        <Link
          href={`/catalogue/${option.slug}`}
          className="text-[14px] font-medium text-prodet-text hover:text-prodet-blue"
        >
          {option.productName}
        </Link>
        <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
          {[option.categoryName, format].filter(Boolean).join(' · ') ||
            tagline ||
            '\u00A0'}
        </p>
      </div>

      {inBasket ? (
        <div className="flex items-center gap-2">
          <QuantityStepper
            value={lineQuantity!}
            onChange={(next) => {
              if (!Number.isFinite(next)) return;
              const raw = Math.trunc(next);
              if (raw < 1) {
                onRemove();
                return;
              }
              onCommitQuantity(clampQuantity(raw));
            }}
            ariaLabel={`Quantité ${option.productName}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            aria-label={`Retirer ${option.productName}`}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      ) : (
        <Button type="button" size="sm" variant="outline" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Ajouter
        </Button>
      )}
    </div>
  );
}

// ----------------------------- Basket line row -----------------------------

function BasketLineRow({
  line,
  catalogueGroups,
  selectedProductIds,
  onQuantityChange,
  onNoteChange,
  onReplace,
  onRemove,
}: {
  line: BuilderLine;
  catalogueGroups: CatalogueGroup[];
  selectedProductIds: Set<string>;
  onQuantityChange: (quantity: number) => void;
  onNoteChange: (note: string) => void;
  onReplace: (product: PortalProductOption) => void;
  onRemove: () => void;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const format = [line.conditionnement, line.unitOfSale].filter(Boolean).join(' · ');

  return (
    <article className="px-5 py-3 md:px-6">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/catalogue/${line.slug}`}
            className="text-[14px] font-medium text-prodet-text hover:text-prodet-blue"
          >
            {line.productName}
          </Link>
          <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
            {[line.categoryName, format].filter(Boolean).join(' · ') || '\u00A0'}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-prodet-wash hover:text-destructive"
          aria-label={`Retirer ${line.productName}`}
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-3">
        <QuantityStepper
          value={line.quantity}
          onChange={onQuantityChange}
          ariaLabel={`Quantité ${line.productName}`}
        />
        <button
          type="button"
          onClick={() => setShowAdvanced((current) => !current)}
          className="text-[11px] font-medium text-muted-foreground underline-offset-2 hover:text-prodet-blue hover:underline"
        >
          {showAdvanced ? 'Masquer' : 'Note / remplacer'}
        </button>
      </div>

      {showAdvanced ? (
        <div className="mt-2.5 space-y-2">
          <label className="block">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Remplacer par
            </span>
            <select
              value={line.productId}
              onChange={(event) => {
                const nextId = event.target.value;
                outer: for (const group of catalogueGroups) {
                  for (const candidate of group.products) {
                    if (candidate.productId === nextId) {
                      onReplace(candidate);
                      break outer;
                    }
                  }
                }
              }}
              className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2 text-[12px] text-prodet-text outline-none transition-colors focus:border-prodet-blue focus:ring-2 focus:ring-prodet-blue/15"
            >
              {catalogueGroups.map(({ categoryLabel, products }) => {
                const selectable = products.filter(
                  (candidate) =>
                    candidate.productId === line.productId ||
                    !selectedProductIds.has(candidate.productId),
                );
                if (selectable.length === 0) return null;
                return (
                  <optgroup key={categoryLabel} label={categoryLabel}>
                    {selectable.map((candidate) => (
                      <option key={candidate.productId} value={candidate.productId}>
                        {candidate.productName}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </label>
          <label className="block">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Note ligne
            </span>
            <input
              value={line.lineNote}
              onChange={(event) => onNoteChange(event.target.value)}
              maxLength={1000}
              placeholder="Précision, alternative…"
              className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-[12px] text-prodet-text outline-none transition-colors focus:border-prodet-blue focus:ring-2 focus:ring-prodet-blue/15"
            />
          </label>
        </div>
      ) : null}
    </article>
  );
}

// ----------------------------- Form field + quantity stepper -----------------------------

function FormField({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {icon ? <span aria-hidden>{icon}</span> : null}
        {label}
      </span>
      {children}
    </label>
  );
}

function QuantityStepper({
  value,
  onChange,
  ariaLabel,
}: {
  value: number;
  onChange: (quantity: number) => void;
  ariaLabel?: string;
}) {
  return (
    <div className="inline-flex h-9 items-stretch overflow-hidden rounded-md border border-border bg-card">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        className="flex h-full w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-prodet-wash hover:text-prodet-text"
        aria-label="Diminuer la quantité"
      >
        <Minus className="h-3.5 w-3.5" aria-hidden />
      </button>
      <input
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        inputMode="numeric"
        className="h-full w-12 border-x border-border text-center text-[14px] font-semibold tabular-nums text-prodet-text outline-none"
        aria-label={ariaLabel ?? 'Quantité'}
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-full w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-prodet-wash hover:text-prodet-text"
        aria-label="Augmenter la quantité"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

// ----------------------------- Submit result + mobile action bar -----------------------------

function SubmissionState({ result }: { result: SubmitPortalRequestResult }) {
  if (result.ok) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-prodet-green/20 bg-prodet-green/10 px-3 py-2.5 text-[13px] text-prodet-green">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <div className="min-w-0">
          <p className="font-medium">
            Demande enregistrée
            {result.referenceCode ? (
              <span className="font-mono tabular-nums"> · {result.referenceCode}</span>
            ) : null}
          </p>
          {result.orderDraftId ? (
            <Link
              href={`/client/historique/${result.orderDraftId}`}
              className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium underline-offset-2 hover:underline"
            >
              Voir le détail
              <RotateCcw className="h-3 w-3 rotate-180" aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-[13px] text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>{result.formError || 'L\u2019envoi a échoué. Vérifiez votre saisie et réessayez.'}</p>
    </div>
  );
}

function MobileActionBar({
  lineCount,
  totalQuantity,
}: {
  lineCount: number;
  totalQuantity: number;
}) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-30 px-3 lg:hidden"
      style={{ bottom: 'calc(64px + env(safe-area-inset-bottom))' }}
    >
      <a
        href="#order-summary"
        className="pointer-events-auto mx-auto flex h-12 max-w-[640px] items-center justify-between gap-3 rounded-full bg-prodet-ink px-4 text-white shadow-[0_10px_30px_-12px_rgba(8,41,78,0.6)]"
      >
        <span className="inline-flex items-center gap-2 text-[13px] font-medium">
          <StatusPill tone="info" label={String(lineCount)} />
          ligne{lineCount > 1 ? 's' : ''} · {totalQuantity} unité{totalQuantity > 1 ? 's' : ''}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold">
          Continuer
          <ArrowDown className="h-3.5 w-3.5" aria-hidden />
        </span>
      </a>
    </div>
  );
}

// ----------------------------- Pure helpers -----------------------------

function groupProductsByCategory(products: PortalProductOption[]): CatalogueGroup[] {
  const orderKeys: string[] = [];
  const byKey = new Map<string, PortalProductOption[]>();

  for (const product of products) {
    const key = product.categoryName?.trim() || 'Références';
    if (!byKey.has(key)) {
      orderKeys.push(key);
      byKey.set(key, []);
    }
    byKey.get(key)!.push(product);
  }

  return orderKeys.map((categoryLabel) => ({
    categoryLabel,
    products: byKey.get(categoryLabel) ?? [],
  }));
}

function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(9999, Math.trunc(value)));
}
