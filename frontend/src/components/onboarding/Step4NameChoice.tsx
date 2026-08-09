"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Step4NameChoiceProps {
  nameMode: "exist" | "generate";
  onNameModeChange: (mode: "exist" | "generate") => void;
  startupName: string;
  onStartupNameChange: (val: string) => void;
  disabled?: boolean;
}

export function Step4NameChoice({
  nameMode,
  onNameModeChange,
  startupName,
  onStartupNameChange,
  disabled = false,
}: Step4NameChoiceProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[680px] mx-auto flex flex-col gap-6"
    >
      {/* Radio cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {[
          { id: "exist", label: "I already have a startup name" },
          { id: "generate", label: "Generate names with AI" },
        ].map((opt) => {
          const isSelected = nameMode === opt.id;
          return (
            <motion.button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onNameModeChange(opt.id as "exist" | "generate")}
              whileHover={disabled ? {} : { scale: 1.01 }}
              whileTap={disabled ? {} : { scale: 0.99 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={`
                flex items-center gap-3 px-5 py-6 rounded-xl border text-left
                cursor-pointer transition-all duration-250 select-none
                ${
                  isSelected
                    ? "border-white/60 bg-white/[0.06] text-white shadow-[0_0_24px_rgba(255,255,255,0.07)]"
                    : "border-white/10 bg-white/[0.015] text-white/55 hover:border-white/25 hover:bg-white/[0.03] hover:text-white/75"
                }
              `}
            >
              {/* Radio circle */}
              <div
                className={`
                  w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center
                  transition-all duration-200
                  ${isSelected ? "border-white/80" : "border-white/25"}
                `}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      layoutId="radio-dot-name"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="w-2 h-2 rounded-full bg-white"
                    />
                  )}
                </AnimatePresence>
              </div>
              <span className="font-mono text-[13px] uppercase tracking-wider leading-snug">
                {opt.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Conditional name input — only when "exist" */}
      <AnimatePresence>
        {nameMode === "exist" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="relative w-full max-w-[330px] mx-auto rounded-xl overflow-hidden group">
              <div className="absolute -inset-[1px] rounded-xl pointer-events-none
                bg-gradient-to-r from-white/0 via-white/0 to-white/0
                group-focus-within:from-white/0 group-focus-within:via-white/20 group-focus-within:to-white/0
                transition-all duration-500" />
              <input
                type="text"
                value={startupName}
                onChange={(e) => onStartupNameChange(e.target.value)}
                disabled={disabled}
                placeholder="Enter the name of your startup"
                className="
                  relative z-10 w-full rounded-xl border border-white/14 bg-[#0e0e0e]/40
                  backdrop-blur-xl px-5 py-4 text-[16px] text-white
                  text-center
                  placeholder-white/55 font-sans
                  transition-all duration-250
                  focus:border-white/35 focus:outline-none
                  focus:ring-1 focus:ring-white/18
                  focus:shadow-[0_0_32px_rgba(255,255,255,0.06)]
                  hover:border-white/20
                "
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
