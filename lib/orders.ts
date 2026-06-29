/**
 * Order helpers — works with both localStorage (MVP) and Supabase (Phase 2).
 * When NEXT_PUBLIC_SUPABASE_URL is set, we use Supabase; otherwise localStorage.
 */
import { Order } from '@/types';

const STORAGE_KEY = 'noyr_orders';

// ─── localStorage helpers ────────────────────────────────────────────────────

export function getLocalOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Order[];
  } catch {
    return [];
  }
}

export function saveLocalOrder(order: Order): void {
  const existing = getLocalOrders();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([order, ...existing]));
}

export function updateLocalOrder(id: string, changes: Partial<Order>): Order | null {
  const orders = getLocalOrders();
  const idx = orders.findIndex(o => o.id === id);
  if (idx < 0) return null;
  orders[idx] = { ...orders[idx], ...changes };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  return orders[idx];
}

export function getLocalOrderById(id: string): Order | null {
  return getLocalOrders().find(o => o.id === id) ?? null;
}

// ─── ID generation ───────────────────────────────────────────────────────────

export function generateOrderId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'ORD-';
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}
