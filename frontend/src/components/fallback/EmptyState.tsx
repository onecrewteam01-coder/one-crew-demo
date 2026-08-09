"use client";

import React from "react";
import { Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FallbackShell, FallbackAction } from "./FallbackShell";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actions?: FallbackAction[];
  size?: "screen" | "panel";
}

/**
 * Generic "nothing here yet" state for lists, tables, and dashboard
 * widgets with no data (as opposed to SearchEmptyState, which is scoped
 * to a specific search query).
 */
export function EmptyState({
  icon = Inbox,
  title = "Nothing here yet",
  description = "There's no data to show right now. Once activity comes in, it'll show up here.",
  actions,
  size = "panel",
}: EmptyStateProps) {
  return (
    <FallbackShell
      icon={icon}
      title={title}
      description={description}
      size={size}
      actions={actions}
    />
  );
}
