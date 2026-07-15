"use client";

import type { ThemeMode } from "@apzhub/theme";
import { useTheme } from "@apzhub/theme";
import { useEffect, useRef } from "react";

export interface PersonalisationThemeBridgeProps {
  readonly userId?: string;
  readonly initialTheme?: ThemeMode;
}

/** Syncs next-themes with Platform PreferenceService (M8-04). */
export function PersonalisationThemeBridge({
  userId,
  initialTheme,
}: PersonalisationThemeBridgeProps) {
  const { theme, setTheme } = useTheme();
  const hydratedRef = useRef(false);
  const savingRef = useRef(false);

  useEffect(() => {
    if (!userId || hydratedRef.current) {
      return;
    }

    if (initialTheme) {
      setTheme(initialTheme);
      hydratedRef.current = true;
      return;
    }

    let active = true;
    fetch("/api/platform/v1/preferences", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok || !active) {
          return;
        }
        const body = (await response.json()) as {
          data?: { appearance?: { theme?: ThemeMode } };
        };
        const savedTheme = body.data?.appearance?.theme;
        if (savedTheme) {
          setTheme(savedTheme);
        }
        hydratedRef.current = true;
      })
      .catch(() => {
        hydratedRef.current = true;
      });

    return () => {
      active = false;
    };
  }, [userId, initialTheme, setTheme]);

  useEffect(() => {
    if (!userId || !hydratedRef.current || savingRef.current || !theme) {
      return;
    }

    savingRef.current = true;
    fetch("/api/platform/v1/preferences", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appearance: { theme } }),
    })
      .catch(() => undefined)
      .finally(() => {
        savingRef.current = false;
      });
  }, [theme, userId]);

  return null;
}
