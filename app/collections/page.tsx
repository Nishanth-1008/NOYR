'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { useStorefrontCatalog } from '@/lib/useStorefrontCatalog';

export default function CollectionsPage() {
  const { products, collections, loading } = useStorefrontCatalog();

  return (
    <div className="bg-black min-h-screen pt-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pb-16 border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs tracking-[0.4em] text-white/30 mb-4">NOYR STORE</p>
          <h1 className="font-display text-6xl md:text-8xl font-black text-white tracking-tight">ALL PIECES</h1>
        </motion.div>
      </div>

      {loading && (
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <p className="text-white/20 text-xs tracking-widest">LOADING…</p>
        </div>
      )}

      {/* Collection sections */}
      {collections.map((col, ci) => {
        const colProducts = products.filter(p => p.collection_id === col.id && p.active);
        if (colProducts.length === 0) return null;
        return (
          <section key={col.id} className="max-w-7xl mx-auto px-6 py-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-end justify-between mb-10"
            >
              <div>
                <span className="text-xs tracking-[0.3em] text-white/20">COLLECTION {ci + 1}</span>
                <h2 className="font-display text-3xl font-black text-white tracking-widest mt-2">{col.title}</h2>
                <p className="text-xs tracking-widest text-white/30 mt-1">{col.hero_text}</p>
              </div>
              <Link
                href={`/collections/${col.slug}`}
                className="hidden md:flex items-center gap-2 text-xs tracking-widest text-white/40 hover:text-white transition-colors"
              >
                VIEW COLLECTION <ArrowRight size={12} />
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {colProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Products with no collection assigned */}
      {(() => {
        const orphan = products.filter(p => p.active && !p.collection_id);
        if (orphan.length === 0) return null;
        return (
          <section className="max-w-7xl mx-auto px-6 py-20">
            <div className="mb-10">
              <h2 className="font-display text-3xl font-black text-white tracking-widest">MORE PIECES</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {orphan.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </section>
        );
      })()}
    </div>
  );
}
