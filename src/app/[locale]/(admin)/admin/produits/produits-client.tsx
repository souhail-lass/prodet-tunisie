'use client';

import { useMemo, useState, useTransition } from 'react';
import { Eye, EyeOff, Pencil, Plus, RefreshCw, Search, Star } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import type { AdminProductRow } from '@/features/catalogue/queries';
import { setProductHiddenAction, syncCatalogueAction, toggleCategoryAction } from './actions';

export function ProduitsClient({ items }: { items: AdminProductRow[] }) {
  const router = useRouter();
  const [override, setOverride] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [visibility, setVisibility] = useState<'all' | 'visible' | 'hidden'>('all');
  const [pending, startTransition] = useTransition();
  const [syncing, setSyncing] = useState(false);

  const isHidden = (it: AdminProductRow) => override[it.id] ?? it.hidden;

  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.baseCategory).filter((c): c is string => Boolean(c)))).sort(),
    [items],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (category !== 'all' && (it.baseCategory ?? '') !== category) return false;
      const hidden = override[it.id] ?? it.hidden;
      if (visibility === 'visible' && hidden) return false;
      if (visibility === 'hidden' && !hidden) return false;
      if (q) return it.name.toLowerCase().includes(q) || (it.sku ?? '').toLowerCase().includes(q);
      return true;
    });
  }, [items, query, category, visibility, override]);

  const visibleCount = items.filter((it) => !isHidden(it)).length;

  function toggleProduct(it: AdminProductRow) {
    const next = !isHidden(it);
    setOverride((p) => ({ ...p, [it.id]: next }));
    startTransition(async () => {
      const r = await setProductHiddenAction({ id: it.id, hidden: next });
      if (!r.ok) setOverride((p) => ({ ...p, [it.id]: !next }));
    });
  }

  function toggleCategory(hidden: boolean) {
    if (category === 'all') return;
    const ids = items.filter((i) => (i.baseCategory ?? '') === category).map((i) => i.id);
    setOverride((p) => {
      const n = { ...p };
      for (const id of ids) n[id] = hidden;
      return n;
    });
    startTransition(async () => {
      await toggleCategoryAction({ categoryLabel: category, hidden });
    });
  }

  function sync() {
    setSyncing(true);
    startTransition(async () => {
      await syncCatalogueAction();
      setSyncing(false);
      router.refresh();
    });
  }

  const cols = '3fr 1.6fr auto auto';

  return (
    <div className="dash">
      <div className="dash__stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <Stat
          tone="blue"
          value={items.length}
          label="Produits"
          active={visibility === 'all'}
          onClick={() => setVisibility('all')}
        />
        <Stat
          tone="green"
          value={visibleCount}
          label="Visibles"
          active={visibility === 'visible'}
          onClick={() => setVisibility((v) => (v === 'visible' ? 'all' : 'visible'))}
        />
        <Stat
          tone="amber"
          value={items.length - visibleCount}
          label="Masqués"
          active={visibility === 'hidden'}
          onClick={() => setVisibility((v) => (v === 'hidden' ? 'all' : 'hidden'))}
        />
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={16} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un produit ou une référence…" />
        </div>
        <select className="admin-select" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">Toutes les catégories ({categories.length})</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {category !== 'all' ? (
          <button className="pds-btn pds-btn--outline pds-btn--sm" onClick={() => toggleCategory(true)}>
            <EyeOff size={14} /> <span>Masquer la catégorie</span>
          </button>
        ) : null}
        <button className="pds-btn pds-btn--ghost pds-btn--sm" onClick={sync} disabled={pending}>
          <RefreshCw size={14} /> <span>{syncing ? 'Synchronisation…' : 'Synchroniser'}</span>
        </button>
        <Link href="/admin/produits/nouveau" className="pds-btn pds-btn--primary pds-btn--sm">
          <Plus size={15} /> <span>Ajouter</span>
        </Link>
      </div>

      <div className="admin-table">
        <div className="admin-table__head" style={{ gridTemplateColumns: cols }}>
          <span>Produit</span>
          <span className="admin-hide-sm">Catégorie</span>
          <span>État</span>
          <span style={{ textAlign: 'right' }}>Éditer</span>
        </div>
        {filtered.slice(0, 400).map((it) => {
          const hidden = isHidden(it);
          const img = it.imageUrl || it.baseImageUrl;
          return (
            <div key={it.id} className={`admin-row${hidden ? ' is-dim' : ''}`} style={{ gridTemplateColumns: cols }}>
              <div className="admin-namecell">
                <span className="admin-thumb">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" />
                  ) : (
                    <span>{it.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </span>
                <div className="admin-cell">
                  <div className="admin-cell-strong">
                    {it.displayName || it.name}
                    {it.featured ? <Star size={12} style={{ marginLeft: 6, color: 'var(--color-warning)' }} /> : null}
                  </div>
                  <div className="admin-cell-sub">
                    {it.source === 'custom' ? 'Personnalisé' : it.sku}
                  </div>
                </div>
              </div>
              <div className="admin-cell-muted admin-hide-sm">{it.baseCategory ?? '—'}</div>
              <div>
                <button onClick={() => toggleProduct(it)} className={`admin-toggle ${hidden ? 'admin-toggle--off' : 'admin-toggle--on'}`}>
                  {hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                  {hidden ? 'Masqué' : 'Visible'}
                </button>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Link href={`/admin/produits/${it.id}`} className="pds-btn pds-btn--ghost pds-btn--sm">
                  <Pencil size={14} /> <span>Modifier</span>
                </Link>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 ? <div className="admin-empty">Aucun produit.</div> : null}
        {filtered.length > 400 ? (
          <div className="admin-result-note">{filtered.length} résultats — affinez la recherche (400 affichés).</div>
        ) : null}
      </div>
    </div>
  );
}

function Stat({
  tone,
  value,
  label,
  active,
  onClick,
}: {
  tone: 'blue' | 'green' | 'amber';
  value: number;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const color = tone === 'green' ? 'var(--prodet-green)' : tone === 'amber' ? 'var(--color-warning)' : 'var(--prodet-blue)';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`stat-card stat-card--filter stat-card--${tone}${active ? ' is-active' : ''}`}
    >
      <div className="stat-card__value" style={{ color }}>
        {value}
      </div>
      <div className="stat-card__label">{label}</div>
    </button>
  );
}
