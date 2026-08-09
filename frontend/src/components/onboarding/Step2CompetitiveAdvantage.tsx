"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface Step2FormProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const PLACEHOLDER_TEXT = "Better UX, Faster, Lower cost, AI-powered, More accurate, Better privacy, New technology...";

export function Step2Form({ value, onChange, disabled = false }: Step2FormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(Math.max(110, textarea.scrollHeight), 280)}px`;
    }
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[600px] mx-auto flex flex-col gap-2"
    >
      <div className="relative rounded-2xl overflow-hidden group">
        {/* Glow accent border layer */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-white/0 via-white/5 to-white/0 rounded-2xl pointer-events-none group-focus-within:via-white/20 transition-all duration-500" />

        {/* Shadow glow under textarea */}
        <div className="absolute inset-0 bg-white/[0.012] group-focus-within:bg-white/[0.018] rounded-2xl blur-xl pointer-events-none transition-all duration-500" />

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={PLACEHOLDER_TEXT}
          className="onboarding-textarea relative z-10 w-full min-h-[132px] max-h-[280px] rounded-2xl border border-white/20 bg-[#0e0e0e]/45 backdrop-blur-xl p-4 md:p-[18px] text-[15px] text-white placeholder-white/55 shadow-[inset_0_2px_8px_rgba(0,0,0,0.55)] resize-none transition-[border-color,background-color,box-shadow,opacity] duration-300 focus:border-white/25 focus:outline-none focus:ring-1 focus:ring-white/15 focus:shadow-[0_0_40px_rgba(255,255,255,0.06)] leading-relaxed font-sans disabled:opacity-50 disabled:cursor-not-allowed overflow-y-auto"
        />
      </div>

      <div className="flex justify-end items-center px-2 select-none text-[11px] md:text-[13px] font-mono uppercase tracking-wider text-white/40">
        <span className="tabular-nums">{value.length} characters</span>
      </div>
    </motion.div>
  );
}
