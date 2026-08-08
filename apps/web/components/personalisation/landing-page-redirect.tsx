"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { fetchPreferences } from "@/lib/personalisation/api";

/**
 * Applies workbench.landingPage once per session when landing on default home.
 */
export function LandingPageRedirect() {
  const pathname = usePathname();
  const router = useRouter();
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current) {
      return;
    }
    if (pathname !== "/workspace/home" && pathname !== "/workspace/home/") {
      return;
    }
    applied.current = true;
    void fetchPreferences()
      .then((prefs) => {
        const landing = prefs.workbench.landingPage?.trim();
        if (
          landing &&
          landing.startsWith("/workspace/") &&
          landing !== "/workspace/home" &&
          landing !== "/workspace/home/"
        ) {
          router.replace(landing);
        }
      })
      .catch(() => {
        /* fail open — stay on home */
      });
  }, [pathname, router]);

  return null;
}
