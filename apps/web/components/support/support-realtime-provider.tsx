"use client";

import type { ReactNode } from "react";

import { useSupportRealtimeSubscription } from "@/lib/support/realtime/use-support-realtime";

/**
 * SUP-PR-03 — Support v1.0 realtime disposition: honest none by default.
 * SSE stack may exist platform-wide; product UI only connects when explicitly enabled
 * via NEXT_PUBLIC_APZHUB_REALTIME_SSE_ENABLED=true (must match server flag).
 */
function isSupportRealtimeUiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_APZHUB_REALTIME_SSE_ENABLED === "true";
}

/**
 * Mounts live updates for the APZ Support workspace when product realtime is enabled.
 * Read-only — mutations remain request/response.
 */
export function SupportRealtimeProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const uiEnabled = isSupportRealtimeUiEnabled();
  const { state, lastError } = useSupportRealtimeSubscription({
    enabled: uiEnabled,
  });

  return (
    <div
      data-testid="support-realtime-provider"
      data-realtime-state={state}
      data-realtime-ui-enabled={uiEnabled ? "true" : "false"}
    >
      {!uiEnabled ? (
        <p className="sr-only" data-testid="support-realtime-disabled" role="status">
          Live updates are not enabled for APZ Support. Refresh the request list or
          detail to see changes.
        </p>
      ) : null}
      {uiEnabled && (state === "error" || state === "connecting") ? (
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
      {uiEnabled && state === "open" ? (
        <p className="mb-2 sr-only" data-testid="support-realtime-live" role="status">
          Live updates connected.
        </p>
      ) : null}
      {children}
    </div>
  );
}
