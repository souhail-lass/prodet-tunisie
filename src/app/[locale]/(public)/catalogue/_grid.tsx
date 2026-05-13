import { Check, PackageSearch, RotateCcw } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type {
  PublicOffer,
  PublicOfferSection,
  PublicOfferSectionId,
  PublicOfferSort,
} from '@/data/public-offers';
import { siteContent } from '@/data/site-content';
import { OfferCard } from '@/components/offers/offer-card';
import { CatalogueToolbar } from '@/components/offers/catalogue-toolbar';
import { Button } from '@/components/ui/button';

interface CatalogueGridProps {
  offers: readonly PublicOffer[];
  sectionSummaries: readonly PublicOfferSection[];
  allSectionCounts: Record<PublicOfferSectionId, number>;
  activeSectionIds: readonly PublicOfferSectionId[];
  activeQuery: string;
  activeSort: PublicOfferSort;
  activeLimit: number | 'all';
}

export function CatalogueGrid({
  offers,
  sectionSummaries,
  allSectionCounts,
  activeSectionIds,
  activeQuery,
  activeSort,
  activeLimit,
}: CatalogueGridProps) {
  const copy = siteContent.catalogue;
  const visibleOffers = activeLimit === 'all' ? offers : offers.slice(0, activeLimit);
  const hasFilters = activeSectionIds.length > 0 || activeQuery.length > 0;
  const hiddenCount = offers.length - visibleOffers.length;

  return (
    <div className="section-shell py-10 lg:py-12">
      <header className="border-b border-border/80 pb-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow-label">CATALOGUE</p>
            <h1 className="public-display-title-compact mt-4">{copy.title}</h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{copy.subtitle}</p>
          </div>

          <CatalogueToolbar
            activeSectionIds={activeSectionIds}
            activeQuery={activeQuery}
            activeSort={activeSort}
            activeLimit={activeLimit}
            searchLabel={copy.searchLabel}
            searchPlaceholder={copy.searchPlaceholder}
            sortLabel={copy.sortLabel}
          />
        </div>
      </header>

      <div className="mt-8 grid gap-8 xl:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-28 xl:self-start">
          <div className="rounded-[24px] border border-border/70 bg-white/72 p-4 shadow-[0_18px_36px_-34px_rgba(11,61,115,0.18)] backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-primary/72">
                Sections
              </p>
              {hasFilters ? (
                <Link
                  href={buildCatalogueHref({
                    activeSectionIds: [],
                    activeQuery: '',
                    activeSort: activeSort === 'relevance' ? 'catalogue' : activeSort,
                    activeLimit,
                  })}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-[11px] font-medium text-prodet-text transition-colors hover:border-primary/35 hover:text-primary"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                  Reset
                </Link>
              ) : null}
            </div>

            <div className="mt-4 space-y-2">
              {sectionSummaries.map((section) => {
                const isActive = activeSectionIds.includes(section.id);
                return (
                  <Link
                    key={section.id}
                    href={buildCatalogueHref({
                      activeSectionIds: toggleValue(activeSectionIds, section.id),
                      activeQuery,
                      activeSort,
                      activeLimit,
                    })}
                    className={[
                      'flex items-center justify-between gap-3 rounded-[18px] border px-4 py-3 text-sm transition-[border-color,background-color,color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                      isActive
                        ? 'border-primary bg-[#EAF2FA] text-primary'
                        : 'border-border bg-white text-prodet-text hover:-translate-y-[1px] hover:border-primary/28 hover:bg-[#F4F6F8]',
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={[
                          'inline-flex h-5 w-5 items-center justify-center rounded-full border',
                          isActive
                            ? 'border-primary bg-primary text-white'
                            : 'border-border bg-white text-transparent',
                        ].join(' ')}
                      >
                        <Check className="h-3 w-3" aria-hidden />
                      </span>
                      <span className="font-medium">{section.label}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {allSectionCounts[section.id] ?? section.products.length}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        <div>
          <div className="flex flex-col gap-3 rounded-[20px] bg-[#F4F6F8] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-prodet-text">
                {offers.length} références trouvées
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {activeLimit === 'all'
                  ? 'Toutes les références filtrées sont affichées.'
                  : `${visibleOffers.length} références affichées sur ${offers.length}.`}
              </p>
            </div>
            {hiddenCount > 0 ? (
              <p className="text-sm text-muted-foreground">
                {hiddenCount} autres références restent disponibles si vous passez à 20, 30 ou
                tout afficher.
              </p>
            ) : null}
          </div>

          {offers.length === 0 ? (
            <div className="mt-8 rounded-[28px] border border-dashed border-border bg-white px-8 py-12 text-center">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
                <PackageSearch className="h-6 w-6" aria-hidden />
              </div>
              <p className="mt-5 text-lg font-semibold text-prodet-text">
                {activeQuery ? copy.emptySearchTitle : copy.emptyTitle}
              </p>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                {activeQuery ? copy.emptySearchBody : copy.emptyBody}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild variant="outline" className="rounded-full px-5">
                  <Link href="/catalogue">{copy.resetFilters}</Link>
                </Button>
                <Button asChild className="rounded-full px-5">
                  <Link href="/contact">{copy.emptyContactCta}</Link>
                </Button>
              </div>
            </div>
          ) : (
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {visibleOffers.map((offer) => (
                <li key={offer.id}>
                  <OfferCard offer={offer} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function toggleValue(
  values: readonly PublicOfferSectionId[],
  value: PublicOfferSectionId,
): PublicOfferSectionId[] {
  const next = new Set(values);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return [...next];
}

function buildCatalogueHref({
  activeSectionIds,
  activeQuery,
  activeSort,
  activeLimit,
}: {
  activeSectionIds: readonly PublicOfferSectionId[];
  activeQuery: string;
  activeSort: PublicOfferSort;
  activeLimit: number | 'all';
}) {
  const params = new URLSearchParams();
  activeSectionIds.forEach((id) => params.append('section', id));
  if (activeQuery.trim()) params.set('q', activeQuery.trim());
  if (activeSort !== 'catalogue' && (activeSort !== 'relevance' || activeQuery.trim())) {
    params.set('sort', activeSort);
  }
  if (activeLimit !== 20) params.set('limit', String(activeLimit));

  const query = params.toString();
  return query ? `/catalogue?${query}` : '/catalogue';
}
