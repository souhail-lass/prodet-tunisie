/**
 * Admin content skeleton — paints instantly inside the admin shell while
 * the target page (queue/table) renders.
 */
export default function AdminLoading() {
  return (
    <div aria-busy="true" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <span className="sr-only">Chargement…</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span className="pds-skeleton pds-skeleton--title" style={{ width: 260 }} />
        <span className="pds-skeleton" style={{ width: 120, height: 34, marginLeft: 'auto' }} />
      </div>
      <div className="panel">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 110px',
              gap: 16,
              padding: '13px 0',
              borderBottom: i < 5 ? '1px solid var(--border-default)' : 'none',
            }}
          >
            <span className="pds-skeleton pds-skeleton--text" style={{ width: '80%' }} />
            <span className="pds-skeleton pds-skeleton--text" style={{ width: '65%' }} />
            <span className="pds-skeleton pds-skeleton--text" style={{ width: '55%' }} />
            <span className="pds-skeleton pds-skeleton--text" style={{ width: '100%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
