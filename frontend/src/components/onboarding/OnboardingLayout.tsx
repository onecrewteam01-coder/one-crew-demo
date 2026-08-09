"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import StarfieldBackground from "@/components/onboarding/StarfieldBackground";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  onBack?: () => void;
}

export default function OnboardingLayout({
  children,
  onBack,
}: OnboardingLayoutProps) {
  // Suppress scroll-behaviour hydration mismatch warning
  useEffect(() => {
    document.documentElement.setAttribute("data-scroll-behavior", "smooth");
    return () => {
      document.documentElement.removeAttribute("data-scroll-behavior");
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-[#e5e2e1] overflow-y-auto flex flex-col selection:bg-white selection:text-black">

      {/* ── Starfield (same shader as landing page, no planet/agents) ─────── */}
      <StarfieldBackground />

      {/* ── Scanline overlay ───────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-[5] pointer-events-none scanline-overlay opacity-15" />

      {/* ── Ambient centre glow (quieter than login page) ─────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.006] rounded-full blur-[140px] pointer-events-none z-[5]" />

      {/* ── Navigation Header ─────────────────────────────────────────────── */}
      <header className="relative z-[20] w-full px-6 py-2 md:px-10 flex justify-between items-center shrink-0 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link
            id="header-logo"
            href="/"
            className="font-sora text-base sm:text-lg font-semibold tracking-tighter text-white glow-text hover:opacity-90 transition-opacity focus:outline-none"
          >
            OneCrew
          </Link>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[9px] font-semibold tracking-wider text-white/80 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse" />
            Observatory
          </div>
        </div>

        {/* Back — step decrement or home navigation */}
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="font-mono text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors duration-300 flex items-center gap-1.5 group focus:outline-none cursor-pointer"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span> Back
          </button>
        ) : (
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors duration-300 flex items-center gap-1.5 group focus:outline-none"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span> Back
          </Link>
        )}
      </header>

      {/* ── Main content — top-aligned single column ─────────────────────── */}
      <main className="relative z-[20] flex-1 flex justify-center items-start px-5 sm:px-6 lg:px-8 xl:px-10 py-[clamp(0.1rem,0.5vh,0.5rem)] overflow-visible">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9 }}
          className="w-full max-w-[600px] sm:max-w-[660px] md:max-w-[760px] lg:max-w-[860px] xl:max-w-[940px] 2xl:max-w-[1000px] flex flex-col pb-4"
        >
          {children}
        </motion.div>

      </main>
    </div>
  );
}