"use client";

import type { ReactNode } from "react";

import { useSupportRealtimeSubscription } from "@/lib/support/realtime/use-support-realtime";

/**
 * Mounts Support SSE subscription for the Support workspace (ENG-003).
 * Read-only — mutations remain REST.
 */
export function SupportRealtimeProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const { state, lastError } = useSupportRealtimeSubscription({ enabled: true });

  return (
    <div data-testid="support-realtime-provider" data-realtime-state={state}>
      {state === "error" || state === "connecting" ? (
        <p
          className="mb-2 text-xs text-muted-foreground"
          data-testid="support-realtime-status"
          role="status"
        >
          {state === "connecting"
            ? "Connecting live Support updates…"
            : (lastError ??
              "Live Support updates unavailable — REST refresh remains authoritative.")}
        </p>
      ) : null}
      {state === "open" ? (
        <p className="mb-2 sr-only" data-testid="support-realtime-live" role="status">
          Live Support updates connected (SSE).
        </p>
      ) : null}
      {children}
    </div>
  );
}
