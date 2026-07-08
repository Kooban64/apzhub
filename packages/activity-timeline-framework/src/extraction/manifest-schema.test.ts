import { describe, expect, it } from "vitest";

import { bootstrapActivityRegistry } from "../bootstrap/bootstrap-activity-registry";
import { bootstrapTimelineRegistry } from "../bootstrap/bootstrap-timeline-registry";
import { buildPlatformActivityDescriptors } from "../catalogue/register-platform-activities";
import { parseActivityManifestEntry } from "../extraction/activity-manifest-schema";
import { parseTimelineManifestEntry } from "../extraction/timeline-manifest-schema";
import { mapTimelineManifestToDefinition } from "../extraction/map-timeline-manifest";
import { normalizeManifestTimelineScope } from "../extraction/normalize-timeline-scope";
import {
  createEmptyActivityRegistryHydrationDiagnostics,
  buildActivityRegistryHydrationDiagnostics,
} from "../server/activity-registry-hydration-diagnostics";
import {
  createEmptyTimelineRegistryHydrationDiagnostics,
  buildTimelineRegistryHydrationDiagnostics,
} from "../server/timeline-registry-hydration-diagnostics";
import { createDefaultActivityRegistry } from "../registry/default-activity-registry";
import { createDefaultTimelineRegistry } from "../timeline/default-timeline-registry";
import {
  TIMELINE_SCOPE_ORGANIZATION,
  TIMELINE_SCOPE_TEAM,
} from "../types/timeline-scope";

const VALID_ACTIVITY = {
  id: "capability.example.created",
  eventPattern: "capability.example.created",
  category: "capability",
  timelineScopes: ["personal", "workspace"],
  templateRef: "example-created",
  version: "1.0.0",
  severity: "info",
  status: "planned",
  retentionHint: "standard",
  permissionKeys: ["platform.activity.read"],
  tags: ["example"],
};

const VALID_TIMELINE = {
  id: "team.support",
  scope: "team",
  label: "Support queue activity",
  version: "1.0.0",
  grouping: "by-actor",
  sortOrder: "newest-first",
  order: 150,
  activityCategoryFilter: ["integration"],
  activityTypeFilter: ["capability.*"],
  permissionKeys: ["platform.team.support.read"],
  experienceRef: "team-support-timeline",
  status: "planned",
};

describe("normalizeManifestTimelineScope", () => {
  it("maps manifest aliases to reserved scope ids", () => {
    expect(normalizeManifestTimelineScope("workspace")).toBe(
      TIMELINE_SCOPE_ORGANIZATION,
    );
    expect(normalizeManifestTimelineScope("timeline.team")).toBe(TIMELINE_SCOPE_TEAM);
    expect(normalizeManifestTimelineScope("unknown")).toBeUndefined();
  });
});

describe("parseActivityManifestEntry", () => {
  it("accepts a fully populated manifest entry", () => {
    const parsed = parseActivityManifestEntry(VALID_ACTIVITY);
    expect(parsed.entry?.timelineScopes).toEqual([
      "timeline.personal",
      "timeline.organization",
    ]);
  });

  it("rejects invalid manifest payloads", () => {
    expect(parseActivityManifestEntry(null).issue?.message).toContain("object");
    expect(
      parseActivityManifestEntry({ ...VALID_ACTIVITY, id: "Bad Id" }).issue?.field,
    ).toBe("id");
    expect(
      parseActivityManifestEntry({ ...VALID_ACTIVITY, category: "invalid" }).issue
        ?.field,
    ).toBe("category");
    expect(
      parseActivityManifestEntry({ ...VALID_ACTIVITY, timelineScopes: [] }).issue
        ?.field,
    ).toBe("timelineScopes");
    expect(
      parseActivityManifestEntry({ ...VALID_ACTIVITY, severity: "critical" }).issue
        ?.field,
    ).toBe("severity");
    expect(
      parseActivityManifestEntry({ ...VALID_ACTIVITY, tags: [""] }).issue?.field,
    ).toBe("tags");
  });
});

