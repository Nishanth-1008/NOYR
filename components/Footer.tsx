import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/8 bg-black mt-24">
      <div className="max-w-[1400px] mx-auto px-8 md:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[#cc0000] text-xl">✦</span>
              <span className="font-display text-3xl font-black tracking-[0.15em] text-white">NOYR</span>
            </div>
            <p className="text-sm text-white/35 leading-relaxed max-w-xs">
              Premium streetwear for those who move through darkness with intention. Built to last. Made to mean something.
            </p>
            <p className="mt-6 text-[10px] tracking-[0.3em] text-white/20">DRESSED FOR THE VOID.</p>
          </div>

          {/* Shop */}
          <div className="md:col-span-2">
            <h4 className="text-[10px] tracking-[0.35em] text-white/25 mb-6">SHOP</h4>
            <ul className="space-y-3">
              {[
                { href: '/collections', label: 'All Collections' },
                { href: '/collections/void-season-01', label: 'Void S01' },
                { href: '/collections/ghost-protocol', label: 'Ghost Protocol' },
                { href: '/drops', label: 'Upcoming Drops' },
                { href: '/size-guide', label: 'Size Guide' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[12px] tracking-wide text-white/35 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Universe */}
          <div className="md:col-span-2">
            <h4 className="text-[10px] tracking-[0.35em] text-white/25 mb-6">UNIVERSE</h4>
            <ul className="space-y-3">
              {[
                { href: '/universe', label: 'Brand World' },
                { href: '/lookbook', label: 'Lookbook' },
                { href: '/journal', label: 'Journal' },
                { href: '/about', label: 'About NOYR' },
                { href: '/build-your-look', label: 'Build Your Look' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[12px] tracking-wide text-white/35 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="md:col-span-2">
            <h4 className="text-[10px] tracking-[0.35em] text-white/25 mb-6">ACCOUNT</h4>
            <ul className="space-y-3">
              {[
                { href: '/rewards', label: 'Rewards' },
                { href: '/wishlist', label: 'Wishlist' },
                { href: '/track-order', label: 'Track Order' },
                { href: '/faq', label: 'FAQ' },
                { href: '/contact', label: 'Contact' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[12px] tracking-wide text-white/35 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-2">
            <h4 className="text-[10px] tracking-[0.35em] text-white/25 mb-6">JOIN THE LIST</h4>
            <p className="text-[12px] text-white/30 leading-relaxed mb-5">
              Drop notifications. No noise.
            </p>
            <Link
              href="/newsletter"
              className="inline-flex items-center text-[10px] tracking-[0.3em] text-white/40 hover:text-white border-b border-white/15 hover:border-white pb-0.5 transition-all"
            >
              SUBSCRIBE →
            </Link>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-[10px] text-white/15 tracking-widest">
            © {new Date().getFullYear()} NOYR. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8">
            {['/faq', '/contact'].map(href => (
              <Link key={href} href={href} className="text-[10px] tracking-widest text-white/15 hover:text-white/40 transition-colors">
                {href.slice(1).replace('-', ' ').toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
