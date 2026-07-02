'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

const INTERESTS = [
  'NEW DROPS', 'RESTOCKS', 'JOURNAL POSTS', 'BEHIND THE SCENES', 'EARLY ACCESS',
];

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>(['NEW DROPS', 'EARLY ACCESS']);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggle = (tag: string) =>
    setSelected(s => s.includes(tag) ? s.filter(x => x !== tag) : [...s, tag]);

  const handleSubmit = async () => {
    if (!email.includes('@')) { setError('Enter a valid email.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to subscribe.');
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Could not reach the server. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <div className="flex-1 max-w-[700px] mx-auto w-full px-8 py-32 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-[10px] tracking-[0.5em] text-white/20 mb-6">NOYR</p>
                <h1 className="font-display text-[clamp(3rem,8vw,7rem)] font-black text-white leading-none tracking-tight mb-4">
                  JOIN THE<br />LIST.
                </h1>
                <p className="text-white/35 text-sm leading-relaxed mb-12 max-w-sm">
                  No noise. Only drops, restocks, and things worth reading. Unsubscribe whenever.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="flex flex-col gap-5">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-[0.3em] text-white/25">NAME (OPTIONAL)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="bg-transparent border-b border-white/15 focus:border-white/40 text-white text-base py-3 outline-none transition-colors placeholder:text-white/15"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-[0.3em] text-white/25">EMAIL *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="your@email.com"
                    className="bg-transparent border-b border-white/15 focus:border-white/40 text-white text-base py-3 outline-none transition-colors placeholder:text-white/15"
                  />
                  {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>

                {/* Interests */}
                <div className="flex flex-col gap-3 mt-2">
                  <label className="text-[10px] tracking-[0.3em] text-white/25">NOTIFY ME ABOUT</label>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggle(tag)}
                        className={`text-[10px] tracking-[0.2em] px-4 py-2 border transition-all font-medium ${
                          selected.includes(tag)
                            ? 'border-white text-white bg-white/10'
                            : 'border-white/15 text-white/30 hover:border-white/30 hover:text-white/50'
                        }`}
                      >
                        {selected.includes(tag) && <span className="mr-1.5 text-[#cc0000]">✦</span>}
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="mt-6 bg-white text-black px-10 py-4 text-[11px] tracking-[0.3em] font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 self-start"
                >
                  {loading ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
                </button>

                <p className="text-[10px] text-white/15 leading-relaxed mt-2 max-w-xs">
                  By subscribing, you agree to receive email communications from NOYR. Unsubscribe at any time.
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-start"
            >
              <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center mb-8">
                <Check size={20} className="text-white" />
              </div>
              <h2 className="font-display text-5xl md:text-7xl font-black text-white tracking-tight leading-none mb-6">
                YOU'RE<br />IN.
              </h2>
              <p className="text-white/35 text-sm leading-relaxed max-w-xs">
                {name ? `Welcome, ${name}. ` : ''}We'll reach out when something worth your attention happens.
              </p>
              <div className="mt-10 flex gap-4">
                <a href="/collections" className="text-[11px] tracking-[0.3em] text-white/40 hover:text-white transition-colors border-b border-white/15 pb-0.5">
                  SHOP NOW
                </a>
                <a href="/drops" className="text-[11px] tracking-[0.3em] text-white/40 hover:text-white transition-colors border-b border-white/15 pb-0.5">
                  UPCOMING DROPS
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