describe("parseTimelineManifestEntry", () => {
  it("accepts a fully populated manifest entry", () => {
    const parsed = parseTimelineManifestEntry(VALID_TIMELINE);
    expect(parsed.entry?.scope).toBe(TIMELINE_SCOPE_TEAM);
  });

  it("rejects invalid manifest payloads", () => {
    expect(parseTimelineManifestEntry(null).issue?.message).toContain("object");
    expect(
      parseTimelineManifestEntry({ ...VALID_TIMELINE, scope: "invalid" }).issue?.field,
    ).toBe("scope");
    expect(
      parseTimelineManifestEntry({ ...VALID_TIMELINE, grouping: "invalid" }).issue
        ?.field,
    ).toBe("grouping");
    expect(
      parseTimelineManifestEntry({ ...VALID_TIMELINE, sortOrder: "invalid" }).issue
        ?.field,
    ).toBe("sortOrder");
    expect(
      parseTimelineManifestEntry({ ...VALID_TIMELINE, activityCategoryFilter: [] })
        .issue?.field,
    ).toBe("activityCategoryFilter");
    expect(
      parseTimelineManifestEntry({ ...VALID_TIMELINE, activityTypeFilter: [""] }).issue
        ?.field,
    ).toBe("activityTypeFilter");
    expect(
      parseTimelineManifestEntry({ ...VALID_TIMELINE, order: Number.NaN }).issue?.field,
    ).toBe("order");
  });
});

describe("mapTimelineManifestToDefinition", () => {
  it("maps optional manifest metadata onto definition metadata", () => {
    const entry = parseTimelineManifestEntry(VALID_TIMELINE).entry!;
    const definition = mapTimelineManifestToDefinition(entry, "cap.example");

    expect(definition.order).toBe(150);
    expect(definition.metadata?.grouping).toBe("by-actor");
    expect(definition.metadata?.activityTypeFilter).toEqual(["capability.*"]);
    expect(definition.metadata?.sourceCapability).toBe("cap.example");
  });
});

describe("buildPlatformActivityDescriptors", () => {
  it("stamps custom platform version on descriptors", () => {
    const descriptors = buildPlatformActivityDescriptors("2.0.0");
    expect(descriptors[0]?.schemaVersion).toBe("2.0.0");
  });
});

describe("bootstrap failure paths", () => {
  it("returns empty activity diagnostics when platform registration fails", () => {
    const registry = createDefaultActivityRegistry();
    registry.register(buildPlatformActivityDescriptors()[0]!);

    const result = bootstrapActivityRegistry({ registry });
    expect(result.ok).toBe(false);
    expect(result.diagnostics).toEqual(
      createEmptyActivityRegistryHydrationDiagnostics(),
    );
  });

  it("returns empty timeline diagnostics when platform registration fails", () => {
    const registry = createDefaultTimelineRegistry();
    registry.register({
      timelineId: "timeline.personal",
      scope: "timeline.personal",
      label: "Personal",
      order: 10,
      version: "1.0.0",
    });

    const result = bootstrapTimelineRegistry({ registry });
    expect(result.ok).toBe(false);
    expect(result.diagnostics).toEqual(
      createEmptyTimelineRegistryHydrationDiagnostics(),
    );
  });
});

describe("hydration diagnostics empty registry", () => {
  it("builds activity diagnostics for empty registry", () => {
    const registry = createDefaultActivityRegistry();
    expect(buildActivityRegistryHydrationDiagnostics(registry).registeredCount).toBe(0);
  });

  it("builds timeline diagnostics for empty registry", () => {
    const registry = createDefaultTimelineRegistry();
    expect(buildTimelineRegistryHydrationDiagnostics(registry).registeredCount).toBe(0);
  });
});
