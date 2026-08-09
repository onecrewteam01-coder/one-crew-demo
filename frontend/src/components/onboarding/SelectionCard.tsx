"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface SelectionCardProps {
  title: string;
  description: string;
  selected: boolean;
  disabled?: boolean;
  icon: React.ElementType;
  compact?: boolean;
  onClick: () => void;
  delay?: number;
}

export function SelectionCard({
  title,
  description,
  selected,
  disabled,
  icon: Icon,
  compact = false,
  onClick,
  delay = 0,
}: SelectionCardProps) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      className={`relative h-full overflow-hidden rounded-2xl border text-left transition-all duration-300
        ${compact ? "p-2" : "p-2 sm:p-3"}

      ${
        selected
          ? "border-white bg-white/5 shadow-[0_0_35px_rgba(255,255,255,0.05)]"
          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex justify-between items-start">
        <div className={`flex flex-1 items-start min-w-0 ${compact ? "gap-2.5" : "gap-3.5"}`}>
          <div
            className={`
              ${compact ? "h-9 w-9" : "h-11 w-11"}
              shrink-0
              rounded-xl
              border
              flex
              items-center
              justify-center
              transition-all
              ${selected ? "border-white/20 bg-white/5" : "border-white/10"}
            `}
          >
            <Icon
              className={`h-[18px] w-[18px] ${
                selected ? "text-white" : "text-white/45"
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className={`font-mono uppercase tracking-wider text-[13px] ${
                selected ? "text-white" : "text-white/70"
              }`}
            >
              {title}
            </h3>

            <p 
              className={`
                ${compact ? "mt-1 min-h-0" : "mt-1.5 min-h-[42px]"}
                text-[13px] leading-relaxed text-white/40
              `}
            >
              {description}
            </p>
          </div>
        </div>

        {selected && (
          <Check className="w-[18px] h-[18px] text-white shrink-0 ml-3" />
        )}
      </div>
    </motion.button>
  );
}
