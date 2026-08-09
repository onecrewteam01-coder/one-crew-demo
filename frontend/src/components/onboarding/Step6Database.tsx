"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SelectionCard } from "./SelectionCard";
import { Sparkles, Package, Database, Flame } from "lucide-react";

interface Step6DatabaseProps {
  selectedDatabase: string;
  onSelectDatabase: (value: string) => void;

  databaseOther: string;
  onDatabaseOtherChange: (value: string) => void;

  disabled?: boolean;
}

const DATABASE_OPTIONS = [
  { id: "Let OneCrew Decide", icon: Sparkles, description: "We'll recommend the best database" },
  { id: "PostgreSQL", icon: Database, description: "Powerful relational database" },
  { id: "MySQL", icon: Database, description: "Popular SQL database" },
  { id: "MongoDB", icon: Database, description: "Flexible NoSQL database" },
  { id: "Firebase", icon: Flame, description: "Realtime backend platform" },
  { id: "Supabase", icon: Database, description: "Open-source backend" },
  { id: "SQLite", icon: Database, description: "Lightweight embedded database" },
  { id: "Other", icon: Package, description: "Something else" },
];

export function Step6Database({
  selectedDatabase,
  onSelectDatabase,
  databaseOther,
  onDatabaseOtherChange,
  disabled = false,
}: Step6DatabaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[800px] mx-auto flex flex-col gap-8"
    >
      <section className="flex flex-col items-center gap-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full">
          {DATABASE_OPTIONS.map((db, index) => (
            <SelectionCard
              key={db.id}
              title={db.id}
              description={db.description}
              icon={db.icon}
              selected={selectedDatabase === db.id}
              disabled={disabled}
              delay={index * 0.04}
              onClick={() => onSelectDatabase(db.id)}
            />
          ))}
        </div>

        <AnimatePresence>
          {selectedDatabase === "Other" && (
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
                  value={databaseOther}
                  disabled={disabled}
                  onChange={(e) => onDatabaseOtherChange(e.target.value)}
                  placeholder="Tell us your preferred database..."
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
