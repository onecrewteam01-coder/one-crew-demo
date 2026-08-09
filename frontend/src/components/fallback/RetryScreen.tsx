"use client";

import React from "react";
import { RefreshCcw } from "lucide-react";
import { FallbackShell } from "./FallbackShell";

interface RetryScreenProps {
  title?: string;
  description?: string;
  onRetry: () => void;
  isRetrying?: boolean;
  /** Number of attempts already made, shown as a small counter for transparency. */
  attempt?: number;
  size?: "screen" | "panel";
}

/**
 * A focused "couldn't load, try again" state for a failed data fetch
 * (as opposed to ErrorScreen, which covers thrown/unhandled exceptions).
 */
export function RetryScreen({
  title = "Couldn't load this content",
  description = "The request failed to complete. This is usually temporary — give it another try.",
  onRetry,
  isRetrying = false,
  attempt,
  size = "panel",
}: RetryScreenProps) {
  return (
    <FallbackShell
      icon={RefreshCcw}
      eyebrow="Load Failed"
      title={title}
      description={description}
      size={size}
      actions={[
        {
          label: isRetrying ? "Retrying..." : "Retry",
          onClick: onRetry,
          variant: "primary",
          loading: isRetrying,
        },
      ]}
    >
      {typeof attempt === "number" && attempt > 0 && (
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/25">
          Attempt {attempt}
        </span>
      )}
    </FallbackShell>
  );
}
