'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartItem, Product, Variant } from '@/types';

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; variant: Variant }
  | { type: 'REMOVE_ITEM'; variantId: string }
  | { type: 'UPDATE_QTY'; variantId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD'; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.findIndex(i => i.variant.id === action.variant.id);
      if (existing >= 0) {
        const items = [...state.items];
        items[existing] = { ...items[existing], quantity: items[existing].quantity + 1 };
        return { items };
      }
      return { items: [...state.items, { product: action.product, variant: action.variant, quantity: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { items: state.items.filter(i => i.variant.id !== action.variantId) };
    case 'UPDATE_QTY': {
      if (action.quantity <= 0) {
        return { items: state.items.filter(i => i.variant.id !== action.variantId) };
      }
      return {
        items: state.items.map(i =>
          i.variant.id === action.variantId ? { ...i, quantity: action.quantity } : i
        ),
      };
    }
    case 'CLEAR_CART':
      return { items: [] };
    case 'LOAD':
      return { items: action.items };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, variant: Variant) => void;
  removeItem: (variantId: string) => void;
  updateQty: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('noyr_cart');
      if (saved) dispatch({ type: 'LOAD', items: JSON.parse(saved) });
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('noyr_cart', JSON.stringify(state.items));
    } catch {}
  }, [state.items]);

  const total = state.items.reduce((sum, i) => sum + i.variant.price * i.quantity, 0);
  const count = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items: state.items,
      addItem: (p, v) => dispatch({ type: 'ADD_ITEM', product: p, variant: v }),
      removeItem: (id) => dispatch({ type: 'REMOVE_ITEM', variantId: id }),
      updateQty: (id, qty) => dispatch({ type: 'UPDATE_QTY', variantId: id, quantity: qty }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
      total,
      count,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
