'use client';

import { useParams, notFound } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronDown, ArrowRight, Heart } from 'lucide-react';
import Link from 'next/link';
import { getProductBySlug, products } from '@/data/products';
import { useCart } from '@/components/CartContext';
import { useWishlist } from '@/components/WishlistContext';
import { Variant } from '@/types';
import ProductCard from '@/components/ProductCard';
import ProductReviews from '@/components/ProductReviews';
import RestockNotify from '@/components/RestockNotify';
import SizeRecommender from '@/components/SizeRecommender';
import DropCountdown from '@/components/DropCountdown';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = getProductBySlug(slug);
  if (!product) return notFound();

  const { addItem } = useCart();
  const { addItem: wishlistAdd, removeItem: wishlistRemove, isWishlisted } = useWishlist();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const related = products.filter(p => p.id !== product.id && p.collection_id === product.collection_id).slice(0, 3);

  const handleAdd = () => {
    if (!selectedVariant) return;
    addItem(product, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const toggleWishlist = () => {
    if (wishlisted) wishlistRemove(product.id);
    else wishlistAdd(product);
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const uniqueSizes = [...new Set(product.variants.map(v => v.size))];
  const outOfStockSizes = uniqueSizes.filter(s => {
    const v = product.variants.find(vv => vv.size === s);
    return (v?.stock ?? 0) === 0;
  });

  return (
    <div className="bg-black min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Images */}
          <div>
            <motion.div
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-[3/4] bg-zinc-900 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-8xl font-black text-white/5 tracking-widest">NOYR</span>
              </div>
              {product.limited && (
                <div className="absolute top-4 left-4 bg-red-600 text-white text-[9px] tracking-[0.3em] px-3 py-1 font-semibold">
                  LIMITED
                </div>
              )}
            </motion.div>
            {product.images.length > 1 && (
              <div className="mt-4 flex gap-3">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative aspect-square w-20 bg-zinc-900 overflow-hidden border transition-colors ${
                      activeImage === i ? 'border-white' : 'border-transparent hover:border-white/30'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <p className="text-xs tracking-[0.3em] text-white/30 mb-4">{product.category.toUpperCase()}</p>
              <div className="flex items-start justify-between gap-4">
                <h1 className="font-display text-4xl md:text-5xl font-black text-white tracking-widest leading-tight">
                  {product.title}
                </h1>
                <button
                  onClick={toggleWishlist}
                  className="flex-shrink-0 mt-2 p-2 text-white/30 hover:text-white transition-colors"
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart
                    size={20}
                    className={`transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : ''}`}
                  />
                </button>
              </div>
              <p className="mt-4 text-2xl font-medium text-white">{formatPrice(product.price)}</p>

              {/* Drop countdown */}
              {product.drop_date && new Date(product.drop_date) > new Date() && (
                <div className="mt-6 border border-white/10 p-5">
                  <DropCountdown targetDate={product.drop_date} />
                </div>
              )}

              <p className="mt-6 text-white/50 leading-relaxed text-sm">{product.description}</p>
            </motion.div>

            {/* Size selector */}
            <div className="mt-10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs tracking-[0.3em] text-white/40">SELECT SIZE</span>
                <div className="flex items-center gap-4">
                  <SizeRecommender
                    category={product.category}
                    onSelect={size => {
                      const v = product.variants.find(vv => vv.size === size && vv.stock > 0);
                      if (v) setSelectedVariant(v);
                    }}
                  />
                  <Link href="/size-guide" className="text-xs tracking-widest text-white/30 hover:text-white transition-colors underline underline-offset-4">
                    SIZE GUIDE
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {uniqueSizes.map(size => {
                  const variant = product.variants.find(v => v.size === size);
                  const inStock = (variant?.stock ?? 0) > 0;
                  return (
                    <button
                      key={size}
                      disabled={!inStock}
                      onClick={() => variant && setSelectedVariant(variant)}
                      className={`border py-3 text-sm font-medium tracking-widest transition-all ${
                        selectedVariant?.size === size
                          ? 'bg-white text-black border-white'
                          : inStock
                          ? 'border-white/20 text-white hover:border-white'
                          : 'border-white/10 text-white/20 cursor-not-allowed line-through'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 flex flex-col gap-3">
              <motion.button
                onClick={handleAdd}
                disabled={!selectedVariant}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center justify-center gap-3 py-4 text-sm font-semibold tracking-[0.2em] transition-all ${
                  !selectedVariant
                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                    : added
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-black hover:bg-white/90'
                }`}
              >
                <ShoppingBag size={16} />
                {added ? 'ADDED TO CART' : !selectedVariant ? 'SELECT A SIZE' : 'ADD TO CART'}
              </motion.button>

              <AnimatePresence>
                {added && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-between items-center"
                  >
                    <p className="text-xs text-green-400 tracking-widest">Added to bag</p>
                    <Link href="/cart" className="text-xs tracking-widest text-white underline underline-offset-4 flex items-center gap-1">
                      VIEW CART <ArrowRight size={10} />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Restock notification for out-of-stock sizes */}
              {selectedVariant === null && outOfStockSizes.length > 0 && (
                <div className="mt-2">
                  {outOfStockSizes.slice(0, 1).map(size => {
                    const v = product.variants.find(vv => vv.size === size);
                    if (!v) return null;
                    return (
                      <RestockNotify key={v.id} productId={product.id} variantId={v.id} size={size} />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Story */}
            {product.story && (
              <div className="mt-12 border-t border-white/10 pt-8">
                <p className="text-xs tracking-[0.3em] text-white/30 mb-4">THE STORY</p>
                <p className="text-white/60 text-sm leading-relaxed italic">&ldquo;{product.story}&rdquo;</p>
              </div>
            )}

            {/* Details accordion */}
            <div className="mt-8 border-t border-white/10">
              <button
                onClick={() => setDetailsOpen(v => !v)}
                className="w-full flex justify-between items-center py-5 text-xs tracking-[0.3em] text-white/40 hover:text-white transition-colors"
              >
                FABRIC & DETAILS
                <motion.div animate={{ rotate: detailsOpen ? 180 : 0 }}>
                  <ChevronDown size={14} />
                </motion.div>
              </button>
              <AnimatePresence>
                {detailsOpen && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-2 pb-6"
                  >
                    {product.details?.map((d, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/50">
                        <span className="text-white/20 mt-0.5">—</span> {d}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Shipping note */}
            <div className="mt-4 bg-white/5 px-5 py-4 text-xs text-white/40 leading-relaxed">
              Manual UPI payment. Ships within 3–5 business days after verification.{' '}
              <Link href="/faq" className="underline underline-offset-2 hover:text-white transition-colors">Learn more</Link>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <ProductReviews productId={product.id} />

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-32 border-t border-white/10 pt-20">
            <h2 className="text-xs tracking-[0.4em] text-white/30 mb-12">YOU MAY ALSO LIKE</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
