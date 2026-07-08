import { describe, expect, it } from "vitest";

import { ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION } from "../server/filter/activity-registry-dto-schema-version";
import { TIMELINE_REGISTRY_DTO_SCHEMA_VERSION } from "../server/filter/timeline-registry-dto-schema-version";
import { ACTIVITY_TIMELINE_HYDRATION_BUNDLE_SCHEMA_VERSION } from "./activity-timeline-hydration-bundle-schema-version";
import { createEmptyActivityTimelineHydrationBundle } from "./activity-timeline-hydration-bundle";
import { createActivityTimelineContextFromDto } from "./create-activity-timeline-context-from-dto";
import { sampleActivityTimelineHydrationBundle } from "./test-fixtures";

describe("createActivityTimelineContextFromDto", () => {
  it("hydrates both registries from a valid bundle", () => {
    const result = createActivityTimelineContextFromDto(
      sampleActivityTimelineHydrationBundle(),
    );

    expect(result.ok).toBe(true);
    expect(result.activityRegistry.list()).toHaveLength(2);
    expect(result.timelineRegistry.list()).toHaveLength(2);
    expect(result.diagnostics.hydrationStatus).toBe("hydrated");
    expect(result.diagnostics.schemaVersion).toBe(
      ACTIVITY_TIMELINE_HYDRATION_BUNDLE_SCHEMA_VERSION,
    );
    expect(result.diagnostics.activityTypeCount).toBe(2);
    expect(result.diagnostics.timelineDefinitionCount).toBe(2);
    expect(result.diagnostics.frameworkVersion).toBe("1.0.0");
  });

  it("rejects invalid bundle shape without partial hydration", () => {
    const result = createActivityTimelineContextFromDto({
      schemaVersion: 99,
      activityRegistry: {},
      timelineRegistry: {},
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.hydrationStatus).toBe("invalid");
    expect(result.activityRegistryDiagnostics.status).toBe("invalid");
    expect(result.timelineRegistryDiagnostics.status).toBe("invalid");
    expect(result.bundleErrors.length).toBeGreaterThan(0);
    expect(result.activityRegistry.list()).toEqual([]);
    expect(result.timelineRegistry.list()).toEqual([]);
  });

  it("rejects invalid activity dto without partial hydration", () => {
    const bundle = sampleActivityTimelineHydrationBundle({
      activityRegistry: {
        schemaVersion: ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION,
        types: [
          {
            activityTypeId: "dup",
            sourceEventPattern: "a",
            category: "capability",
            timelineScopes: ["timeline.personal"],
            templateRef: "t",
            version: "1",
            schemaVersion: "1",
            visibility: "public",
            stability: "stable",
            status: "active",
            source: "manifest",
            tags: [],
          },
          {
            activityTypeId: "dup",
            sourceEventPattern: "b",
            category: "capability",
            timelineScopes: ["timeline.personal"],
            templateRef: "t2",
            version: "1",
            schemaVersion: "1",
            visibility: "public",
            stability: "stable",
            status: "active",
            source: "manifest",
            tags: [],
          },
        ],
      },
    });

    const result = createActivityTimelineContextFromDto(bundle);

    expect(result.ok).toBe(false);
    expect(result.activityErrors.length).toBeGreaterThan(0);
    expect(result.timelineRegistryDiagnostics.status).toBe("invalid");
  });

  it("rejects invalid timeline dto without partial hydration", () => {
    const bundle = sampleActivityTimelineHydrationBundle({
      timelineRegistry: {
        schemaVersion: TIMELINE_REGISTRY_DTO_SCHEMA_VERSION,
        timelines: [],
      },
    });

    const invalidBundle = {
      ...bundle,
      timelineRegistry: {
        schemaVersion: 99,
        timelines: [],
      },
    };

    const result = createActivityTimelineContextFromDto(invalidBundle);

    expect(result.ok).toBe(false);
    expect(result.timelineErrors.length).toBeGreaterThan(0);
    expect(result.activityRegistryDiagnostics.status).toBe("invalid");
  });

  it("handles empty bundle as empty hydration status", () => {
    const result = createActivityTimelineContextFromDto(
      createEmptyActivityTimelineHydrationBundle(),
    );

    expect(result.ok).toBe(true);
    expect(result.diagnostics.hydrationStatus).toBe("empty");
    expect(result.diagnostics.activityTypeCount).toBe(0);
    expect(result.diagnostics.timelineDefinitionCount).toBe(0);
  });
});
