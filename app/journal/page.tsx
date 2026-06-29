'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { journalPosts } from '@/data/journal';

export default function JournalPage() {
  const posts = journalPosts.filter(p => p.published);

  return (
    <div className="bg-black min-h-screen pt-24">
      {/* Header */}
      <div className="max-w-[1200px] mx-auto px-8 py-16 border-b border-white/8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[10px] tracking-[0.4em] text-white/25 mb-4">NOYR</p>
          <h1 className="font-display text-7xl md:text-9xl font-black text-white tracking-tight leading-none">
            JOURNAL
          </h1>
          <p className="mt-6 text-white/35 text-sm max-w-lg leading-relaxed">
            Craft. Concept. Culture. Long-form writing on the things that matter to us — and by extension, to you.
          </p>
        </motion.div>
      </div>

      {/* Featured post */}
      {posts[0] && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-[1200px] mx-auto px-8 py-16 border-b border-white/8"
        >
          <Link href={`/journal/${posts[0].slug}`} className="group grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
            {/* Cover placeholder */}
            <div className="aspect-[4/3] bg-zinc-950 border border-white/8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-8xl font-black text-white/5 tracking-widest">N</span>
              </div>
              <div className="absolute top-4 left-4">
                <span className="text-[9px] tracking-[0.3em] text-white/30 border border-white/15 px-2 py-1">
                  {posts[0].tags[0]}
                </span>
              </div>
            </div>

            <div>
              <p className="text-[10px] tracking-[0.4em] text-white/25 mb-6">FEATURED</p>
              <h2 className="font-display text-4xl md:text-5xl font-black text-white leading-tight group-hover:text-white/70 transition-colors">
                {posts[0].title}
              </h2>
              <p className="mt-6 text-white/40 text-sm leading-relaxed">{posts[0].excerpt}</p>
              <div className="mt-8 flex items-center gap-3 text-[11px] tracking-widest text-white/35 group-hover:text-white transition-colors">
                READ MORE <ArrowUpRight size={12} />
              </div>
              <p className="mt-4 text-[10px] tracking-widest text-white/20">
                {new Date(posts[0].created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Rest of posts */}
      <div className="max-w-[1200px] mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {posts.slice(1).map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7 }}
            >
              <Link href={`/journal/${post.slug}`} className="group block">
                <div className="aspect-[16/9] bg-zinc-950 border border-white/8 relative overflow-hidden mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 left-4">
                    <span className="text-[9px] tracking-[0.3em] text-white/30 border border-white/15 px-2 py-1">
                      {post.tags[0]}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  {post.tags.slice(0, 2).map(t => (
                    <span key={t} className="text-[9px] tracking-[0.3em] text-white/25">{t}</span>
                  ))}
                </div>
                <h3 className="font-display text-2xl font-black text-white group-hover:text-white/60 transition-colors leading-tight">
                  {post.title}
                </h3>
                <p className="mt-3 text-sm text-white/35 leading-relaxed line-clamp-2">{post.excerpt}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-[10px] tracking-widest text-white/20">
                    {new Date(post.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
                  </span>
                  <ArrowUpRight size={14} className="text-white/20 group-hover:text-white transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
