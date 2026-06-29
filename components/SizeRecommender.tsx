'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, X } from 'lucide-react';

interface SizeRecommenderProps {
  category: string;
  onSelect: (size: string) => void;
}

const SIZE_CHARTS: Record<string, {
  label: string;
  fields: string[];
  sizes: { size: string; ranges: Record<string, [number, number]> }[];
}> = {
  hoodies: {
    label: 'hoodie',
    fields: ['chest', 'height'],
    sizes: [
      { size: 'S',  ranges: { chest: [86, 96],  height: [155, 170] } },
      { size: 'M',  ranges: { chest: [96, 106], height: [165, 178] } },
      { size: 'L',  ranges: { chest: [106, 116], height: [175, 185] } },
      { size: 'XL', ranges: { chest: [116, 128], height: [182, 195] } },
    ],
  },
  tops: {
    label: 'tee',
    fields: ['chest', 'height'],
    sizes: [
      { size: 'S',  ranges: { chest: [84, 94],  height: [155, 170] } },
      { size: 'M',  ranges: { chest: [94, 104], height: [165, 178] } },
      { size: 'L',  ranges: { chest: [104, 114], height: [175, 185] } },
      { size: 'XL', ranges: { chest: [114, 126], height: [182, 195] } },
    ],
  },
  bottoms: {
    label: 'cargo',
    fields: ['waist', 'height'],
    sizes: [
      { size: 'S',  ranges: { waist: [66, 74],  height: [155, 172] } },
      { size: 'M',  ranges: { waist: [74, 82],  height: [165, 180] } },
      { size: 'L',  ranges: { waist: [82, 90],  height: [175, 188] } },
      { size: 'XL', ranges: { waist: [90, 100], height: [183, 196] } },
    ],
  },
  outerwear: {
    label: 'jacket',
    fields: ['chest', 'height'],
    sizes: [
      { size: 'S',  ranges: { chest: [86, 96],  height: [155, 170] } },
      { size: 'M',  ranges: { chest: [96, 106], height: [165, 178] } },
      { size: 'L',  ranges: { chest: [106, 116], height: [175, 185] } },
      { size: 'XL', ranges: { chest: [116, 128], height: [182, 195] } },
    ],
  },
};

const FIELD_LABELS: Record<string, string> = {
  chest: 'CHEST (cm)',
  waist: 'WAIST (cm)',
  height: 'HEIGHT (cm)',
};

export default function SizeRecommender({ category, onSelect }: SizeRecommenderProps) {
  const [open, setOpen] = useState(false);
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);

  const chart = SIZE_CHARTS[category] ?? SIZE_CHARTS.tops;

  const recommend = () => {
    const vals = Object.fromEntries(
      chart.fields.map(f => [f, parseFloat(measurements[f] ?? '0')])
    );

    let best: string | null = null;
    for (const entry of chart.sizes) {
      const fits = chart.fields.every(f => {
        const v = vals[f];
        const [lo, hi] = entry.ranges[f];
        return v >= lo && v <= hi;
      });
      if (fits) { best = entry.size; break; }
    }

    // Fallback: find closest by chest/waist
    if (!best) {
      const primaryField = chart.fields[0];
      const v = vals[primaryField];
      if (v > 0) {
        let minDiff = Infinity;
        for (const entry of chart.sizes) {
          const mid = (entry.ranges[primaryField][0] + entry.ranges[primaryField][1]) / 2;
          const diff = Math.abs(v - mid);
          if (diff < minDiff) { minDiff = diff; best = entry.size; }
        }
      }
    }

    setResult(best);
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-xs tracking-[0.2em] text-white/40 hover:text-white transition-colors"
      >
        <Ruler size={12} />
        FIND MY SIZE
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-zinc-950 border border-white/10 p-8 w-full max-w-sm"
            >
              <div className="flex justify-between items-center mb-6">
                <p className="text-xs tracking-[0.3em] text-white/40">FIND YOUR {chart.label.toUpperCase()} SIZE</p>
                <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {chart.fields.map(field => (
                  <div key={field}>
                    <label className="text-[10px] tracking-[0.3em] text-white/30 block mb-2">{FIELD_LABELS[field]}</label>
                    <input
                      type="number"
                      placeholder={field === 'height' ? '175' : '96'}
                      value={measurements[field] ?? ''}
                      onChange={e => setMeasurements(m => ({ ...m, [field]: e.target.value }))}
                      className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={recommend}
                className="w-full bg-white text-black py-3 text-xs font-semibold tracking-[0.2em] hover:bg-white/90 transition-colors mb-4"
              >
                RECOMMEND MY SIZE
              </button>

              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <p className="text-xs tracking-[0.3em] text-white/30 mb-2">WE RECOMMEND</p>
                    <p className="font-display text-5xl font-black text-white mb-4">{result}</p>
                    <button
                      onClick={() => { onSelect(result); setOpen(false); }}
                      className="text-xs tracking-[0.2em] text-white border border-white/20 px-6 py-2 hover:bg-white hover:text-black transition-colors"
                    >
                      SELECT SIZE {result}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-[10px] text-white/20 mt-6 text-center leading-relaxed">
                NOYR pieces are cut oversized. When between sizes, size down for a regular fit.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
