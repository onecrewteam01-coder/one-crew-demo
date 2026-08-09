"use client";

import { useEffect, useState } from "react";

/**
 * Tracks browser connectivity via the `online` / `offline` window events.
 * Defaults to `true` on the server / first paint to avoid a hydration
 * mismatch, then syncs to `navigator.onLine` immediately after mount.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
});

  useEffect(() => {

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
