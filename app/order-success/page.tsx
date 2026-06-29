'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle, Download, Share2, ArrowRight } from 'lucide-react';
import { clearCartEmail } from '@/lib/abandonedCart';

export default function OrderSuccessPage() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loadingReferral, setLoadingReferral] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const em = params.get('email');
    const name = params.get('name');
    setOrderId(id);
    setEmail(em);
    setCustomerName(name);
    clearCartEmail();
  }, []);

  useEffect(() => {
    if (!email || !customerName) return;
    setLoadingReferral(true);
    fetch('/api/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name: customerName }),
    })
      .then(r => r.json())
      .then(d => { if (d.code) setReferralCode(d.code); })
      .catch(() => {})
      .finally(() => setLoadingReferral(false));
  }, [email, customerName]);

  const copyReferral = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-black min-h-screen pt-16 flex items-center">
      <div className="max-w-2xl mx-auto px-6 py-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-8 flex items-center justify-center border border-green-400/30 bg-green-400/5"
          >
            <CheckCircle size={28} className="text-green-400" />
          </motion.div>

          <p className="text-xs tracking-[0.4em] text-white/30 mb-3">ORDER PLACED</p>
          <h1 className="font-display text-5xl md:text-7xl font-black text-white tracking-widest mb-6">
            CONFIRMED.
          </h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-md mx-auto">
            Your order has been received. We&apos;ll verify your payment within 24 hours
            and ship within 3–5 business days.
          </p>

          {orderId && (
            <div className="mt-8 border border-white/10 bg-white/3 px-6 py-4 inline-block">
              <p className="text-xs tracking-[0.3em] text-white/30 mb-2">ORDER ID</p>
              <p className="font-mono text-lg text-white">{orderId}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/track-order?id=${orderId}`}
              className="flex items-center justify-center gap-2 border border-white/20 text-white px-6 py-3 text-xs tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
            >
              TRACK ORDER <ArrowRight size={12} />
            </Link>

            {orderId && email && (
              <a
                href={`/api/invoice?order_id=${orderId}&email=${encodeURIComponent(email)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border border-white/10 text-white/50 hover:text-white hover:border-white/30 px-6 py-3 text-xs tracking-[0.2em] transition-colors"
              >
                <Download size={12} />
                DOWNLOAD INVOICE
              </a>
            )}
          </div>

          {/* Referral section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 border-t border-white/10 pt-12"
          >
            <p className="text-xs tracking-[0.3em] text-white/30 mb-2">SPREAD THE VOID</p>
            <h2 className="font-display text-2xl font-black text-white tracking-widest mb-4">
              REFER A FRIEND
            </h2>
            <p className="text-white/40 text-sm mb-6">
              Share your code. Your friend gets 5% off their first order.
            </p>

            {loadingReferral ? (
              <div className="h-12 bg-white/5 animate-pulse" />
            ) : referralCode ? (
              <div className="flex gap-2">
                <div className="flex-1 bg-white/5 border border-white/10 px-4 py-3 font-mono text-white text-sm text-left">
                  {referralCode}
                </div>
                <button
                  onClick={copyReferral}
                  className="bg-white text-black px-5 text-xs font-semibold tracking-[0.15em] hover:bg-white/90 transition-colors flex items-center gap-2"
                >
                  <Share2 size={12} />
                  {copied ? 'COPIED!' : 'COPY'}
                </button>
              </div>
            ) : (
              <p className="text-white/20 text-xs tracking-widest">Referral code will appear here</p>
            )}
          </motion.div>

          <div className="mt-12">
            <Link
              href="/collections"
              className="text-xs tracking-[0.3em] text-white/30 hover:text-white transition-colors underline underline-offset-4"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
