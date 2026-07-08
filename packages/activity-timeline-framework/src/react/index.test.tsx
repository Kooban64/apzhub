import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import {
  ACTIVITY_TIMELINE_FRAMEWORK_STATUS,
  ACTIVITY_TIMELINE_REACT_STATUS,
  ACTIVITY_TIMELINE_HYDRATION_BUNDLE_SCHEMA_VERSION,
  createActivityTimelineContextFromDto,
  createActivityTimelineContext,
  DEFAULT_TIMELINE_SCOPE_ID,
  sampleActivityTimelineHydrationBundle,
  useActivityTimelineContext,
} from "./index";
import { ActivityTimelineProvider } from "./activity-timeline-context";

describe("@apzhub/activity-timeline-framework/react", () => {
  it("exports react experiences status", () => {
    expect(ACTIVITY_TIMELINE_REACT_STATUS).toBe("experiences");
  });

  it("re-exports framework status and hydration factories", () => {
    expect(ACTIVITY_TIMELINE_FRAMEWORK_STATUS).toBe("experiences");
    expect(createActivityTimelineContext).toBeTypeOf("function");
    expect(createActivityTimelineContextFromDto).toBeTypeOf("function");
    expect(DEFAULT_TIMELINE_SCOPE_ID).toBe("timeline.personal");
    expect(ACTIVITY_TIMELINE_HYDRATION_BUNDLE_SCHEMA_VERSION).toBe(1);
  });

  it("exposes combined hydration diagnostics via context hook", () => {
    const bundle = sampleActivityTimelineHydrationBundle();

    const wrapper = ({ children }: { children: ReactNode }) => (
      <ActivityTimelineProvider bundle={bundle}>{children}</ActivityTimelineProvider>
    );

    const { result } = renderHook(() => useActivityTimelineContext(), { wrapper });

    expect(result.current.ok).toBe(true);
    expect(result.current.diagnostics.hydrationStatus).toBe("hydrated");
    expect(result.current.diagnostics.activityTypeCount).toBe(2);
    expect(result.current.diagnostics.timelineDefinitionCount).toBe(2);
  });
});
