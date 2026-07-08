import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { createActivityTimelineServiceFromHydration } from "../client/service";
import { createActivityTimelineContextFromDto } from "../client";
import { sampleActivityTimelineHydrationBundle } from "../client/test-fixtures";
import { sampleActivityDocument } from "../client/service/test-fixtures";
import { ActivityTimelineProvider } from "./activity-timeline-context";
import { ActivityTimelineServiceProvider } from "./activity-timeline-service-context";
import { useActivityPresentation } from "./use-activity-presentation";

function createWrapper(
  initialActivities = [
    sampleActivityDocument({
      activityId: "env-1:platform.action.executed",
      timestamp: "2026-07-04T12:00:00.000Z",
    }),
  ],
) {
  const bundle = sampleActivityTimelineHydrationBundle();
  const context = createActivityTimelineContextFromDto(bundle);
  const service = createActivityTimelineServiceFromHydration({
    context,
    initialActivities,
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ActivityTimelineProvider bundle={bundle}>
        <ActivityTimelineServiceProvider service={service}>
          {children}
        </ActivityTimelineServiceProvider>
      </ActivityTimelineProvider>
    );
  };
}

describe("useActivityPresentation", () => {
  it("returns view models, grouped view models, and diagnostics", async () => {
    const { result } = renderHook(
      () =>
        useActivityPresentation({
          now: "2026-07-04T12:05:00.000Z",
          grouping: "date",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.viewModels).toHaveLength(1);
    });

    expect(result.current.isEmpty).toBe(false);
    expect(result.current.isReady).toBe(true);
    expect(result.current.groupedViewModels[0]?.key).toBe("today");
    expect(result.current.diagnostics.totalCount).toBe(1);
    expect(result.current.diagnostics.layerStatus).toBe("presentation");
    expect(result.current.serviceDiagnostics.activityCount).toBe(1);
  });

  it("returns empty presentation for empty service", async () => {
    const { result } = renderHook(() => useActivityPresentation(), {
      wrapper: createWrapper([]),
    });

    await waitFor(() => {
      expect(result.current.isEmpty).toBe(true);
    });

    expect(result.current.diagnostics.status).toBe("empty");
  });

  it("throws outside ActivityTimelineServiceProvider", () => {
    expect(() => renderHook(() => useActivityPresentation())).toThrow(
      "useActivityService must be used within ActivityTimelineServiceProvider",
    );
  });
});
