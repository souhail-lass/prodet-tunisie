'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Search } from 'lucide-react';
import type { AcademyFamily, AcademyFamilyKey, AcademyProduct } from '../types';

type Lang = 'fr' | 'en';

export function CommandPalette({
  products,
  families,
  lang,
  onSelect,
  onClose,
}: {
  products: AcademyProduct[];
  families: Record<AcademyFamilyKey, AcademyFamily>;
  lang: Lang;
  onSelect: (index: number) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return products
      .map((p, i) => ({ p, i }))
      .filter(({ p }) =>
        needle === '' ||
        [p.n, p.d_fr, p.d_en, p.lo_fr, p.lo_en, families[p.f].fr, families[p.f].en]
          .join(' ')
          .toLowerCase()
          .includes(needle),
      );
  }, [products, families, q]);

  useEffect(() => {
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    setActive(0);
  }, [q]);

  function onKey(e: ReactKeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const hit = results[active];
      if (hit) onSelect(hit.i);
    }
  }

  useEffect(() => {
    listRef.current?.querySelector('.cmdk__item.on')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  return (
    <div className="cmdk-bg" onClick={onClose}>
      <div className="cmdk" role="dialog" aria-modal="true" aria-label="Recherche produits" onClick={(e) => e.stopPropagation()} onKeyDown={onKey}>
        <div className="cmdk__input">
          <Search size={18} aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={lang === 'en' ? 'Search a product…' : 'Rechercher un produit…'}
            aria-label={lang === 'en' ? 'Search a product' : 'Rechercher un produit'}
          />
        </div>
        <div className="cmdk__list" ref={listRef}>
          {results.length === 0 ? (
            <div className="cmdk__empty">{lang === 'en' ? 'No match.' : 'Aucun résultat.'}</div>
          ) : (
            results.map(({ p, i }, idx) => {
              const fam = families[p.f];
              return (
                <div
                  key={p.n}
                  className={`cmdk__item${idx === active ? ' on' : ''}`}
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => onSelect(i)}
                >
                  <span className="cmdk__item-emoji" style={{ background: fam.col }} aria-hidden>{fam.emoji}</span>
                  <span className="cmdk__item-name">{p.n}</span>
                  <span className="cmdk__item-fam">{lang === 'en' ? fam.en : fam.fr}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
