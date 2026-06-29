'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'How does payment work?',
    a: 'We currently accept UPI payments only. During checkout, you will see our UPI ID and QR code. After transferring the amount, enter your transaction ID. Our team will verify within 24 hours.',
  },
  {
    q: 'How long does delivery take?',
    a: 'After payment verification, orders are processed and shipped within 3–5 business days. Delivery typically takes 5–7 business days depending on your location.',
  },
  {
    q: 'Can I cancel my order?',
    a: 'Orders can be cancelled before payment verification. Once payment is verified and the order moves to processing, cancellations are not possible. Contact us immediately if you need to cancel.',
  },
  {
    q: 'What is your return policy?',
    a: 'We accept returns within 7 days of delivery for manufacturing defects only. Items must be unworn, unwashed, with all tags intact. Size exchanges are available subject to stock.',
  },
  {
    q: 'How do I track my order?',
    a: 'Use the Track Order page with your order ID. Once shipped, we will update the status. Shipping tracking numbers will be added to your order when available.',
  },
  {
    q: 'Are the fabrics pre-shrunk?',
    a: 'Yes. All NOYR garments are enzyme washed and pre-treated during production. Wash in cold water and air dry to maintain the garment best.',
  },
  {
    q: 'What sizes do you offer?',
    a: 'We currently offer XS to XXL depending on the product. Check the Size Guide for detailed measurements. NOYR pieces are designed oversized — size down if you prefer a closer fit.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Currently domestic India only. International shipping is planned for future collections.',
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="bg-black min-h-screen pt-24">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-6xl font-black text-white tracking-widest mb-16">FAQ</h1>
        </motion.div>
        <div className="divide-y divide-white/10">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex justify-between items-start py-6 text-left gap-8"
              >
                <span className="text-sm font-medium text-white tracking-wider">{faq.q}</span>
                <motion.div animate={{ rotate: open === i ? 180 : 0 }} className="shrink-0 mt-0.5">
                  <ChevronDown size={16} className="text-white/40" />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 text-sm text-white/50 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
