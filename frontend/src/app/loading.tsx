import React from "react";
import { PageSkeleton } from "@/components/fallback/Skeleton";

/**
 * Root loading boundary for Next.js App Router.
 * Wraps root page and sub-route segment loading fallbacks automatically.
 */
export default function RootLoading() {
  return (
    <div className="relative bg-[#050505] text-[#e5e2e1] min-h-screen w-full flex flex-col justify-center items-center">
      <PageSkeleton cards={3} />
    </div>
  );
}
