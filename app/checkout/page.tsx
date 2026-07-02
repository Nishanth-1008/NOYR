'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Check, Loader2, ArrowRight, ChevronRight, Tag } from 'lucide-react';
import { useCart } from '@/components/CartContext';
import { Order } from '@/types';
import { generateOrderId } from '@/lib/orders';
import { saveLocalOrder } from '@/lib/orders';
import { captureCartEmail, clearCartEmail } from '@/lib/abandonedCart';
import { useAuth } from '@/components/AuthContext';

const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID ?? 'noyr@upi';

const STEP_LABELS = ['DETAILS', 'REVIEW', 'PAYMENT'];

function StepBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-0 mb-14">
      {STEP_LABELS.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex items-center gap-2.5">
            <div className={`flex items-center justify-center w-7 h-7 text-[11px] font-semibold transition-all ${
              i < step  ? 'bg-white text-black' :
              i === step ? 'border border-white text-white' :
              'border border-white/15 text-white/20'
            }`}>
              {i < step ? <Check size={11} /> : String(i + 1)}
            </div>
            <span className={`text-[10px] tracking-[0.25em] hidden sm:block transition-colors ${
              i <= step ? 'text-white' : 'text-white/20'
            }`}>{label}</span>
          </div>
          {i < 2 && <div className={`w-10 h-px mx-4 transition-colors ${i < step ? 'bg-white/40' : 'bg-white/10'}`} />}
        </div>
      ))}
    </div>
  );
}

