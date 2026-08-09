"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SelectionChip } from "./SelectionChip";

interface Step7FormProps {
  selectedRevenueModels: string[];
  onToggleRevenueModel: (value: string) => void;

  revenueOther: string;
  onRevenueOtherChange: (value: string) => void;

  disabled?: boolean;
}

const REVENUE_MODELS = [
  "Subscription",
  "One-Time Purchase",
  "Freemium",
  "Marketplace Commission",
  "Advertising",
  "Enterprise Licensing",
  "Services",
  "Not Sure",
  "Other",
];

export function Step7Form({
  selectedRevenueModels,
  onToggleRevenueModel,
  revenueOther,
  onRevenueOtherChange,
  disabled = false,
}: Step7FormProps) {
  const showOther = selectedRevenueModels.includes("Other");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full  max-w-[700px] mx-auto flex flex-col gap-8"
    >
      <section className="flex flex-col items-center gap-6">

        <div className="flex flex-wrap justify-center gap-2 w-full max-w-[650px] mx-auto">
          {REVENUE_MODELS.map((item, index) => (
            <SelectionChip
              key={item}
              title={item}
              selected={selectedRevenueModels.includes(item)}
              disabled={disabled}
              delay={index * 0.03}
              onClick={() => onToggleRevenueModel(item)}
            />
          ))}
        </div>

        <AnimatePresence>
          {showOther && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden w-full"
            >
              <div className="relative rounded-xl overflow-hidden group">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-white/0 via-white/5 to-white/0 rounded-xl pointer-events-none group-focus-within:via-white/20 transition-all duration-500" />

                <input
                  type="text"
                  value={revenueOther}
                  disabled={disabled}
                  onChange={(e) => onRevenueOtherChange(e.target.value)}
                  placeholder="Describe your revenue model..."
                  className="relative z-10 w-full rounded-xl border border-white/10 bg-[#0e0e0e]/30 backdrop-blur-xl px-4 py-3 text-[15px] text-white placeholder-white/25 transition-all duration-300 focus:border-white/25 focus:outline-none focus:ring-1 focus:ring-white/15 focus:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  );
}
