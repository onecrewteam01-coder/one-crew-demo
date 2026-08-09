"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Monitor,
  Lightbulb,
  Rocket,
  PartyPopper,
  TrendingUp,
  Target,
} from "lucide-react";
import { StepIntro } from "./StepIntro";
import { SelectionCard } from "./SelectionCard";

interface Step5StartupStageProps {
  startupStage: string;
  onStartupStageChange: (value: string) => void;
  disabled?: boolean;
}

const startupStages = [
  {
    id: "idea",
    title: "Idea",
    icon: Lightbulb,
    description: "Exploring and validating the concept",
  },
  {
    id: "planning",
    title: "Planning",
    icon: Target,
    description: "Defining strategy and requirements",
  },
  {
    id: "designing",
    title: "Designing",
    icon: Monitor,
    description: "Creating UI, UX and architecture",
  },
  {
    id: "mvp",
    title: "Building MVP",
    icon: Rocket,
    description: "Developing the first usable version",
  },
  {
    id: "beta",
    title: "Beta",
    icon: PartyPopper,
    description: "Testing with early users",
  },
  {
    id: "live",
    title: "Live",
    icon: TrendingUp,
    description: "Publicly launched product",
  },
];

export function Step5StartupStage({
  startupStage,
  onStartupStageChange,
  disabled = false,
}: Step5StartupStageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[800px] mx-auto flex flex-col gap-8"
    >
      <section className="flex flex-col items-center gap-6">
        <StepIntro
          description="Choose the stage that best describes your startup today."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full mx-auto items-stretch">
          {startupStages.map((stage, index) => (
            <SelectionCard
              key={stage.id}
              title={stage.title}
              description={stage.description}
              icon={stage.icon}
              selected={startupStage === stage.id}
              disabled={disabled}
              delay={index * 0.05}
              onClick={() => onStartupStageChange(stage.id)}
            />
          ))}
        </div>
      </section>
    </motion.div>
  );
}
