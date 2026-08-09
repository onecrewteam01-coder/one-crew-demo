"use client";

import React from "react";
import { motion } from "framer-motion";

interface SelectionChipProps {
  title: string;
  selected: boolean;
  disabled?: boolean;
  /** Dimmed + inert, but visually distinct from a fully `disabled` chip
   *  (used e.g. when a 3-of-3 selection cap is reached). */
  maxReached?: boolean;
  onClick: () => void;
  delay?: number;
}

/**
 * Single source of truth for every chip in the onboarding flow
 * (product type, target customer "other", personality, colors,
 * revenue model, etc). Previously this markup was copy-pasted with
 * small drifts (uppercase vs. not, px-3.5 vs. px-3, text-xs vs implicit)
 * across Step4IdentityDetails, Step5ProductTypes and Step7Business.
 */
export function SelectionChip({
  title,
  selected,
  disabled,
  maxReached = false,
  onClick,
  delay = 0,
}: SelectionChipProps) {
  const isInert = disabled || maxReached;

  return (
    <motion.button
      type="button"
      disabled={isInert}
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={isInert ? {} : { scale: 1.03 }}
      whileTap={isInert ? {} : { scale: 0.97 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`
        relative flex items-center select-none
        px-4 py-1.5 rounded-md border
        font-mono uppercase tracking-wider text-[13px]
        transition-all duration-200
        ${
          selected
            ? "border-white/70 bg-white/90 text-black/90 shadow-[0_0_8px_rgba(255,255,255,0.07)]"
            : maxReached
            ? "border-white/5 bg-transparent text-white/18 cursor-not-allowed"
            : "border-white/12 bg-white/[0.02] text-white/55 cursor-pointer hover:border-white/28 hover:bg-white/[0.05] hover:text-white/80"
        }
      `}
    >
      {title}
    </motion.button>
  );
}
