'use client';

import { useSyncExternalStore } from 'react';
import type { PortalProductRef } from '@/features/client-portal/mock/portal-mock';

/**
 * Panier du portail, conservé entre les pages.
 *
 * La corbeille de « Commander » vivait dans un useState : sortir vers Factures
 * puis revenir effaçait toute la sélection. On la garde donc en localStorage,
 * et on la partage avec la barre du haut (badge + retour au panier) via un
 * petit store externe plutôt qu'un provider — le layout du portail est un
 * composant serveur, et ça évite de le transformer pour si peu.
 */
export type PortalCart = {
  /** Quantité par slug produit. */
  qty: Record<string, number>;
  /** Produits ajoutés hors « habituels », pour pouvoir les réafficher. */
  extra: PortalProductRef[];
  /** Ordre de sélection, plus récent d'abord. */
  picked: string[];
};

const STORAGE_KEY = 'prodet.portal.cart.v1';
const EMPTY: PortalCart = { qty: {}, extra: [], picked: [] };

let state: PortalCart = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function read(): PortalCart {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<PortalCart>;
    return {
      qty: parsed.qty && typeof parsed.qty === 'object' ? parsed.qty : {},
      extra: Array.isArray(parsed.extra) ? parsed.extra : [],
      picked: Array.isArray(parsed.picked) ? parsed.picked : [],
    };
  } catch {
    // Stockage indisponible (navigation privée, quota) — panier vide.
    return EMPTY;
  }
}

function ensureHydrated(): void {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  state = read();
}

function emit(): void {
  for (const listener of listeners) listener();
}

export function setPortalCart(next: PortalCart): void {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // On garde l'état en mémoire même si l'écriture échoue.
  }
  emit();
}

export function clearPortalCart(): void {
  setPortalCart({ qty: {}, extra: [], picked: [] });
}

function subscribe(listener: () => void): () => void {
  ensureHydrated();
  listeners.add(listener);
  // Un autre onglet a modifié le panier : on se resynchronise.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    state = read();
    emit();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): PortalCart {
  ensureHydrated();
  return state;
}

/** Snapshot serveur : toujours vide, pour ne pas casser l'hydratation. */
function getServerSnapshot(): PortalCart {
  return EMPTY;
}

export function usePortalCart(): PortalCart {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Nombre de références sélectionnées — alimente le badge de la barre du haut. */
export function usePortalCartCount(): number {
  const cart = usePortalCart();
  return Object.values(cart.qty).filter((n) => n > 0).length;
}
