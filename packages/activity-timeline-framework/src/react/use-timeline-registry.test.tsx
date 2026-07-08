import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { TIMELINE_REGISTRY_DTO_SCHEMA_VERSION } from "../server/filter/timeline-registry-dto-schema-version";
import { TIMELINE_SCOPE_PERSONAL } from "../types/timeline-scope";
import type { ActivityTimelineHydrationBundle } from "../client";
import {
  createEmptyActivityTimelineHydrationBundle,
  sampleActivityTimelineHydrationBundle,
} from "../client";
import { ActivityTimelineProvider } from "./activity-timeline-context";
import { useTimelineRegistry } from "./use-timeline-registry";

function createWrapper(
  bundle: ActivityTimelineHydrationBundle = sampleActivityTimelineHydrationBundle(),
) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ActivityTimelineProvider bundle={bundle}>{children}</ActivityTimelineProvider>
    );
  };
}

describe("useTimelineRegistry", () => {
  it("returns isReady and hydrated timelines after provider mount", async () => {
    const { result } = renderHook(() => useTimelineRegistry(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.timelines).toHaveLength(2);
    expect(result.current.diagnostics.status).toBe("hydrated");
    expect(result.current.schemaVersion).toBe(TIMELINE_REGISTRY_DTO_SCHEMA_VERSION);
  });

  it("listByScope filters timelines", async () => {
    const { result } = renderHook(() => useTimelineRegistry(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.listByScope(TIMELINE_SCOPE_PERSONAL)).toHaveLength(1);
    expect(result.current.get(TIMELINE_SCOPE_PERSONAL)?.label).toBe(
      "Personal timeline",
    );
  });

  it("reports importErrors for invalid bundle", async () => {
    const invalidBundle = {
      schemaVersion: 99,
      activityRegistry: {},
      timelineRegistry: {},
    } as unknown as ActivityTimelineHydrationBundle;

    const { result } = renderHook(() => useTimelineRegistry(), {
      wrapper: createWrapper(invalidBundle),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(false);
    });

    expect(result.current.importErrors.length).toBeGreaterThan(0);
    expect(result.current.diagnostics.status).toBe("invalid");
  });

  it("handles empty bundle", async () => {
    const { result } = renderHook(() => useTimelineRegistry(), {
      wrapper: createWrapper(createEmptyActivityTimelineHydrationBundle()),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.timelines).toHaveLength(0);
    expect(result.current.diagnostics.status).toBe("empty");
  });

  it("throws outside provider", () => {
    expect(() => renderHook(() => useTimelineRegistry())).toThrow(
      "useActivityTimelineContext must be used within ActivityTimelineProvider",
    );
  });
});
