'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, X, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/components/WishlistContext';

const formatPrice = (p: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();

  return (
    <div className="bg-black min-h-screen pt-16">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs tracking-[0.4em] text-white/30 mb-3">YOUR</p>
          <h1 className="font-display text-5xl md:text-7xl font-black text-white tracking-widest mb-16">WISHLIST</h1>
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-32"
          >
            <Heart size={40} className="mx-auto text-white/10 mb-6" />
            <p className="text-white/30 text-sm tracking-[0.3em] mb-8">NOTHING SAVED YET</p>
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 text-xs tracking-[0.2em] text-white border border-white/20 px-8 py-4 hover:bg-white hover:text-black transition-colors"
            >
              EXPLORE THE DROP <ArrowRight size={12} />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-1">
            {items.map((item, i) => (
              <motion.div
                key={item.product_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between border border-white/5 p-5 hover:border-white/10 transition-colors group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-20 bg-zinc-900 flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-xs font-black text-white/10">NOYR</span>
                  </div>
                  <div>
                    <p className="text-xs tracking-[0.2em] text-white/30 mb-1">
                      {new Date(item.added_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="font-medium text-white tracking-wide">{item.product_title}</p>
                    <p className="text-white/50 text-sm mt-1">{formatPrice(item.product_price)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    href={`/products/${item.product_slug}`}
                    className="text-xs tracking-[0.2em] text-white/30 hover:text-white border border-white/10 hover:border-white/30 px-4 py-2 transition-colors"
                  >
                    VIEW
                  </Link>
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-white/20 hover:text-red-400 transition-colors p-2"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            ))}

            <div className="pt-8 text-center">
              <Link
                href="/collections"
                className="inline-flex items-center gap-2 text-xs tracking-[0.2em] text-white/40 hover:text-white transition-colors"
              >
                CONTINUE SHOPPING <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
