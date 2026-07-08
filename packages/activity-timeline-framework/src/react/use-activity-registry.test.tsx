import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION } from "../server/filter/activity-registry-dto-schema-version";
import type { ActivityTimelineHydrationBundle } from "../client";
import {
  createEmptyActivityTimelineHydrationBundle,
  sampleActivityTimelineHydrationBundle,
} from "../client";
import { ActivityTimelineProvider } from "./activity-timeline-context";
import { useActivityRegistry } from "./use-activity-registry";

function createWrapper(
  bundle: ActivityTimelineHydrationBundle = sampleActivityTimelineHydrationBundle(),
) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ActivityTimelineProvider bundle={bundle}>{children}</ActivityTimelineProvider>
    );
  };
}

describe("useActivityRegistry", () => {
  it("returns isReady and hydrated types after provider mount", async () => {
    const { result } = renderHook(() => useActivityRegistry(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.types).toHaveLength(2);
    expect(result.current.diagnostics.status).toBe("hydrated");
    expect(result.current.diagnostics.synchronisation.mode).toBe("hydration");
    expect(result.current.schemaVersion).toBe(ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION);
    expect(result.current.frameworkVersion).toBe("1.0.0");
  });

  it("get and has resolve hydrated types", async () => {
    const { result } = renderHook(() => useActivityRegistry(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.has("platform.action.executed")).toBe(true);
    expect(result.current.get("platform.action.executed")?.label).toBe(
      "Action executed",
    );
    expect(result.current.get("missing.type")).toBeUndefined();
  });

  it("reports importErrors for invalid bundle", async () => {
    const invalidBundle = {
      schemaVersion: 99,
      activityRegistry: {},
      timelineRegistry: {},
    } as unknown as ActivityTimelineHydrationBundle;

    const { result } = renderHook(() => useActivityRegistry(), {
      wrapper: createWrapper(invalidBundle),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(false);
    });

    expect(result.current.importErrors.length).toBeGreaterThan(0);
    expect(result.current.diagnostics.status).toBe("invalid");
  });

  it("handles empty bundle", async () => {
    const { result } = renderHook(() => useActivityRegistry(), {
      wrapper: createWrapper(createEmptyActivityTimelineHydrationBundle()),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.types).toHaveLength(0);
    expect(result.current.diagnostics.status).toBe("empty");
  });

  it("throws outside provider", () => {
    expect(() => renderHook(() => useActivityRegistry())).toThrow(
      "useActivityTimelineContext must be used within ActivityTimelineProvider",
    );
  });
});
