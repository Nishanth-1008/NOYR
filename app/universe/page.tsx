'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, ChevronDown } from 'lucide-react';

/* ── Lore data ── */
const CHAPTERS = [
  {
    id: '01',
    title: 'THE VOID',
    subtitle: 'Season Zero',
    body: `Before NOYR, there was the question.\n\nWhat do you wear when the world runs out of stories to tell you? When every brand is a billboard, every drop a performance, every piece a placeholder for something that was never actually there?\n\nThe void is not darkness. It is the space between who you were told to be and who you chose to become. The void is where NOYR begins.`,
    accent: 'ORIGIN',
  },
  {
    id: '02',
    title: 'THE SIGNAL',
    subtitle: 'Purpose',
    body: `NOYR does not dress a trend. It dresses an intention.\n\nEvery piece is built with a singular obsession: weight. Weight of fabric. Weight of decision. Weight of the person wearing it.\n\nYou do not put on NOYR. You pick it up. You carry it. You decide if you're ready for what it means to exist without apology.`,
    accent: 'PHILOSOPHY',
  },
  {
    id: '03',
    title: 'GHOST PROTOCOL',
    subtitle: 'Invisibility as Power',
    body: `The second chapter of NOYR was born from a simple observation: the most powerful people in any room are the ones you didn't notice enter.\n\nPresence through absence. Movement through stillness. The Ghost Protocol collection is not about being seen. It is about choosing whether or not to be seen — and either way, being ready.`,
    accent: 'COLLECTION',
  },
  {
    id: '04',
    title: 'THE FUTURE',
    subtitle: 'What Comes Next',
    body: `NOYR is not a brand. It is a position.\n\nWe are building toward something that does not yet have a name. A clothing line that doubles as a record of a moment. A collection that documents what it felt like to be alive and unresolved at this particular point in time.\n\nThe next chapter drops when it is ready. Not before.`,
    accent: 'WHAT\'S NEXT',
  },
];

const PILLARS = [
  { title: 'WEIGHT', body: 'Clothing that costs more per kilo than most brands dare to use. Because cheap fabric is a decision you feel every time you put something on.' },
  { title: 'SILENCE', body: 'No logo. No shout. No desperate grab for attention. The piece speaks on its own terms or it does not speak at all.' },
  { title: 'INTENTION', body: 'Every stitch has a reason. Every dimension has been considered. Nothing exists in a NOYR piece by accident.' },
  { title: 'PERMANENCE', body: 'We build for ten years, not one season. The day you buy it should not be the best day it ever looks.' },
];

const TIMELINE = [
  { year: '2024', event: 'NOYR Founded', detail: 'The question is asked. What comes after?' },
  { year: '2025.Q1', event: 'Void Season 01', detail: 'The first four pieces. The centrepiece hoodie.' },
  { year: '2025.Q3', event: 'Ghost Protocol', detail: 'Collection 02. Utility as aesthetic.' },
  { year: '2026', event: 'The Next Chapter', detail: 'Unnamed. Unannounced. In progress.' },
];

/* ── Chapter component ── */
function Chapter({ chapter, index }: { chapter: typeof CHAPTERS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['30px', '-30px']);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-0 py-24 border-b border-white/8"
    >
      {/* Number + accent */}
      <div className="md:col-span-2 flex md:flex-col items-center md:items-start gap-4 md:gap-0">
        <span className="font-mono text-[10px] tracking-[0.4em] text-white/15">{chapter.id}</span>
        <span className="hidden md:block mt-6 text-[9px] tracking-[0.4em] text-[#cc0000]/50 rotate-90 origin-left translate-y-16">
          {chapter.accent}
        </span>
      </div>

      {/* Main content */}
      <motion.div style={{ y }} className="md:col-span-7">
        <p className="text-[10px] tracking-[0.4em] text-white/20 mb-4">{chapter.subtitle.toUpperCase()}</p>
        <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] font-black text-white leading-none tracking-tight mb-10">
          {chapter.title}
        </h2>
        {chapter.body.split('\n\n').map((para, i) => (
          <p key={i} className="text-white/40 leading-relaxed text-base mb-5">
            {para}
          </p>
        ))}
      </motion.div>

      {/* Side accent */}
      <div className="md:col-span-3 flex md:flex-col items-end justify-start">
        <div className="hidden md:block w-px h-full bg-gradient-to-b from-white/5 via-white/15 to-transparent mx-auto" />
      </div>
    </motion.div>
  );
}

