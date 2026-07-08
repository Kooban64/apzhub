import { describe, expect, it } from "vitest";

import { bootstrapActivityRegistry } from "../bootstrap/bootstrap-activity-registry";
import { bootstrapTimelineRegistry } from "../bootstrap/bootstrap-timeline-registry";
import { createEmptyActivityTimelineHydrationBundle } from "../client/activity-timeline-hydration-bundle";
import { ACTIVITY_TIMELINE_HYDRATION_BUNDLE_SCHEMA_VERSION } from "../client/activity-timeline-hydration-bundle-schema-version";

import { buildActivityTimelineHydrationBundle } from "./build-activity-timeline-hydration-bundle";

describe("buildActivityTimelineHydrationBundle", () => {
  it("maps bootstrapped registries into a hydration bundle", () => {
    const activity = bootstrapActivityRegistry();
    const timeline = bootstrapTimelineRegistry();

    const bundle = buildActivityTimelineHydrationBundle({
      activityRegistry: activity.registry,
      timelineRegistry: timeline.registry,
    });

    expect(bundle.schemaVersion).toBe(
      ACTIVITY_TIMELINE_HYDRATION_BUNDLE_SCHEMA_VERSION,
    );
    expect(bundle.activityRegistry.types.length).toBeGreaterThan(0);
    expect(bundle.timelineRegistry.timelines.length).toBeGreaterThan(0);
    expect(bundle.synchronisation?.mode).toBe("hydration");
  });

  it("accepts pre-mapped DTOs", () => {
    const activity = bootstrapActivityRegistry();
    const timeline = bootstrapTimelineRegistry();
    const bundle = buildActivityTimelineHydrationBundle({
      activityRegistryDto: buildActivityTimelineHydrationBundle({
        activityRegistry: activity.registry,
        timelineRegistry: timeline.registry,
      }).activityRegistry,
      timelineRegistryDto: buildActivityTimelineHydrationBundle({
        activityRegistry: activity.registry,
        timelineRegistry: timeline.registry,
      }).timelineRegistry,
    });

    expect(bundle.activityRegistry.types.length).toBeGreaterThan(0);
    expect(bundle.timelineRegistry.timelines.length).toBeGreaterThan(0);
  });

  it("throws when registry sources are missing", () => {
    expect(() => buildActivityTimelineHydrationBundle({})).toThrow(
      /requires activity and timeline registry sources/,
    );
    expect(createEmptyActivityTimelineHydrationBundle().activityRegistry.types).toEqual(
      [],
    );
  });
});
