"use client";

import React from "react";
import { SearchX } from "lucide-react";
import { FallbackShell, FallbackAction } from "./FallbackShell";

interface SearchEmptyStateProps {
  query: string;
  suggestions?: string[];
  onClearSearch?: () => void;
  size?: "screen" | "panel";
}

/** Scoped empty state for a specific search query, distinct from the generic EmptyState. */
export function SearchEmptyState({
  query,
  suggestions,
  onClearSearch,
  size = "panel",
}: SearchEmptyStateProps) {
  const actions: FallbackAction[] = onClearSearch
    ? [{ label: "Clear Search", onClick: onClearSearch, variant: "secondary" }]
    : [];

  return (
    <FallbackShell
      icon={SearchX}
      eyebrow="No Results"
      title={`No results for "${query}"`}
      description="Try adjusting your search terms or filters."
      size={size}
      actions={actions}
    >
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {suggestions.map((s) => (
            <span
              key={s}
              className="font-mono text-[11px] uppercase tracking-wider text-white/45 border border-white/10 rounded-full px-3 py-1"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </FallbackShell>
  );
}
