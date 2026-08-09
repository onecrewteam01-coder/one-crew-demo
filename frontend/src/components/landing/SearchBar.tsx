"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchBar({
  maxHeight = 300,
}: {
  maxHeight?: number;
} = {}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [atMax, setAtMax] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${next}px`;
    setAtMax(el.scrollHeight >= maxHeight);
  }, [value, maxHeight]);

  const handleGenerate = () => {
    if (value.trim()) {
      if (typeof window !== "undefined") {
        localStorage.setItem("onboarding_startupIdea", value.trim());
      }
      router.push("/onboarding");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className="group relative flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.07] to-white/[0.01] backdrop-blur-md px-4 py-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-500 hover:border-white/15"
      >
        <div className="flex-1 w-full relative">
          {/* Custom Placeholder with Blinking Caret */}
          <AnimatePresence>
            {value === "" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 left-0.5 pointer-events-none font-sans text-base text-white/55 flex items-center justify-start gap-1"
              >
                Describe your startup idea...
                {!isFocused && (
                  <span className="inline-block w-[1.5px] h-[16px] bg-white/70 animate-blink"></span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            style={{
              maxHeight: `${maxHeight}px`,
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            } as React.CSSProperties}
            className={`w-full bg-transparent resize-none transition-[height] duration-150 outline-none py-2 text-center text-white placeholder:text-transparent leading-normal font-sans text-base [&::-webkit-scrollbar]:hidden ${atMax ? "overflow-y-auto" : "overflow-hidden"}`}
          />
        </div>

        <button
          onClick={handleGenerate}
          className="group/btn w-full sm:w-auto sm:ml-3 rounded-xl bg-white text-[#050505] px-4 py-2 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(255,255,255,0.05)] hover:-translate-y-[2px] hover:shadow-[0_8px_25px_rgba(255,255,255,0.25)] hover:scale-[1.02] active:translate-y-0 transition-all duration-300"
        >
          <span className="font-mono text-xs font-semibold uppercase tracking-wider">Build</span>
          <ArrowRight size={16} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {[
          "AI Tutor",
          "Healthcare Copilot",
          "GST Assistant",
        ].map((item, idx) => (
          <motion.button
            key={item}
            onClick={() => {
              setValue(item);
              textareaRef.current?.focus();
            }}
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              duration: 4.5 + idx * 0.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{
              y: -8,
              scale: 1.02,
              boxShadow: "0 12px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
            className="rounded-full border border-white/[0.04] bg-white/[0.02] backdrop-blur-md px-5 py-2 text-xs sm:text-sm text-white/45 shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:text-white/80 hover:border-white/[0.25] transition-all duration-300 cursor-pointer"
          >
            {item}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
