'use client';

import { useEffect, useRef } from 'react';
import { CartItem } from '@/types';

const ABANDON_DELAY_MS = 30 * 60 * 1000; // 30 minutes
const STORAGE_KEY = 'noyr_cart_email_captured';

/**
 * Fires an abandoned-cart email if the user has items in cart
 * and doesn't complete checkout within ABANDON_DELAY_MS.
 */
export function useAbandonedCart(items: CartItem[], customerEmail?: string) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (items.length === 0) return;

    const email = customerEmail ?? (typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY)
      : null);

    if (!email) return;

    timerRef.current = setTimeout(async () => {
      try {
        await fetch('/api/abandoned-cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            items: items.map(i => ({
              title: i.product.title,
              size: i.variant.size,
              quantity: i.quantity,
              price: i.variant.price,
              slug: i.product.slug,
            })),
          }),
        });
      } catch {
        // Silently fail — cart reminder is best-effort
      }
    }, ABANDON_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [items, customerEmail]);
}

/** Call this when user enters their email at checkout */
export function captureCartEmail(email: string) {
  try {
    localStorage.setItem(STORAGE_KEY, email);
  } catch {}
}

/** Call this on successful order to clear the captured email */
export function clearCartEmail() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
