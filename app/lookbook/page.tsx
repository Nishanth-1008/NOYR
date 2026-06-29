'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, X } from 'lucide-react';

const LOOKBOOK_ENTRIES = [
  {
    id: 1,
    season: 'SS.2025',
    collection: 'VOID SEASON 01',
    lookNumber: '01',
    title: 'INTO THE VOID',
    pieces: ['VOID OVERSIZED HOODIE', 'GHOST CARGO PANTS'],
    productSlugs: ['void-oversized-hoodie', 'ghost-cargo-pants'],
    direction: 'Worn oversized. Hood up. Cargo pants tapered at the ankle. This is what leaving looks like.',
    colorStory: 'All black. Zero compromise.',
    bg: 'from-zinc-950 to-black',
  },
  {
    id: 2,
    season: 'SS.2025',
    collection: 'VOID SEASON 01',
    lookNumber: '02',
    title: 'THE WEIGHT',
    pieces: ['VOID OVERSIZED HOODIE', 'SIGNAL TEE'],
    productSlugs: ['void-oversized-hoodie', 'signal-tee'],
    direction: 'Layered. Hoodie open. TEE tucked slightly. The weight of the fabric does the rest.',
    colorStory: 'Black on black. The print only shows in direct light.',
    bg: 'from-zinc-900 to-zinc-950',
  },
  {
    id: 3,
    season: 'SS.2025',
    collection: 'VOID SEASON 01',
    lookNumber: '03',
    title: 'CLEAN EXIT',
    pieces: ['VOID COACH JACKET', 'SIGNAL TEE'],
    productSlugs: ['void-coach-jacket', 'signal-tee'],
    direction: 'Shell jacket, zipped up. Minimal. The jacket packs into its own chest pocket.',
    colorStory: 'Technical black. Moves like water.',
    bg: 'from-black to-zinc-950',
  },
  {
    id: 4,
    season: 'FW.2025',
    collection: 'GHOST PROTOCOL',
    lookNumber: '04',
    title: 'GHOST MODE',
    pieces: ['GHOST PROTOCOL JACKET', 'GHOST CARGO PANTS'],
    productSlugs: ['ghost-protocol-jacket', 'ghost-cargo-pants'],
    direction: 'Full Ghost. The jacket conceals the hood. The cargo pockets stay empty until they need to be full.',
    colorStory: 'Tactical. Ripstop surface catches light differently.',
    bg: 'from-zinc-800 to-zinc-950',
  },
];

/* ── Full-bleed look panel ── */
function LookPanel({ entry, onClick }: { entry: typeof LOOKBOOK_ENTRIES[0]; onClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['8%', '-8%']);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      className="relative h-screen flex items-center overflow-hidden cursor-pointer group"
      onClick={onClick}
      data-cursor="VIEW LOOK"
    >
      {/* Parallax background */}
      <motion.div
        style={{ y: imgY }}
        className={`absolute inset-0 bg-gradient-to-br ${entry.bg} scale-110`}
      />

      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
      }} />

      {/* Large phantom silhouette placeholder */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '-5%']) }}
      >
        <div className="relative w-[280px] h-[420px] md:w-[380px] md:h-[560px]">
          {/* Phantom garment shape */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent rounded-sm" />
          <div className="absolute inset-x-0 top-0 h-1/3 bg-white/[0.04] rounded-t-sm" />
          <div className="absolute bottom-0 left-1/4 right-1/4 h-1/2 bg-white/[0.03]" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-8 md:px-16">
        <div className="grid grid-cols-2 md:grid-cols-3 items-end gap-8">
          {/* Left: look info */}
          <div>
            <p className="text-[9px] tracking-[0.5em] text-white/20 mb-3">{entry.season}</p>
            <p className="text-[9px] tracking-[0.4em] text-white/15 mb-6">{entry.collection}</p>
            <h2 className="font-display text-4xl md:text-6xl font-black text-white leading-none tracking-tight">
              LOOK<br />
              <span className="text-white/20">{entry.lookNumber}</span>
            </h2>
          </div>

          {/* Center: title (desktop) */}
          <div className="hidden md:block text-center">
            <p className="font-display text-2xl font-black text-white/20 tracking-widest">{entry.title}</p>
          </div>

          {/* Right: pieces + CTA */}
          <div className="text-right">
            <div className="mb-6">
              {entry.pieces.map(p => (
                <p key={p} className="text-[10px] tracking-[0.2em] text-white/40 mb-1">{p}</p>
              ))}
            </div>
            <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] text-white/20 group-hover:text-white transition-colors">
              VIEW LOOK <ArrowUpRight size={11} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5" />
    </motion.div>
  );
}

