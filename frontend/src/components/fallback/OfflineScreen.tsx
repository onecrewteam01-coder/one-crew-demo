"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { FallbackShell, FallbackAction } from "./FallbackShell";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";

interface OfflineScreenProps {
  size?: "screen" | "panel";
  onRetry?: () => void;
}

/** Full fallback screen for routes/pages that require connectivity. */
export function OfflineScreen({ size = "screen", onRetry }: OfflineScreenProps) {
  const isOnline = useOnlineStatus();

  const actions: FallbackAction[] = [
    {
      label: "Try Again",
      onClick: onRetry ?? (() => window.location.reload()),
      variant: "primary",
    },
  ];

  return (
    <FallbackShell
      icon={WifiOff}
      eyebrow={isOnline ? "Connection Restored" : "No Internet"}
      title={isOnline ? "You're back online" : "You're offline"}
      description={
        isOnline
          ? "Your connection has been restored. You can continue where you left off."
          : "We can't reach the network right now. Check your connection and try again."
      }
      tone={isOnline ? "neutral" : "warning"}
      size={size}
      actions={actions}
    />
  );
}

/**
 * App-wide slim banner that appears automatically whenever the browser
 * goes offline, without blocking the rest of the UI. Mount once near the
 * root layout (see app/layout.tsx).
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          className="fixed top-0 inset-x-0 z-[999] flex items-center justify-center gap-2 py-2 px-4 bg-amber-400/10 border-b border-amber-400/20 backdrop-blur-md font-mono text-[11px] uppercase tracking-widest text-amber-200/90"
        >
          <WifiOff className="h-3.5 w-3.5" />
          You&apos;re offline — some features may not work
        </motion.div>
      )}
    </AnimatePresence>
  );
}
