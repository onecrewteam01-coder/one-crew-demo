"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThinkingOrb } from "thinking-orbs";

type ProcessingState = "searching" | "composing" | "working";

interface AIProcessingScreenProps {
  /** Fixed label — omit to auto-cycle through the default phases below. */
  label?: string;
  state?: ProcessingState;
  size?: "screen" | "panel";
}

const DEFAULT_PHASES: { state: ProcessingState; label: string }[] = [
  { state: "searching", label: "Gathering context..." },
  { state: "composing", label: "Thinking..." },
  { state: "working", label: "Finalizing response..." },
];

/**
 * Full fallback screen for long-running AI/agent operations. Reuses the
 * same `ThinkingOrb` (from the `thinking-orbs` package) as the inline
 * `AgentThinkingIndicator` in AgentChat.tsx, so the loading motif stays
 * identical whether it appears inline in chat or as a full takeover.
 */
export function AIProcessingScreen({ label, state, size = "screen" }: AIProcessingScreenProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (label) return; // fixed label — no auto-cycling
    const interval = setInterval(() => {
      setPhaseIndex((i) => (i + 1) % DEFAULT_PHASES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [label]);

  const currentLabel = label ?? DEFAULT_PHASES[phaseIndex].label;
  const currentState = state ?? DEFAULT_PHASES[phaseIndex].state;

  return (
    <div
      className={`w-full flex items-center justify-center px-6 ${
        size === "screen" ? "min-h-screen py-16" : "min-h-[420px] py-10"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center text-center max-w-md mx-auto gap-5"
      >
        <div className="h-20 w-20 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
          <ThinkingOrb state={currentState} size={64} aria-label={currentLabel} />
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-white/40">
            AI Processing
          </span>
          <AnimatePresence mode="wait">
            <motion.h2
              key={currentLabel}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="font-sora text-[24px] md:text-[28px] font-semibold tracking-tight text-white glow-text"
            >
              {currentLabel}
            </motion.h2>
          </AnimatePresence>
          <p className="text-[14px] text-white/45 leading-relaxed max-w-sm mx-auto">
            This may take a few moments. Feel free to keep this tab open — we will update as soon as it is ready.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