/* ── Look detail overlay ── */
function LookOverlay({ entry, onClose }: { entry: typeof LOOKBOOK_ENTRIES[0]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col"
      onClick={onClose}
    >
      <button
        className="absolute top-6 right-8 text-white/30 hover:text-white transition-colors z-10"
        onClick={onClose}
      >
        <X size={22} />
      </button>

      <div
        className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Left: visual */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={`bg-gradient-to-br ${entry.bg} flex items-center justify-center min-h-[50vh] md:min-h-full`}
        >
          <div className="text-center">
            <p className="font-display text-[12vw] md:text-[8vw] font-black text-white/5 tracking-widest">
              {String(entry.lookNumber).padStart(2,'0')}
            </p>
            <p className="text-[10px] tracking-[0.4em] text-white/20 -mt-4">{entry.title}</p>
          </div>
        </motion.div>

        {/* Right: details */}
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col justify-center px-10 py-16 md:px-16"
        >
          <p className="text-[9px] tracking-[0.5em] text-white/20 mb-2">{entry.season} — {entry.collection}</p>
          <h2 className="font-display text-5xl md:text-7xl font-black text-white tracking-tight leading-none mb-12">
            LOOK {entry.lookNumber}
          </h2>

          <div className="mb-8">
            <p className="text-[10px] tracking-[0.35em] text-white/25 mb-4">THE DIRECTION</p>
            <p className="text-white/50 text-sm leading-relaxed">{entry.direction}</p>
          </div>

          <div className="mb-10">
            <p className="text-[10px] tracking-[0.35em] text-white/25 mb-4">COLOR STORY</p>
            <p className="text-white/50 text-sm leading-relaxed">{entry.colorStory}</p>
          </div>

          <div className="mb-10">
            <p className="text-[10px] tracking-[0.35em] text-white/25 mb-4">THE PIECES</p>
            <div className="flex flex-col gap-3">
              {entry.pieces.map((piece, i) => (
                <Link
                  key={piece}
                  href={`/products/${entry.productSlugs[i]}`}
                  className="group flex items-center justify-between border border-white/10 hover:border-white/30 px-5 py-3.5 transition-colors"
                  onClick={onClose}
                >
                  <span className="text-[11px] tracking-[0.2em] text-white font-medium">{piece}</span>
                  <ArrowUpRight size={13} className="text-white/30 group-hover:text-white transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/collections"
            className="text-[10px] tracking-[0.3em] text-white/25 hover:text-white transition-colors inline-flex items-center gap-2"
            onClick={onClose}
          >
            SHOP ALL PIECES <ArrowUpRight size={11} />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function LookbookPage() {
  const [activeLook, setActiveLook] = useState<typeof LOOKBOOK_ENTRIES[0] | null>(null);

  return (
    <div className="bg-black">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-8 md:px-16 pt-32 pb-16 border-b border-white/8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[10px] tracking-[0.4em] text-white/20 mb-4">SS.2025 — FW.2025</p>
          <h1 className="font-display text-[clamp(4rem,10vw,9rem)] font-black text-white tracking-tight leading-none">
            LOOKBOOK
          </h1>
          <p className="mt-6 text-white/30 text-sm max-w-md leading-relaxed">
            How to wear NOYR. Each look is a complete statement. Scroll to explore. Click to go deeper.
          </p>
        </motion.div>
      </div>

      {/* Look panels — full screen scroll */}
      {LOOKBOOK_ENTRIES.map(entry => (
        <LookPanel key={entry.id} entry={entry} onClick={() => setActiveLook(entry)} />
      ))}

      {/* Credits footer */}
      <div className="max-w-[1400px] mx-auto px-8 md:px-16 py-20 border-t border-white/8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div>
            <p className="text-[9px] tracking-[0.4em] text-white/15 mb-2">CREATIVE DIRECTION</p>
            <p className="text-white/30 text-sm">NOYR Studio</p>
          </div>
          <Link
            href="/collections"
            className="group flex items-center gap-3 border border-white/15 px-8 py-3.5 text-[11px] tracking-[0.25em] text-white/45 hover:text-white hover:border-white transition-all"
          >
            SHOP THE LOOKS <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Look overlay */}
      <AnimatePresence>
        {activeLook && (
          <LookOverlay entry={activeLook} onClose={() => setActiveLook(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
