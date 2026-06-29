'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Bell, ArrowUpRight, Lock, Clock } from 'lucide-react';
import { products } from '@/data/products';

/* ── Synthetic upcoming drops ── */
const UPCOMING_DROPS = [
  {
    id: 'drop-001',
    name: 'VOID COACH JACKET',
    slug: 'void-coach-jacket',
    collection: 'VOID SEASON 01',
    drop_date: '2026-07-15T12:00:00.000Z',
    type: 'RESTOCK',
    description: 'The shell jacket returns. Same spec. Same silhouette. Strictly limited.',
    units: 50,
    price: 7499,
    status: 'upcoming',
  },
  {
    id: 'drop-002',
    name: 'GHOST PROTOCOL JACKET',
    slug: 'ghost-protocol-jacket',
    collection: 'GHOST PROTOCOL',
    drop_date: '2026-08-01T12:00:00.000Z',
    type: 'NEW DROP',
    description: 'The second Ghost Protocol outerwear piece. Tactical ripstop. Concealed hood.',
    units: 35,
    price: 8999,
    status: 'upcoming',
  },
  {
    id: 'drop-003',
    name: 'ECLIPSE COLLECTION',
    slug: null,
    collection: 'ECLIPSE',
    drop_date: '2026-09-15T00:00:00.000Z',
    type: 'COLLECTION',
    description: 'The third NOYR collection. Name confirmed. Details withheld.',
    units: null,
    price: null,
    status: 'teaser',
  },
];

function useCountdown(dateStr: string) {
  const [now] = useState(() => new Date());
  const target = new Date(dateStr);
  const diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, mins, isPast: diff === 0 };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-mono text-3xl md:text-4xl font-bold text-white tabular-nums">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] tracking-[0.3em] text-white/25">{label}</span>
    </div>
  );
}

function DropCard({ drop, index }: { drop: typeof UPCOMING_DROPS[0]; index: number }) {
  const { days, hours, mins } = useCountdown(drop.drop_date);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notified, setNotified] = useState(false);
  const [showNotify, setShowNotify] = useState(false);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const handleNotify = () => {
    if (!notifyEmail.includes('@')) return;
    setNotified(true);
    setShowNotify(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="border border-white/8 hover:border-white/20 transition-colors relative overflow-hidden"
    >
      {/* Type badge */}
      <div className="absolute top-6 right-6 z-10">
        <span className={`text-[9px] tracking-[0.3em] px-3 py-1 font-semibold ${
          drop.type === 'COLLECTION' ? 'bg-white/5 text-white/30 border border-white/10' :
          drop.type === 'NEW DROP' ? 'bg-[#cc0000]/15 text-[#cc0000] border border-[#cc0000]/30' :
          'bg-white/10 text-white/60 border border-white/20'
        }`}>
          {drop.type}
        </span>
      </div>

      <div className="p-8 md:p-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[9px] tracking-[0.4em] text-white/20 mb-3">{drop.collection}</p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-white tracking-tight leading-tight pr-28">
            {drop.name}
          </h2>
          <p className="mt-4 text-white/35 text-sm leading-relaxed max-w-lg">{drop.description}</p>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-6 mb-10 pb-8 border-b border-white/8">
          <div>
            <p className="text-[9px] tracking-[0.3em] text-white/20 mb-1">DROP DATE</p>
            <p className="text-sm text-white/60">{formatDate(drop.drop_date)}</p>
          </div>
          {drop.units && (
            <div>
              <p className="text-[9px] tracking-[0.3em] text-white/20 mb-1">UNITS</p>
              <p className="text-sm text-white/60">{drop.units} pieces</p>
            </div>
          )}
          {drop.price && (
            <div>
              <p className="text-[9px] tracking-[0.3em] text-white/20 mb-1">STARTING FROM</p>
              <p className="text-sm text-white/60">{formatPrice(drop.price)}</p>
            </div>
          )}
        </div>

        {/* Countdown */}
        <div className="mb-10">
          <p className="text-[9px] tracking-[0.35em] text-white/20 mb-5 flex items-center gap-2">
            <Clock size={10} /> DROPS IN
          </p>
          <div className="flex items-center gap-8">
            <CountdownUnit value={days} label="DAYS" />
            <span className="text-white/20 text-2xl font-light">:</span>
            <CountdownUnit value={hours} label="HRS" />
            <span className="text-white/20 text-2xl font-light">:</span>
            <CountdownUnit value={mins} label="MIN" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {drop.status === 'teaser' ? (
            <div className="flex items-center gap-2 text-white/25 text-[11px] tracking-[0.2em]">
              <Lock size={12} /> DETAILS CLASSIFIED
            </div>
          ) : drop.slug ? (
            <Link
              href={`/products/${drop.slug}`}
              className="group flex items-center gap-2 border border-white/20 hover:border-white hover:bg-white hover:text-black text-white px-6 py-2.5 text-[11px] tracking-[0.2em] font-semibold transition-all"
            >
              VIEW PRODUCT <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          ) : null}

          {notified ? (
            <span className="text-[11px] tracking-[0.2em] text-green-400">✓ NOTIFY SET</span>
          ) : (
            <button
              onClick={() => setShowNotify(v => !v)}
              className="flex items-center gap-2 text-[11px] tracking-[0.2em] text-white/30 hover:text-white transition-colors"
            >
              <Bell size={12} /> NOTIFY ME
            </button>
          )}
        </div>

        {/* Notify form */}
        <AnimatePresence>
          {showNotify && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-5 flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={notifyEmail}
                  onChange={e => setNotifyEmail(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/15 focus:border-white/40 text-white text-sm px-4 py-2.5 outline-none transition-colors placeholder:text-white/20"
                />
                <button
                  onClick={handleNotify}
                  className="bg-white text-black px-5 py-2.5 text-[11px] tracking-widest font-semibold hover:bg-white/90 transition-colors"
                >
                  SET
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function DropsPage() {
  return (
    <div className="bg-black min-h-screen">
      {/* Header */}
      <div className="max-w-[1200px] mx-auto px-8 md:px-16 pt-32 pb-16 border-b border-white/8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[10px] tracking-[0.4em] text-white/20 mb-4">UPCOMING</p>
          <h1 className="font-display text-[clamp(3.5rem,9vw,8rem)] font-black text-white tracking-tight leading-none">
            DROP<br />CALENDAR
          </h1>
          <p className="mt-6 text-white/30 text-sm max-w-sm leading-relaxed">
            Limited releases. No restocks. No hype. Just the work, on its own schedule.
          </p>
        </motion.div>
      </div>

      {/* Drops list */}
      <div className="max-w-[1200px] mx-auto px-8 md:px-16 py-16">
        <div className="flex flex-col gap-4">
          {UPCOMING_DROPS.map((drop, i) => (
            <DropCard key={drop.id} drop={drop} index={i} />
          ))}
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="max-w-[1200px] mx-auto px-8 md:px-16 py-20 border-t border-white/8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] tracking-[0.4em] text-white/20 mb-3">NEVER MISS A DROP</p>
            <h3 className="font-display text-3xl font-black text-white tracking-tight">JOIN THE LIST</h3>
          </div>
          <Link
            href="/newsletter"
            className="group flex items-center gap-3 border border-white/20 hover:border-white px-8 py-3.5 text-[11px] tracking-[0.25em] text-white/45 hover:text-white transition-all"
          >
            SUBSCRIBE <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
