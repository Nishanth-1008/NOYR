'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Check } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate send
    setTimeout(() => setSent(true), 600);
  };

  return (
    <div className="bg-black min-h-screen pt-24">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-6xl font-black text-white tracking-widest mb-4">CONTACT</h1>
          <p className="text-white/40 text-sm mb-16">
            Questions? Issues with an order? We&apos;ll get back to you within 24 hours.
          </p>
        </motion.div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Check size={48} className="text-white mx-auto mb-6" />
            <h2 className="font-display text-3xl font-black text-white tracking-widest">MESSAGE SENT</h2>
            <p className="mt-4 text-white/40 text-sm">We&apos;ll respond within 24 hours.</p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] tracking-[0.3em] text-white/40 block mb-2">NAME</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-white text-white text-sm px-4 py-3 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.3em] text-white/40 block mb-2">EMAIL</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-zinc-900 border border-white/10 focus:border-white text-white text-sm px-4 py-3 outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] text-white/40 block mb-2">SUBJECT</label>
              <select
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                className="w-full bg-zinc-900 border border-white/10 focus:border-white text-white text-sm px-4 py-3 outline-none transition-colors"
              >
                <option value="">Select a subject</option>
                <option value="order">Order Enquiry</option>
                <option value="payment">Payment Issue</option>
                <option value="return">Return / Exchange</option>
                <option value="product">Product Question</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] tracking-[0.3em] text-white/40 block mb-2">MESSAGE</label>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="w-full bg-zinc-900 border border-white/10 focus:border-white text-white text-sm px-4 py-3 outline-none transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-3 bg-white text-black px-8 py-4 text-xs tracking-[0.25em] font-semibold hover:bg-white/90 transition-colors"
            >
              <Send size={14} /> SEND MESSAGE
            </button>
          </motion.form>
        )}

        {/* Contact info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 border-t border-white/10 pt-10 grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div>
            <p className="text-[10px] tracking-[0.4em] text-white/30 mb-2">EMAIL</p>
            <p className="text-sm text-white/60">contact@noyr.in</p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.4em] text-white/30 mb-2">RESPONSE TIME</p>
            <p className="text-sm text-white/60">Within 24 hours</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
