/**
 * Portal content skeleton — paints instantly inside the portal shell while
 * the target page renders, so navigation never feels frozen.
 */
export default function ClientPortalLoading() {
  return (
    <div className="dash" aria-busy="true">
      <span className="sr-only">Chargement…</span>
      <span className="pds-skeleton pds-skeleton--title" style={{ width: 240 }} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 16,
        }}
      >
        {Array.from({ length: 4 }, (_, i) => (
          <div className="stat-card" key={i}>
            <span className="pds-skeleton" style={{ width: 36, height: 36, borderRadius: 999 }} />
            <span className="pds-skeleton pds-skeleton--title" style={{ width: '50%', marginTop: 10 }} />
            <span className="pds-skeleton pds-skeleton--text" style={{ width: '70%', marginTop: 6 }} />
          </div>
        ))}
      </div>
      <div className="panel">
        <span className="pds-skeleton pds-skeleton--title" style={{ width: 200 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
          {Array.from({ length: 5 }, (_, i) => (
            <span className="pds-skeleton pds-skeleton--text" key={i} style={{ width: `${92 - i * 7}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
