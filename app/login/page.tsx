'use client';

import { useAuth } from '@/components/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';

function LoginContent() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const next = searchParams.get('next') ?? '/account';
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push(next);
    }
  }, [user, loading, router, next]);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      setSigningIn(false);
    }
  };

  if (loading || (user && !signingIn)) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md text-center"
      >
        <span className="text-[#cc0000] text-2xl">✦</span>
        <h1 className="font-display text-3xl font-black text-white tracking-[0.2em] mt-3">ACCESS</h1>
        <p className="text-white/35 text-xs tracking-widest mt-1.5 mb-10">NOYR ACCOUNT PORTAL</p>

        {error && (
          <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-4 py-3 mb-6 tracking-wide leading-relaxed">
            Authentication failed. Please try again.
          </p>
        )}

        <button
          onClick={handleSignIn}
          disabled={signingIn}
          className="w-full bg-white text-black py-4 text-xs tracking-[0.3em] font-semibold hover:bg-white/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {signingIn ? (
            <>
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              REDIRECTING...
            </>
          ) : (
            'SIGN IN WITH GOOGLE'
          )}
        </button>

        <p className="text-[10px] text-white/20 leading-relaxed mt-6 max-w-xs mx-auto">
          Access your order history, shipping updates, loyalty perks, and custom discount rewards.
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
