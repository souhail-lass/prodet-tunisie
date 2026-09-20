'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowLeft, ChevronDown, ChevronUp, EyeOff, GripVertical, RotateCcw, Save, Star, StarOff } from 'lucide-react';
import { familleLabel, sousCategorieLabel } from '@/data/famille-labels';
import { TOUS_LES_PRODUITS, type FamilleId } from '@/data/familles';
import type { CurationFamille, CurationProduct } from '@/features/catalogue/queries';
import { localePrefixedPath } from '@/lib/admin-catalogue-query';
import { reorderCatalogueRankAction, reorderSousCategorieAction, setCataloguePinAction } from '../actions';

function move<T>(list: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return [...list];
  const next = [...list];
  const [moved] = next.splice(from, 1);
  if (moved !== undefined) next.splice(to, 0, moved);
  return next;
}

const sameOrder = (a: readonly CurationProduct[], b: readonly string[]) =>
  a.length === b.length && a.every((item, i) => item.id === b[i]);

export function RangementClient({
  groups,
  backHref = '/admin/produits',
}: {
  groups: CurationFamille[];
  backHref?: string;
}) {
  const router = useRouter();
  const locale = useLocale();
  const populated = groups.filter((g) => g.sousCategories.length > 0);
  const firstFamille = populated[0];
  const [familleId, setFamilleId] = useState<FamilleId>(firstFamille?.familleId ?? 'produits-nettoyage');
  const [slug, setSlug] = useState<string>(firstFamille?.sousCategories[0]?.slug ?? '');
  const [items, setItems] = useState<CurationProduct[]>(firstFamille?.sousCategories[0]?.products ?? []);
  const [baseline, setBaseline] = useState<string[]>(
    (firstFamille?.sousCategories[0]?.products ?? []).map((p) => p.id),
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const famille = groups.find((g) => g.familleId === familleId);
  const sousCategories = famille?.sousCategories ?? [];
  const dirty = !sameOrder(items, baseline);
  const isAllProducts = familleId === TOUS_LES_PRODUITS;

  function load(nextFamille: FamilleId, nextSlug: string) {
    const group = groups
      .find((g) => g.familleId === nextFamille)
      ?.sousCategories.find((s) => s.slug === nextSlug);
    const products = group?.products ?? [];
    setFamilleId(nextFamille);
    setSlug(nextSlug);
    setItems(products);
    setBaseline(products.map((p) => p.id));
    setStatus(null);
  }

  function pickFamille(value: string) {
    const next = groups.find((g) => g.familleId === value);
    if (!next) return;
    load(next.familleId, next.sousCategories[0]?.slug ?? '');
  }

  function moveItem(id: string, targetIndex: number) {
    setItems((current) => move(current, current.findIndex((p) => p.id === id), targetIndex));
  }

  function nudge(index: number, delta: number) {
    setItems((current) => move(current, index, index + delta));
    setStatus(null);
  }

  function togglePin(item: CurationProduct) {
    setStatus(null);
    startTransition(async () => {
      const r = await setCataloguePinAction({ id: item.id, pinned: !item.pinned });
      setStatus(
        r.ok
          ? item.pinned
            ? `${item.name} retiré de « Tous les produits ».`
            : `${item.name} mis en avant dans « Tous les produits ».`
          : 'La mise en avant n’a pas pu être enregistrée.',
      );
      router.refresh();
    });
  }

  function save() {
    setStatus(null);
    startTransition(async () => {
      const orderedIds = items.map((p) => p.id);
      const r = isAllProducts
        ? await reorderCatalogueRankAction({ orderedIds })
        : await reorderSousCategorieAction({
            familleSlug: familleId,
            sousCategorieSlug: slug,
            orderedIds,
          });
      if (!r.ok) {
        setStatus(
          r.error === 'forbidden'
            ? 'Enregistrement refusé : rôle insuffisant.'
            : 'L’ordre n’a pas pu être enregistré. Rechargez la page et réessayez.',
        );
        return;
      }
      setBaseline(items.map((p) => p.id));
      setStatus('Ordre enregistré. Le site public est à jour.');
      router.refresh();
    });
  }

  return (
    <div className="dash">
      <a href={localePrefixedPath(locale, backHref)} className="ghost-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <ArrowLeft size={15} /> Retour au catalogue
      </a>

      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Ordre des produits</h2>
        </div>
        <p className="panel__sub">
          {isAllProducts
            ? 'Ces produits sont mis en avant en tête de « Tous les produits ». Le reste du catalogue suit par ordre alphabétique. Cet ordre est global : il ne change pas le classement à l’intérieur des sous-catégories.'
            : 'Glissez une ligne pour la déplacer, ou utilisez les flèches. Les produits rangés ici passent en tête de la sous-catégorie ; les autres suivent par ordre alphabétique.'}
        </p>
        <div className="admin-toolbar" style={{ marginTop: 14, marginBottom: 0 }}>
          <select className="admin-select" value={familleId} onChange={(e) => pickFamille(e.target.value)} aria-label="Famille">
            {groups.map((g) => (
              <option key={g.familleId} value={g.familleId} disabled={g.sousCategories.length === 0}>
                {familleLabel(g.familleId)}
              </option>
            ))}
          </select>
          {isAllProducts ? null : (
            <select
              className="admin-select"
              value={slug}
              onChange={(e) => load(familleId, e.target.value)}
              aria-label="Sous-catégorie"
            >
              {sousCategories.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {sousCategorieLabel(s.slug)} ({s.products.length})
                </option>
              ))}
            </select>
          )}
          <span style={{ flex: 1 }} />
          {dirty ? (
            <button className="pds-btn pds-btn--ghost pds-btn--sm" onClick={() => load(familleId, slug)} disabled={pending}>
              <RotateCcw size={14} /> <span>Annuler</span>
            </button>
          ) : null}
          <button className="pds-btn pds-btn--primary pds-btn--sm" onClick={save} disabled={!dirty || pending}>
            <Save size={14} /> <span>{pending ? 'Enregistrement…' : 'Enregistrer l’ordre'}</span>
          </button>
        </div>
        <p aria-live="polite" style={{ marginTop: 10, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', minHeight: 20 }}>
          {status ?? (dirty ? 'Ordre modifié — pensez à enregistrer.' : '')}
        </p>
      </section>

      <div className="admin-table">
        <div className="admin-table__head" style={{ gridTemplateColumns: HEAD_COLS }}>
          <span>Position</span>
          <span>Produit</span>
          <span className="admin-hide-sm">Classement</span>
          <span style={{ textAlign: 'right' }}>Déplacer</span>
        </div>
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`admin-row admin-order-row${draggingId === item.id ? ' is-dragging' : ''}${item.hidden ? ' is-dim' : ''}`}
            style={{ gridTemplateColumns: HEAD_COLS }}
            draggable
            onDragStart={(e) => {
              setDraggingId(item.id);
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', item.id);
            }}
            onDragEnter={() => {
              if (draggingId && draggingId !== item.id) moveItem(draggingId, index);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDraggingId(null);
              setStatus(null);
            }}
            onDragEnd={() => setDraggingId(null)}
          >
            <div className="admin-order-pos">
              <GripVertical size={16} aria-hidden />
              <span>{index + 1}</span>
            </div>
            <div className="admin-namecell">
              <span className="admin-thumb">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" />
                ) : (
                  <span>{item.name.slice(0, 2).toUpperCase()}</span>
                )}
              </span>
              <div className="admin-cell">
                <div className="admin-cell-strong">{item.name}</div>
                <div className="admin-cell-sub">
                  {item.sku ?? 'Personnalisé'}
                  {item.hidden ? (
                    <>
                      {' · '}
                      <EyeOff size={11} style={{ verticalAlign: '-1px' }} /> masqué
                    </>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="admin-cell-muted admin-hide-sm">
              {isAllProducts
                ? 'Mis en avant'
                : item.origin === 'manual'
                  ? 'Manuel'
                  : item.origin === 'extra'
                    ? 'Aussi ici'
                    : 'Automatique'}
            </div>
            <div className="admin-order-actions">
              <button
                className={`admin-toggle ${item.pinned ? 'admin-toggle--on' : 'admin-toggle--off'}`}
                onClick={() => togglePin(item)}
                disabled={pending}
                title={
                  item.pinned
                    ? 'Retirer de la tête de « Tous les produits »'
                    : 'Mettre en avant dans « Tous les produits »'
                }
                aria-label={
                  item.pinned
                    ? `Retirer ${item.name} de la mise en avant`
                    : `Mettre ${item.name} en avant`
                }
              >
                {item.pinned ? <Star size={14} /> : <StarOff size={14} />}
              </button>
              <button
                className="admin-toggle admin-toggle--off"
                onClick={() => nudge(index, -1)}
                disabled={index === 0}
                aria-label={`Monter ${item.name}`}
              >
                <ChevronUp size={14} />
              </button>
              <button
                className="admin-toggle admin-toggle--off"
                onClick={() => nudge(index, 1)}
                disabled={index === items.length - 1}
                aria-label={`Descendre ${item.name}`}
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 ? (
          <div className="admin-empty">
            {isAllProducts
              ? 'Aucun produit mis en avant. Étoilez un produit depuis une sous-catégorie pour l’ajouter ici.'
              : 'Aucun produit dans cette sous-catégorie.'}
          </div>
        ) : null}
      </div>
    </div>
  );
}

const HEAD_COLS = '84px 3fr 1.2fr auto';
