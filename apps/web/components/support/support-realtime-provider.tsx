"use client";

import type { ReactNode } from "react";

import { useSupportRealtimeSubscription } from "@/lib/support/realtime/use-support-realtime";

/**
 * Mounts live updates for the APZ Support workspace.
 * Read-only — mutations remain request/response.
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
            ? "Connecting live updates…"
            : (lastError ?? "Live updates unavailable — refresh still works normally.")}
        </p>
      ) : null}
      {state === "open" ? (
        <p className="mb-2 sr-only" data-testid="support-realtime-live" role="status">
          Live updates connected.
        </p>
      ) : null}
      {children}
    </div>
  );
}
