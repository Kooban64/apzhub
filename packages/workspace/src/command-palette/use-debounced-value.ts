import { useEffect, useState } from "react";

/** Debounce a value for palette query filtering (AF-012 — 50–100ms). */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

export const COMMAND_PALETTE_QUERY_DEBOUNCE_MS = 75 as const;
