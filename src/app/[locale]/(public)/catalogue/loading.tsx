/**
 * Shown while a /catalogue/[slug] product page streams in. The catalogue
 * index itself redirects to the famille browse, so this is a PDP silhouette.
 */
export default function CatalogueLoading() {
  return (
    <div className="py-6 md:py-8" aria-busy="true">
      <span className="sr-only">Chargement…</span>
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <span className="pds-skeleton pds-skeleton--text" style={{ width: 180 }} />
        <div
          className="mt-6 grid gap-7 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)]"
        >
          <span className="pds-skeleton pds-skeleton--card" style={{ minHeight: 420 }} />
          <div>
            <span className="pds-skeleton pds-skeleton--title" style={{ width: '70%' }} />
            <span className="pds-skeleton pds-skeleton--text" style={{ width: '90%', marginTop: 16 }} />
            <span className="pds-skeleton pds-skeleton--text" style={{ width: '80%', marginTop: 10 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
