'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        {/* Image container */}
        <div className="relative overflow-hidden bg-[#111] aspect-[3/4]">
          {/* Placeholder gradient (replace with real images) */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950 group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-6xl font-black text-white/5 tracking-widest">NOYR</span>
          </div>
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500" />
          {/* Category tag */}
          <div className="absolute top-4 left-4">
            <span className="text-[9px] tracking-[0.3em] text-white/40 border border-white/20 px-2 py-1">
              {product.category.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 flex justify-between items-end">
          <div>
            <h3 className="text-sm font-semibold tracking-widest text-white group-hover:text-white/70 transition-colors">
              {product.title}
            </h3>
            <p className="mt-1 text-xs text-white/30 tracking-wider line-clamp-1 max-w-[200px]">
              {product.description}
            </p>
          </div>
          <span className="text-sm font-medium text-white/70 shrink-0 ml-4">
            {formatPrice(product.price)}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
