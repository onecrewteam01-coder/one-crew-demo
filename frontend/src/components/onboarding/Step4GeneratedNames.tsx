"use client";

import React from "react";
import { motion } from "framer-motion";

interface Step4GeneratedNamesProps {
  generatedNames: string[];
  selectedName: string;
  onSelectName: (name: string) => void;
  onRegenerate: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export function Step4GeneratedNames({
  generatedNames,
  selectedName,
  onSelectName,
  onRegenerate,
  isGenerating,
  disabled = false,
}: Step4GeneratedNamesProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-[720px] mx-auto flex flex-col gap-5"
    >
      {/* AI Generated Names */}
      {isGenerating ? (
        <div className="py-12 text-center text-white/60">
          Generating startup names...
        </div>
      ) : generatedNames.length === 0 ? (
        <div className="py-12 text-center text-white/35">
          Click <strong>Regenerate Names</strong> to generate AI suggestions.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {generatedNames.map((name, index) => {
            const selected = selectedName === name;

            return (
              <motion.button
                key={name}
                type="button"
                disabled={disabled}
                onClick={() => onSelectName(name)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: index * 0.05,
                }}
                whileHover={disabled ? {} : { scale: 1.015 }}
                whileTap={disabled ? {} : { scale: 0.985 }}
                className={`
                    relative rounded-2xl border px-5 py-5
                    transition-all duration-300 text-left

                    ${
                      selected
                        ? "border-white/60 bg-white/[0.07] shadow-[0_0_24px_rgba(255,255,255,0.08)]"
                        : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]"
                    }
                `}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`
                        text-lg font-medium tracking-wide
                        ${selected ? "text-white" : "text-white/75"}
                    `}
                  >
                    {name}
                  </span>

                  <div
                    className={`
                        w-5 h-5 rounded-full border flex items-center justify-center
                        ${selected ? "border-white" : "border-white/25"}
                    `}
                  >
                    {selected && (
                      <motion.div
                         initial={{ scale: 0 }}
                         animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 rounded-full bg-white"
                      />
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Regenerate Button */}
      <div className="flex justify-center w-full">
        <motion.button
            type="button"
            disabled={disabled || isGenerating}
            onClick={onRegenerate}
            whileHover={disabled || isGenerating ? {} : { scale: 1.01 }}
            whileTap={disabled || isGenerating ? {} : { scale: 0.98 }}
            className="
                rounded-xl
                border border-white/20
                bg-transparent
                px-10
                py-3
                text-[12px]
                font-mono
                font-semibold
                uppercase
                tracking-[0.2em]
                text-white/70
                transition-all
                duration-300

                hover:border-white/40
                hover:text-white
                hover:bg-white/[0.05]
                hover:shadow-[0_0_20px_rgba(255,255,255,0.25)]

                disabled:text-white/25
                disabled:border-white/10
                disabled:cursor-not-allowed
            "
            >
            {isGenerating ? (
                <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                >
                    Generating...
                </motion.span>
                ) : (
                "Regenerate Names"
                )}
            </motion.button>
        </div>
    </motion.div>
  );
}
