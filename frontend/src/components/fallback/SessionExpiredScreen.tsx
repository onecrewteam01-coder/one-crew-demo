"use client";

import React from "react";
import { TimerOff } from "lucide-react";
import { FallbackShell, FallbackAction } from "./FallbackShell";

interface SessionExpiredScreenProps {
  size?: "screen" | "panel";
  loginHref?: string;
  onSignInAgain?: () => void;
}

/** Shown when a previously-authenticated session has timed out or been revoked. */
export function SessionExpiredScreen({
  size = "screen",
  loginHref = "/login",
  onSignInAgain,
}: SessionExpiredScreenProps) {
  const actions: FallbackAction[] = [
    onSignInAgain
      ? { label: "Sign In Again", onClick: onSignInAgain, variant: "primary" }
      : { label: "Sign In Again", href: loginHref, variant: "primary" },
  ];

  return (
    <FallbackShell
      icon={TimerOff}
      eyebrow="Session Expired"
      title="Your session has ended"
      description="For your security, you've been signed out after a period of inactivity. Please sign in again to continue."
      tone="warning"
      size={size}
      actions={actions}
    />
  );
}