/* ── Pillar card ── */
function PillarCard({ pillar, index }: { pillar: typeof PILLARS[0]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="border border-white/8 hover:border-white/20 transition-colors cursor-pointer"
      onClick={() => setOpen(v => !v)}
    >
      <div className="p-8 flex items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[9px] tracking-[0.4em] text-white/15">{String(index + 1).padStart(2, '0')}</span>
          <h3 className="font-display text-2xl font-black text-white tracking-widest mt-3">{pillar.title}</h3>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown size={16} className="text-white/30 mt-2 shrink-0" />
        </motion.div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="px-8 pb-8 text-white/40 text-sm leading-relaxed border-t border-white/5 pt-6">
              {pillar.body}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function UniversePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="bg-black min-h-screen">
      {/* ── Hero ── */}
      <section ref={heroRef} className="relative h-screen flex items-center overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 z-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        {/* Centered glow */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(204,0,0,0.06)_0%,transparent_70%)]" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16"
        >
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[10px] tracking-[0.5em] text-white/25 mb-8"
          >
            THE NOYR UNIVERSE
          </motion.p>

          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="font-display text-[clamp(4rem,12vw,11rem)] font-black text-white leading-[0.85] tracking-tight"
            >
              NOT YOUR
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="font-display text-[clamp(4rem,12vw,11rem)] font-black leading-[0.85] tracking-tight text-white/15"
            >
              REALITY.
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-10 text-white/35 max-w-md text-sm leading-relaxed"
          >
            A clothing brand built on questions. Every piece is an answer. Every season, a new chapter.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-8"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 border border-white/20 rounded-full flex items-start justify-center pt-2"
            >
              <div className="w-1 h-2 rounded-full bg-[#cc0000]" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Brand story chapters ── */}
      <section className="max-w-[1200px] mx-auto px-8 md:px-16">
        {CHAPTERS.map((ch, i) => (
          <Chapter key={ch.id} chapter={ch} index={i} />
        ))}
      </section>

      {/* ── Core pillars ── */}
      <section className="py-28 border-t border-white/8 bg-[#080808]">
        <div className="max-w-[1200px] mx-auto px-8 md:px-16">
          <div className="mb-14">
            <p className="text-[10px] tracking-[0.4em] text-white/20 mb-4">WHAT WE STAND ON</p>
            <h2 className="font-display text-5xl font-black text-white tracking-tight">THE PILLARS</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PILLARS.map((p, i) => <PillarCard key={p.title} pillar={p} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-28 max-w-[1200px] mx-auto px-8 md:px-16">
        <div className="mb-14">
          <p className="text-[10px] tracking-[0.4em] text-white/20 mb-4">THE RECORD</p>
          <h2 className="font-display text-5xl font-black text-white tracking-tight">TIMELINE</h2>
        </div>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[120px] top-0 bottom-0 w-px bg-white/8 hidden md:block" />
          <div className="flex flex-col gap-0">
            {TIMELINE.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 md:gap-12 py-10 border-b border-white/5"
              >
                <div className="flex md:flex-col md:text-right gap-3 md:gap-1 md:pr-8">
                  <span className="font-mono text-[11px] text-white/30 tracking-widest">{item.year}</span>
                </div>
                <div className="relative md:pl-8">
                  {/* Dot on line */}
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border border-white/20 bg-black hidden md:flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#cc0000]" />
                  </div>
                  <h3 className="font-display text-2xl font-black text-white tracking-widest">{item.event}</h3>
                  <p className="mt-2 text-white/35 text-sm">{item.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-white py-24">
        <div className="max-w-[1200px] mx-auto px-8 md:px-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <p className="text-[10px] tracking-[0.4em] text-black/30 mb-4">ENTER THE UNIVERSE</p>
            <h2 className="font-display text-5xl md:text-7xl font-black text-black leading-none tracking-tight">
              READY TO<br />WEAR IT?
            </h2>
          </div>
          <Link
            href="/collections"
            className="flex items-center gap-3 bg-black text-white px-10 py-4 text-[11px] tracking-[0.25em] font-semibold hover:bg-black/80 transition-colors group"
          >
            SHOP NOYR <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
