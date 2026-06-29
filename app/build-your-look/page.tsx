'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { products } from '@/data/products';

/* ── Question flow ── */
const STEPS = [
  {
    id: 'vibe',
    q: 'WHAT\'S YOUR VIBE RIGHT NOW?',
    options: [
      { label: 'MOVING CLEAN', desc: 'Minimal. Intentional. Nothing extra.', value: 'clean' },
      { label: 'LAYERED UP', desc: 'Heavy. Complex. Multiple pieces.', value: 'layered' },
      { label: 'GHOST MODE', desc: 'Tactical. Functional. Utility first.', value: 'ghost' },
      { label: 'VOID WALK', desc: 'All black. Oversized. Statement weight.', value: 'void' },
    ],
  },
  {
    id: 'occasion',
    q: 'WHERE ARE YOU WEARING THIS?',
    options: [
      { label: 'EVERYDAY', desc: 'Built for movement. Works anywhere.', value: 'everyday' },
      { label: 'NIGHT', desc: 'After dark. When it matters more.', value: 'night' },
      { label: 'STATEMENT', desc: 'When you want to be seen.', value: 'statement' },
      { label: 'DISAPPEAR', desc: 'When you don\'t.', value: 'disappear' },
    ],
  },
  {
    id: 'anchor',
    q: 'WHAT\'S YOUR ANCHOR PIECE?',
    options: [
      { label: 'TOP', desc: 'Start with what you wear on your chest.', value: 'top' },
      { label: 'BOTTOM', desc: 'Build everything from the ground up.', value: 'bottom' },
      { label: 'OUTERWEAR', desc: 'The outermost layer defines the look.', value: 'outerwear' },
      { label: 'SURPRISE ME', desc: 'You decide. I\'ll trust it.', value: 'any' },
    ],
  },
];

/* ── Recommendation logic ── */
function getRecommendations(answers: Record<string, string>) {
  const { vibe, anchor } = answers;
  
  let recs = products.filter(p => p.active);

  if (anchor === 'top') recs = [...products.filter(p => ['tops', 'hoodies'].includes(p.category) && p.active)];
  else if (anchor === 'bottom') recs = [...products.filter(p => p.category === 'bottoms' && p.active)];
  else if (anchor === 'outerwear') recs = [...products.filter(p => p.category === 'outerwear' && p.active)];

  if (recs.length === 0) recs = products.filter(p => p.active);

  // Sort by relevance score
  const scored = recs.map(p => {
    let score = 0;
    if (vibe === 'void' && ['hoodies', 'outerwear'].includes(p.category)) score += 3;
    if (vibe === 'ghost' && ['bottoms', 'outerwear'].includes(p.category)) score += 3;
    if (vibe === 'layered') score += 1;
    if (p.limited) score += 1;
    return { ...p, score };
  }).sort((a, b) => b.score - a.score);

  return scored.slice(0, 3);
}

/* ── Option button ── */
function OptionBtn({ option, selected, onSelect }: {
  option: { label: string; desc: string; value: string };
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={`w-full text-left border p-5 md:p-6 transition-all group ${
        selected
          ? 'border-white bg-white/5'
          : 'border-white/10 hover:border-white/30'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-[11px] tracking-[0.25em] font-semibold mb-1 transition-colors ${selected ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}>
            {option.label}
          </p>
          <p className={`text-[11px] leading-relaxed transition-colors ${selected ? 'text-white/50' : 'text-white/25'}`}>
            {option.desc}
          </p>
        </div>
        <div className={`w-5 h-5 rounded-full border shrink-0 mt-0.5 flex items-center justify-center transition-all ${
          selected ? 'border-white bg-white' : 'border-white/20'
        }`}>
          {selected && <div className="w-2 h-2 rounded-full bg-black" />}
        </div>
      </div>
    </motion.button>
  );
}

export default function BuildLookPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const currentStep = STEPS[step];
  const recs = done ? getRecommendations(answers) : [];
  const progress = ((step) / STEPS.length) * 100;

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const selectOption = (value: string) => {
    const newAnswers = { ...answers, [currentStep.id]: value };
    setAnswers(newAnswers);
    if (step < STEPS.length - 1) {
      setTimeout(() => setStep(s => s + 1), 250);
    } else {
      setTimeout(() => setDone(true), 250);
    }
  };

  const reset = () => { setAnswers({}); setStep(0); setDone(false); };

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <div className="max-w-[800px] mx-auto w-full px-8 py-32 flex-1 flex flex-col">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <p className="text-[10px] tracking-[0.5em] text-white/20 mb-4">NOYR</p>
          <h1 className="font-display text-5xl md:text-7xl font-black text-white tracking-tight leading-none">
            BUILD<br />YOUR LOOK.
          </h1>
        </motion.div>

        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key={`step-${step}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
              {/* Progress */}
              <div className="mb-10">
                <div className="flex justify-between mb-3">
                  <p className="text-[9px] tracking-[0.4em] text-white/20">{step + 1}/{STEPS.length}</p>
                  <p className="text-[9px] tracking-[0.4em] text-white/20">{Math.round(progress)}%</p>
                </div>
                <div className="h-px bg-white/8 w-full">
                  <motion.div
                    className="h-full bg-[#cc0000]"
                    initial={{ width: `${((step) / STEPS.length) * 100}%` }}
                    animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>

              <h2 className="font-display text-3xl md:text-4xl font-black text-white tracking-tight mb-8">
                {currentStep.q}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {currentStep.options.map(opt => (
                  <OptionBtn
                    key={opt.value}
                    option={opt}
                    selected={answers[currentStep.id] === opt.value}
                    onSelect={() => selectOption(opt.value)}
                  />
                ))}
              </div>

              {/* Back */}
              {step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="mt-8 text-[10px] tracking-[0.3em] text-white/20 hover:text-white/50 transition-colors"
                >
                  ← BACK
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-10">
                <h2 className="font-display text-4xl font-black text-white tracking-tight mb-3">YOUR LOOK</h2>
                <p className="text-white/35 text-sm">Based on your choices. Three pieces. One direction.</p>
              </div>

              <div className="flex flex-col gap-3 mb-10">
                {recs.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={`/products/${product.slug}`}
                      className="group flex items-center gap-5 border border-white/8 hover:border-white/25 p-5 transition-all"
                    >
                      {/* Phantom product */}
                      <div className="w-16 h-16 bg-zinc-900 border border-white/8 flex items-center justify-center shrink-0">
                        <span className="font-display text-xs font-black text-white/10">{String(i + 1).padStart(2, '0')}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] tracking-[0.3em] text-white/20 mb-1">{product.category.toUpperCase()}</p>
                        <p className="font-display text-lg font-black text-white tracking-wide group-hover:text-white/70 transition-colors">{product.title}</p>
                        <p className="text-[11px] text-white/30 mt-0.5">{formatPrice(product.price)}</p>
                      </div>
                      <ArrowUpRight size={16} className="text-white/20 group-hover:text-white transition-colors shrink-0" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/collections"
                  className="flex items-center gap-2 bg-white text-black px-8 py-3.5 text-[11px] tracking-[0.25em] font-semibold hover:bg-white/90 transition-colors"
                >
                  SHOP ALL <ArrowUpRight size={12} />
                </Link>
                <button
                  onClick={reset}
                  className="text-[11px] tracking-[0.25em] text-white/30 hover:text-white transition-colors border-b border-white/10 pb-0.5"
                >
                  BUILD ANOTHER
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
