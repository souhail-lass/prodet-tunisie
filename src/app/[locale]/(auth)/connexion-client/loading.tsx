/**
 * Instant paint while /connexion-client streams — avoids a frozen header click.
 */
export default function ConnexionClientLoading() {
  return (
    <main>
      <div className="auth-atmosphere relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-5 py-16">
        <div className="auth-atmosphere__wash" aria-hidden />
        <div className="auth-atmosphere__grid" aria-hidden />
        <div className="relative z-10 w-full max-w-[440px]" aria-busy="true">
          <span className="sr-only">Chargement…</span>
          <div className="mb-8 flex flex-col items-center text-center">
            <span className="pds-skeleton" style={{ width: 96, height: 12 }} />
            <span
              className="pds-skeleton pds-skeleton--title"
              style={{ width: 220, height: 28, marginTop: 12 }}
            />
            <span
              className="pds-skeleton pds-skeleton--text"
              style={{ width: '80%', height: 14, marginTop: 20 }}
            />
          </div>
          <div className="border-border bg-card rounded-xl border p-7">
            <span className="pds-skeleton" style={{ width: 140, height: 12 }} />
            <span
              className="pds-skeleton"
              style={{ width: '100%', height: 40, marginTop: 10, borderRadius: 8 }}
            />
            <span
              className="pds-skeleton"
              style={{ width: '100%', height: 44, marginTop: 14, borderRadius: 8 }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
