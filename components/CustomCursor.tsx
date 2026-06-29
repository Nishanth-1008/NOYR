'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [label, setLabel] = useState('');
  const [isTouch, setIsTouch] = useState(false);

  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const sx = useSpring(mx, { stiffness: 140, damping: 20, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 140, damping: 20, mass: 0.4 });

  useEffect(() => {
    // Detect touch device — bail early
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouch(true);
      return;
    }

    const move = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      setHidden(false);
    };
    const down = () => setClicked(true);
    const up   = () => setClicked(false);
    const leave = () => setHidden(true);
    const enter = () => setHidden(false);

    const over = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('a, button, [data-cursor]') as HTMLElement | null;
      if (el) { setHovered(true); setLabel(el.dataset.cursor ?? ''); }
    };
    const out = () => { setHovered(false); setLabel(''); };

    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup',   up);
    document.documentElement.addEventListener('mouseleave', leave);
    document.documentElement.addEventListener('mouseenter', enter);
    document.addEventListener('mouseover',  over);
    document.addEventListener('mouseout',   out);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup',   up);
      document.documentElement.removeEventListener('mouseleave', leave);
      document.documentElement.removeEventListener('mouseenter', enter);
      document.removeEventListener('mouseover',  over);
      document.removeEventListener('mouseout',   out);
    };
  }, [mx, my]);

  if (isTouch) return null;

  return (
    <>
      {/* Outer ring — spring-lagged */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border"
        style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width:  hovered ? 52 : clicked ? 20 : 32,
          height: hovered ? 52 : clicked ? 20 : 32,
          opacity: hidden ? 0 : 1,
          borderColor: hovered ? 'rgba(204,0,0,0.8)' : 'rgba(255,255,255,0.6)',
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      />

      {/* Inner dot — instant */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full bg-white"
        style={{ x: mx, y: my, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width:  hovered ? 5 : 5,
          height: hovered ? 5 : 5,
          opacity: hidden ? 0 : 1,
          backgroundColor: hovered ? '#cc0000' : '#ffffff',
          scale: clicked ? 0.4 : 1,
        }}
        transition={{ duration: 0.1 }}
      />

      {/* Optional label */}
      {label && !hidden && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9999]"
          style={{ x: sx, y: sy }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute left-9 -top-3 whitespace-nowrap text-[9px] tracking-[0.3em] font-semibold text-white bg-black/80 px-2.5 py-1 rounded-sm">
            {label}
          </div>
        </motion.div>
      )}
    </>
  );
}
