'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { Review } from '@/types';

interface ProductReviewsProps {
  productId: string;
}

function StarRow({ rating, interactive, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            size={14}
            className={`transition-colors ${
              n <= (hovered || rating)
                ? 'fill-white text-white'
                : 'fill-transparent text-white/20'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    customer_name: '',
    rating: 5,
    body: '',
    size_purchased: '',
  });

  useEffect(() => {
    fetch(`/api/reviews?product_id=${productId}`)
      .then(r => r.json())
      .then(data => { setReviews(data.reviews ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [productId]);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const submit = async () => {
    if (!form.customer_name || !form.body || form.rating === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, product_id: productId }),
      });
      if (res.ok) {
        const { review } = await res.json();
        setReviews(prev => [review, ...prev]);
        setSubmitted(true);
        setShowForm(false);
        setForm({ customer_name: '', rating: 5, body: '', size_purchased: '' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-t border-white/10 pt-12 mt-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.3em] text-white/30 mb-2">REVIEWS</p>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3">
              <StarRow rating={Math.round(avgRating)} />
              <span className="text-white/50 text-sm">{avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        {!submitted && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="text-xs tracking-[0.2em] text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-4 py-2 transition-colors"
          >
            WRITE REVIEW
          </button>
        )}
      </div>

      {/* Review form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-10"
          >
            <div className="bg-white/3 border border-white/10 p-6 space-y-4">
              <div>
                <label className="text-[10px] tracking-[0.3em] text-white/30 block mb-2">YOUR RATING</label>
                <StarRow rating={form.rating} interactive onChange={r => setForm(f => ({ ...f, rating: r }))} />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.3em] text-white/30 block mb-2">NAME</label>
                <input
                  value={form.customer_name}
                  onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
                />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.3em] text-white/30 block mb-2">SIZE PURCHASED</label>
                <input
                  value={form.size_purchased}
                  onChange={e => setForm(f => ({ ...f, size_purchased: e.target.value }))}
                  placeholder="S / M / L / XL"
                  className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40"
                />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.3em] text-white/30 block mb-2">REVIEW</label>
                <textarea
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  placeholder="Tell us about the fit, fabric, and feel..."
                  rows={4}
                  className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 resize-none"
                />
              </div>
              <button
                onClick={submit}
                disabled={submitting}
                className="bg-white text-black px-6 py-3 text-xs font-semibold tracking-[0.2em] hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {submitting ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {submitted && (
        <p className="text-green-400 text-xs tracking-widest mb-6">Thank you. Your review is pending approval.</p>
      )}

      {/* Reviews list */}
      {loading ? (
        <p className="text-white/20 text-sm tracking-widest">LOADING...</p>
      ) : reviews.length === 0 ? (
        <p className="text-white/20 text-sm">No reviews yet. Be the first.</p>
      ) : (
        <div className="space-y-8">
          {reviews.map(review => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-white/5 pb-8"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <StarRow rating={review.rating} />
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm text-white font-medium">{review.customer_name}</span>
                    {review.verified_purchase && (
                      <span className="text-[9px] tracking-[0.2em] text-green-400/60 border border-green-400/20 px-2 py-0.5">VERIFIED</span>
                    )}
                    {review.size_purchased && (
                      <span className="text-[9px] tracking-[0.2em] text-white/30">SIZE {review.size_purchased}</span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-white/20">
                  {new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">{review.body}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
