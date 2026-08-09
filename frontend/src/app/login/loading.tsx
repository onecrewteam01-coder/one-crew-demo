import React from "react";
import { Skeleton, SkeletonText } from "@/components/fallback/Skeleton";

/**
 * Route-level loading boundary for /login.
 * Provides immediate skeleton feedback when navigating to the login page.
 */
export default function LoginLoading() {
  return (
    <div className="relative min-h-screen max-h-screen h-screen w-full bg-[#050505] text-[#e5e2e1] overflow-hidden flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Header skeleton */}
      <header className="relative z-10 w-full px-6 py-6 md:px-16 md:py-8 max-w-7xl mx-auto flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3.5">
          <Skeleton className="h-7 w-28 rounded-lg" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-4 w-16 rounded-md" />
      </header>

      {/* Login Card Skeleton */}
      <main className="relative z-10 w-full flex-grow flex items-center justify-center pb-12 px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.02] p-8 flex flex-col gap-6 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-7 w-48 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <Skeleton className="h-11 w-full rounded-xl mt-2" />
          </div>
          <SkeletonText lines={1} className="mt-2" />
        </div>
      </main>
    </div>
  );
}
