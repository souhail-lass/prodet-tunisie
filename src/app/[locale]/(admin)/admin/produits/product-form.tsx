'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowLeft, ArrowUpDown, FileText, Plus, Save, Star, Trash2, Upload, X } from 'lucide-react';
import { Button, ConfirmDialog, Input, Textarea } from '@/components/ds';
import {
  assignableSousCategorieSlugs,
  curationFamilleIds,
  isFamilleId,
  resolvePlacement,
  type FamilleId,
} from '@/data/familles';
import { familleLabel, sousCategorieLabel } from '@/data/famille-labels';
import { sanitizeExtraPlacements, type ExtraPlacement } from '@/features/catalogue/placement';
import { localePrefixedPath } from '@/lib/admin-catalogue-query';
import type { ProductSpec } from '@/types/product';
import {
  createProductAction,
  deleteProductAction,
  saveProductAction,
  setProductPlacementAction,
  uploadAssetAction,
} from './actions';

export type ProductFormInitial = {
  id?: string;
  isCustom: boolean;
  name: string;
  sku: string;
  baseCategory: string;
  baseImageUrl: string;
  displayName: string;
  tagline: string;
  description: string;
  howToUse: string;
  dosage: string;
  specs: ProductSpec[];
  technicalSheetUrl: string;
  safetySheetUrl: string;
  imageUrl: string;
  hidden: boolean;
  featured: boolean;
  /** '' = automatique (le classifieur décide). */
  familleSlug: string;
  sousCategorieSlug: string;
  extraPlacements: ExtraPlacement[];
};

