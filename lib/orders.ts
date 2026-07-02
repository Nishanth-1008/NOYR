/**
 * Order helpers — works with both localStorage (MVP) and Supabase (Phase 2).
 * When NEXT_PUBLIC_SUPABASE_URL is set, we use Supabase; otherwise localStorage.
 */
import { Order } from '@/types';

const STORAGE_KEY = 'noyr_orders';
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'noyr2025';

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

function writeLocalOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(orders)); } catch {}
}

// ─── Supabase-backed fetch (admin uses this) ─────────────────────────────────

/**
 * Normalizes a Supabase order row (with nested order_items / payments)
 * into the flat Order shape the rest of the app expects.
 */
export function normalizeSupabaseOrder(row: any): Order {
  return {
    id: row.id,
    customer_name: row.customer_name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    city: row.city,
    pincode: row.pincode,
    total: Number(row.total),
    status: row.status,
    payment_status: row.payment_status,
    items: (row.order_items ?? []).map((i: any) => ({
      id: i.id,
      order_id: i.order_id,
      product_id: i.product_id,
      product_title: i.product_title,
      variant_id: i.variant_id,
      size: i.size,
      quantity: i.quantity,
      unit_price: Number(i.unit_price),
    })),
    payment: row.payments?.[0]
      ? {
          id: row.payments[0].id,
          order_id: row.payments[0].order_id,
          payment_method: row.payments[0].payment_method,
          transaction_id: row.payments[0].transaction_id,
          screenshot_url: row.payments[0].screenshot_url ?? undefined,
          verified: row.payments[0].verified,
        }
      : undefined,
    created_at: row.created_at,
    notes: row.notes ?? undefined,
    tracking_id: row.tracking_id ?? undefined,
  };
}

/**
 * Fetches orders from Supabase (via the admin API route) when configured,
 * keeping localStorage in sync as a cache/fallback. Falls back to
 * localStorage-only data if Supabase isn't configured or the request fails.
 */
export async function fetchOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api/orders', {
      headers: { 'x-admin-key': ADMIN_KEY },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      const orders = data.map(normalizeSupabaseOrder);
      writeLocalOrders(orders);
      return orders;
    }
  } catch {
    // Supabase not configured, or request failed — fall back to local cache
  }
  return getLocalOrders();
}

// ─── ID generation ───────────────────────────────────────────────────────────

export function generateOrderId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'ORD-';
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}
