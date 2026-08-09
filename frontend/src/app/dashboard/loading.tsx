import React from "react";
import { PageSkeleton } from "@/components/fallback/Skeleton";

/**
 * Route-level loading boundary for /dashboard.
 * Automatically shown by Next.js App Router during server chunk loading
 * and client transitions to /dashboard.
 */
export default function DashboardLoading() {
  return (
    <div className="relative bg-black text-slate-100 min-h-screen w-full max-w-full flex flex-col p-6">
      <PageSkeleton cards={3} />
    </div>
  );
}
