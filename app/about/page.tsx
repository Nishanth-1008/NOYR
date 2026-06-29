'use client';

import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="bg-black min-h-screen pt-24">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="text-xs tracking-[0.4em] text-white/30 mb-4">THE BRAND</p>
          <h1 className="font-display text-6xl md:text-8xl font-black text-white tracking-tight leading-none mb-16">
            NOT YOUR<br />REALITY.
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xs tracking-[0.4em] text-white/30 mb-6">ORIGIN</h2>
            <p className="text-white/60 text-base leading-relaxed">
              NOYR was born from a simple idea: clothing should mean something. Not just cover a body. Not just follow a trend.
            </p>
            <p className="mt-4 text-white/60 text-base leading-relaxed">
              We build for those who exist between worlds. Those who see things others don&apos;t. Those who carry weight with intention.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xs tracking-[0.4em] text-white/30 mb-6">CONSTRUCTION</h2>
            <p className="text-white/60 text-base leading-relaxed">
              Every NOYR piece is built with heavyweight fabrics, reinforced construction, and minimal branding. We do not do fast fashion. We do not do excess.
            </p>
            <p className="mt-4 text-white/60 text-base leading-relaxed">
              A NOYR garment should outlast trends. It should outlast seasons. It should feel right in ten years.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-20 border-t border-white/10 pt-16"
        >
          <blockquote className="font-display text-3xl md:text-5xl font-black text-white/20 leading-tight text-center max-w-3xl mx-auto">
            &ldquo;This is not about being seen. This is about knowing exactly who you are when no one is watching.&rdquo;
          </blockquote>
        </motion.div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'FOUNDED', value: '2025' },
            { label: 'COLLECTION', value: 'VOID S01' },
            { label: 'PHILOSOPHY', value: 'INTENT OVER HYPE' },
          ].map(item => (
            <div key={item.label} className="border-l border-white/20 pl-6">
              <p className="text-[10px] tracking-[0.4em] text-white/30">{item.label}</p>
              <p className="mt-2 text-white text-xl font-semibold tracking-wider">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
