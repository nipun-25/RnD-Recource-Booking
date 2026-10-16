'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Microscope, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export function HeroGraphic() {
  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square flex items-center justify-center select-none">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0052FF]/15 via-[#4D7CFF]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* 60s rotating outer dashed ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-dashed border-[#0052FF]/25 pointer-events-none"
      >
        <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#0052FF]" />
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-[#4D7CFF]" />
      </motion.div>

      {/* Central Glassmorphic Core Container */}
      <div className="relative z-10 w-64 h-64 sm:w-76 sm:h-76 rounded-3xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-2xl p-6 flex flex-col justify-between overflow-hidden">
        {/* Subtle decorative dot grid 3x3 */}
        <div className="absolute top-4 right-4 grid grid-cols-3 gap-1.5 opacity-30">
          {[...Array(9)].map((_, i) => (
            <span key={i} className="w-1 h-1 rounded-full bg-slate-800" />
          ))}
        </div>

        {/* Core header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] flex items-center justify-center text-white shadow-xs">
            <Microscope className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Active Instrument
            </span>
            <h4 className="text-sm font-semibold text-slate-900 leading-tight">HR-TEM 200kV</h4>
          </div>
        </div>

        {/* Middle telemetry indicator */}
        <div className="space-y-2.5 my-auto">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono">Beam Alignment</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Optimal (0.14 nm)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] h-full rounded-full w-[88%]" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Vacuum: 1.2e-7 Pa</span>
            <span>Temp: 77 K</span>
          </div>
        </div>

        {/* Footer status */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#0052FF]" />
            <span>Auditable Session</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#0052FF]/10 text-[#0052FF] font-semibold">
            LOCK #481
          </span>
        </div>
      </div>

      {/* Floating Card 1: Live Intake Record (Staggered y-axis bobbing) */}
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-4 -left-4 sm:-left-8 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl p-4 w-52 sm:w-56"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-mono font-medium text-slate-600">Sample Dispatched</span>
        </div>
        <div className="text-xs font-semibold text-slate-900">Thin-Film Nanowires</div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
          <span>RND-2026-X8K9</span>
          <span className="text-[#0052FF] font-semibold">Ready for Review</span>
        </div>
      </motion.div>

      {/* Floating Card 2: Slot Confirmed Badge */}
      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-4 -right-4 sm:-right-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl p-4 w-48 sm:w-52"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900">Slot Confirmed</div>
            <div className="text-[10px] font-mono text-slate-500">Tomorrow • 10:00 AM</div>
          </div>
        </div>
      </motion.div>

      {/* Decorative Corner Accent Block */}
      <div className="absolute -bottom-8 left-8 z-10 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white shadow-accent text-xs font-medium">
        <Sparkles className="w-3.5 h-3.5" />
        <span>R&D Cell Certified</span>
      </div>
    </div>
  );
}
