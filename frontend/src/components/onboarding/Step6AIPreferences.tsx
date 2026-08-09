"use client";

import React from "react";
import { motion } from "framer-motion";
import { SelectionCard } from "./SelectionCard";
import { StepIntro } from "./StepIntro";
import { Sparkles, Ban, HelpCircle } from "lucide-react";

interface Step6AIPreferencesProps {
  aiPreference: string;
  onAiPreferenceChange: (value: string) => void;
  disabled?: boolean;
}

const AI_OPTIONS = [
  {
    id: "Required",
    icon: Sparkles,
    description: "AI-powered application",
  },
  {
    id: "Not Required",
    icon: Ban,
    description: "Traditional application",
  },
  {
    id: "Not Sure",
    icon: HelpCircle,
    description: "Help us decide",
  },
];

export function Step6AIPreferences({
  aiPreference,
  onAiPreferenceChange,
  disabled = false,
}: Step6AIPreferencesProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[850px] mx-auto flex flex-col gap-8"
    >
      <section className="flex flex-col items-center gap-6">
        <StepIntro
          description="What is your vision for AI?"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-2xl">
          {AI_OPTIONS.map((item, index) => (
            <SelectionCard
              key={item.id}
              title={item.id}
              description={item.description}
              icon={item.icon}
              selected={aiPreference === item.id}
              disabled={disabled}
              delay={index * 0.05}
              onClick={() => onAiPreferenceChange(item.id)}
            />
          ))}
        </div>
      </section>
    </motion.div>
  );
}
