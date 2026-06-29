'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Order } from '@/types';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'payment_received', label: 'Payment Verified' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

function getStatusIndex(status: Order['status']) {
  return STATUS_STEPS.findIndex(s => s.key === status);
}

function TrackContent() {
  const params = useSearchParams();
  const [inputId, setInputId] = useState(params.get('id') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const handleSearch = () => {
    setNotFound(false);
    try {
      const orders: Order[] = JSON.parse(localStorage.getItem('noyr_orders') || '[]');
      const found = orders.find(o => o.id === inputId.trim().toUpperCase());
      if (found) { setOrder(found); }
      else { setOrder(null); setNotFound(true); }
    } catch {
      setOrder(null); setNotFound(true);
    }
  };

  const statusIdx = order ? getStatusIndex(order.status) : -1;

  return (
    <div className="bg-black min-h-screen pt-24">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-5xl font-black text-white tracking-widest mb-12">TRACK ORDER</h1>

          <div className="flex gap-3">
            <input
              type="text"
              value={inputId}
              onChange={e => setInputId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Enter your order ID (e.g. ORD-ABC123)"
              className="flex-1 bg-zinc-900 border border-white/10 focus:border-white text-white text-sm px-4 py-3 outline-none transition-colors placeholder:text-white/20"
            />
            <button
              onClick={handleSearch}
              className="bg-white text-black px-6 py-3 hover:bg-white/90 transition-colors flex items-center gap-2"
            >
              <Search size={16} />
            </button>
          </div>

          {notFound && (
            <p className="mt-4 text-sm text-red-400 tracking-widest">Order not found. Check your ID and try again.</p>
          )}

          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10"
            >
              {/* Order header */}
              <div className="bg-zinc-900 border border-white/10 p-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs tracking-[0.3em] text-white/40">ORDER ID</p>
                    <p className="font-mono text-white text-lg mt-1">{order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs tracking-[0.3em] text-white/40">TOTAL</p>
                    <p className="text-white text-lg mt-1">{formatPrice(order.total)}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
                  <span className={`text-xs tracking-widest px-3 py-1 border ${
                    order.payment_status === 'verified' ? 'border-green-500 text-green-400' :
                    order.payment_status === 'submitted' ? 'border-yellow-500 text-yellow-400' :
                    'border-white/20 text-white/40'
                  }`}>
                    PAYMENT: {order.payment_status.toUpperCase()}
                  </span>
                  <span className="text-xs text-white/30">{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Status timeline */}
              <div className="space-y-0">
                {STATUS_STEPS.map((s, i) => {
                  const active = i <= statusIdx;
                  return (
                    <div key={s.key} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full border-2 mt-0.5 transition-colors ${
                          active ? 'bg-white border-white' : 'border-white/20'
                        }`} />
                        {i < STATUS_STEPS.length - 1 && (
                          <div className={`w-px flex-1 min-h-[32px] transition-colors ${active ? 'bg-white/40' : 'bg-white/10'}`} />
                        )}
                      </div>
                      <div className="pb-8">
                        <p className={`text-sm font-medium transition-colors ${active ? 'text-white' : 'text-white/30'}`}>
                          {s.label}
                        </p>
                        {i === statusIdx && (
                          <p className="text-xs text-white/40 mt-0.5 tracking-widest">CURRENT</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Items */}
              <div className="mt-6 border-t border-white/10 pt-6">
                <h3 className="text-xs tracking-[0.3em] text-white/40 mb-4">ITEMS</h3>
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm py-2">
                    <span className="text-white/60">{item.product_title} (Size {item.size}) × {item.quantity}</span>
                    <span className="text-white">{formatPrice(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return <Suspense><TrackContent /></Suspense>;
}
