"use client";

import React from "react";
import { motion } from "framer-motion";

interface Step3FormProps {
  mvpValue: string;
  onMvpChange: (val: string) => void;
  futureValue: string;
  onFutureChange: (val: string) => void;
  disabled?: boolean;
}

export function Step3Form({
  mvpValue,
  onMvpChange,
  futureValue,
  onFutureChange,
  disabled = false,
}: Step3FormProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[450px] mx-auto flex flex-col gap-5"
    >
      {/* Required MVP Textarea */}
      <div className="flex flex-col gap-2">
        <label className="block text-[11px] md:text-[13px] font-mono uppercase tracking-wider text-white/50 px-1">
          Minimum Viable Product
        </label>
        <div className="relative rounded-2xl overflow-hidden group">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-white/0 via-white/5 to-white/0 rounded-2xl pointer-events-none group-focus-within:via-white/20 transition-all duration-500" />
          <div className="absolute inset-0 bg-white/[0.012] group-focus-within:bg-white/[0.018] rounded-2xl blur-xl pointer-events-none transition-all duration-500" />

          <textarea
            value={mvpValue}
            onChange={(e) => onMvpChange(e.target.value)}
            disabled={disabled}
            placeholder="What is the minimum version of your product users can start using?"
            className="onboarding-textarea relative z-10 w-full h-[105px] rounded-2xl border border-white/20 bg-[#0e0e0e]/45 backdrop-blur-xl p-4 text-[15px] text-white placeholder-white/55 shadow-[inset_0_2px_8px_rgba(0,0,0,0.55)] resize-none transition-[border-color,background-color,box-shadow,opacity] duration-300 focus:border-white/25 focus:outline-none focus:ring-1 focus:ring-white/15 focus:shadow-[0_0_40px_rgba(255,255,255,0.06)] leading-relaxed font-sans disabled:opacity-50 disabled:cursor-not-allowed overflow-y-auto"
          />
        </div>
      </div>

      {/* Optional Future Features Textarea */}
      <div className="flex flex-col gap-2">
        <label className="block text-[11px] md:text-[13px] font-mono uppercase tracking-wider text-white/50 px-1">
          Future Features (Optional)
        </label>
        <div className="relative rounded-2xl overflow-hidden group">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-white/0 via-white/5 to-white/0 rounded-2xl pointer-events-none group-focus-within:via-white/20 transition-all duration-500" />
          <div className="absolute inset-0 bg-white/[0.012] group-focus-within:bg-white/[0.018] rounded-2xl blur-xl pointer-events-none transition-all duration-500" />

          <textarea
            value={futureValue}
            onChange={(e) => onFutureChange(e.target.value)}
            disabled={disabled}
            placeholder="What features can wait until future versions?"
            className="onboarding-textarea relative z-10 w-full h-[88px] rounded-2xl border border-white/20 bg-[#0e0e0e]/45 backdrop-blur-xl p-4 text-[15px] text-white placeholder-white/55 shadow-[inset_0_2px_8px_rgba(0,0,0,0.55)] resize-none transition-[border-color,background-color,box-shadow,opacity] duration-300 focus:border-white/25 focus:outline-none focus:ring-1 focus:ring-white/15 focus:shadow-[0_0_40px_rgba(255,255,255,0.06)] leading-relaxed font-sans disabled:opacity-50 disabled:cursor-not-allowed overflow-y-auto"
          />
        </div>
      </div>

      <div className="w-full max-w-[450px] mx-auto flex justify-end items-center px-2 select-none text-[11px] md:text-[13px] font-mono uppercase tracking-wider text-white/40">
        <span className="tabular-nums">{mvpValue.length} characters</span>
      </div>
    </motion.div>
  );
}
