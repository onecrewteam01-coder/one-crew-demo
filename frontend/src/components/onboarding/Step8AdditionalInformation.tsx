"use client";

import React from "react";
import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";

interface Step8FormProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function Step8Form({
  value,
  onChange,
  disabled = false,
}: Step8FormProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[800px] mx-auto flex flex-col gap-8"
    >
      <section className="flex flex-col items-center gap-6">

        <div className="w-full">
          <div className="relative rounded-2xl overflow-hidden group">

            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 pointer-events-none group-focus-within:via-white/20 transition-all duration-500" />

            <div className="relative z-10 rounded-2xl border border-white/10 bg-[#0e0e0e]/30 backdrop-blur-xl">

              {/* Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <ClipboardList className="w-3.5 h-3.5 text-white/40" />

                <span className="font-mono uppercase tracking-wider text-[11px] text-white/40">
                  Optional Details
                </span>
              </div>


              {/* Input */}
              <textarea
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                rows={4}
                placeholder={`Examples:
                  • Budget limitations
                  • Performance requirements
                  • Security requirements`}
                className="
                  w-full
                  resize-none
                  bg-transparent
                  px-4
                  py-4
                  text-[15px]
                  leading-6
                  text-white
                  placeholder:text-white/40
                  outline-none
                  min-h-[150px]
                "
              />

            </div>
          </div>


          {/* Counter */}
          <div className="mt-3 flex justify-between text-[12px] text-white/30 font-mono uppercase tracking-wider">
            <span>Optional</span>
            <span>{value.length} characters</span>
          </div>

        </div>

      </section>
    </motion.div>
  );
}