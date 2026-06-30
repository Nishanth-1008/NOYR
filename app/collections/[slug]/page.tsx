'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { useStorefrontCatalog, getCollectionBySlugFrom, getProductsByCollectionFrom } from '@/lib/useStorefrontCatalog';

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const { products, collections, loading } = useStorefrontCatalog();

  const collection = getCollectionBySlugFrom(collections, slug);

  if (!loading && !collection) return notFound();
  if (loading || !collection) {
    return (
      <div className="bg-black min-h-screen pt-24 flex items-center justify-center">
        <p className="text-white/20 text-xs tracking-widest">LOADING…</p>
      </div>
    );
  }

  const colProducts = getProductsByCollectionFrom(products, collection.id);

  return (
    <div className="bg-black min-h-screen pt-24">
      {/* Hero */}
      <div className="relative h-[50vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs tracking-[0.4em] text-white/40 mb-4">NOYR — COLLECTION</p>
            <h1 className="font-display text-6xl md:text-8xl font-black text-white tracking-tight leading-none">
              {collection.title}
            </h1>
            <p className="mt-4 text-white/40 text-sm tracking-[0.2em]">{collection.hero_text}</p>
          </motion.div>
        </div>
      </div>

      {/* Description */}
      <div className="max-w-7xl mx-auto px-6 py-16 border-b border-white/10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/50 text-lg leading-relaxed max-w-2xl"
        >
          {collection.description}
        </motion.p>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {colProducts.length === 0 ? (
          <p className="text-white/20 text-sm tracking-widest text-center py-12">NO PRODUCTS IN THIS COLLECTION YET</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {colProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
