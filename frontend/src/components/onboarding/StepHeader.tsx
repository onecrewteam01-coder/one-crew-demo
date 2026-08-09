"use client";

import React from "react";
import { motion } from "framer-motion";

interface StepHeaderProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle: string;
}

export default function StepHeader({
  currentStep,
  totalSteps,
  title,
  subtitle,
}: StepHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center gap-1">
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="font-mono text-[11px] uppercase tracking-widest text-white/50"
      >
        Step {currentStep} of {totalSteps}
      </motion.span>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="font-sora text-[34px] md:text-[38px] font-semibold tracking-tight text-white glow-text"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="font-sans text-[17px] text-white leading-relaxed max-w-[560px] mx-auto"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
