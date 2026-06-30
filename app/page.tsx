'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { ArrowUpRight, Play, ChevronRight } from 'lucide-react';
import { useStorefrontCatalog } from '@/lib/useStorefrontCatalog';
import ProductCard from '@/components/ProductCard';

const Hero3D = dynamic(() => import('@/components/three/Hero3D'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-black" />,
});

/* ── Marquee ticker ── */
function Marquee({ text }: { text: string }) {
  const items = Array(10).fill(text);
  return (
    <div className="overflow-hidden flex whitespace-nowrap border-t border-white/10 bg-black py-3">
      <motion.div
        className="flex shrink-0 gap-8 pr-8"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        {[...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-6 text-[11px] tracking-[0.35em] text-white/30 font-medium">
            {t}
            <span className="text-[#cc0000] text-xs">✦</span>
            <span className="text-white/15 tracking-[0.4em] text-[10px]">NOYR</span>
            <span className="text-[#cc0000] text-xs">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ── Vertical side text ── */
function VerticalText({ text, side = 'left' }: { text: string; side?: 'left' | 'right' }) {
  return (
    <div
      className={`hidden lg:flex absolute ${side === 'left' ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 z-20 items-center gap-3`}
      style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
    >
      <div className="w-px h-12 bg-white/20" />
      <span className="text-[9px] tracking-[0.4em] text-white/25 font-medium">
        {text}
      </span>
      <div className="w-px h-12 bg-white/20" />
    </div>
  );
}

/* ── Section number indicators ── */
function SectionNumbers({ active }: { active: number }) {
  return (
    <div className="hidden lg:flex absolute left-10 bottom-28 z-20 flex-col gap-4">
      {[1, 2, 3, 4].map(n => (
        <motion.span
          key={n}
          animate={{ color: active === n ? '#ffffff' : 'rgba(255,255,255,0.18)' }}
          className="text-[11px] font-mono tracking-widest cursor-default"
        >
          {String(n).padStart(2, '0')}
        </motion.span>
      ))}
    </div>
  );
}

/* ── Collection quick-link card (right panel) ── */
function CollectionCard({ title, href, index }: { title: string; href: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={href} className="group flex gap-3 items-center">
        <div className="w-[90px] h-[70px] bg-zinc-900 border border-white/10 group-hover:border-white/30 transition-colors overflow-hidden relative shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950 group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-[10px] font-black text-white/10 tracking-wider">NOYR</span>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] text-white group-hover:text-white/70 transition-colors">{title}</p>
          <p className="text-[9px] tracking-[0.3em] text-white/30 mt-0.5">COLLECTION</p>
        </div>
        <div className="ml-1 w-7 h-7 border border-white/20 rounded-full flex items-center justify-center group-hover:border-white group-hover:bg-white transition-all shrink-0">
          <ArrowUpRight size={10} className="text-white/50 group-hover:text-black transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
}

export default function HomePage() {
  const { products, collections } = useStorefrontCatalog();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.4], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const [activeSection] = useState(1);

  // Stagger words for hero headline
  const words = ['DRESSED', 'FOR THE'];
  const [showVoid, setShowVoid] = useState(false);
  useEffect(() => { setTimeout(() => setShowVoid(true), 900); }, []);

  const COLLECTION_CARDS = [
    { title: 'VOID S01', href: '/collections/void-season-01' },
    { title: 'GHOST PROTOCOL', href: '/collections/ghost-protocol' },
    { title: 'ECLIPSE', href: '/collections' },
  ];

  return (
    <div className="bg-black" ref={containerRef}>
      {/* ════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════ */}
      <section className="relative h-screen overflow-hidden">
        {/* 3-D canvas — full-bleed behind everything */}
        <motion.div className="absolute inset-0 z-0" style={{ y: heroY }}>
          <Hero3D />
        </motion.div>

        {/* Radial gradient vignette */}
        <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_60%_80%_at_50%_60%,transparent_0%,rgba(0,0,0,0.55)_60%,rgba(0,0,0,0.95)_100%)]" />
        <div className="absolute bottom-0 left-0 right-0 z-10 h-48 bg-gradient-to-t from-black to-transparent" />
        <div className="absolute top-0 left-0 right-0 z-10 h-24 bg-gradient-to-b from-black/60 to-transparent" />

        {/* Decorative left vertical line */}
        <div className="absolute left-14 top-[20%] bottom-[20%] z-20 flex flex-col items-center gap-0 hidden lg:flex">
          <div className="w-px flex-1 bg-white/10" />
          <span className="text-[#cc0000] text-xs my-4">✦</span>
          <div className="w-px flex-1 bg-white/10" />
        </div>

        {/* Vertical side labels */}
        <VerticalText text="DRESSED FOR THE VOID" side="left" />

        {/* Section numbers */}
        <SectionNumbers active={activeSection} />

        {/* ── Hero copy (left) ── */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute left-0 top-0 bottom-0 z-20 flex flex-col justify-center pl-8 md:pl-24 lg:pl-32 pt-16"
        >
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[10px] tracking-[0.4em] text-white/35 mb-6 font-medium"
          >
            SS.2025 — VOID SEASON 01
          </motion.p>

          <div className="overflow-hidden">
            {words.map((word, wi) => (
              <div key={wi} className="overflow-hidden">
                <motion.h1
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 + wi * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-[clamp(3rem,8vw,7.5rem)] font-black leading-[0.88] text-white tracking-tight"
                >
                  {word}
                </motion.h1>
              </div>
            ))}
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.54, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-[clamp(3rem,8vw,7.5rem)] font-black leading-[0.88] tracking-tight"
              >
                <span className="text-[#cc0000]">VOID.</span>
              </motion.h1>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="mt-7 text-white/45 text-sm leading-relaxed max-w-[230px]"
          >
            Premium streetwear for those who<br />defy the ordinary.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.05 }}
            className="mt-8"
          >
            <Link
              href="/collections"
              className="group inline-flex items-center gap-3 border border-white/25 bg-white/5 hover:bg-white hover:border-white text-white hover:text-black px-7 py-3.5 text-[11px] tracking-[0.25em] font-semibold transition-all duration-300"
            >
              EXPLORE COLLECTION
              <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* ── Right panel: collection quick links ── */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute right-8 md:right-12 top-0 bottom-0 z-20 hidden lg:flex flex-col justify-center gap-4"
        >
          {COLLECTION_CARDS.map((card, i) => (
            <CollectionCard key={card.title} {...card} index={i} />
          ))}
        </motion.div>

        {/* ── Bottom bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          style={{ opacity: heroOpacity }}
          className="absolute bottom-8 left-0 right-0 z-20 px-8 md:px-24 lg:px-32 flex items-center justify-between"
        >
          <button className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full border border-white/25 flex items-center justify-center group-hover:border-white transition-colors">
              <Play size={10} fill="white" className="text-white ml-0.5" />
            </div>
            <span className="text-[10px] tracking-[0.3em] text-white/35 group-hover:text-white transition-colors">PLAY REEL</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-[10px] tracking-[0.3em] text-white/30">SCROLL TO DISCOVER</span>
            <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center">
              <motion.div
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-1 rounded-full bg-[#cc0000]"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Trust badges ── */}
      <section className="border-t border-white/8 bg-[#0a0a0a] py-6">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-4">
          {[
            { icon: '🚚', title: 'WORLDWIDE SHIPPING', sub: 'Fast & Secure Delivery' },
            { icon: '🛡️', title: 'PREMIUM QUALITY', sub: 'Built to Last' },
            { icon: '🔒', title: 'SECURE PAYMENTS', sub: 'Shop with Confidence' },
          ].map(b => (
            <div key={b.title} className="flex items-center gap-4">
              <span className="text-xl opacity-60">{b.icon}</span>
              <div>
                <p className="text-[10px] tracking-[0.2em] text-white font-semibold">{b.title}</p>
                <p className="text-[9px] text-white/35 mt-0.5">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          BRAND STATEMENT
      ════════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-8 md:px-16 py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-end">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] font-black text-white leading-[0.9] tracking-tight">
              NOT YOUR<br />
              <span className="text-white/20">REALITY.</span>
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-white/45 text-base leading-relaxed border-l-2 border-[#cc0000]/40 pl-6">
              NOYR is built for those who exist between worlds. Premium construction. Minimal expression. Maximum intent. Every piece is a choice. Every thread, deliberate.
            </p>
          </motion.div>
        </div>

        {/* Stat row */}
        <div className="mt-20 grid grid-cols-3 gap-0 border border-white/8">
          {[
            { n: '04', label: 'PIECES THIS SEASON' },
            { n: '02', label: 'COLLECTIONS' },
            { n: '∞', label: 'INTENT' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 ${i < 2 ? 'border-r border-white/8' : ''}`}
            >
              <p className="font-display text-5xl font-black text-white">{s.n}</p>
              <p className="mt-2 text-[10px] tracking-[0.3em] text-white/30">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          COLLECTIONS GRID
      ════════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-8 md:px-16 pb-28">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] tracking-[0.4em] text-white/25 mb-3">OUR WORK</p>
            <h2 className="font-display text-4xl font-black text-white tracking-widest">COLLECTIONS</h2>
          </div>
          <Link href="/collections" className="group flex items-center gap-2 text-[11px] tracking-widest text-white/35 hover:text-white transition-colors">
            VIEW ALL <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {collections.map((col, i) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
            >
              <Link href={`/collections/${col.slug}`} className="group relative block overflow-hidden aspect-[16/9] bg-zinc-950">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black group-hover:scale-105 transition-transform duration-1000" />
                {/* Noise texture overlay */}
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")'
                }} />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                <div className="relative z-10 h-full flex flex-col justify-end p-8">
                  <div className="overflow-hidden">
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="text-[9px] tracking-[0.5em] text-white/30 mb-3"
                    >
                      {i === 0 ? 'SS.2025' : 'FW.2025'} — COLLECTION {String(i + 1).padStart(2,'0')}
                    </motion.p>
                  </div>
                  <h3 className="font-display text-4xl font-black text-white tracking-tight leading-none">{col.title}</h3>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-[10px] tracking-[0.3em] text-white/35">{col.hero_text}</p>
                    <div className="w-8 h-8 border border-white/20 rounded-full flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all">
                      <ArrowUpRight size={11} className="text-white/60 group-hover:text-black transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURED PRODUCTS
      ════════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-8 md:px-16 pb-28">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] tracking-[0.4em] text-white/25 mb-3">SELECTED PIECES</p>
            <h2 className="font-display text-4xl font-black text-white tracking-widest">FEATURED</h2>
          </div>
          <Link href="/collections" className="group flex items-center gap-2 text-[11px] tracking-widest text-white/35 hover:text-white transition-colors">
            ALL PIECES <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* ════════════════════════════════════════
          BRAND PILLARS
      ════════════════════════════════════════ */}
      <section className="border-t border-white/8 py-24 bg-[#080808]">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/8">
            {[
              { n: '01', title: 'WEIGHT', body: 'Heavyweight construction. Fabrics that feel like they carry meaning.' },
              { n: '02', title: 'FORM', body: 'Silhouettes built to outlast trends. Considered, not reactive.' },
              { n: '03', title: 'INTENT', body: 'No logos. No hype. The piece and the person wearing it.' },
            ].map((item, i) => (
              <motion.div
                key={item.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.12 }}
                className="px-10 py-10"
              >
                <span className="text-[10px] tracking-[0.4em] text-[#cc0000]/60 font-mono">{item.n}</span>
                <h3 className="mt-5 font-display text-2xl font-black text-white tracking-widest">{item.title}</h3>
                <p className="mt-4 text-sm text-white/35 leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA BANNER — inverted
      ════════════════════════════════════════ */}
      <section className="bg-white py-20">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-[10px] tracking-[0.4em] text-black/35 mb-4">LIMITED RUN — VOID S01</p>
              <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] font-black text-black leading-none tracking-tight">
                READY TO<br />ENTER THE VOID?
              </h2>
            </motion.div>
            <Link
              href="/collections/void-season-01"
              className="shrink-0 flex items-center gap-3 bg-black text-white px-10 py-4 text-[11px] tracking-[0.25em] font-semibold hover:bg-black/80 transition-colors group"
            >
              SHOP NOW <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PHASE 4 — LOOKBOOK TEASER
      ════════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-8 md:px-16 py-28">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] tracking-[0.4em] text-white/25 mb-3">SS.2025 — FW.2025</p>
            <h2 className="font-display text-4xl font-black text-white tracking-widest">LOOKBOOK</h2>
          </div>
          <Link href="/lookbook" className="group flex items-center gap-2 text-[11px] tracking-widest text-white/35 hover:text-white transition-colors">
            VIEW ALL LOOKS <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { num: '01', title: 'INTO THE VOID', season: 'SS.2025', pieces: 'HOODIE + CARGO' },
            { num: '02', title: 'GHOST MODE', season: 'FW.2025', pieces: 'JACKET + CARGO' },
          ].map((look, i) => (
            <motion.div
              key={look.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
            >
              <Link
                href="/lookbook"
                className="group relative block aspect-[4/5] md:aspect-[4/3] bg-zinc-950 overflow-hidden"
                data-cursor="VIEW LOOK"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
                }} />
                {/* phantom silhouette */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-48 md:w-40 md:h-56 bg-gradient-to-b from-white/5 to-transparent rounded-sm" />
                </div>
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-colors duration-500" />
                <div className="relative z-10 h-full flex flex-col justify-end p-8">
                  <p className="text-[9px] tracking-[0.5em] text-white/25 mb-2">{look.season}</p>
                  <h3 className="font-display text-3xl font-black text-white tracking-tight leading-none">{look.title}</h3>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-[10px] tracking-[0.3em] text-white/30">{look.pieces}</p>
                    <div className="w-8 h-8 border border-white/20 rounded-full flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all">
                      <ArrowUpRight size={11} className="text-white/60 group-hover:text-black transition-colors" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-6 left-6">
                  <span className="font-mono text-[9px] tracking-[0.4em] text-white/20">LOOK {look.num}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          PHASE 4 — UNIVERSE + DROPS ROW
      ════════════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-8 md:px-16 pb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Universe card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Link href="/universe" className="group relative block border border-white/8 hover:border-white/25 transition-colors p-10 min-h-[260px] flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
              <div className="relative z-10">
                <p className="text-[9px] tracking-[0.4em] text-white/20 mb-3">THE NOYR UNIVERSE</p>
                <h3 className="font-display text-4xl font-black text-white tracking-tight leading-none">
                  NOT YOUR<br /><span className="text-white/20">REALITY.</span>
                </h3>
              </div>
              <div className="relative z-10 flex items-center justify-between mt-8">
                <p className="text-[11px] text-white/30 max-w-[200px] leading-relaxed">The brand story. The philosophy. The world behind the clothes.</p>
                <div className="w-9 h-9 border border-white/15 rounded-full flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all shrink-0">
                  <ArrowUpRight size={13} className="text-white/40 group-hover:text-black transition-colors" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Drops card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.12 }}
          >
            <Link href="/drops" className="group relative block border border-[#cc0000]/20 hover:border-[#cc0000]/50 transition-colors p-10 min-h-[260px] flex flex-col justify-between overflow-hidden bg-[#cc0000]/[0.03]">
              <div className="relative z-10">
                <p className="text-[9px] tracking-[0.4em] text-[#cc0000]/50 mb-3">UPCOMING</p>
                <h3 className="font-display text-4xl font-black text-white tracking-tight leading-none">
                  DROP<br />CALENDAR
                </h3>
                <div className="mt-4 flex flex-col gap-2">
                  {[
                    { name: 'VOID COACH JACKET', date: 'JUL 15' },
                    { name: 'GHOST PROTOCOL JACKET', date: 'AUG 01' },
                    { name: 'ECLIPSE COLLECTION', date: 'SEP 15' },
                  ].map(d => (
                    <div key={d.name} className="flex items-center justify-between text-[10px] tracking-[0.15em]">
                      <span className="text-white/30">{d.name}</span>
                      <span className="text-white/20 font-mono">{d.date}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative z-10 flex items-center justify-between mt-6">
                <p className="text-[11px] text-white/25">Set drop reminders. Never miss a release.</p>
                <div className="w-9 h-9 border border-[#cc0000]/30 rounded-full flex items-center justify-center group-hover:bg-[#cc0000] group-hover:border-[#cc0000] transition-all shrink-0">
                  <ArrowUpRight size={13} className="text-[#cc0000]/60 group-hover:text-white transition-colors" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PHASE 4 — BUILD YOUR LOOK + REWARDS
      ════════════════════════════════════════ */}
      <section className="border-t border-white/8 bg-[#060606] py-24">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/8">
            {[
              {
                href: '/build-your-look',
                tag: 'PERSONALIZE',
                title: 'BUILD YOUR LOOK',
                body: 'Answer three questions. Get a curated edit built around your style and intent.',
                cta: 'START BUILDING',
              },
              {
                href: '/rewards',
                tag: 'LOYALTY',
                title: 'REWARDS PROGRAM',
                body: 'Every order earns points. Points unlock tiers. Tiers unlock early access, discounts, and more.',
                cta: 'VIEW REWARDS',
              },
              {
                href: '/newsletter',
                tag: 'COMMUNITY',
                title: 'JOIN THE LIST',
                body: 'Drop notifications. Behind-the-scenes. Long-form writing. Nothing you didn\'t ask for.',
                cta: 'SUBSCRIBE',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="px-10 py-10"
              >
                <span className="text-[9px] tracking-[0.4em] text-[#cc0000]/50 font-mono">{item.tag}</span>
                <h3 className="mt-4 font-display text-xl font-black text-white tracking-widest">{item.title}</h3>
                <p className="mt-3 text-sm text-white/30 leading-relaxed">{item.body}</p>
                <Link
                  href={item.href}
                  className="mt-6 inline-flex items-center gap-2 text-[10px] tracking-[0.3em] text-white/35 hover:text-white transition-colors border-b border-white/10 hover:border-white/40 pb-0.5"
                >
                  {item.cta} <ArrowUpRight size={11} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TICKER
      ════════════════════════════════════════ */}
      <Marquee text="NEVER OUTGROW YOUR RAGE" />
    </div>
  );
}
