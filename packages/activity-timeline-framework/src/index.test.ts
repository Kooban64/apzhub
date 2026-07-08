import { describe, expect, it } from "vitest";

import {
  ACTIVITY_TIMELINE_FRAMEWORK_STATUS,
  TIMELINE_SCOPE_PERSONAL,
  createActivityTimelineContext,
  createDefaultActivityRegistry,
  createDefaultTimelineRegistry,
  createPlaceholderActivityRegistry,
  createPlaceholderTimelineRegistry,
  PLATFORM_TIMELINE_DEFINITIONS,
} from "./index";

describe("@apzhub/activity-timeline-framework package", () => {
  it("exports experiences status", () => {
    expect(ACTIVITY_TIMELINE_FRAMEWORK_STATUS).toBe("experiences");
  });

  it("exports four platform timeline definitions", () => {
    expect(PLATFORM_TIMELINE_DEFINITIONS).toHaveLength(4);
    expect(PLATFORM_TIMELINE_DEFINITIONS[0]?.timelineId).toBe(TIMELINE_SCOPE_PERSONAL);
  });
});

describe("createActivityTimelineContext", () => {
  it("defaults to DefaultActivityRegistry and platform timeline registry", () => {
    const context = createActivityTimelineContext();

    expect(context.status).toBe("experiences");
    expect(context.registry.list().length).toBeGreaterThan(0);
    expect(context.timelineRegistry.list()).toHaveLength(4);
    expect(context.timelineDiagnostics.registeredTimelineCount).toBe(4);
    expect(context.timelineDiagnostics.status).toBe("ready");
  });

  it("allows timeline registry injection override", () => {
    const context = createActivityTimelineContext({
      registry: createDefaultActivityRegistry(),
      timelineRegistry: createPlaceholderTimelineRegistry(),
    });

    expect(context.timelineRegistry.list()).toEqual([]);
    expect(context.timelineDiagnostics.status).toBe("scaffold");
  });

  it("allows activity registry injection override", () => {
    const context = createActivityTimelineContext({
      registry: createPlaceholderActivityRegistry(),
      timelineRegistry: createDefaultTimelineRegistry(),
    });

    expect(context.diagnostics.status).toBe("scaffold");
    expect(context.timelineRegistry.list()).toEqual([]);
  });
});