interface FormData {
  name: string; email: string; phone: string;
  address: string; city: string; pincode: string; notes: string;
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep]   = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Partial<FormData>>({});
  const [form, setForm]   = useState<FormData>({
    name: '', email: '', phone: '',
    address: '', city: '', pincode: '', notes: '',
  });
  const [txnId, setTxnId]           = useState('');
  const [screenshotName, setScreenshotName] = useState('');
  const [screenshotUrl, setScreenshotUrl]   = useState('');
  const [uploading, setUploading]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Unified Coupon & Referral state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    type: 'coupon' | 'referral';
    discountType: 'percent' | 'flat';
    discountValue: number;
  } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [checkingPromo, setCheckingPromo] = useState(false);

  // Capture email for abandoned cart when user types it
  useEffect(() => {
    if (form.email && form.email.includes('@')) {
      captureCartEmail(form.email);
    }
  }, [form.email]);

  // Autofill user details
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name: f.name || user.user_metadata?.full_name || '',
        email: f.email || user.email || '',
      }));
    }
  }, [user]);

  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'percent') {
      discountAmount = Math.round(total * (appliedPromo.discountValue / 100));
    } else {
      discountAmount = Math.round(appliedPromo.discountValue);
    }
  }
  const discountedTotal = Math.max(0, total - discountAmount);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  /* ── Promo Code validation (Unified Coupons & Referrals) ── */
  const applyPromoCode = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setCheckingPromo(true);
    setPromoError('');

    try {
      // 1. Try Coupon Validate
      const couponRes = await fetch(`/api/coupons/validate?code=${code}`);
      const couponData = await couponRes.json();
      
      if (couponData.valid) {
        setAppliedPromo({
          code,
          type: 'coupon',
          discountType: couponData.type,
          discountValue: couponData.value,
        });
        setCheckingPromo(false);
        return;
      }

      // 2. Try Referral Validate
      const referralRes = await fetch(`/api/referral?code=${code}`);
      const referralData = await referralRes.json();

      if (referralData.valid) {
        setAppliedPromo({
          code,
          type: 'referral',
          discountType: 'percent',
          discountValue: referralData.discount ?? 5,
        });
        setCheckingPromo(false);
        return;
      }

      setPromoError(couponData.error || 'Invalid code.');
    } catch {
      setPromoError('Could not verify code. Try again.');
    }
    setCheckingPromo(false);
  };

  /* ── Validation ── */
  const validate = () => {
    const e: Partial<FormData> = {};
    if (!form.name.trim())                      e.name    = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!/^\d{10}$/.test(form.phone))           e.phone   = '10-digit number';
    if (!form.address.trim())                   e.address = 'Required';
    if (!form.city.trim())                      e.city    = 'Required';
    if (!/^\d{6}$/.test(form.pincode))         e.pincode = '6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Screenshot upload ── */
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotName(file.name);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const { url } = await res.json();
      setScreenshotUrl(url ?? '');
    } catch { /* ignore */ }
    setUploading(false);
  };

  /* ── Submit order ── */
  const handleSubmitOrder = async () => {
    if (!txnId.trim()) return;
    setLoading(true);

    const id: string = generateOrderId();
    const order: Order = {
      id,
      customer_name:  form.name,
      email:          form.email,
      phone:          form.phone,
      address:        `${form.address}, ${form.city} — ${form.pincode}`,
      city:           form.city,
      pincode:        form.pincode,
      total:          discountedTotal,
      status:         'pending',
      payment_status: 'submitted',
      notes:          form.notes || undefined,
      referral_code:  (appliedPromo?.type === 'referral' ? appliedPromo.code : undefined),
      coupon_code:    (appliedPromo?.type === 'coupon' ? appliedPromo.code : undefined),
      user_id:        user?.id || undefined,
      items: items.map((item, idx) => ({
        id:            `${id}-${idx}`,
        order_id:      id,
        product_id:    item.product.id,
        product_title: item.product.title,
        variant_id:    item.variant.id,
        size:          item.variant.size,
        quantity:      item.quantity,
        unit_price:    item.variant.price,
      })),
      payment: {
        id:               `PAY-${id}`,
        order_id:         id,
        payment_method:   'UPI',
        transaction_id:   txnId.trim(),
        screenshot_url:   screenshotUrl || undefined,
        verified:         false,
      },
      created_at: new Date().toISOString(),
    };

    // Persist locally first (instant + offline-safe)
    saveLocalOrder(order);

    // Then try to hit the API (Supabase + email) — fire-and-forget
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    }).catch(() => {});

    clearCart();
    clearCartEmail();
    setLoading(false);
    router.push(`/order-success?id=${id}&email=${encodeURIComponent(form.email)}&name=${encodeURIComponent(form.name)}`);
  };

  if (items.length === 0 && step < 2) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl font-black text-white tracking-widest">BAG IS EMPTY</h1>
          <a href="/collections" className="mt-4 block text-white/35 hover:text-white text-xs tracking-widest underline">BACK TO SHOP</a>
        </div>
      </div>
    );
  }

  const field = (
    name: keyof FormData, label: string,
    type = 'text', full = false, placeholder = ''
  ) => (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="text-[10px] tracking-[0.3em] text-white/35 block mb-2">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[name]}
        onChange={e => { setForm(f => ({ ...f, [name]: e.target.value })); setErrors(er => ({ ...er, [name]: '' })); }}
        className={`w-full bg-[#0e0e0e] border text-white text-sm px-4 py-3 outline-none focus:border-white/50 transition-colors placeholder:text-white/15 ${
          errors[name] ? 'border-red-500/60' : 'border-white/8'
        }`}
      />
      {errors[name] && <p className="mt-1 text-[11px] text-red-400">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="bg-black min-h-screen pt-24">
      <div className="max-w-3xl mx-auto px-6 py-14">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl font-black text-white tracking-tight mb-12">
          CHECKOUT
        </motion.h1>

        <StepBar step={step} />

        <AnimatePresence mode="wait">
          {/* ── Step 0 — Customer Details ── */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {field('name',    'FULL NAME',  'text',  true)}
                {field('email',   'EMAIL',      'email')}
                {field('phone',   'PHONE',      'tel',   false, '10-digit mobile')}
                {field('address', 'ADDRESS',    'text',  true,  'Street, Area')}
                {field('city',    'CITY',       'text')}
                {field('pincode', 'PINCODE',    'text',  false, '6-digit')}
                {field('notes',   'ORDER NOTES (OPTIONAL)', 'text', true)}
              </div>
              <button onClick={() => validate() && setStep(1)}
                className="mt-10 flex items-center gap-3 bg-white text-black px-8 py-4 text-[11px] tracking-[0.25em] font-semibold hover:bg-white/90 transition-colors">
                REVIEW ORDER <ChevronRight size={14} />
              </button>
            </motion.div>
          )}

          {/* ── Step 1 — Review ── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* Items */}
                <div className="md:col-span-3">
                  <p className="text-[10px] tracking-[0.4em] text-white/30 mb-6">ITEMS</p>
                  <div className="space-y-5">
                    {items.map(item => (
                      <div key={item.variant.id} className="flex gap-4">
                        <div className="w-16 h-20 bg-zinc-900 shrink-0 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950" />
                        </div>
                        <div className="flex-1 flex justify-between items-start">
                          <div>
                            <p className="text-sm text-white font-medium">{item.product.title}</p>
                            <p className="text-[11px] text-white/35 mt-1">Size: {item.variant.size} · Qty: {item.quantity}</p>
                          </div>
                          <span className="text-sm text-white">{formatPrice(item.variant.price * item.quantity)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/8 space-y-3">
                    {/* Promo/Discount code field */}
                    <div>
                      <p className="text-[10px] tracking-[0.3em] text-white/25 mb-3">DISCOUNT OR REFERRAL CODE (OPTIONAL)</p>
                      {appliedPromo ? (
                        <div className="flex items-center justify-between text-green-400 text-xs tracking-widest bg-green-400/5 border border-green-500/20 px-3 py-2">
                          <span className="flex items-center gap-2">
                            <Tag size={12} />
                            {appliedPromo.code} — {appliedPromo.discountType === 'percent' ? `${appliedPromo.discountValue}%` : `₹${appliedPromo.discountValue}`} off applied
                          </span>
                          <button
                            type="button"
                            onClick={() => { setAppliedPromo(null); setPromoInput(''); }}
                            className="text-white/40 hover:text-white/80 transition-colors text-[9px] border border-white/10 hover:border-white/30 px-2 py-0.5 tracking-wider"
                          >
                            REMOVE
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            value={promoInput}
                            onChange={e => setPromoInput(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === 'Enter' && applyPromoCode()}
                            placeholder="ENTER CODE"
                            className="flex-1 bg-black border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-white/30 font-mono tracking-widest"
                          />
                          <button
                            type="button"
                            onClick={applyPromoCode}
                            disabled={checkingPromo || !promoInput.trim()}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 text-xs tracking-[0.15em] transition-colors disabled:opacity-40"
                          >
                            {checkingPromo ? '...' : 'APPLY'}
                          </button>
                        </div>
                      )}
                      {promoError && <p className="text-red-400 text-[10px] tracking-widest mt-2">{promoError}</p>}
                    </div>

                    <div className="flex justify-between text-white/40 text-sm pt-2">
                      <span className="tracking-[0.2em] text-[11px]">SUBTOTAL</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-400 text-sm">
                        <span className="tracking-[0.2em] text-[11px]">DISCOUNT</span>
                        <span>−{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-white tracking-wider pt-3 border-t border-white/8">
                      <span className="text-[11px] tracking-[0.3em]">TOTAL</span>
                      <span>{formatPrice(discountedTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery */}
                <div className="md:col-span-2">
                  <p className="text-[10px] tracking-[0.4em] text-white/30 mb-6">DELIVER TO</p>
                  <div className="bg-[#0e0e0e] border border-white/8 p-5 space-y-1.5">
                    <p className="text-sm text-white font-medium">{form.name}</p>
                    <p className="text-xs text-white/40">{form.email}</p>
                    <p className="text-xs text-white/40">{form.phone}</p>
                    <p className="text-xs text-white/40 pt-2">{form.address}</p>
                    <p className="text-xs text-white/40">{form.city} — {form.pincode}</p>
                    {form.notes && <p className="text-xs text-white/25 pt-2 border-t border-white/5">{form.notes}</p>}
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button onClick={() => setStep(0)} className="border border-white/15 text-white/60 px-7 py-4 text-[11px] tracking-widest hover:border-white/40 hover:text-white transition-colors">
                  BACK
                </button>
                <button onClick={() => setStep(2)} className="flex items-center gap-3 bg-white text-black px-8 py-4 text-[11px] tracking-[0.25em] font-semibold hover:bg-white/90 transition-colors">
                  PROCEED TO PAYMENT <ChevronRight size={13} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2 — UPI Payment ── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="max-w-md">
              <div className="bg-[#0a0a0a] border border-white/8 p-8">
                <p className="text-[10px] tracking-[0.4em] text-white/30 mb-7">UPI PAYMENT</p>

                {/* QR placeholder */}
                <div className="flex justify-center mb-6">
                  <div className="w-44 h-44 bg-white p-3 relative">
                    {/* Stylised QR grid */}
                    <div className="grid grid-cols-9 gap-[1.5px] w-full h-full">
                      {Array.from({ length: 81 }).map((_, i) => {
                        // Corner squares
                        const row = Math.floor(i / 9), col = i % 9;
                        const inTopLeft     = row < 3 && col < 3;
                        const inTopRight    = row < 3 && col > 5;
                        const inBottomLeft  = row > 5 && col < 3;
                        const isCornerFrame = inTopLeft || inTopRight || inBottomLeft;
                        const isInner       = (row === 1 && col === 1) || (row === 1 && col === 7) || (row === 7 && col === 1);
                        return (
                          <div key={i} className="aspect-square"
                            style={{ backgroundColor: isCornerFrame || isInner || Math.random() > 0.55 ? '#000' : '#fff' }}
                          />
                        );
                      })}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white px-1.5 py-0.5">
                        <span className="text-[8px] font-black tracking-widest text-black">NOYR</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* UPI ID */}
                <div className="text-center mb-7">
                  <p className="text-[10px] tracking-[0.3em] text-white/30 mb-2">UPI ID</p>
                  <button
                    onClick={() => { navigator.clipboard?.writeText(UPI_ID); }}
                    className="font-mono text-base text-white border border-white/15 px-5 py-2 hover:border-white/40 transition-colors tracking-widest"
                  >
                    {UPI_ID}
                  </button>
                  <p className="mt-3 text-sm text-white">
                    Amount: <span className="font-semibold text-white">{formatPrice(discountedTotal)}</span>
                  </p>
                </div>

                <p className="text-[11px] text-white/30 leading-relaxed text-center mb-7 border-t border-white/8 pt-6">
                  After payment, enter the Transaction ID / UTR from your UPI app below.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] tracking-[0.3em] text-white/35 block mb-2">TRANSACTION ID / UTR *</label>
                    <input
                      type="text"
                      value={txnId}
                      onChange={e => setTxnId(e.target.value)}
                      placeholder="e.g. 409123456789"
                      className="w-full bg-black border border-white/10 focus:border-white/40 text-white text-sm px-4 py-3 outline-none placeholder:text-white/15 transition-colors font-mono tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] tracking-[0.3em] text-white/35 block mb-2">SCREENSHOT (OPTIONAL)</label>
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="w-full border border-dashed border-white/10 hover:border-white/30 py-4 text-[11px] tracking-widest text-white/30 hover:text-white/60 transition-all flex items-center justify-center gap-2"
                    >
                      <Upload size={13} />
                      {uploading ? 'UPLOADING…' : screenshotName || 'ATTACH SCREENSHOT'}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button onClick={() => setStep(1)}
                  className="border border-white/15 text-white/50 px-6 py-4 text-[11px] tracking-widest hover:border-white/40 hover:text-white transition-colors">
                  BACK
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={!txnId.trim() || loading}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 text-[11px] tracking-[0.25em] font-semibold transition-all ${
                    !txnId.trim() || loading
                      ? 'bg-white/10 text-white/30 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-white/90'
                  }`}
                >
                  {loading
                    ? <><Loader2 size={14} className="animate-spin" /> PLACING ORDER…</>
                    : <><Check size={14} /> CONFIRM ORDER</>
                  }
                </button>
              </div>

              <p className="mt-4 text-[10px] text-white/20 leading-relaxed">
                Payment verification within 24 hours. Ships within 3–5 business days after verification.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
