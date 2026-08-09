"use client";

import React from "react";
import { motion } from "framer-motion";

interface ContinueButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  loading?: boolean;
}

export default function ContinueButton({
  onClick,
  disabled = false,
  label = "Continue",
  loading = false,
}: ContinueButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full flex justify-center pt-5 pb-2"
    >
      <motion.button
        type="button"
        disabled={disabled || loading}
        onClick={onClick}
        whileHover={disabled || loading ? {} : { scale: 1.01 }}
        whileTap={disabled || loading ? {} : { scale: 0.98 }}
        className="min-w-[230px] bg-white text-black font-mono text-[13px] font-semibold uppercase tracking-widest py-3 px-8 rounded-xl border border-transparent transition-all duration-300 cursor-pointer select-none disabled:bg-transparent disabled:text-white/25 disabled:border-white/10 disabled:cursor-not-allowed hover:bg-white/95 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] focus:outline-none"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-0.25">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-black border-t-transparent animate-spin"></span>
            ANALYZING...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-0.25">
            {label} <span className="text-[11px]">→</span>
          </span>
        )}
      </motion.button>
    </motion.div>
  );
}
