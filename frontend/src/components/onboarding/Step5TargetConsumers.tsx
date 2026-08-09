"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Monitor,
  Package,
  Building2,
  Users,
  Landmark,
} from "lucide-react";
import { StepIntro } from "./StepIntro";
import { SelectionCard } from "./SelectionCard";

interface Step5TargetConsumersProps {
  selectedCustomers: string[];
  onToggleCustomer: (value: string) => void;

  customerOther: string;
  onCustomerOtherChange: (value: string) => void;

  disabled?: boolean;
}

const targetCustomers = [
  {
    id: "b2c",
    title: "Consumers (B2C)",
    icon: Users,
    description: "Sell directly to individual customers",
  },
  {
    id: "b2b",
    title: "Businesses (B2B)",
    icon: Building2,
    description: "Sell products or services to companies",
  },
  {
    id: "both",
    title: "Both",
    icon: Globe,
    description: "Serve both businesses and consumers",
  },
  {
    id: "government",
    title: "Government",
    icon: Landmark,
    description: "Public sector organizations",
  },
  {
    id: "internal",
    title: "Internal Company Tool",
    icon: Monitor,
    description: "Software used inside organizations",
  },
  {
    id: "Other",
    title: "Other",
    icon: Package,
    description: "Something different",
  },
];

export function Step5TargetConsumers({
  selectedCustomers,
  onToggleCustomer,
  customerOther,
  onCustomerOtherChange,
  disabled = false,
}: Step5TargetConsumersProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[850px] mx-auto flex flex-col gap-8"
    >
      <section className="flex flex-col items-center gap-6">
        <StepIntro
          description="Select all customer segments that apply."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full items-stretch">
          {targetCustomers.map((customer, index) => (
            <SelectionCard
              key={customer.id}
              title={customer.title}
              description={customer.description}
              icon={customer.icon}
              selected={selectedCustomers.includes(customer.id)}
              disabled={disabled}
              delay={index * 0.05}
              onClick={() => onToggleCustomer(customer.id)}
            />
          ))}
        </div>

        <AnimatePresence>
          {selectedCustomers.includes("Other") && (
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
                  value={customerOther}
                  disabled={disabled}
                  onChange={(e) => onCustomerOtherChange(e.target.value)}
                  placeholder="Tell us about your customers..."
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
