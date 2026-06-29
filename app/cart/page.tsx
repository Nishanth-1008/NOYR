'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/CartContext';

export default function CartPage() {
  const { items, removeItem, updateQty, total } = useCart();

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  if (items.length === 0) {
    return (
      <div className="bg-black min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16">
        <ShoppingBag size={48} className="text-white/20 mb-6" />
        <h1 className="font-display text-4xl font-black text-white tracking-widest">YOUR BAG IS EMPTY</h1>
        <p className="mt-4 text-white/40 text-sm tracking-widest">Nothing here yet.</p>
        <Link
          href="/collections"
          className="mt-8 inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-xs tracking-[0.25em] font-semibold hover:bg-white/90 transition-colors"
        >
          SHOP NOW <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl font-black text-white tracking-widest mb-12"
        >
          YOUR BAG
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-px">
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div
                  key={item.variant.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-zinc-900 p-6 flex gap-6"
                >
                  {/* Thumb */}
                  <div className="relative w-24 h-32 bg-zinc-800 shrink-0 flex items-center justify-center overflow-hidden">
                    <span className="font-display text-2xl font-black text-white/10">N</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-semibold tracking-widest text-white truncate">{item.product.title}</h3>
                        <p className="mt-1 text-xs text-white/40 tracking-wider">SIZE: {item.variant.size}</p>
                        <p className="text-xs text-white/40 tracking-wider">COLOR: {item.variant.color}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.variant.id)}
                        className="text-white/30 hover:text-white transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      {/* Qty */}
                      <div className="flex items-center border border-white/20">
                        <button
                          onClick={() => updateQty(item.variant.id, item.quantity - 1)}
                          className="px-3 py-2 hover:bg-white/10 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-4 text-sm text-white font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.variant.id, item.quantity + 1)}
                          className="px-3 py-2 hover:bg-white/10 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-medium text-white">
                        {formatPrice(item.variant.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900 p-8 h-fit"
          >
            <h2 className="text-xs tracking-[0.4em] text-white/40 mb-8">ORDER SUMMARY</h2>

            <div className="space-y-4">
              {items.map(item => (
                <div key={item.variant.id} className="flex justify-between text-sm">
                  <span className="text-white/50 truncate max-w-[180px]">
                    {item.product.title} × {item.quantity}
                  </span>
                  <span className="text-white shrink-0 ml-4">{formatPrice(item.variant.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="my-6 border-t border-white/10" />

            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-white/50">Subtotal</span>
              <span className="text-sm text-white">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between items-center mb-8">
              <span className="text-sm text-white/50">Shipping</span>
              <span className="text-sm text-white/40">Calculated at checkout</span>
            </div>

            <div className="border-t border-white/10 pt-6 flex justify-between items-center mb-8">
              <span className="font-semibold tracking-wider text-white">TOTAL</span>
              <span className="text-xl font-bold text-white">{formatPrice(total)}</span>
            </div>

            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 text-xs tracking-[0.25em] font-semibold hover:bg-white/90 transition-colors"
            >
              CHECKOUT <ArrowRight size={14} />
            </Link>

            <Link
              href="/collections"
              className="w-full flex items-center justify-center gap-3 border border-white/20 text-white py-4 text-xs tracking-[0.25em] font-medium hover:border-white transition-colors mt-3"
            >
              CONTINUE SHOPPING
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
