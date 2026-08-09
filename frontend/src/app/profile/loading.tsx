import React from "react";
import { Skeleton, SkeletonCircle, SkeletonText } from "@/components/fallback/Skeleton";

/**
 * Route-level loading boundary for /profile.
 * Renders a glass-panel skeleton matching the profile form layout.
 */
export default function ProfileLoading() {
  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-[#e5e2e1] flex flex-col">
      <header className="relative z-10 w-full px-6 py-3.5 md:px-10 flex justify-between items-center border-b border-white/5">
        <Skeleton className="h-6 w-24 rounded-lg" />
        <Skeleton className="h-4 w-32 rounded-md" />
      </header>

      <main className="relative z-10 w-full flex justify-center px-5 sm:px-6 py-10 md:py-14">
        <div className="w-full max-w-[640px] rounded-2xl border border-white/10 bg-[#0e0e0e]/45 backdrop-blur-2xl p-6 md:p-9 flex flex-col gap-7">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-7 w-40 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>

          <div className="flex flex-col items-center gap-3">
            <SkeletonCircle className="h-24 w-24" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 flex flex-col gap-2">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-12 rounded" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20 rounded" />
            <SkeletonText lines={3} />
          </div>

          <Skeleton className="h-11 w-48 rounded-xl mx-auto mt-2" />
        </div>
      </main>
    </div>
  );
}
