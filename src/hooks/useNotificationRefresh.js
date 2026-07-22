"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const REFRESH_INTERVAL = 15000;

export default function useNotificationRefresh() {
  const router = useRouter();
  const intervalRef = useRef(null);

  useEffect(() => {
    function refreshNotifications() {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }

    function startRefreshInterval() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(refreshNotifications, REFRESH_INTERVAL);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        refreshNotifications();
        startRefreshInterval();
        return;
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    function handleWindowFocus() {
      refreshNotifications();
    }

    startRefreshInterval();

    document.addEventListener("visibilitychange", handleVisibilityChange);

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);

      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [router]);
}
