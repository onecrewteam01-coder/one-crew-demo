"use client";

import React from "react";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import { FallbackShell, FallbackAction } from "./FallbackShell";

interface PermissionDeniedScreenProps {
  size?: "screen" | "panel";
  onGoBack?: () => void;
  homeHref?: string;
}

/** Shown when an authenticated user lacks the role/permission for a resource. */
export function PermissionDeniedScreen({
  size = "screen",
  onGoBack,
  homeHref = "/",
}: PermissionDeniedScreenProps) {
  const actions: FallbackAction[] = [];

  if (onGoBack) {
    actions.push({ label: "Go Back", onClick: onGoBack, variant: "secondary", icon: ArrowLeft });
  }
  actions.push({ label: "Back To Home", href: homeHref, variant: "primary", icon: Home });

  return (
    <FallbackShell
      icon={ShieldAlert}
      eyebrow="Access Restricted"
      title="You don't have permission"
      description="Your account doesn't have access to this page. Contact your admin if you think this is a mistake."
      tone="warning"
      size={size}
      actions={actions}
    />
  );
}
