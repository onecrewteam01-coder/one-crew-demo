"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SelectionCard } from "./SelectionCard";
import {
  Smartphone,
  Package,
  Mail,
  UserRound,
  Apple,
  Monitor,
  KeyRound,
  Ban,
} from "lucide-react";

interface Step6AuthenticationProps {
  selectedAuth: string[];
  onToggleAuth: (value: string) => void;

  authOther: string;
  onAuthOtherChange: (value: string) => void;

  disabled?: boolean;
}

const AUTH_OPTIONS = [
  { id: "Email", icon: Mail, description: "Email & password login" },
  { id: "Google", icon: UserRound, description: "Continue with Google" },
  { id: "Apple", icon: Apple, description: "Sign in with Apple" },
  { id: "Microsoft", icon: Monitor, description: "Microsoft Account" },
  { id: "Phone Number", icon: Smartphone, description: "OTP based login" },
  { id: "Passwordless", icon: KeyRound, description: "Magic link authentication" },
  { id: "Not Required", icon: Ban, description: "No user accounts" },
  { id: "Other", icon: Package, description: "Custom authentication" },
];

export function Step6Authentication({
  selectedAuth,
  onToggleAuth,
  authOther,
  onAuthOtherChange,
  disabled = false,
}: Step6AuthenticationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[800px] mx-auto flex flex-col gap-8"
    >
      <section className="flex flex-col items-center gap-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full max-w-[700px] mx-auto">
          {AUTH_OPTIONS.map((auth, index) => (
            <SelectionCard
              key={auth.id}
              title={auth.id}
              description={auth.description}
              icon={auth.icon}
              selected={selectedAuth.includes(auth.id)}
              disabled={disabled}
              delay={index * 0.04}
              onClick={() => onToggleAuth(auth.id)}
            />
          ))}
        </div>

        <AnimatePresence>
          {selectedAuth.includes("Other") && (
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
                  value={authOther}
                  disabled={disabled}
                  onChange={(e) => onAuthOtherChange(e.target.value)}
                  placeholder="Describe your authentication preference..."
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
