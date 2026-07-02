'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu, Heart, ShoppingBag, Gift, User as UserIcon } from 'lucide-react';
import { useCart } from './CartContext';
import { useWishlist } from './WishlistContext';
import { useAuth } from './AuthContext';

const NAV_LINKS = [
  { href: '/collections', label: 'SHOP' },
  { href: '/lookbook', label: 'LOOKBOOK' },
  { href: '/drops', label: 'DROPS' },
  { href: '/universe', label: 'UNIVERSE' },
  { href: '/journal', label: 'JOURNAL' },
];

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user } = useAuth();
  const pathname = usePathname();

  const MENU_SECTIONS = [
    {
      label: 'SHOP',
      links: [
        { href: '/collections', label: 'All Collections' },
        { href: '/collections/void-season-01', label: 'Void Season 01' },
        { href: '/collections/ghost-protocol', label: 'Ghost Protocol' },
        { href: '/drops', label: 'Upcoming Drops' },
        { href: '/build-your-look', label: 'Build Your Look' },
      ],
    },
    {
      label: 'UNIVERSE',
      links: [
        { href: '/universe', label: 'Brand World' },
        { href: '/lookbook', label: 'Lookbook' },
        { href: '/journal', label: 'Journal' },
        { href: '/about', label: 'About NOYR' },
      ],
    },
    {
      label: 'ACCOUNT',
      links: [
        { href: user ? '/account' : '/login', label: user ? 'Account Profile' : 'Sign In / Register' },
        { href: '/rewards', label: 'Rewards' },
        { href: '/wishlist', label: 'Wishlist' },
        { href: '/track-order', label: 'Track Order' },
        { href: '/newsletter', label: 'Newsletter' },
      ],
    },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-black/95 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-[60px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group z-10">
            <span className="text-[#cc0000] text-xl leading-none">✦</span>
            <span className="font-display text-xl font-black tracking-[0.15em] text-white group-hover:opacity-80 transition-opacity">
              NOYR
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map(link => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-[11px] tracking-[0.18em] font-medium transition-colors hover:text-white relative group ${
                  pathname === link.href ? 'text-white' : 'text-white/45'
                }`}
              >
                {link.label}
                {pathname.startsWith(link.href) && link.href !== '/' && (
                  <motion.span
                    layoutId="nav-dot"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#cc0000]"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            <Link
              href={user ? "/account" : "/login"}
              className="hidden lg:flex items-center gap-1.5 text-[11px] tracking-[0.15em] text-white/40 hover:text-white transition-colors"
              title="Account"
            >
              <UserIcon size={13} />
            </Link>
            <Link
              href="/rewards"
              className="hidden lg:flex items-center gap-1.5 text-[11px] tracking-[0.15em] text-white/40 hover:text-white transition-colors"
              title="Rewards"
            >
              <Gift size={13} />
            </Link>
            <Link
              href="/wishlist"
              className="hidden lg:flex items-center gap-1.5 text-[11px] tracking-[0.15em] text-white/40 hover:text-white transition-colors"
            >
              <Heart size={13} className={wishlistCount > 0 ? 'fill-[#cc0000] text-[#cc0000]' : ''} />
              {wishlistCount > 0 && <span className="text-[10px]">{wishlistCount}</span>}
            </Link>
            <Link
              href="/cart"
              className="hidden lg:flex items-center gap-2 border border-white/15 hover:border-white/40 px-4 py-1.5 text-[11px] tracking-[0.15em] text-white/45 hover:text-white transition-all"
            >
              <ShoppingBag size={12} />
              CART {count > 0 && `(${count})`}
            </Link>
            <button
              className="p-1 text-white/45 hover:text-white transition-colors"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Fullscreen mega menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] bg-black flex flex-col"
          >
            {/* Menu header */}
            <div className="flex justify-between items-center px-8 md:px-16 h-[60px] border-b border-white/8">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-[#cc0000] text-xl">✦</span>
                <span className="font-display text-xl font-black tracking-widest text-white">NOYR</span>
              </Link>
              <button onClick={() => setMenuOpen(false)} className="text-white/40 hover:text-white transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            {/* Menu body */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-auto">
              {/* Left: big links */}
              <div className="md:col-span-7 flex flex-col justify-center px-8 md:px-16 py-12 gap-3">
                {[
                  { href: '/collections', label: 'SHOP' },
                  { href: '/lookbook', label: 'LOOKBOOK' },
                  { href: '/drops', label: 'DROPS' },
                  { href: '/universe', label: 'UNIVERSE' },
                  { href: '/journal', label: 'JOURNAL' },
                  { href: '/build-your-look', label: 'BUILD YOUR LOOK' },
                  { href: '/rewards', label: 'REWARDS' },
                ].map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={link.href}
                      className="font-display text-[clamp(2rem,5vw,4.5rem)] font-black text-white/15 hover:text-white transition-colors tracking-tight leading-none block"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Right: categorised links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="md:col-span-5 border-l border-white/8 flex flex-col justify-center px-8 md:px-12 py-12 gap-10"
              >
                {MENU_SECTIONS.map(section => (
                  <div key={section.label}>
                    <p className="text-[9px] tracking-[0.4em] text-white/20 mb-4">{section.label}</p>
                    <div className="flex flex-col gap-2.5">
                      {section.links.map(link => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="text-[13px] tracking-wide text-white/40 hover:text-white transition-colors"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Cart + wishlist in menu */}
                <div className="flex gap-4 pt-4 border-t border-white/8">
                  <Link href="/cart" className="text-[11px] tracking-[0.2em] text-white/30 hover:text-white transition-colors flex items-center gap-2">
                    <ShoppingBag size={11} /> CART ({count})
                  </Link>
                  <Link href="/wishlist" className="text-[11px] tracking-[0.2em] text-white/30 hover:text-white transition-colors flex items-center gap-2">
                    <Heart size={11} /> WISHLIST {wishlistCount > 0 && `(${wishlistCount})`}
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Menu footer */}
            <div className="px-8 md:px-16 py-6 border-t border-white/8 flex flex-wrap gap-6">
              {['/faq', '/size-guide', '/contact', '/track-order', '/newsletter'].map(href => (
                <Link key={href} href={href} className="text-[10px] tracking-[0.3em] text-white/20 hover:text-white/50 transition-colors">
                  {href.slice(1).replace(/-/g, ' ').toUpperCase()}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