export function ProductForm({
  initial,
  listHref = '/admin/produits',
  rangementHref = '/admin/produits/rangement',
}: {
  initial: ProductFormInitial;
  listHref?: string;
  rangementHref?: string;
}) {
  const router = useRouter();
  const locale = useLocale();
  const [f, setF] = useState<ProductFormInitial>({ ...initial, specs: initial.specs.length ? initial.specs : [] });
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState<'sheet' | 'safety' | 'image' | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [placementError, setPlacementError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const sheetInput = useRef<HTMLInputElement>(null);
  const safetyInput = useRef<HTMLInputElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProductFormInitial>(k: K, v: ProductFormInitial[K]) => setF((p) => ({ ...p, [k]: v }));

  const classifiedName = f.displayName.trim() || f.name.trim();
  const auto = useMemo(
    () => resolvePlacement({ name: classifiedName, baseCategory: f.baseCategory || null }),
    [classifiedName, f.baseCategory],
  );
  const placement = useMemo(
    () =>
      resolvePlacement({
        name: classifiedName,
        baseCategory: f.baseCategory || null,
        familleSlug: f.familleSlug || null,
        sousCategorieSlug: f.sousCategorieSlug || null,
      }),
    [classifiedName, f.baseCategory, f.familleSlug, f.sousCategorieSlug],
  );
  const sousCategorieOptions = assignableSousCategorieSlugs(placement.familleId);

  // Changing the famille invalidates a sous-catégorie that belongs elsewhere;
  // the server cascades the same way, this only keeps the form honest.
  function pickFamille(value: string) {
    const nextFamille: FamilleId | null = isFamilleId(value) ? value : null;
    setF((p) => {
      const stillValid =
        nextFamille != null &&
        p.sousCategorieSlug !== '' &&
        assignableSousCategorieSlugs(nextFamille).includes(p.sousCategorieSlug);
      const next = { ...p, familleSlug: value, sousCategorieSlug: stillValid ? p.sousCategorieSlug : '' };
      const home = resolvePlacement({
        name: next.displayName.trim() || next.name.trim(),
        baseCategory: next.baseCategory || null,
        familleSlug: next.familleSlug || null,
        sousCategorieSlug: next.sousCategorieSlug || null,
      });
      return { ...next, extraPlacements: sanitizeExtraPlacements(next.extraPlacements, home) };
    });
  }

  function toggleExtra(familleSlug: FamilleId, sousCategorieSlug: string, checked: boolean) {
    setF((p) => {
      const extraPlacements = checked
        ? [...p.extraPlacements, { familleSlug, sousCategorieSlug, sortOrder: null }]
        : p.extraPlacements.filter(
            (extra) => extra.familleSlug !== familleSlug || extra.sousCategorieSlug !== sousCategorieSlug,
          );
      return { ...p, extraPlacements: sanitizeExtraPlacements(extraPlacements, placement) };
    });
  }

  function extrasChanged() {
    const a = sanitizeExtraPlacements(f.extraPlacements, placement);
    const b = sanitizeExtraPlacements(initial.extraPlacements, placement);
    const key = (extra: ExtraPlacement) => `${extra.familleSlug}/${extra.sousCategorieSlug}:${extra.sortOrder ?? ''}`;
    return a.map(key).sort().join('|') !== b.map(key).sort().join('|');
  }

  async function savePlacement(productId: string) {
    if (
      f.familleSlug === initial.familleSlug &&
      f.sousCategorieSlug === initial.sousCategorieSlug &&
      !extrasChanged()
    ) {
      return true;
    }
    const r = await setProductPlacementAction({
      id: productId,
      familleSlug: f.familleSlug || null,
      sousCategorieSlug: f.sousCategorieSlug || null,
      extraPlacements: sanitizeExtraPlacements(f.extraPlacements, placement),
    });
    if (!r.ok) {
      setPlacementError(
        r.error === 'forbidden'
          ? 'Changement de famille refusé : rôle propriétaire ou admin requis.'
          : 'Le classement n’a pas pu être enregistré.',
      );
      return false;
    }
    return true;
  }

  async function upload(file: File, kind: 'sheet' | 'safety' | 'image') {
    const MAX = 10 * 1024 * 1024;
    setUploadError(null);
    if (file.size > MAX) {
      setUploadError(`Fichier trop volumineux (${(file.size / 1048576).toFixed(1)} Mo). Maximum 10 Mo.`);
      return;
    }
    setUploading(kind);
    try {
      const fd = new FormData();
      fd.set('file', file);
      fd.set('kind', kind);
      fd.set('productId', f.id ?? 'new');
      const r = await uploadAssetAction(fd);
      if (r.ok)
        set(
          kind === 'sheet' ? 'technicalSheetUrl' : kind === 'safety' ? 'safetySheetUrl' : 'imageUrl',
          r.url,
        );
      else setUploadError('Échec du téléversement : ' + (r.error === 'too-large' ? 'fichier trop volumineux (max 10 Mo)' : r.error));
    } catch {
      setUploadError('Échec du téléversement. Vérifiez la taille du fichier (max 10 Mo) et réessayez.');
    } finally {
      setUploading(null);
    }
  }

  function save() {
    const content = {
      displayName: f.displayName.trim() || null,
      tagline: f.tagline.trim() || null,
      description: f.description.trim() || null,
      howToUse: f.howToUse.trim() || null,
      dosage: f.dosage.trim() || null,
      specs: f.specs.filter((s) => s.label.trim() || s.value.trim()),
      technicalSheetUrl: f.technicalSheetUrl || null,
      safetySheetUrl: f.safetySheetUrl || null,
      imageUrl: f.imageUrl || null,
      hidden: f.hidden,
      featured: f.featured,
      ...(f.isCustom ? { name: f.name.trim() || 'Produit', sku: f.sku.trim() || null, baseCategory: f.baseCategory.trim() || null } : {}),
    };
    setPlacementError(null);
    startTransition(async () => {
      let productId = f.id;
      if (productId) await saveProductAction(productId, content);
      else productId = (await createProductAction(content)).id;
      if (productId && !(await savePlacement(productId))) return;
      router.push(localePrefixedPath(locale, listHref));
      router.refresh();
    });
  }

  function remove() {
    if (!f.id) return;
    setConfirmingDelete(false);
    startTransition(async () => {
      await deleteProductAction({ id: f.id! });
      router.push(localePrefixedPath(locale, listHref));
      router.refresh();
    });
  }

  const previewImage = f.imageUrl || f.baseImageUrl;

  return (
    <div className="dash" style={{ maxWidth: 820 }}>
      <a href={localePrefixedPath(locale, listHref)} className="ghost-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <ArrowLeft size={15} /> Retour au catalogue
      </a>

      {/* Identité */}
      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Identité</h2>
          {f.isCustom ? <span className="pds-badge">Produit personnalisé</span> : <span className="pds-badge">Swiver · {f.sku}</span>}
        </div>
        {f.isCustom ? (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
            <Input label="Nom du produit" value={f.name} onChange={(e) => set('name', e.target.value)} />
            <Input label="Référence (SKU)" value={f.sku} onChange={(e) => set('sku', e.target.value)} />
            <Input label="Catégorie" value={f.baseCategory} onChange={(e) => set('baseCategory', e.target.value)} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
            <Input label="Nom affiché (laisser vide = nom Swiver)" placeholder={f.name} value={f.displayName} onChange={(e) => set('displayName', e.target.value)} />
            <div>
              <div style={labelStyle}>Nom Swiver</div>
              <div style={{ marginTop: 8, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{f.name}</div>
            </div>
          </div>
        )}
        <div style={{ marginTop: 14 }}>
          <Input label="Accroche (tagline)" placeholder="Courte phrase descriptive" value={f.tagline} onChange={(e) => set('tagline', e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className={`admin-toggle ${f.hidden ? 'admin-toggle--off' : 'admin-toggle--on'}`} onClick={() => set('hidden', !f.hidden)}>
            {f.hidden ? 'Masqué du site' : 'Visible sur le site'}
          </button>
          <button className={`admin-toggle ${f.featured ? 'admin-toggle--on' : 'admin-toggle--off'}`} onClick={() => set('featured', !f.featured)}>
            <Star size={13} /> {f.featured ? 'En vedette' : 'Mettre en vedette'}
          </button>
        </div>
      </section>

      {/* Classement */}
      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Classement sur le site</h2>
          <a href={localePrefixedPath(locale, rangementHref)} className="panel__link">
            <ArrowUpDown size={15} /> Ordre des produits
          </a>
        </div>
        <p className="panel__sub">
          « Automatique » laisse le nom du produit décider — c’est ce qui place tout seul les nouveautés
          synchronisées depuis Swiver. Choisissez une valeur pour figer le classement.
        </p>
        {placementError ? (
          <p style={{ marginTop: 10, fontSize: 'var(--text-sm)', color: 'var(--color-danger)', fontWeight: 'var(--fw-medium)' }}>
            {placementError}
          </p>
        ) : null}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
          <div>
            <div style={labelStyle}>Famille</div>
            <select
              className="admin-select"
              style={{ marginTop: 8, width: '100%' }}
              value={f.familleSlug}
              onChange={(e) => pickFamille(e.target.value)}
            >
              <option value="">Automatique — {familleLabel(auto.familleId)}</option>
              {curationFamilleIds.map((id) => (
                <option key={id} value={id}>
                  {familleLabel(id)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div style={labelStyle}>Sous-catégorie</div>
            <select
              className="admin-select"
              style={{ marginTop: 8, width: '100%' }}
              value={f.sousCategorieSlug}
              onChange={(e) => {
                const sousCategorieSlug = e.target.value;
                setF((p) => {
                  const next = { ...p, sousCategorieSlug };
                  const home = resolvePlacement({
                    name: next.displayName.trim() || next.name.trim(),
                    baseCategory: next.baseCategory || null,
                    familleSlug: next.familleSlug || null,
                    sousCategorieSlug: next.sousCategorieSlug || null,
                  });
                  return { ...next, extraPlacements: sanitizeExtraPlacements(next.extraPlacements, home) };
                });
              }}
            >
              <option value="">
                Automatique — {sousCategorieLabel(resolvePlacement({ name: classifiedName, baseCategory: f.baseCategory || null, familleSlug: f.familleSlug || null }).sousCategorieSlug)}
              </option>
              {sousCategorieOptions.map((slug) => (
                <option key={slug} value={slug}>
                  {sousCategorieLabel(slug)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p style={{ marginTop: 12, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Sur le site : {familleLabel(placement.familleId)} › {sousCategorieLabel(placement.sousCategorieSlug)}
        </p>
        <div style={{ marginTop: 18 }}>
          <div style={labelStyle}>Aussi visible dans</div>
          <p className="panel__sub" style={{ marginTop: 6 }}>
            Un produit a un emplacement principal ci-dessus. Cochez d’autres sous-catégories pour qu’il
            apparaisse aussi là — y compris dans une autre famille.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              marginTop: 12,
            }}
          >
            {curationFamilleIds.map((familleId) => (
              <fieldset key={familleId} style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
                <legend
                  style={{
                    ...labelStyle,
                    padding: 0,
                    marginBottom: 8,
                    color: 'var(--text-secondary)',
                    textTransform: 'none',
                    letterSpacing: 0,
                  }}
                >
                  {familleLabel(familleId)}
                </legend>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {assignableSousCategorieSlugs(familleId).map((slug) => {
                    const isHome =
                      placement.familleId === familleId && placement.sousCategorieSlug === slug;
                    const checked =
                      isHome ||
                      f.extraPlacements.some(
                        (extra) => extra.familleSlug === familleId && extra.sousCategorieSlug === slug,
                      );
                    return (
                      <label
                        key={slug}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                          fontSize: 'var(--text-sm)',
                          color: isHome ? 'var(--text-tertiary)' : 'var(--text-primary)',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={isHome}
                          onChange={(e) => toggleExtra(familleId, slug, e.target.checked)}
                          style={{ marginTop: 2 }}
                        />
                        <span>
                          {sousCategorieLabel(slug)}
                          {isHome ? ' — emplacement principal' : ''}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        </div>
      </section>

      {/* Contenu */}
      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Contenu</h2>
        </div>
        <Textarea label="Description" rows={4} value={f.description} onChange={(e) => set('description', e.target.value)} />
        <div style={{ marginTop: 14 }}>
          <Textarea label="Mode d’emploi" rows={3} value={f.howToUse} onChange={(e) => set('howToUse', e.target.value)} />
        </div>
        <div style={{ marginTop: 14 }}>
          <Input label="Dosage" value={f.dosage} onChange={(e) => set('dosage', e.target.value)} />
        </div>
      </section>

      {/* Spécifications */}
      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Spécifications</h2>
          <button className="panel__link" onClick={() => set('specs', [...f.specs, { label: '', value: '' }])}>
            <Plus size={15} /> Ajouter
          </button>
        </div>
        {f.specs.length === 0 ? (
          <p className="panel__sub">Aucune spécification. Ajoutez des paires (ex. « Usage » → « Dégraissage »).</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {f.specs.map((spec, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 10, alignItems: 'center' }}>
                <Input placeholder="Libellé" value={spec.label} onChange={(e) => set('specs', f.specs.map((s, j) => (j === i ? { ...s, label: e.target.value } : s)))} />
                <Input placeholder="Valeur" value={spec.value} onChange={(e) => set('specs', f.specs.map((s, j) => (j === i ? { ...s, value: e.target.value } : s)))} />
                <button className="admin-toggle admin-toggle--off" onClick={() => set('specs', f.specs.filter((_, j) => j !== i))}>
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Image + Fiche technique */}
      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Image &amp; fiche technique</h2>
        </div>
        {uploadError ? (
          <p style={{ marginBottom: 12, fontSize: 'var(--text-sm)', color: 'var(--color-danger)', fontWeight: 'var(--fw-medium)' }}>
            {uploadError}
          </p>
        ) : null}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div>
            <div style={labelStyle}>Image produit</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <span className="admin-thumb" style={{ width: 56, height: 56 }}>
                {previewImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewImage} alt="" />
                ) : (
                  <span>—</span>
                )}
              </span>
              <input ref={imageInput} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], 'image')} />
              <Button variant="outline" size="sm" onClick={() => imageInput.current?.click()} disabled={uploading === 'image'}>
                <Upload size={14} /> {uploading === 'image' ? 'Envoi…' : 'Remplacer'}
              </Button>
              {f.imageUrl ? (
                <button className="ghost-link" onClick={() => set('imageUrl', '')}>
                  <Trash2 size={14} />
                </button>
              ) : null}
            </div>
          </div>
          <div>
            <div style={labelStyle}>Fiche technique (PDF)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              {f.technicalSheetUrl ? (
                <a href={f.technicalSheetUrl} target="_blank" rel="noreferrer" className="ghost-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={15} /> Voir le fichier
                </a>
              ) : (
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Aucune</span>
              )}
              <input ref={sheetInput} type="file" accept=".pdf,.doc,.docx,application/pdf" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], 'sheet')} />
              <Button variant="outline" size="sm" onClick={() => sheetInput.current?.click()} disabled={uploading === 'sheet'}>
                <Upload size={14} /> {uploading === 'sheet' ? 'Envoi…' : 'Téléverser'}
              </Button>
              {f.technicalSheetUrl ? (
                <button className="ghost-link" onClick={() => set('technicalSheetUrl', '')}>
                  <Trash2 size={14} />
                </button>
              ) : null}
            </div>
          </div>
          <div>
            <div style={labelStyle}>Fiche de données de sécurité (FDS)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              {f.safetySheetUrl ? (
                <a href={f.safetySheetUrl} target="_blank" rel="noreferrer" className="ghost-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={15} /> Voir le fichier
                </a>
              ) : (
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Aucune</span>
              )}
              <input ref={safetyInput} type="file" accept=".pdf,.doc,.docx,application/pdf" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], 'safety')} />
              <Button variant="outline" size="sm" onClick={() => safetyInput.current?.click()} disabled={uploading === 'safety'}>
                <Upload size={14} /> {uploading === 'safety' ? 'Envoi…' : 'Téléverser'}
              </Button>
              {f.safetySheetUrl ? (
                <button className="ghost-link" onClick={() => set('safetySheetUrl', '')}>
                  <Trash2 size={14} />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', bottom: 0 }}>
        {f.isCustom && f.id ? (
          <Button variant="outline" onClick={() => setConfirmingDelete(true)} disabled={pending}>
            <Trash2 size={15} /> Supprimer
          </Button>
        ) : (
          <span />
        )}
        <Button variant="primary" size="lg" onClick={save} disabled={pending || uploading != null}>
          <Save size={16} /> {pending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Supprimer ce produit ?"
        message="La suppression est définitive — le produit disparaîtra du site et du catalogue admin."
        confirmLabel="Supprimer"
        cancelLabel="Garder"
        danger
        pending={pending}
        onConfirm={remove}
        onClose={() => setConfirmingDelete(false)}
      />
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--text-xs)',
  color: 'var(--text-tertiary)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  fontWeight: 'var(--fw-semibold)',
};
