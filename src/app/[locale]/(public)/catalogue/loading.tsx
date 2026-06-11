/**
 * Catalogue skeleton — only visible on a cold ISR render (or in dev); keeps
 * the masthead/grid silhouette so the swap to real content is seamless.
 */
export default function CatalogueLoading() {
  return (
    <div className="catalogue" aria-busy="true">
      <span className="sr-only">Chargement…</span>
      <div className="catalogue__masthead">
        <div className="section-wrap catalogue__masthead-inner">
          <div style={{ width: '100%' }}>
            <span className="pds-skeleton pds-skeleton--text" style={{ width: 110 }} />
            <span className="pds-skeleton pds-skeleton--title" style={{ width: 320, marginTop: 12 }} />
            <span className="pds-skeleton pds-skeleton--text" style={{ width: 420, maxWidth: '90%', marginTop: 10 }} />
          </div>
        </div>
      </div>
      <div className="section-wrap catalogue__layout">
        <aside className="catalogue__sidebar">
          <div className="filters-card" style={{ padding: 18 }}>
            <span className="pds-skeleton pds-skeleton--text" style={{ width: 90 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              {Array.from({ length: 4 }, (_, i) => (
                <span className="pds-skeleton pds-skeleton--text" key={i} style={{ width: `${85 - i * 10}%` }} />
              ))}
            </div>
          </div>
        </aside>
        <div className="catalogue__main">
          <div className="catalogue__toolbar">
            <span className="pds-skeleton" style={{ width: 320, maxWidth: '60%', height: 40 }} />
            <span className="pds-skeleton" style={{ width: 150, height: 40, marginLeft: 'auto' }} />
          </div>
          <div className="catalogue__grid">
            {Array.from({ length: 8 }, (_, i) => (
              <span className="pds-skeleton pds-skeleton--card" key={i} style={{ height: 300 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
