'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Gift, Star, Zap, ArrowUpRight, Share2, Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabase-browser';

/* ── Tiers ── */
const TIERS = [
  { name: 'SIGNAL', min: 0, max: 999, color: 'text-white/40', bg: 'border-white/10' },
  { name: 'GHOST', min: 1000, max: 4999, color: 'text-white/70', bg: 'border-white/25' },
  { name: 'VOID', min: 5000, max: 14999, color: 'text-[#cc0000]', bg: 'border-[#cc0000]/30' },
  { name: 'ECLIPSE', min: 15000, max: Infinity, color: 'text-white', bg: 'border-white' },
];

const TIER_PERKS: Record<string, string[]> = {
  SIGNAL: ['Early access to drops (24hr)', 'Birthday discount code'],
  GHOST: ['Early access to drops (48hr)', '5% loyalty discount', 'Free shipping on all orders'],
  VOID: ['Early access to drops (72hr)', '10% loyalty discount', 'Free express shipping', 'Exclusive colourways'],
  ECLIPSE: ['Priority early access (1 week)', '15% loyalty discount', 'Free overnight shipping', 'Private drops & collabs', 'Direct line to studio'],
};

/* ── Progress bar ── */
function TierProgress({ points, tier }: { points: number; tier: typeof TIERS[0] }) {
  const next = TIERS[TIERS.indexOf(tier) + 1];
  if (!next) return (
    <div className="mt-6">
      <p className="text-[10px] tracking-[0.3em] text-white/20 mb-2">MAX TIER REACHED</p>
      <div className="h-px bg-white/20 w-full" />
    </div>
  );

  const pct = Math.min(100, ((points - tier.min) / (next.min - tier.min)) * 100);
  const remaining = next.min - points;

  return (
    <div className="mt-6">
      <div className="flex justify-between items-end mb-2">
        <p className="text-[10px] tracking-[0.3em] text-white/20">{tier.name}</p>
        <p className="text-[10px] tracking-[0.3em] text-white/20">{next.name}</p>
      </div>
      <div className="h-px bg-white/10 w-full relative overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          className="absolute inset-y-0 left-0 bg-[#cc0000]"
        />
      </div>
      <p className="mt-3 text-[11px] text-white/25">
        {remaining.toLocaleString('en-IN')} more points to <span className="text-white/50">{next.name}</span>
      </p>
    </div>
  );
}

export default function RewardsPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [tab, setTab] = useState<'overview' | 'history' | 'perks'>('overview');
  
  // Rewards & Referrals state
  const [orders, setOrders] = useState<any[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [copied, setCopied] = useState(false);

  const totalSpent = orders.reduce((a, o) => a + Number(o.total), 0);
  const points = Math.floor(totalSpent / 10);
  const tier = TIERS.find(t => points >= t.min && points <= t.max) ?? TIERS[0];

  useEffect(() => {
    const fetchRewardsData = async () => {
      if (!user) return;
      setLoadingData(true);
      try {
        // 1. Fetch referral code
        const refRes = await fetch('/api/referral', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.user_metadata?.full_name || 'NOYR Member',
          }),
        });
        const refData = await refRes.json();
        if (refData.code) {
          setReferralCode(refData.code);
        }

        // 2. Fetch verified orders via RLS
        const { data: ords } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', user.id)
          .eq('payment_status', 'verified');

        if (ords) {
          setOrders(ords);
        }
      } catch (err) {
        console.error(err);
      }
      setLoadingData(false);
    };

    if (user) {
      fetchRewardsData();
    }
  }, [user]);

  const copyReferral = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  if (authLoading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen pt-24 text-white">
      <div className="max-w-[1100px] mx-auto px-8 md:px-16 py-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <p className="text-[10px] tracking-[0.5em] text-white/20 mb-4">NOYR</p>
          <h1 className="font-display text-6xl md:text-8xl font-black leading-none tracking-tight">
            REWARDS
          </h1>
          <p className="mt-4 text-white/35 text-sm max-w-sm leading-relaxed">
            Every purchase earns points. Points unlock tiers. Tiers unlock access.
          </p>
        </motion.div>

        {/* Registration gating */}
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div
              key="register"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="border border-white/8 p-10 md:p-14 max-w-lg"
            >
              <h2 className="font-display text-3xl font-black mb-2">ENTER THE PROGRAM</h2>
              <p className="text-white/35 text-sm mb-8">Sign in with Google to view or create your rewards account.</p>
              
              <button
                onClick={signInWithGoogle}
                className="bg-white text-black px-8 py-3.5 text-[11px] tracking-[0.3em] font-semibold hover:bg-white/90 transition-colors flex items-center gap-2"
              >
                <LogIn size={13} /> ACCESS REWARDS
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Tier card */}
              <div className={`border ${tier.bg} p-8 md:p-10 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className="text-[9px] tracking-[0.4em] text-white/20 mb-1">CURRENT TIER</p>
                      <h2 className={`font-display text-5xl font-black tracking-widest ${tier.color}`}>
                        {tier.name}
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] tracking-[0.4em] text-white/20 mb-1">TOTAL POINTS</p>
                      <p className="font-mono text-3xl font-bold text-white">{points.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <TierProgress points={points} tier={tier} />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-0 border-b border-white/8">
                {(['overview', 'history', 'perks'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-6 py-3 text-[10px] tracking-[0.3em] font-semibold transition-colors border-b-2 -mb-px ${
                      tab === t ? 'border-white text-white' : 'border-transparent text-white/25 hover:text-white/50'
                    }`}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">
                {tab === 'overview' && (
                  <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                      {[
                        { icon: <Star size={14} />, label: 'POINTS', value: points.toLocaleString('en-IN') },
                        { icon: <Gift size={14} />, label: 'TOTAL SPENT', value: formatPrice(totalSpent) },
                        { icon: <Zap size={14} />, label: 'VERIFIED ORDERS', value: orders.length },
                      ].map(s => (
                        <div key={s.label} className="border border-white/8 p-6 flex flex-col gap-3">
                          <span className="text-white/25">{s.icon}</span>
                          <div>
                            <p className="text-[9px] tracking-[0.3em] text-white/20 mb-1">{s.label}</p>
                            <p className="text-white font-semibold text-xl">{s.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Referral code */}
                    <div className="border border-white/8 p-8">
                      <p className="text-[10px] tracking-[0.3em] text-white/20 mb-4 flex items-center gap-2">
                        <Share2 size={11} /> YOUR REFERRAL CODE
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-2xl font-bold text-white tracking-widest">
                          {loadingData ? 'FETCHING...' : referralCode || 'NO CODE YET'}
                        </span>
                        {referralCode && (
                          <button
                            onClick={copyReferral}
                            className="flex items-center gap-2 border border-white/15 hover:border-white px-4 py-2 text-[10px] tracking-[0.2em] text-white/40 hover:text-white transition-all font-semibold"
                          >
                            {copied ? <><Check size={11} /> COPIED</> : <><Copy size={11} /> COPY</>}
                          </button>
                        )}
                      </div>
                      <p className="mt-3 text-[11px] text-white/25 leading-relaxed">
                        Share this code. Your friends get 5% off. You earn points for each referral.
                      </p>
                    </div>

                    {/* How points work */}
                    <div className="mt-6 border border-white/8 p-8">
                      <p className="text-[10px] tracking-[0.3em] text-white/20 mb-6">HOW POINTS WORK</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { action: 'PURCHASE', pts: '₹10 = 1 pt', detail: 'Earned on every verified order.' },
                          { action: 'REFERRAL', pts: '500 pts', detail: 'When a referred friend places their first order.' },
                          { action: 'REVIEW', pts: '100 pts', detail: 'For verified purchase reviews with photo.' },
                        ].map(r => (
                          <div key={r.action}>
                            <p className="text-[9px] tracking-[0.3em] text-white/25 mb-1">{r.action}</p>
                            <p className="font-semibold text-white mb-1">{r.pts}</p>
                            <p className="text-[11px] text-white/30 leading-relaxed">{r.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {tab === 'history' && (
                  <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="flex flex-col gap-2">
                      {loadingData ? (
                        <div className="flex items-center justify-center py-12 text-white/40">
                          <Loader2 size={16} className="animate-spin mr-2" /> Fetching order history...
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="border border-white/8 p-12 text-center text-white/20 text-xs tracking-widest">
                          NO VERIFIED ORDERS YET
                        </div>
                      ) : (
                        orders.map((order, i) => (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="border border-white/8 p-6 grid grid-cols-2 md:grid-cols-4 gap-4 items-center"
                          >
                            <div>
                              <p className="text-[9px] tracking-[0.3em] text-white/20 mb-1 font-semibold">ORDER</p>
                              <p className="text-sm font-mono text-white/70">{order.id}</p>
                            </div>
                            <div>
                              <p className="text-[9px] tracking-[0.3em] text-white/20 mb-1 font-semibold">DATE</p>
                              <p className="text-sm text-white/50">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                            <div>
                              <p className="text-[9px] tracking-[0.3em] text-white/20 mb-1 font-semibold">TOTAL</p>
                              <p className="text-sm text-white/70">{formatPrice(order.total)}</p>
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-4">
                              <div>
                                <p className="text-[9px] tracking-[0.3em] text-white/20 mb-1 font-semibold">POINTS</p>
                                <p className="text-sm text-[#cc0000] font-semibold">+{Math.floor(order.total / 10)}</p>
                              </div>
                              <Link href={`/track-order?id=${order.id}`} className="text-white/20 hover:text-white transition-colors">
                                <ArrowUpRight size={14} />
                              </Link>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                {tab === 'perks' && (
                  <motion.div key="perks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {TIERS.map((t, i) => (
                        <div key={t.name} className={`border ${t.bg} p-7 relative ${t.name === tier.name ? 'bg-white/[0.02]' : ''}`}>
                          {t.name === tier.name && (
                            <div className="absolute top-4 right-4 text-[9px] tracking-[0.3em] text-[#cc0000] font-semibold">
                              CURRENT
                            </div>
                          )}
                          <p className={`font-display text-2xl font-black tracking-widest mb-1 ${t.color}`}>{t.name}</p>
                          <p className="text-[10px] tracking-[0.3em] text-white/20 mb-5">
                            {t.max === Infinity ? `${t.min.toLocaleString()}+ points` : `${t.min.toLocaleString()} – ${t.max.toLocaleString()} points`}
                          </p>
                          <ul className="flex flex-col gap-2">
                            {TIER_PERKS[t.name].map(perk => (
                              <li key={perk} className="flex items-start gap-2 text-[11px] text-white/40">
                                <span className="text-[#cc0000] mt-0.5 shrink-0">✦</span>
                                {perk}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
