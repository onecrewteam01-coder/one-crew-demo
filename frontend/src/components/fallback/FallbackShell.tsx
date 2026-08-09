"use client";

import React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

/**
 * FallbackShell
 * ──────────────────────────────────────────────────────────────────────────
 * Single source of truth for the visual scaffold behind every fallback
 * screen in the app (offline, error, 404, empty, permission denied, auth
 * required, session expired, retry, maintenance, search empty, AI
 * processing). Mirrors the same "single reusable primitive" approach used
 * by SelectionChip / SelectionCard in the onboarding flow, so every
 * fallback shares identical spacing, typography and motion instead of
 * drifting copy-paste markup.
 */

export type FallbackTone = "neutral" | "danger" | "warning";
export type FallbackSize = "screen" | "panel";

export interface FallbackAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary";
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
}

interface FallbackShellProps {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  description?: string;
  tone?: FallbackTone;
  size?: FallbackSize;
  actions?: FallbackAction[];
  children?: React.ReactNode;
  className?: string;
}

const toneRing: Record<FallbackTone, string> = {
  neutral: "border-white/10 bg-white/[0.03]",
  danger: "border-red-500/20 bg-red-500/[0.04]",
  warning: "border-amber-400/20 bg-amber-400/[0.04]",
};

const toneIcon: Record<FallbackTone, string> = {
  neutral: "text-white/70",
  danger: "text-red-400/80",
  warning: "text-amber-300/80",
};

export function FallbackButton({
  label,
  onClick,
  href,
  variant = "primary",
  icon: Icon,
  loading = false,
  disabled = false,
}: FallbackAction) {
  const isInert = disabled || loading;

  const classes =
    variant === "primary"
      ? "bg-white text-black hover:bg-white/95 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:bg-white/20 disabled:text-black/40"
      : "border border-white/15 text-white/70 bg-transparent hover:border-white/30 hover:text-white disabled:text-white/25 disabled:border-white/10";

  const content = (
    <>
      {loading ? (
        <span
          className={`h-3.5 w-3.5 rounded-full border-2 border-t-transparent animate-spin ${
            variant === "primary" ? "border-black" : "border-white/60"
          }`}
        />
      ) : (
        Icon && <Icon className="h-3.5 w-3.5" />
      )}
      {label}
    </>
  );

  const sharedClassName = `inline-flex items-center justify-center gap-2 min-w-[160px] font-mono text-[12px] font-semibold uppercase tracking-widest py-3 px-6 rounded-xl transition-all duration-300 select-none cursor-pointer disabled:cursor-not-allowed ${classes}`;

  if (href && !isInert) {
    return (
      <motion.a
        href={href}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={sharedClassName}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={isInert}
      whileHover={isInert ? {} : { scale: 1.02 }}
      whileTap={isInert ? {} : { scale: 0.97 }}
      className={sharedClassName}
    >
      {content}
    </motion.button>
  );
}

export function FallbackShell({
  icon: Icon,
  eyebrow,
  title,
  description,
  tone = "neutral",
  size = "screen",
  actions,
  children,
  className = "",
}: FallbackShellProps) {
  return (
    <div
      className={`w-full flex items-center justify-center px-6 ${
        size === "screen" ? "min-h-screen py-16" : "min-h-[420px] py-10"
      } ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center text-center max-w-md mx-auto gap-5"
      >
        <div
          className={`h-16 w-16 rounded-2xl border flex items-center justify-center ${toneRing[tone]}`}
        >
          <Icon className={`h-7 w-7 ${toneIcon[tone]}`} strokeWidth={1.75} />
        </div>

        <div className="flex flex-col gap-2">
          {eyebrow && (
            <span className="font-mono text-[11px] uppercase tracking-widest text-white/40">
              {eyebrow}
            </span>
          )}
          <h2 className="font-sora text-[26px] md:text-[30px] font-semibold tracking-tight text-white glow-text">
            {title}
          </h2>
          {description && (
            <p className="text-[14px] md:text-[15px] text-white/45 leading-relaxed max-w-sm mx-auto">
              {description}
            </p>
          )}
        </div>

        {children}

        {actions && actions.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {actions.map((action) => (
              <FallbackButton key={action.label} {...action} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
