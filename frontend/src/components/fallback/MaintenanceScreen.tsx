"use client";

import React from "react";
import { Wrench } from "lucide-react";
import { FallbackShell, FallbackAction } from "./FallbackShell";

interface MaintenanceScreenProps {
  size?: "screen" | "panel";
  /** e.g. "back by 3:00 PM UTC" — shown as a small status line if provided. */
  etaLabel?: string;
  onRefresh?: () => void;
}

/** Shown app-wide when the product is intentionally taken offline for maintenance. */
export function MaintenanceScreen({ size = "screen", etaLabel, onRefresh }: MaintenanceScreenProps) {
  const actions: FallbackAction[] = [
    {
      label: "Refresh",
      onClick: onRefresh ?? (() => window.location.reload()),
      variant: "primary",
    },
  ];

  return (
    <FallbackShell
      icon={Wrench}
      eyebrow="Scheduled Maintenance"
      title="We'll be right back"
      description="OneCrew is currently undergoing scheduled maintenance to improve your experience. Thanks for your patience."
      size={size}
      actions={actions}
    >
      {etaLabel && (
        <span className="font-mono text-[11px] uppercase tracking-widest text-white/40 border border-white/10 rounded-full px-3 py-1">
          {etaLabel}
        </span>
      )}
    </FallbackShell>
  );
}
