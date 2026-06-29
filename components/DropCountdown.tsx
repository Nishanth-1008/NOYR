'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownProps {
  targetDate: string; // ISO date string
  label?: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(target: string): TimeLeft | null {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Digit({ value, label }: { value: number; label: string }) {
  const str = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={str}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="block font-display text-2xl md:text-3xl font-black text-white tabular-nums"
          >
            {str}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[9px] tracking-[0.3em] text-white/30 uppercase">{label}</span>
    </div>
  );
}

export default function DropCountdown({ targetDate, label = 'DROP IN', className = '' }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calcTimeLeft(targetDate));
    const interval = setInterval(() => {
      const t = calcTimeLeft(targetDate);
      setTimeLeft(t);
      if (!t) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!mounted) return null;

  if (!timeLeft) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
        <span className="text-xs tracking-[0.3em] text-red-400 font-medium">LIVE NOW</span>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <p className="text-[9px] tracking-[0.4em] text-white/30 mb-3">{label}</p>
      <div className="flex items-end gap-4">
        <Digit value={timeLeft.days}    label="DAYS"    />
        <span className="text-white/20 text-2xl font-thin mb-5">:</span>
        <Digit value={timeLeft.hours}   label="HRS"     />
        <span className="text-white/20 text-2xl font-thin mb-5">:</span>
        <Digit value={timeLeft.minutes} label="MIN"     />
        <span className="text-white/20 text-2xl font-thin mb-5">:</span>
        <Digit value={timeLeft.seconds} label="SEC"     />
      </div>
    </div>
  );
}
