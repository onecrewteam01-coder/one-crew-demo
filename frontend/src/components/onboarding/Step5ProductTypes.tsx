"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepIntro } from "./StepIntro";
import { SelectionChip } from "./SelectionChip";

interface Step5ProductTypeProps {
  selectedProductTypes: string[];
  onToggleProductType: (value: string) => void;

  productTypeOther: string;
  onProductTypeOtherChange: (value: string) => void;

  disabled?: boolean;
}

const PRODUCT_TYPES = [
  "Web App",
  "Mobile App",
  "Desktop Application",
  "AI Product",
  "AI Agent",
  "Hardware",
  "API",
  "Browser Extension",
  "SaaS",
  "Marketplace",
  "Other",
];

export function Step5ProductTypes({
  selectedProductTypes,
  onToggleProductType,
  productTypeOther,
  onProductTypeOtherChange,
  disabled = false,
}: Step5ProductTypeProps) {
  const showProductOther = selectedProductTypes.includes("Other");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full  max-w-[700px] mx-auto flex flex-col gap-8"
    >
      <section className="flex flex-col items-center gap-6">
        <StepIntro
          description="Select every option that best describes your product."
        />

        <div className="flex flex-wrap justify-center gap-2 w-full max-w-[650px] mx-auto">
          {PRODUCT_TYPES.map((product, index) => (
            <SelectionChip
              key={product}
              title={product}
              selected={selectedProductTypes.includes(product)}
              disabled={disabled}
              delay={index * 0.03}
              onClick={() => onToggleProductType(product)}
            />
          ))}
        </div>

        <AnimatePresence>
          {showProductOther && (
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
                  value={productTypeOther}
                  disabled={disabled}
                  onChange={(e) => onProductTypeOtherChange(e.target.value)}
                  placeholder="Tell us about your product..."
                  className="relative z-10 w-full rounded-xl border border-white/10 bg-[#0e0e0e]/30 backdrop-blur-xl px-4 py-3 text-[15px] text-white placeholder-white/40 transition-all duration-300 focus:border-white/25 focus:outline-none focus:ring-1 focus:ring-white/15 focus:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  );
}
