'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WishlistItem, Product } from '@/types';

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  isWishlisted: () => false,
  count: 0,
});

const STORAGE_KEY = 'noyr_wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  const persist = useCallback((next: WishlistItem[]) => {
    setItems(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const addItem = useCallback((product: Product) => {
    setItems(prev => {
      if (prev.find(i => i.product_id === product.id)) return prev;
      const next = [...prev, {
        product_id: product.id,
        product_slug: product.slug,
        product_title: product.title,
        product_price: product.price,
        added_at: new Date().toISOString(),
      }];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.product_id !== productId);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const isWishlisted = useCallback((productId: string) => {
    return items.some(i => i.product_id === productId);
  }, [items]);

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, isWishlisted, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
