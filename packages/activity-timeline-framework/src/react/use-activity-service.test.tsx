import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { createActivityTimelineServiceFromHydration } from "../client/service";
import { createActivityTimelineContextFromDto } from "../client";
import { sampleActivityTimelineHydrationBundle } from "../client/test-fixtures";
import { TIMELINE_SCOPE_PERSONAL } from "../types/timeline-scope";
import { ActivityTimelineProvider } from "./activity-timeline-context";
import { ActivityTimelineServiceProvider } from "./activity-timeline-service-context";
import { sampleActivityDocument } from "../client/service/test-fixtures";
import { useActivityService } from "./use-activity-service";

function createWrapper(bundle = sampleActivityTimelineHydrationBundle()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ActivityTimelineProvider bundle={bundle}>
        <ActivityTimelineServiceProvider>{children}</ActivityTimelineServiceProvider>
      </ActivityTimelineProvider>
    );
  };
}

describe("useActivityService", () => {
  it("exposes delegated query methods and diagnostics", async () => {
    const context = createActivityTimelineContextFromDto(
      sampleActivityTimelineHydrationBundle(),
    );
    const item = sampleActivityDocument({
      activityId: "env-1:platform.action.executed",
    });
    const service = createActivityTimelineServiceFromHydration({
      context,
      initialActivities: [item],
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ActivityTimelineServiceProvider service={service}>
        {children}
      </ActivityTimelineServiceProvider>
    );

    const { result } = renderHook(() => useActivityService(), { wrapper });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.listActivities()).toHaveLength(1);
    expect(result.current.getActivity(item.activityId)?.activityId).toBe(
      item.activityId,
    );
    expect(
      result.current.queryTimeline({ scopeId: TIMELINE_SCOPE_PERSONAL }),
    ).toMatchObject({
      items: [item.activityId],
      status: "ok",
    });
    expect(result.current.diagnostics.activityCount).toBe(1);
    expect(result.current.diagnostics.timelineDefinitionCount).toBe(2);
  });

  it("auto-wires from ActivityTimelineProvider hydration context", async () => {
    const { result } = renderHook(() => useActivityService(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.diagnostics.registryReady).toBe(true);
    expect(result.current.diagnostics.hydrationStatus).toBe("hydrated");
    expect(result.current.listActivities()).toEqual([]);
    expect(result.current.diagnostics.serviceStatus).toBe("empty");
  });

  it("reports unavailable diagnostics for invalid hydration bundle", async () => {
    const invalidBundle = {
      schemaVersion: 99,
      activityRegistry: {},
      timelineRegistry: {},
    } as unknown as ReturnType<typeof sampleActivityTimelineHydrationBundle>;

    const { result } = renderHook(() => useActivityService(), {
      wrapper: createWrapper(invalidBundle),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(false);
    });

    expect(result.current.diagnostics.serviceStatus).toBe("unavailable");
  });

  it("throws outside ActivityTimelineServiceProvider", () => {
    expect(() => renderHook(() => useActivityService())).toThrow(
      "useActivityService must be used within ActivityTimelineServiceProvider",
    );
  });
});
