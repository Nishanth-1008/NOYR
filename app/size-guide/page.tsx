'use client';

import { motion } from 'framer-motion';

const SIZES = [
  { size: 'XS', chest: '84–88', shoulder: '42', length: '64', sleeve: '60' },
  { size: 'S', chest: '88–94', shoulder: '44', length: '66', sleeve: '62' },
  { size: 'M', chest: '94–100', shoulder: '46', length: '68', sleeve: '64' },
  { size: 'L', chest: '100–108', shoulder: '48', length: '70', sleeve: '66' },
  { size: 'XL', chest: '108–116', shoulder: '50', length: '72', sleeve: '68' },
  { size: 'XXL', chest: '116–124', shoulder: '52', length: '74', sleeve: '70' },
];

const BOTTOMS = [
  { size: 'XS', waist: '64–68', hip: '88–92', inseam: '72', rise: '28' },
  { size: 'S', waist: '68–74', hip: '92–96', inseam: '74', rise: '29' },
  { size: 'M', waist: '74–80', hip: '96–102', inseam: '76', rise: '30' },
  { size: 'L', waist: '80–88', hip: '102–108', inseam: '78', rise: '31' },
  { size: 'XL', waist: '88–96', hip: '108–116', inseam: '80', rise: '32' },
];

export default function SizeGuidePage() {
  return (
    <div className="bg-black min-h-screen pt-24">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-6xl font-black text-white tracking-widest mb-4">SIZE GUIDE</h1>
          <p className="text-white/40 text-sm mb-16 max-w-lg">
            All measurements are in centimetres. NOYR pieces are intentionally oversized — size down if you want a closer fit.
          </p>
        </motion.div>

        {/* Tops */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-xs tracking-[0.4em] text-white/30 mb-6">TOPS & HOODIES</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {['SIZE', 'CHEST', 'SHOULDER', 'LENGTH', 'SLEEVE'].map(h => (
                    <th key={h} className="text-[10px] tracking-[0.3em] text-white/30 text-left py-3 pr-8 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {SIZES.map(row => (
                  <tr key={row.size} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 pr-8 text-sm font-semibold text-white tracking-widest">{row.size}</td>
                    <td className="py-4 pr-8 text-sm text-white/60">{row.chest}</td>
                    <td className="py-4 pr-8 text-sm text-white/60">{row.shoulder}</td>
                    <td className="py-4 pr-8 text-sm text-white/60">{row.length}</td>
                    <td className="py-4 pr-8 text-sm text-white/60">{row.sleeve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Bottoms */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-16">
          <h2 className="text-xs tracking-[0.4em] text-white/30 mb-6">BOTTOMS</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {['SIZE', 'WAIST', 'HIP', 'INSEAM', 'RISE'].map(h => (
                    <th key={h} className="text-[10px] tracking-[0.3em] text-white/30 text-left py-3 pr-8 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {BOTTOMS.map(row => (
                  <tr key={row.size} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 pr-8 text-sm font-semibold text-white tracking-widest">{row.size}</td>
                    <td className="py-4 pr-8 text-sm text-white/60">{row.waist}</td>
                    <td className="py-4 pr-8 text-sm text-white/60">{row.hip}</td>
                    <td className="py-4 pr-8 text-sm text-white/60">{row.inseam}</td>
                    <td className="py-4 pr-8 text-sm text-white/60">{row.rise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Fit notes */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-16 border border-white/10 p-8">
          <h3 className="text-xs tracking-[0.4em] text-white/30 mb-6">FIT NOTES</h3>
          <ul className="space-y-3 text-sm text-white/50 leading-relaxed">
            <li>— NOYR hoodies and tees are built oversized. If you&apos;re between sizes, size down for a structured look.</li>
            <li>— Bottoms have an elastic/drawstring waist and will accommodate 2–3cm variance.</li>
            <li>— After washing cold and air drying, there is minimal shrinkage (&lt;2%).</li>
            <li>— If you need help choosing a size, contact us before ordering.</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
