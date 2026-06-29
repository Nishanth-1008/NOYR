/**
 * lib/catalog.ts
 * Client-side localStorage store for products + collections.
 * Mirrors the lib/orders.ts pattern so admin edits are instant
 * and survive a page refresh without Supabase being configured.
 *
 * On first load the store seeds itself from data/products.ts so the
 * admin always has something to work with out of the box.
 */

import { Product, Collection, Variant } from '@/types';
import { products as SEED_PRODUCTS, collections as SEED_COLLECTIONS } from '@/data/products';

const PRODUCTS_KEY   = 'noyr_catalog_products';
const COLLECTIONS_KEY = 'noyr_catalog_collections';

/* ─── helpers ─────────────────────────────────────────────────────── */

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function writeJSON<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function slug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/* ─── products ────────────────────────────────────────────────────── */

export function getLocalProducts(): Product[] {
  const stored = readJSON<Product[] | null>(PRODUCTS_KEY, null);
  if (!stored) {
    writeJSON(PRODUCTS_KEY, SEED_PRODUCTS);
    return SEED_PRODUCTS;
  }
  return stored;
}

export function saveLocalProducts(products: Product[]): void {
  writeJSON(PRODUCTS_KEY, products);
}

export function createLocalProduct(data: Omit<Product, 'id' | 'variants'>): Product {
  const products = getLocalProducts();
  const product: Product = {
    ...data,
    id: `prod-${uid()}`,
    slug: data.slug || slug(data.title),
    variants: [],
  };
  saveLocalProducts([...products, product]);
  return product;
}

export function updateLocalProduct(id: string, changes: Partial<Product>): Product | null {
  const products = getLocalProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  const updated = { ...products[idx], ...changes };
  products[idx] = updated;
  saveLocalProducts(products);
  return updated;
}

export function deleteLocalProduct(id: string): boolean {
  const products = getLocalProducts();
  const next = products.filter(p => p.id !== id);
  if (next.length === products.length) return false;
  saveLocalProducts(next);
  return true;
}

/* ─── collections ─────────────────────────────────────────────────── */

export function getLocalCollections(): Collection[] {
  const stored = readJSON<Collection[] | null>(COLLECTIONS_KEY, null);
  if (!stored) {
    writeJSON(COLLECTIONS_KEY, SEED_COLLECTIONS);
    return SEED_COLLECTIONS;
  }
  return stored;
}

export function saveLocalCollections(collections: Collection[]): void {
  writeJSON(COLLECTIONS_KEY, collections);
}

export function createLocalCollection(data: Partial<Collection>): Collection {
  const collections = getLocalCollections();
  const title = data.title ?? 'New Collection';
  const collection: Collection = {
    id: `col-${uid()}`,
    title,
    slug: data.slug || slug(title),
    hero_text: data.hero_text ?? '',
    banner_image: data.banner_image ?? '',
    description: data.description ?? '',
  };
  saveLocalCollections([...collections, collection]);
  return collection;
}

export function updateLocalCollection(id: string, changes: Partial<Collection>): Collection | null {
  const collections = getLocalCollections();
  const idx = collections.findIndex(c => c.id === id);
  if (idx === -1) return null;
  const updated = { ...collections[idx], ...changes };
  collections[idx] = updated;
  saveLocalCollections(collections);
  return updated;
}

export function deleteLocalCollection(id: string): boolean {
  const collections = getLocalCollections();
  const next = collections.filter(c => c.id !== id);
  if (next.length === collections.length) return false;
  saveLocalCollections(next);
  return true;
}

/* ─── variants ────────────────────────────────────────────────────── */

export function addVariantToProduct(productId: string, data: Omit<Variant, 'id' | 'product_id'>): Variant | null {
  const products = getLocalProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx === -1) return null;
  const variant: Variant = {
    ...data,
    id: `v-${uid()}`,
    product_id: productId,
  };
  products[idx] = { ...products[idx], variants: [...products[idx].variants, variant] };
  saveLocalProducts(products);
  return variant;
}

export function updateVariantStock(productId: string, variantId: string, stock: number): boolean {
  const products = getLocalProducts();
  const pIdx = products.findIndex(p => p.id === productId);
  if (pIdx === -1) return false;
  const vIdx = products[pIdx].variants.findIndex(v => v.id === variantId);
  if (vIdx === -1) return false;
  products[pIdx].variants[vIdx] = { ...products[pIdx].variants[vIdx], stock };
  saveLocalProducts(products);
  return true;
}

export function updateVariant(productId: string, variantId: string, changes: Partial<Variant>): boolean {
  const products = getLocalProducts();
  const pIdx = products.findIndex(p => p.id === productId);
  if (pIdx === -1) return false;
  const vIdx = products[pIdx].variants.findIndex(v => v.id === variantId);
  if (vIdx === -1) return false;
  products[pIdx].variants[vIdx] = { ...products[pIdx].variants[vIdx], ...changes };
  saveLocalProducts(products);
  return true;
}

export function deleteVariant(productId: string, variantId: string): boolean {
  const products = getLocalProducts();
  const pIdx = products.findIndex(p => p.id === productId);
  if (pIdx === -1) return false;
  const before = products[pIdx].variants.length;
  products[pIdx] = {
    ...products[pIdx],
    variants: products[pIdx].variants.filter(v => v.id !== variantId),
  };
  if (products[pIdx].variants.length === before) return false;
  saveLocalProducts(products);
  return true;
}
