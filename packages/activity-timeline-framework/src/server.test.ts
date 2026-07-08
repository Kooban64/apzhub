import { describe, expect, it } from "vitest";

import {
  ACTIVITY_MANIFEST_BLOCK,
  ACTIVITY_TIMELINE_SERVER_STATUS,
  createActivityTimelineContext,
} from "./server";

describe("@apzhub/activity-timeline-framework/server", () => {
  it("exports server registry status", () => {
    expect(ACTIVITY_TIMELINE_SERVER_STATUS).toBe("service");
  });

  it("re-exports composition root and manifest block constant", () => {
    expect(ACTIVITY_MANIFEST_BLOCK).toBe("activities.types");
    expect(createActivityTimelineContext).toBeTypeOf("function");
  });
});
