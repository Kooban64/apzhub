/**
 * Support Workbench realtime client (ADR-0072 / ENG-003) — EventSource SSE only.
 * Mutations remain REST; this module only invalidates TanStack Query caches.
 * Automatic reconnect + Last-Event-ID resume (query param when recreating EventSource).
 */

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { supportQueryKeys } from "../query-keys";

export type SupportRealtimeConnectionState =
  "disabled" | "connecting" | "open" | "error" | "closed";

export type SupportRealtimeWirePayload = {
  readonly id?: string;
  readonly event?: string;
  readonly data?: {
    readonly supportRequestId?: string;
    readonly sourceEventId?: string;
  };
};

const SUPPORT_WIRE_EVENTS = [
  "support.ticket.created",
  "support.ticket.assigned",
  "support.ticket.updated",
  "support.ticket.status_changed",
  "support.ticket.comment_added",
  "support.ticket.attachment_added",
  "support.ticket.sla_warning",
  "support.ticket.resolved",
] as const;

function resolveStreamUrl(lastEventId: string | null): string {
  const base =
    typeof window === "undefined"
      ? "/api/v1/support/events/stream"
      : `${window.location.origin}/api/v1/support/events/stream`;
  if (!lastEventId) return base;
  const url = new URL(base, "http://localhost");
  url.searchParams.set("lastEventId", lastEventId);
  if (typeof window === "undefined") {
    return `${url.pathname}${url.search}`;
  }
  return `${window.location.origin}${url.pathname}${url.search}`;
}

/**
 * Subscribe to Support SSE and refresh inbox/detail queries on events.
 * Reconnect with exponential backoff; never opens WebSockets.
 */
export function useSupportRealtimeSubscription(options?: {
  readonly enabled?: boolean;
}): {
  readonly state: SupportRealtimeConnectionState;
  readonly lastEventId: string | null;
  readonly lastError: string | null;
} {
  const queryClient = useQueryClient();
  const enabled = options?.enabled ?? true;
  const [state, setState] = useState<SupportRealtimeConnectionState>(
    enabled ? "connecting" : "disabled",
  );
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const attemptRef = useRef(0);
  const sourceRef = useRef<EventSource | null>(null);
  const lastEventIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setState("disabled");
      return;
    }

    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    function invalidateForEvent(payload: SupportRealtimeWirePayload): void {
      const requestId = payload.data?.supportRequestId;
      void queryClient.invalidateQueries({
        queryKey: supportQueryKeys.requests.lists(),
      });
      if (requestId) {
        void queryClient.invalidateQueries({
          queryKey: supportQueryKeys.requests.detail(requestId),
        });
        void queryClient.invalidateQueries({
          queryKey: supportQueryKeys.requests.articles(requestId),
        });
      }
    }

    function connect(): void {
      if (cancelled) return;
      setState("connecting");
      const url = resolveStreamUrl(lastEventIdRef.current);
      const source = new EventSource(url, { withCredentials: true });
      sourceRef.current = source;

      source.addEventListener("realtime.ready", () => {
        attemptRef.current = 0;
        setState("open");
        setLastError(null);
      });

      source.addEventListener("realtime.heartbeat", () => {
        /* keep-alive — no cache invalidation */
      });

      source.addEventListener("realtime.idle_timeout", () => {
        setLastError("Idle timeout — reconnecting");
      });

      source.addEventListener("realtime.shutdown", () => {
        setLastError("Server shutting down — reconnecting");
      });

      for (const eventName of SUPPORT_WIRE_EVENTS) {
        source.addEventListener(eventName, (ev) => {
          const messageEvent = ev as MessageEvent<string>;
          if (messageEvent.lastEventId) {
            lastEventIdRef.current = messageEvent.lastEventId;
            setLastEventId(messageEvent.lastEventId);
          }
          try {
            const parsed = JSON.parse(messageEvent.data) as SupportRealtimeWirePayload;
            if (parsed.id) {
              lastEventIdRef.current = parsed.id;
              setLastEventId(parsed.id);
            }
            invalidateForEvent(parsed);
          } catch {
            invalidateForEvent({});
          }
        });
      }

      source.onerror = () => {
        source.close();
        sourceRef.current = null;
        if (cancelled) return;
        setState("error");
        setLastError("SSE connection error — reconnecting");
        const attempt = attemptRef.current + 1;
        attemptRef.current = attempt;
        const delay = Math.min(30_000, 500 * 2 ** Math.min(attempt, 6));
        reconnectTimer = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      sourceRef.current?.close();
      sourceRef.current = null;
      setState("closed");
    };
  }, [enabled, queryClient]);

  return { state, lastEventId, lastError };
}
