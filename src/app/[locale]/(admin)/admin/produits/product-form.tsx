'use client';

import { useRef, useState, useTransition } from 'react';
import { ArrowLeft, FileText, Plus, Save, Star, Trash2, Upload, X } from 'lucide-react';
import { Button, ConfirmDialog, Input, Textarea } from '@/components/ds';
import { Link, useRouter } from '@/i18n/routing';
import type { ProductSpec } from '@/types/product';
import { createProductAction, deleteProductAction, saveProductAction, uploadAssetAction } from './actions';

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
};

export function ProductForm({ initial }: { initial: ProductFormInitial }) {
  const router = useRouter();
  const [f, setF] = useState<ProductFormInitial>({ ...initial, specs: initial.specs.length ? initial.specs : [] });
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState<'sheet' | 'safety' | 'image' | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const sheetInput = useRef<HTMLInputElement>(null);
  const safetyInput = useRef<HTMLInputElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProductFormInitial>(k: K, v: ProductFormInitial[K]) => setF((p) => ({ ...p, [k]: v }));

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
    startTransition(async () => {
      if (f.id) await saveProductAction(f.id, content);
      else await createProductAction(content);
      router.push('/admin/produits');
      router.refresh();
    });
  }

  function remove() {
    if (!f.id) return;
    setConfirmingDelete(false);
    startTransition(async () => {
      await deleteProductAction({ id: f.id! });
      router.push('/admin/produits');
      router.refresh();
    });
  }

  const previewImage = f.imageUrl || f.baseImageUrl;

  return (
    <div className="dash" style={{ maxWidth: 820 }}>
      <Link href="/admin/produits" className="ghost-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <ArrowLeft size={15} /> Retour au catalogue
      </Link>

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
