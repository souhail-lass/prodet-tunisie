'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Search } from 'lucide-react';
import type { AcademyFamily, AcademyFamilyKey, AcademyProduct } from '../types';
import { ProductDetail } from './product-detail';
import { CommandPalette } from './command-palette';

type Lang = 'fr' | 'en';
const t = (lang: Lang, fr: string, en: string) => (lang === 'en' ? en : fr);

export function GammeWorkspace({
  products,
  families,
}: {
  products: AcademyProduct[];
  families: AcademyFamily[];
}) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('fr');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [cmdk, setCmdk] = useState(false);

  const familiesByKey = useMemo(() => {
    const map = {} as Record<AcademyFamilyKey, AcademyFamily>;
    for (const f of families) map[f.key] = f;
    return map;
  }, [families]);

  const reformCount = useMemo(() => products.filter((p) => p.reform).length, [products]);

  // Filtered products keep their original index (selection is index-stable).
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .map((p, i) => ({ p, i }))
      .filter(({ p }) =>
        q === '' ||
        [p.n, p.d_fr, p.d_en, p.cl_fr, p.cl_en, p.lo_fr, p.lo_en].join(' ').toLowerCase().includes(q),
      );
  }, [products, query]);

  // Group filtered products by family, preserving the families prop order.
  const groups = useMemo(
    () =>
      families
        .map((f) => ({ family: f, items: filtered.filter(({ p }) => p.f === f.key) }))
        .filter((g) => g.items.length > 0),
    [families, filtered],
  );

  // Desktop: open on the first product so the workspace is never empty.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 861px)').matches) {
      setSelected((cur) => (cur === null ? 0 : cur));
    }
  }, []);

  // ⌘K / Ctrl-K opens the command palette.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdk(true);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  async function lock() {
    await fetch('/api/academy/unlock', { method: 'DELETE' }).catch(() => {});
    router.refresh();
  }

  function pick(index: number) {
    setSelected(index);
    setCmdk(false);
  }

  const current = selected !== null ? products[selected] : null;

  return (
    <div className={`gamme${selected !== null ? ' has-selection' : ''}`}>
      <aside className="gamme__rail">
        <div className="gamme__railhead">
          <div className="gamme-search">
            <Search size={16} aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(lang, 'Rechercher…', 'Search…')}
              aria-label={t(lang, 'Rechercher un produit', 'Search a product')}
            />
            <button type="button" className="academy-lang" onClick={() => setCmdk(true)} aria-label="Recherche rapide" style={{ padding: 0, background: 'none' }}>
              <kbd>⌘K</kbd>
            </button>
          </div>
          <div className="gamme__railmeta">
            <span className="gamme__count">{filtered.length} {t(lang, 'produits', 'products')}</span>
            <span className="gamme__count" style={{ color: '#d9941f' }}>● {reformCount} {t(lang, 'reformulés', 'reformulated')}</span>
          </div>
        </div>

        <div className="gamme__list">
          {groups.length === 0 ? (
            <div className="gamme-empty">{t(lang, 'Aucun produit ne correspond.', 'No product matches.')}</div>
          ) : (
            groups.map((g) => (
              <div className="gamme-group" key={g.family.key}>
                <div className="gamme-group__label">
                  <span aria-hidden>{g.family.emoji}</span> {lang === 'en' ? g.family.en : g.family.fr}
                </div>
                {g.items.map(({ p, i }) => (
                  <button
                    key={p.n}
                    type="button"
                    className={`gamme-item${selected === i ? ' on' : ''}`}
                    onClick={() => setSelected(i)}
                    aria-pressed={selected === i}
                  >
                    <span className="gamme-item__emoji" style={{ background: g.family.col }} aria-hidden>{g.family.emoji}</span>
                    <span className="gamme-item__body">
                      <span className="gamme-item__name">
                        {p.n}
                        {p.note_fr ? <span className="gamme-item__dot" title={t(lang, 'Reformulation', 'Reformulation')} /> : null}
                      </span>
                      <span className="gamme-item__sub">{lang === 'en' ? p.d_en : p.d_fr}</span>
                    </span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </aside>

      <section className="gamme__detail">
        <button type="button" className="gamme__back" onClick={() => setSelected(null)}>
          <ArrowLeft size={15} aria-hidden /> {t(lang, 'Tous les produits', 'All products')}
        </button>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 8 }}>
          <div className="academy-lang" role="group" aria-label="Langue">
            <button className={lang === 'fr' ? 'on' : ''} onClick={() => setLang('fr')} type="button" aria-pressed={lang === 'fr'}>FR</button>
            <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')} type="button" aria-pressed={lang === 'en'}>EN</button>
          </div>
          <button type="button" className="academy-lock-btn" onClick={lock}>
            <Lock size={14} aria-hidden /> {t(lang, 'Verrouiller', 'Lock')}
          </button>
        </div>

        {current ? (
          <ProductDetail product={current} family={familiesByKey[current.f]} lang={lang} />
        ) : (
          <div className="gamme-empty" style={{ padding: '60px 20px' }}>
            {t(lang, '← Choisis un produit dans la liste', '← Pick a product from the list')}
          </div>
        )}
      </section>

      {cmdk ? (
        <CommandPalette
          products={products}
          families={familiesByKey}
          lang={lang}
          onSelect={pick}
          onClose={() => setCmdk(false)}
        />
      ) : null}
    </div>
  );
}
