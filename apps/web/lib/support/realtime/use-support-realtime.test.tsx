/**
 * Support realtime subscription tests (ENG-003) — EventSource mocked.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useSupportRealtimeSubscription } from "./use-support-realtime";

class MockEventSource {
  static instances: MockEventSource[] = [];
  readonly url: string;
  onerror: ((ev: Event) => void) | null = null;
  private listeners = new Map<string, Set<(ev: MessageEvent) => void>>();

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
    queueMicrotask(() => {
      this.dispatch("realtime.ready", { data: "{}", lastEventId: "ready_1" });
    });
  }

  addEventListener(type: string, listener: (ev: MessageEvent) => void): void {
    const set = this.listeners.get(type) ?? new Set();
    set.add(listener);
    this.listeners.set(type, set);
  }

  dispatch(type: string, init: { data: string; lastEventId?: string }): void {
    const ev = {
      data: init.data,
      lastEventId: init.lastEventId ?? "",
    } as MessageEvent;
    for (const listener of this.listeners.get(type) ?? []) {
      listener(ev);
    }
  }

  close(): void {
    /* noop */
  }
}

describe("useSupportRealtimeSubscription", () => {
  beforeEach(() => {
    MockEventSource.instances = [];
    vi.stubGlobal("EventSource", MockEventSource);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("connects via EventSource and reaches open state", async () => {
    const client = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children);

    const { result } = renderHook(() => useSupportRealtimeSubscription(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.state).toBe("open");
    });
    expect(MockEventSource.instances[0]?.url).toContain(
      "/api/v1/support/events/stream",
    );
  });

  it("invalidates request lists on ticket events", async () => {
    const client = new QueryClient();
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children);

    renderHook(() => useSupportRealtimeSubscription(), { wrapper });

    await waitFor(() => {
      expect(MockEventSource.instances.length).toBe(1);
    });

    MockEventSource.instances[0]?.dispatch("support.ticket.created", {
      data: JSON.stringify({
        event: "support.ticket.created",
        data: { supportRequestId: "sreq_1" },
      }),
      lastEventId: "env_1",
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalled();
    });
  });

  it("stays disabled when enabled=false", () => {
    const client = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children);
    const { result } = renderHook(
      () => useSupportRealtimeSubscription({ enabled: false }),
      { wrapper },
    );
    expect(result.current.state).toBe("disabled");
    expect(MockEventSource.instances).toHaveLength(0);
  });
});
