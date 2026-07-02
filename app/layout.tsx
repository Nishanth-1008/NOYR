import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthContext';
import { CartProvider } from '@/components/CartContext';
import { WishlistProvider } from '@/components/WishlistContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: { default: 'NOYR — Dressed For The Void', template: '%s · NOYR' },
  description: 'Premium anime-inspired streetwear. Dressed for the void.',
  keywords: 'NOYR, streetwear, fashion, premium, anime, oversized, hoodie, cargo',
  openGraph: {
    title: 'NOYR — Dressed For The Void',
    description: 'Premium streetwear for those who defy the ordinary.',
    type: 'website',
    locale: 'en_IN',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('font-sans', geist.variable)}>
      <body className="cursor-none">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CustomCursor />
              <Navigation />
              <main>{children}</main>
              <Footer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
