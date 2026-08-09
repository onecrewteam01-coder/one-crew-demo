"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/fallback/ErrorScreen";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook up to your logging/monitoring provider here.
    console.error(error);
  }, [error]);

  return (
    <div className="bg-black min-h-screen w-full">
      <ErrorScreen
        error={error}
        onRetry={reset}
        onGoHome={() => (window.location.href = "/")}
      />
    </div>
  );
}
