'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check } from 'lucide-react';

interface RestockNotifyProps {
  productId: string;
  variantId: string;
  size: string;
}

export default function RestockNotify({ productId, variantId, size }: RestockNotifyProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const submit = async () => {
    if (!email || !email.includes('@')) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/restock-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, variant_id: variantId, email }),
      });
      if (res.ok) {
        setStatus('done');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-xs tracking-[0.2em] text-white/40 hover:text-white transition-colors border border-white/10 hover:border-white/30 px-4 py-3 w-full justify-center"
      >
        <Bell size={13} />
        NOTIFY ME WHEN SIZE {size} IS BACK
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3">
              {status === 'done' ? (
                <div className="flex items-center gap-2 text-green-400 text-xs tracking-widest py-3 justify-center border border-green-400/20">
                  <Check size={13} />
                  WE&apos;LL LET YOU KNOW
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    className="flex-1 bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors"
                  />
                  <button
                    onClick={submit}
                    disabled={status === 'loading'}
                    className="bg-white text-black px-5 text-xs font-semibold tracking-[0.2em] hover:bg-white/90 transition-colors disabled:opacity-50"
                  >
                    {status === 'loading' ? '...' : 'NOTIFY'}
                  </button>
                </div>
              )}
              {status === 'error' && (
                <p className="text-red-400 text-xs mt-2 tracking-widest">Something went wrong. Try again.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
