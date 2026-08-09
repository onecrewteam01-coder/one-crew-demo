"use client";

import React from "react";
import { AlertTriangle, RotateCw, Home } from "lucide-react";
import { FallbackShell, FallbackAction } from "./FallbackShell";

interface ErrorScreenProps {
  title?: string;
  description?: string;
  /** Optional error object, e.g. forwarded from Next.js `error.tsx`. */
  error?: (Error & { digest?: string }) | null;
  /** Retry handler, e.g. Next.js `error.tsx`'s `reset()`. */
  onRetry?: () => void;
  onGoHome?: () => void;
  size?: "screen" | "panel";
}

/**
 * Generic "Something went wrong" screen. Used directly by app/error.tsx
 * and app/global-error.tsx, and reusable anywhere a caught exception
 * needs a graceful UI (e.g. a failed dashboard widget).
 */
export function ErrorScreen({
  title = "Something went wrong",
  description = "An unexpected error occurred. Our team has been notified — please try again.",
  error,
  onRetry,
  onGoHome,
  size = "screen",
}: ErrorScreenProps) {
  const actions: FallbackAction[] = [];

  if (onRetry) {
    actions.push({ label: "Try Again", onClick: onRetry, variant: "primary", icon: RotateCw });
  }
  if (onGoHome) {
    actions.push({ label: "Go Home", onClick: onGoHome, variant: "secondary", icon: Home });
  }

  return (
    <FallbackShell
      icon={AlertTriangle}
      eyebrow="Error"
      title={title}
      description={description}
      tone="danger"
      size={size}
      actions={actions}
    >
      {error?.digest && (
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/25">
          Reference: {error.digest}
        </span>
      )}
    </FallbackShell>
  );
}
