"use client";

import React from "react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { Skeleton, SkeletonCard, SkeletonText } from "@/components/fallback/Skeleton";

/**
 * Route-level loading boundary for /onboarding.
 * Renders an immediate layout skeleton when loading the onboarding wizard.
 */
export default function OnboardingLoading() {
  return (
    <OnboardingLayout>
      <div className="flex flex-col gap-6 pt-5 md:pt-8 w-full max-w-[600px] mx-auto" role="status" aria-label="Loading onboarding">
        {/* Step Header Skeleton */}
        <div className="flex flex-col items-center text-center gap-2">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-80 rounded-md" />
        </div>

        {/* Progress Indicator Skeleton */}
        <div className="flex justify-center my-2">
          <Skeleton className="h-6 w-48 rounded-full" />
        </div>

        {/* Form Card Skeletons */}
        <div className="grid grid-cols-1 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Action Button Skeleton */}
        <Skeleton className="h-12 w-full rounded-xl mt-4" />
      </div>
    </OnboardingLayout>
  );
}
