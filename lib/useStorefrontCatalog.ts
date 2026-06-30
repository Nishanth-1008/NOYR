'use client';

import { useEffect, useState } from 'react';
import { Product, Collection } from '@/types';
import { products as SEED_PRODUCTS, collections as SEED_COLLECTIONS } from '@/data/products';
import { getLocalProducts, getLocalCollections } from '@/lib/catalog';

/**
 * Resolution order for storefront reads:
 *   1. Supabase (via the public, unauthenticated /api/storefront/* routes)
 *   2. localStorage admin edits (if Supabase isn't configured)
 *   3. Static seed data from data/products.ts (first-ever load, nothing saved yet)
 *
 * This is what actually makes admin edits show up on the live site:
 * previously every storefront page imported `products`/`collections`
 * directly from data/products.ts and never looked at Supabase or
 * localStorage at all, so nothing the admin changed ever appeared.
 */

let cachedProducts: Product[] | null = null;
let cachedCollections: Collection[] | null = null;

export function useStorefrontCatalog() {
  const [products, setProducts] = useState<Product[]>(cachedProducts ?? SEED_PRODUCTS);
  const [collections, setCollections] = useState<Collection[]>(cachedCollections ?? SEED_COLLECTIONS);
  const [loading, setLoading] = useState(cachedProducts === null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch('/api/storefront/products', { cache: 'no-store' }),
          fetch('/api/storefront/collections', { cache: 'no-store' }),
        ]);
        const pJson = await pRes.json();
        const cJson = await cRes.json();

        let nextProducts: Product[];
        let nextCollections: Collection[];

        if (pJson.source === 'supabase' && Array.isArray(pJson.products) && pJson.products.length > 0) {
          nextProducts = pJson.products;
        } else {
          nextProducts = getLocalProducts();
        }

        if (cJson.source === 'supabase' && Array.isArray(cJson.collections) && cJson.collections.length > 0) {
          nextCollections = cJson.collections;
        } else {
          nextCollections = getLocalCollections();
        }

        if (active) {
          cachedProducts = nextProducts;
          cachedCollections = nextCollections;
          setProducts(nextProducts);
          setCollections(nextCollections);
        }
      } catch {
        if (active) {
          setProducts(getLocalProducts());
          setCollections(getLocalCollections());
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, []);

  return { products, collections, loading };
}

export function getProductBySlugFrom(products: Product[], slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getCollectionBySlugFrom(collections: Collection[], slug: string): Collection | undefined {
  return collections.find(c => c.slug === slug);
}

export function getProductsByCollectionFrom(products: Product[], collectionId: string): Product[] {
  return products.filter(p => p.collection_id === collectionId && p.active);
}
