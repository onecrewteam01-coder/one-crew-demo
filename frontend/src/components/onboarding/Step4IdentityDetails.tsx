"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SelectionChip } from "./SelectionChip";

interface Step4IdentityDetailsProps {
  selectedPersonalities: string[];
  onTogglePersonality: (chip: string) => void;
  personalityOther: string;
  onPersonalityOtherChange: (val: string) => void;
  selectedColors: string[];
  onToggleColor: (color: string) => void;
  colorOther: string;
  onColorOtherChange: (val: string) => void;
  admiredBrands: string;
  onAdmiredBrandsChange: (val: string) => void;
  associateWords: string;
  onAssociateWordsChange: (val: string) => void;
  disabled?: boolean;
}

const PERSONALITY_OPTIONS = [
  "Modern", "Premium", "Minimal", "Professional", "Friendly", "Bold",
  "Futuristic", "Trustworthy", "Luxury", "Innovative", "Creative", "Playful", "Other",
];

const COLOR_OPTIONS = [
  "Blue", "Purple", "Green", "Red", "Orange", "Black", "White", "No Preference", "Other",
];

export function Step4IdentityDetails({
  selectedPersonalities,
  onTogglePersonality,
  personalityOther,
  onPersonalityOtherChange,
  selectedColors,
  onToggleColor,
  colorOther,
  onColorOtherChange,
  admiredBrands,
  onAdmiredBrandsChange,
  associateWords,
  onAssociateWordsChange,
  disabled = false,
}: Step4IdentityDetailsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[800px] mx-auto flex flex-col gap-2"
    >
      {/* ── Section 1: Brand Personality ──────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between ">
          <label className="text-[13px] font-mono font-medium uppercase tracking-widest text-white/70">
            01. Brand Personality
          </label>
          <span className="font-mono text-[10px] text-white/35 uppercase tracking-widest">
            {selectedPersonalities.length}/3
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-1">
          {PERSONALITY_OPTIONS.map((trait, index) => {
            const isSelected = selectedPersonalities.includes(trait);
            const isMaxReached = selectedPersonalities.length >= 3 && !isSelected;

            return (
              <SelectionChip
                key={trait}
                title={trait}
                selected={isSelected}
                disabled={disabled}
                maxReached={isMaxReached}
                delay={index * 0.02}
                onClick={() => onTogglePersonality(trait)}
              />
            );
          })}
        </div>

        <AnimatePresence>
          {selectedPersonalities.includes("Other") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="relative rounded-xl overflow-hidden group">
                <div className="absolute -inset-[1px] rounded-xl pointer-events-none
                  group-focus-within:bg-gradient-to-r group-focus-within:from-white/0 group-focus-within:via-white/20 group-focus-within:to-white/0
                  transition-all duration-500" />
                <input
                  autoFocus
                  type="text"
                  value={personalityOther}
                  onChange={(e) => onPersonalityOtherChange(e.target.value)}
                  disabled={disabled}
                  placeholder="Describe your brand personality…"
                  className="
                    relative z-10 w-full rounded-xl border border-white/14 bg-[#0e0e0e]/40
                    backdrop-blur-xl px-4 py-3 text-[15px] text-white
                    placeholder-white/55 font-sans transition-all duration-250
                    focus:border-white/35 focus:outline-none focus:ring-1 focus:ring-white/18
                    focus:shadow-[0_0_32px_rgba(255,255,255,0.06)] hover:border-white/20
                  "
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/[0.06]" />

      {/* ── Section 2: Preferred Colors ────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-mono font-medium uppercase tracking-widest text-white/70 px-1">
          02. Preferred Colors <span className="text-white/30">(Optional)</span>
        </label>

        <div className="flex flex-wrap justify-center gap-1">
          {COLOR_OPTIONS.map((color, index) => (
            <SelectionChip
              key={color}
              title={color}
              selected={selectedColors.includes(color)}
              disabled={disabled}
              delay={index * 0.02}
              onClick={() => onToggleColor(color)}
            />
          ))}
        </div>

        <AnimatePresence>
          {selectedColors.includes("Other") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="relative rounded-xl overflow-hidden group">
                <div className="absolute -inset-[1px] rounded-xl pointer-events-none
                  group-focus-within:bg-gradient-to-r group-focus-within:from-white/0 group-focus-within:via-white/20 group-focus-within:to-white/0
                  transition-all duration-500" />
                <input
                  autoFocus
                  type="text"
                  value={colorOther}
                  onChange={(e) => onColorOtherChange(e.target.value)}
                  disabled={disabled}
                  placeholder="Describe your preferred color or style…"
                  className="
                    relative z-10 w-full rounded-xl border border-white/14 bg-[#0e0e0e]/40
                    backdrop-blur-xl px-4 py-3 text-[15px] text-white
                    placeholder-white/55 font-sans transition-all duration-250
                    focus:border-white/35 focus:outline-none focus:ring-1 focus:ring-white/18
                    focus:shadow-[0_0_32px_rgba(255,255,255,0.06)] hover:border-white/20
                  "
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/[0.06]" />

      {/* ── Section 3: Additional Vectors ──────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-mono font-medium uppercase tracking-widest text-white/70 px-1">
          03. Additional Vectors <span className="text-white/30">(Optional)</span>
        </label>

        <div className="w-full max-w-[500px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {/* Brands admired */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/35 px-1">
              Brands you admire
            </span>
            <div className="relative rounded-xl overflow-hidden group">
              <div className="absolute -inset-[1px] rounded-xl pointer-events-none
                group-focus-within:bg-gradient-to-r group-focus-within:from-white/0 group-focus-within:via-white/20 group-focus-within:to-white/0
                transition-all duration-500" />
              <input
                type="text"
                value={admiredBrands}
                onChange={(e) => onAdmiredBrandsChange(e.target.value)}
                disabled={disabled}
                placeholder="e.g. Apple, Stripe"
                className="
                  relative z-10 w-full rounded-xl border border-white/14 bg-[#0e0e0e]/40
                  backdrop-blur-xl px-4 py-3 text-[15px] text-white
                  placeholder-white/30 font-sans transition-all duration-250
                  focus:border-white/35 focus:outline-none focus:ring-1 focus:ring-white/18
                  focus:shadow-[0_0_32px_rgba(255,255,255,0.06)] hover:border-white/20
                "
              />
            </div>
          </div>

          {/* Association words */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/35 px-1">
              Words to associate
            </span>
            <div className="relative rounded-xl overflow-hidden group">
              <div className="absolute -inset-[1px] rounded-xl pointer-events-none
                group-focus-within:bg-gradient-to-r group-focus-within:from-white/0 group-focus-within:via-white/20 group-focus-within:to-white/0
                transition-all duration-500" />
              <input
                type="text"
                value={associateWords}
                onChange={(e) => onAssociateWordsChange(e.target.value)}
                disabled={disabled}
                placeholder="e.g. Reliable, Magical"
                className="
                  relative z-10 w-full rounded-xl border border-white/14 bg-[#0e0e0e]/40
                  backdrop-blur-xl px-4 py-3 text-[15px] text-white
                  placeholder-white/30 font-sans transition-all duration-250
                  focus:border-white/35 focus:outline-none focus:ring-1 focus:ring-white/18
                  focus:shadow-[0_0_32px_rgba(255,255,255,0.06)] hover:border-white/20
                "
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
