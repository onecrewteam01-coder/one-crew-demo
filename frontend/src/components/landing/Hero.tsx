"use client";

import { motion } from "framer-motion";
import AgentWorkspace from "./AgentWorkspace";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center  px-4 sm:px-6 md:px-10 lg:px-16 pt-20 sm:pt-24 pb-12 sm:pb-16 overflow-visible">
      {/* Subtle radial spotlight behind the hero content to separate it from the background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[500px] md:w-[650px] lg:w-[800px] h-[220px] sm:h-[320px] md:h-[380px] lg:h-[420px] rounded-full bg-white/[0.015] blur-[140px] pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl xl:max-w-6xl mx-auto flex flex-col items-center justify-center text-center relative z-10 translate-y-6 md:translate-y-8"
      >
        {/* Headline (Reduced max width, centered) */}
        <h1 className="font-sora text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.15] md:leading-[1.08] max-w-xs sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto glow-text">
          Where Ideas Become Companies
        </h1>

        {/* Subtitle ("Powered by Agentic AI", comfortably below headline with ~24px spacing) */}
        <p className="text-xs sm:text-sm font-mono uppercase tracking-[0.12em] text-white/60 mt-5">
          powered by agentic AI
        </p>

        {/* Search Box + suggestion chips + description (24px below label) */}
        <div className="w-full mt-5 sm:mt-6">
          <AgentWorkspace />
        </div>
      </motion.div>
    </section>
  );
}