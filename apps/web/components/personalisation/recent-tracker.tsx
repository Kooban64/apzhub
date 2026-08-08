"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { trackRecent } from "@/lib/personalisation/api";

function labelForPath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "home";
  return last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Tracks workspace navigations as Recent items (APS-Personalisation). */
export function RecentTracker() {
  const pathname = usePathname();
  const last = useRef<string>("");

  useEffect(() => {
    if (!pathname.startsWith("/workspace/")) {
      return;
    }
    if (pathname === last.current) {
      return;
    }
    last.current = pathname;
    void trackRecent({
      itemType: "route",
      itemKey: pathname,
      label: labelForPath(pathname),
    }).catch(() => {
      /* non-blocking */
    });
  }, [pathname]);

  return null;
}
