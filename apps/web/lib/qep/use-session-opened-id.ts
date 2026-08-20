"use client";

import { useCallback, useState } from "react";

function readSessionId(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Survive desktop↔mobile shell remount without a route navigation.
 */
export function useSessionOpenedId(storageKey: string): {
  readonly openedId: string | null;
  readonly setOpenedId: (id: string | null) => void;
} {
  const [openedId, setOpenedIdState] = useState<string | null>(() =>
    readSessionId(storageKey),
  );
  const setOpenedId = useCallback(
    (id: string | null) => {
      setOpenedIdState(id);
      try {
        if (id) window.sessionStorage.setItem(storageKey, id);
        else window.sessionStorage.removeItem(storageKey);
      } catch {
        /* ignore quota / private mode */
      }
    },
    [storageKey],
  );
  return { openedId, setOpenedId };
}
