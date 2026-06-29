'use client';

import { useParams, notFound } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { getPostBySlug, journalPosts } from '@/data/journal';

function readingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const article = document.getElementById('article-body');
    if (!article) return;

    const update = () => {
      const rect = article.getBoundingClientRect();
      const total = article.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      setProgress(Math.min(100, Math.max(0, (scrolled / total) * 100)));
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div className="fixed top-[60px] left-0 right-0 z-40 h-[2px] bg-white/5">
      <motion.div
        className="h-full bg-[#cc0000]"
        style={{ width: `${progress}%` }}
        transition={{ duration: 0 }}
      />
    </div>
  );
}

export default function JournalPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = getPostBySlug(slug);
  if (!post) return notFound();

  const mins = readingTime(post.body);

  const renderBody = (text: string) =>
    text.split('\n\n').map((para, i) => {
      if (para.startsWith('**') && para.endsWith('**')) {
        return (
          <h3 key={i} className="font-display text-2xl font-black text-white tracking-wider mt-12 mb-5">
            {para.replace(/\*\*/g, '')}
          </h3>
        );
      }
      const html = para.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
      return (
        <p key={i} className="text-white/50 text-[17px] leading-[1.9] mb-6"
          dangerouslySetInnerHTML={{ __html: html }} />
      );
    });

  const related = journalPosts.filter(p => p.id !== post.id && p.published).slice(0, 2);

  return (
    <div className="bg-black min-h-screen pt-24">
      <ReadingProgress />

      <div className="max-w-[740px] mx-auto px-8 py-16">
        {/* Back */}
        <Link href="/journal" className="flex items-center gap-2 text-[11px] tracking-widest text-white/20 hover:text-white transition-colors mb-14">
          <ArrowLeft size={12} /> JOURNAL
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {post.tags.map(t => (
              <span key={t} className="text-[9px] tracking-[0.35em] text-[#cc0000]/70 border border-[#cc0000]/20 px-2.5 py-1">
                {t}
              </span>
            ))}
            <span className="flex items-center gap-1.5 text-[9px] tracking-[0.3em] text-white/20">
              <Clock size={9} /> {mins} MIN READ
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
            {post.title}
          </h1>
          <p className="mt-6 text-white/40 text-base leading-relaxed border-l-2 border-[#cc0000]/30 pl-5 italic">
            {post.excerpt}
          </p>
          <p className="mt-5 text-[10px] tracking-[0.3em] text-white/20">
            {new Date(post.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Cover placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-12 aspect-[16/7] bg-zinc-950 border border-white/8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-[10rem] font-black text-white/[0.025] tracking-widest select-none">
              {post.tags[0]?.slice(0, 1) ?? 'N'}
            </span>
          </div>
        </motion.div>

        {/* Body */}
        <motion.article
          id="article-body"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 border-t border-white/8 pt-12"
        >
          {renderBody(post.body)}
        </motion.article>

        {/* Tags */}
        <div className="mt-16 pt-10 border-t border-white/8 flex flex-wrap gap-2">
          {post.tags.map(t => (
            <span key={t} className="text-[10px] tracking-[0.3em] text-white/20 border border-white/8 px-3 py-1.5">
              {t}
            </span>
          ))}
        </div>

        {/* Share / more */}
        <div className="mt-10 flex items-center gap-6">
          <p className="text-[10px] tracking-[0.3em] text-white/15">SHARE</p>
          {['TWITTER', 'COPY LINK'].map(a => (
            <button key={a} className="text-[10px] tracking-[0.25em] text-white/25 hover:text-white transition-colors border-b border-white/10 hover:border-white/30 pb-0.5">
              {a}
            </button>
          ))}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-24">
            <p className="text-[10px] tracking-[0.4em] text-white/20 mb-8">ALSO IN JOURNAL</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {related.map(p => (
                <Link key={p.id} href={`/journal/${p.slug}`} className="group block border border-white/8 hover:border-white/20 p-6 transition-colors">
                  <p className="text-[9px] tracking-[0.3em] text-white/20 mb-3">{p.tags[0]}</p>
                  <h3 className="font-display text-lg font-black text-white group-hover:text-white/60 transition-colors leading-tight">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-[11px] text-white/25 flex items-center gap-1.5">
                    <Clock size={9} /> {readingTime(p.body)} MIN
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
