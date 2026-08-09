"use client";

import React from "react";
import { Compass, Home } from "lucide-react";
import { FallbackShell, FallbackAction } from "./FallbackShell";

interface NotFoundScreenProps {
  size?: "screen" | "panel";
  homeHref?: string;
}

/** Used by app/not-found.tsx for unmatched routes. */
export function NotFoundScreen({ size = "screen", homeHref = "/" }: NotFoundScreenProps) {
  const actions: FallbackAction[] = [
    { label: "Back To Home", href: homeHref, variant: "primary", icon: Home },
  ];

  return (
    <FallbackShell
      icon={Compass}
      eyebrow="404"
      title="Page not found"
      description="The page you're looking for doesn't exist or may have been moved."
      size={size}
      actions={actions}
    />
  );
}
