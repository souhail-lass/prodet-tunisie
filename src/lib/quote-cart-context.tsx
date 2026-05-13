'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Product, ProductCategory } from '@/types/product';

const STORAGE_KEY = 'prodet_quote_selection_v1';
const MAX_QUANTITY = 9999;

export type QuoteSelectionProduct = {
  productId: string;
  slug?: string;
  productName: string;
  imageUrl?: string;
  category?: ProductCategory;
  format?: string;
};

export type QuoteSelectionItem = QuoteSelectionProduct & {
  quantity: number;
};

type QuoteSelectionContextType = {
  items: Map<string, QuoteSelectionItem>;
  addProduct: (product: QuoteSelectionProduct, quantity?: number) => void;
  setProductQuantity: (product: QuoteSelectionProduct, quantity: number) => void;
  setQuantity: (productId: string, productName: string, quantity: number) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  removeProduct: (productId: string) => void;
  getQuantity: (productId: string) => number;
  totalItems: number;
  totalProducts: number;
  clearSelection: () => void;
  clearCart: () => void;
};

const QuoteSelectionContext = createContext<QuoteSelectionContextType | null>(null);

export function QuoteSelectionProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Map<string, QuoteSelectionItem>>(() => new Map());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(STORAGE_KEY);
      const storedItems = parseStoredItems(storedValue);
      if (storedItems.length > 0) {
        setItems(new Map(storedItems.map((item) => [item.productId, item])));
      }
    } catch {
      // localStorage can be unavailable in private or restricted browsing contexts.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...items.values()]));
    } catch {
      // Persistence is best-effort; the in-memory selection still works for this session.
    }
  }, [hydrated, items]);

  const setProductQuantity = useCallback(
    (product: QuoteSelectionProduct, quantity: number) => {
      const nextQuantity = clampQuantity(quantity);

      setItems((current) => {
        const next = new Map(current);

        if (nextQuantity <= 0) {
          next.delete(product.productId);
        } else {
          next.set(product.productId, {
            ...current.get(product.productId),
            ...product,
            quantity: nextQuantity,
          });
        }

        return next;
      });
    },
    [],
  );

  const addProduct = useCallback((product: QuoteSelectionProduct, quantity = 1) => {
    const quantityToAdd = clampQuantity(quantity);
    if (quantityToAdd <= 0) return;

    setItems((current) => {
      const currentItem = current.get(product.productId);
      const nextQuantity = clampQuantity((currentItem?.quantity ?? 0) + quantityToAdd);
      const next = new Map(current);

      next.set(product.productId, {
        ...currentItem,
        ...product,
        quantity: nextQuantity,
      });

      return next;
    });
  }, []);

  const setQuantity = useCallback(
    (productId: string, productName: string, quantity: number) => {
      setProductQuantity({ productId, productName }, quantity);
    },
    [setProductQuantity],
  );

  const incrementQuantity = useCallback((productId: string) => {
    setItems((current) => {
      const currentItem = current.get(productId);
      if (!currentItem) return current;

      const next = new Map(current);
      next.set(productId, {
        ...currentItem,
        quantity: clampQuantity(currentItem.quantity + 1),
      });
      return next;
    });
  }, []);

  const decrementQuantity = useCallback((productId: string) => {
    setItems((current) => {
      const currentItem = current.get(productId);
      if (!currentItem) return current;

      const next = new Map(current);
      const nextQuantity = clampQuantity(currentItem.quantity - 1);

      if (nextQuantity <= 0) {
        next.delete(productId);
      } else {
        next.set(productId, {
          ...currentItem,
          quantity: nextQuantity,
        });
      }

      return next;
    });
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setItems((current) => {
      const next = new Map(current);
      next.delete(productId);
      return next;
    });
  }, []);

  const getQuantity = useCallback(
    (productId: string) => items.get(productId)?.quantity ?? 0,
    [items],
  );

  const clearSelection = useCallback(() => {
    setItems(new Map());
  }, []);

  const totalItems = useMemo(
    () => [...items.values()].reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      addProduct,
      setProductQuantity,
      setQuantity,
      incrementQuantity,
      decrementQuantity,
      removeProduct,
      getQuantity,
      totalItems,
      totalProducts: items.size,
      clearSelection,
      clearCart: clearSelection,
    }),
    [
      addProduct,
      clearSelection,
      decrementQuantity,
      getQuantity,
      incrementQuantity,
      items,
      removeProduct,
      setProductQuantity,
      setQuantity,
      totalItems,
    ],
  );

  return <QuoteSelectionContext.Provider value={value}>{children}</QuoteSelectionContext.Provider>;
}

export function useQuoteSelection() {
  const value = useContext(QuoteSelectionContext);

  if (!value) {
    throw new Error('useQuoteSelection must be used inside QuoteSelectionProvider.');
  }

  return value;
}

export function toQuoteSelectionProduct(product: Pick<Product, 'id' | 'slug' | 'name' | 'image' | 'category' | 'formats'>): QuoteSelectionProduct {
  return {
    productId: product.id,
    slug: product.slug,
    productName: product.name,
    imageUrl: product.image,
    category: product.category,
    format: product.formats[0]?.label,
  };
}

export const QuoteCartProvider = QuoteSelectionProvider;
export const useQuoteCart = useQuoteSelection;
export type QuoteCartItem = QuoteSelectionItem;

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 0;
  return Math.max(0, Math.min(MAX_QUANTITY, Math.trunc(quantity)));
}

function parseStoredItems(storedValue: string | null): QuoteSelectionItem[] {
  if (!storedValue) return [];

  try {
    const parsedValue: unknown = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) return [];

    return parsedValue
      .map((item) => normalizeStoredItem(item))
      .filter((item): item is QuoteSelectionItem => Boolean(item));
  } catch {
    return [];
  }
}

function normalizeStoredItem(item: unknown): QuoteSelectionItem | null {
  if (!item || typeof item !== 'object') return null;

  const candidate = item as Partial<QuoteSelectionItem>;
  if (typeof candidate.productId !== 'string' || typeof candidate.productName !== 'string') {
    return null;
  }

  const quantity = clampQuantity(Number(candidate.quantity));
  if (quantity <= 0) return null;

  return {
    productId: candidate.productId,
    slug: typeof candidate.slug === 'string' ? candidate.slug : undefined,
    productName: candidate.productName,
    imageUrl: typeof candidate.imageUrl === 'string' ? candidate.imageUrl : undefined,
    category: isProductCategory(candidate.category) ? candidate.category : undefined,
    format: typeof candidate.format === 'string' ? candidate.format : undefined,
    quantity,
  };
}

function isProductCategory(value: unknown): value is ProductCategory {
  return value === 'manufactured' || value === 'commercialized';
}
