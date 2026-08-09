"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/fallback/ErrorScreen";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // global-error.tsx replaces the root layout when a root-level error
  // occurs, so it must render its own <html>/<body>.
  return (
    <html lang="en">
      <body className="bg-black min-h-screen w-full antialiased">
        <ErrorScreen
          title="Something went seriously wrong"
          description="A critical error occurred and the app couldn't recover automatically. Please refresh the page."
          error={error}
          onRetry={reset}
          onGoHome={() => (window.location.href = "/")}
        />
      </body>
    </html>
  );
}
