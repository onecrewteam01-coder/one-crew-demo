"use client";

import React from "react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { Skeleton, SkeletonCard } from "@/components/fallback/Skeleton";

/**
 * Route-level loading boundary for /profile-setup.
 * Renders an immediate skeleton when loading profile setup.
 */
export default function ProfileSetupLoading() {
  return (
    <OnboardingLayout>
      <div className="flex flex-col gap-6 pt-5 md:pt-8 w-full max-w-[600px] mx-auto" role="status" aria-label="Loading setup">
        <div className="flex flex-col items-center text-center gap-2">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-8 w-56 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>

        <div className="flex justify-center gap-2 w-48 mx-auto my-2">
          <Skeleton className="h-1 flex-1 rounded-full" />
          <Skeleton className="h-1 flex-1 rounded-full" />
        </div>

        <SkeletonCard />

        <Skeleton className="h-11 w-full rounded-xl mt-2" />
      </div>
    </OnboardingLayout>
  );
}
