"use client";

import React from "react";
import { KeyRound } from "lucide-react";
import { FallbackShell, FallbackAction } from "./FallbackShell";

interface AuthRequiredScreenProps {
  size?: "screen" | "panel";
  loginHref?: string;
  registerHref?: string;
}

/** Shown when a route requires a signed-in user. */
export function AuthRequiredScreen({
  size = "screen",
  loginHref = "/login",
  registerHref = "/Register",
}: AuthRequiredScreenProps) {
  const actions: FallbackAction[] = [
    { label: "Log In", href: loginHref, variant: "primary" },
    { label: "Create Account", href: registerHref, variant: "secondary" },
  ];

  return (
    <FallbackShell
      icon={KeyRound}
      eyebrow="Authentication Required"
      title="Sign in to continue"
      description="You need to be logged in to view this page. Sign in or create an account to continue."
      size={size}
      actions={actions}
    />
  );
}
