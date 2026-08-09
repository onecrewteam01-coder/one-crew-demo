"use client";

import React from "react";

/**
 * Skeleton primitives
 * ──────────────────────────────────────────────────────────────────────────
 * Building blocks for loading states across the app (dashboard cards,
 * tables, lists, chat). Uses the `.skeleton-shimmer` utility (added to
 * globals.css) so every skeleton shares one animation instead of each
 * screen rolling its own pulse/gradient.
 */

interface SkeletonProps {
  className?: string;
}

/** Base pulsing rectangle. Compose with className for size/radius. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer rounded-md bg-white/[0.06] ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCircle({ className = "h-10 w-10" }: SkeletonProps) {
  return <Skeleton className={`rounded-full ${className}`} />;
}

/** A block of text lines with the last line shorter, like a paragraph. */
export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

/** Mirrors the glass-panel / agent-card look used across the dashboard. */
export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex flex-col gap-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        <SkeletonCircle className="h-9 w-9" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

/** Row for table-style fallbacks (e.g. ActivityTable while loading). */
export function SkeletonRow({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === 0 ? "w-1/4" : "flex-1"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} columns={columns} />
      ))}
    </div>
  );
}

/** Generic full-page loading skeleton: header + a grid of cards. */
export function PageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="w-full flex flex-col gap-6 p-6" role="status" aria-label="Loading">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: cards }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <span className="sr-only">Loading content, please wait…</span>
    </div>
  );
}
