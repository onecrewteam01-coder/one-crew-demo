"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SelectionCard } from "./SelectionCard";
import {
  Sparkles,
  Smartphone,
  Globe,
  Server,
  Cpu,
  Coffee,
  Code2,
  Package,
} from "lucide-react";

interface Step6TechStackProps {
  selectedStacks: string[];
  onToggleStack: (value: string) => void;

  stackOther: string;
  onStackOtherChange: (value: string) => void;

  disabled?: boolean;
}

const TECH_STACKS = [
  { id: "Let OneCrew Decide", icon: Sparkles, description: "We'll recommend the best technologies" },
  { id: "Flutter", icon: Smartphone, description: "Cross-platform mobile apps" },
  { id: "React", icon: Globe, description: "Modern frontend framework" },
  { id: "Next.js", icon: Globe, description: "React framework with SSR" },
  { id: "Node.js", icon: Server, description: "Backend JavaScript runtime" },
  { id: "Python", icon: Cpu, description: "AI, APIs and automation" },
  { id: "Java", icon: Coffee, description: "Enterprise applications" },
  { id: ".NET", icon: Code2, description: "Microsoft development platform" },
  { id: "Other", icon: Package, description: "Something else" },
];

export function Step6TechStack({
  selectedStacks,
  onToggleStack,
  stackOther,
  onStackOtherChange,
  disabled = false,
}: Step6TechStackProps) {
  const showStackOther = selectedStacks.includes("Other");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[800px] mx-auto flex flex-col gap-8"
    >
      <section className="flex flex-col items-center gap-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full">
          {TECH_STACKS.map((stack, index) => (
            <SelectionCard
              key={stack.id}
              title={stack.id}
              description={stack.description}
              icon={stack.icon}
              selected={selectedStacks.includes(stack.id)}
              disabled={disabled}
              delay={index * 0.04}
              onClick={() => onToggleStack(stack.id)}
            />
          ))}
        </div>

        <AnimatePresence>
          {showStackOther && (
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
                  value={stackOther}
                  disabled={disabled}
                  onChange={(e) => onStackOtherChange(e.target.value)}
                  placeholder="Tell us your preferred technology..."
                  className="relative z-10 w-full rounded-xl border border-white/10 bg-[#0e0e0e]/30 backdrop-blur-xl px-4 py-3 text-[15px] text-white placeholder-white/25 transition-all duration-300 focus:border-white/25 focus:outline-none focus:ring-1 focus:ring-white/15 focus:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  );
}
