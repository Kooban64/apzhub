import { describe, expect, it } from "vitest";

import {
  bootstrapActivityRegistry,
  bootstrapActivityRegistryFromCapabilities,
} from "../bootstrap/bootstrap-activity-registry";
import {
  bootstrapTimelineRegistry,
  bootstrapTimelineRegistryFromCapabilities,
} from "../bootstrap/bootstrap-timeline-registry";
import { PLATFORM_ACTIVITY_CATALOGUE } from "../catalogue/platform-activity-catalogue";
import { registerPlatformActivityCatalogue } from "../catalogue/register-platform-activities";
import { registerPlatformTimelineCatalogue } from "../catalogue/register-platform-timelines";
import {
  collectActivityTypeManifestEntries,
  extractActivityDescriptorsFromCapabilities,
  hasCapabilityActivityTypeDeclarations,
} from "../extraction/extract-activities";
import {
  collectTimelineManifestEntries,
  extractTimelineDefinitionsFromCapabilities,
  hasCapabilityTimelineDeclarations,
} from "../extraction/extract-timelines";
import { mapPlatformCapabilitiesToActivityRecords } from "../extraction/map-capability-records";
import { createDefaultActivityRegistry } from "../registry/default-activity-registry";
import { createDefaultTimelineRegistry } from "../timeline/default-timeline-registry";
import { PLATFORM_TIMELINE_DEFINITIONS } from "../timeline/platform-timeline-catalogue";
import { buildActivityRegistryHydrationDiagnostics } from "../server/activity-registry-hydration-diagnostics";
import { buildTimelineRegistryHydrationDiagnostics } from "../server/timeline-registry-hydration-diagnostics";
import { TIMELINE_SCOPE_PERSONAL, TIMELINE_SCOPE_TEAM } from "../types/timeline-scope";

const SAMPLE_ACTIVITY_TYPE = {
  id: "capability.example.created",
  eventPattern: "capability.example.created",
  category: "capability",
  timelineScopes: ["personal"],
  templateRef: "example-created",
  version: "1.0.0",
  label: "Example created",
};

const SAMPLE_TIMELINE = {
  id: "team.support",
  scope: "team",
  label: "Support queue activity",
  version: "1.0.0",
  grouping: "by-actor",
  activityCategoryFilter: ["integration", "capability"],
};

describe("collectActivityTypeManifestEntries", () => {
  it("collects activities.types array declarations", () => {
    const entries = collectActivityTypeManifestEntries({
      activities: { types: [SAMPLE_ACTIVITY_TYPE] },
    });

    expect(entries).toHaveLength(1);
    expect(
      hasCapabilityActivityTypeDeclarations({
        activities: { types: [SAMPLE_ACTIVITY_TYPE] },
      }),
    ).toBe(true);
  });

  it("ignores manifests without activities.types", () => {
    expect(hasCapabilityActivityTypeDeclarations({ events: [] })).toBe(false);
    expect(collectActivityTypeManifestEntries({ activities: {} })).toEqual([]);
  });
});

describe("collectTimelineManifestEntries", () => {
  it("collects activities.timelines array declarations", () => {
    const entries = collectTimelineManifestEntries({
      activities: { timelines: [SAMPLE_TIMELINE] },
    });

    expect(entries).toHaveLength(1);
    expect(
      hasCapabilityTimelineDeclarations({
        activities: { timelines: [SAMPLE_TIMELINE] },
      }),
    ).toBe(true);
  });

  it("falls back to legacy timelines.scopes declarations", () => {
    const entries = collectTimelineManifestEntries({
      timelines: { scopes: [SAMPLE_TIMELINE] },
    });

    expect(entries).toHaveLength(1);
    expect(
      hasCapabilityTimelineDeclarations({ timelines: { scopes: [SAMPLE_TIMELINE] } }),
    ).toBe(true);
  });

  it("prefers activities.timelines over legacy timelines.scopes", () => {
    const entries = collectTimelineManifestEntries({
      activities: { timelines: [SAMPLE_TIMELINE] },
      timelines: { scopes: [{ ...SAMPLE_TIMELINE, id: "legacy.timeline" }] },
    });

    expect(entries).toHaveLength(1);
    expect((entries[0] as { id: string }).id).toBe("team.support");
  });
});

describe("extractActivityDescriptorsFromCapabilities", () => {
  it("extracts valid manifest activity types with source metadata", () => {
    const result = extractActivityDescriptorsFromCapabilities([
      {
        id: "example-cap",
        kind: "module",
        lifecycleState: "active",
        manifest: { activities: { types: [SAMPLE_ACTIVITY_TYPE] } },
        version: "2.0.0",
      },
    ]);

    expect(result.ok).toBe(true);
    expect(result.descriptors).toHaveLength(1);
    expect(result.descriptors[0]?.activityTypeId).toBe("capability.example.created");
    expect(result.descriptors[0]?.source).toBe("manifest");
    expect(result.descriptors[0]?.sourceCapability).toBe("example-cap");
    expect(result.descriptors[0]?.schemaVersion).toBe("2.0.0");
    expect(result.descriptors[0]?.timelineScopes).toEqual([TIMELINE_SCOPE_PERSONAL]);
  });

  it("rejects duplicate activity type ids across capabilities without extracting", () => {
    const result = extractActivityDescriptorsFromCapabilities([
      {
        id: "cap-a",
        kind: "module",
        lifecycleState: "active",
        manifest: { activities: { types: [SAMPLE_ACTIVITY_TYPE] } },
      },
      {
        id: "cap-b",
        kind: "module",
        lifecycleState: "active",
        manifest: { activities: { types: [SAMPLE_ACTIVITY_TYPE] } },
      },
    ]);

    expect(result.ok).toBe(false);
    expect(result.descriptors).toHaveLength(0);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
  });

  it("rejects invalid manifest payloads", () => {
    const result = extractActivityDescriptorsFromCapabilities([
      {
        id: "bad-cap",
        kind: "module",
        lifecycleState: "active",
        manifest: {
          activities: {
            types: [{ ...SAMPLE_ACTIVITY_TYPE, templateRef: "" }],
          },
        },
      },
    ]);

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("VALIDATION");
  });
});

describe("extractTimelineDefinitionsFromCapabilities", () => {
  it("extracts valid manifest timeline definitions with normalized scope", () => {
    const result = extractTimelineDefinitionsFromCapabilities([
      {
        id: "example-cap",
        kind: "module",
        lifecycleState: "active",
        manifest: { activities: { timelines: [SAMPLE_TIMELINE] } },
      },
    ]);

    expect(result.ok).toBe(true);
    expect(result.definitions).toHaveLength(1);
    expect(result.definitions[0]?.timelineId).toBe("team.support");
    expect(result.definitions[0]?.scope).toBe(TIMELINE_SCOPE_TEAM);
    expect(result.definitions[0]?.source).toBe("manifest");
    expect(result.definitions[0]?.metadata?.grouping).toBe("by-actor");
  });

  it("rejects duplicate timeline ids across capabilities without extracting", () => {
    const result = extractTimelineDefinitionsFromCapabilities([
      {
        id: "cap-a",
        kind: "module",
        lifecycleState: "active",
        manifest: { activities: { timelines: [SAMPLE_TIMELINE] } },
      },
      {
        id: "cap-b",
        kind: "module",
        lifecycleState: "active",
        manifest: { activities: { timelines: [SAMPLE_TIMELINE] } },
      },
    ]);

    expect(result.ok).toBe(false);
    expect(result.definitions).toHaveLength(0);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
  });
});

describe("registerPlatformActivityCatalogue", () => {
  it("registers foundational platform activity types atomically", () => {
    const registry = createDefaultActivityRegistry();
    const result = registerPlatformActivityCatalogue(registry);

    expect(result.ok).toBe(true);
    expect(result.registeredCount).toBe(PLATFORM_ACTIVITY_CATALOGUE.length);
    expect(registry.has("platform.lifecycle.started")).toBe(true);
    expect(registry.has("platform.action.executed")).toBe(true);
    expect(registry.get("platform.notification.generated")?.source).toBe("builtin");

    const metadata = registry.getMetadata("platform.knowledge.query.completed");
    expect(metadata?.source).toBe("builtin");
    expect(metadata?.sourceCapability).toBe("platform-runtime");
    expect(registry.getRegistryMetadata().platformCatalogueVersion).toBe("1.0.0");
  });
});

describe("registerPlatformTimelineCatalogue", () => {
  it("registers foundational platform timeline definitions atomically", () => {
    const registry = createDefaultTimelineRegistry();
    const result = registerPlatformTimelineCatalogue(registry);

    expect(result.ok).toBe(true);
    expect(result.registeredCount).toBe(PLATFORM_TIMELINE_DEFINITIONS.length);
    expect(registry.getRegistryMetadata().platformCatalogueVersion).toBe("1.0.0");
  });
});

describe("bootstrapActivityRegistry", () => {
  it("bootstraps platform catalogue and manifest activity types", () => {
    const result = bootstrapActivityRegistry({
      capabilityRecords: [
        {
          id: "example-cap",
          kind: "module",
          lifecycleState: "active",
          manifest: { activities: { types: [SAMPLE_ACTIVITY_TYPE] } },
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.diagnostics.builtinCount).toBe(PLATFORM_ACTIVITY_CATALOGUE.length);
    expect(result.diagnostics.manifestCount).toBe(1);
    expect(result.diagnostics.registeredCount).toBe(
      PLATFORM_ACTIVITY_CATALOGUE.length + 1,
    );
    expect(result.registry.has("capability.example.created")).toBe(true);
    expect(result.registry.getDiagnostics().manifestCapabilityIds).toEqual([
      "example-cap",
    ]);
  });

  it("returns errors without registering manifests when extraction fails", () => {
    const registry = createDefaultActivityRegistry();
    registerPlatformActivityCatalogue(registry);

    const result = bootstrapActivityRegistryFromCapabilities(
      [
        {
          id: "cap-a",
          kind: "module",
          lifecycleState: "active",
          manifest: { activities: { types: [SAMPLE_ACTIVITY_TYPE] } },
        },
        {
          id: "cap-b",
          kind: "module",
          lifecycleState: "active",
          manifest: { activities: { types: [SAMPLE_ACTIVITY_TYPE] } },
        },
      ],
      { registry },
    );

    expect(result.ok).toBe(false);
    expect(result.registry.list()).toHaveLength(PLATFORM_ACTIVITY_CATALOGUE.length);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
  });

  it("detects duplicate against platform catalogue during manifest registration", () => {
    const result = bootstrapActivityRegistry({
      capabilityRecords: [
        {
          id: "platform-cap",
          kind: "module",
          lifecycleState: "active",
          manifest: {
            activities: {
              types: [
                {
                  ...SAMPLE_ACTIVITY_TYPE,
                  id: "platform.lifecycle.started",
                  eventPattern: "platform.lifecycle.started",
                },
              ],
            },
          },
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
    expect(result.registry.list()).toHaveLength(PLATFORM_ACTIVITY_CATALOGUE.length);
  });

  it("is repeatable on fresh registry instances", () => {
    const first = bootstrapActivityRegistry();
    const second = bootstrapActivityRegistry();

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(first.diagnostics.builtinCount).toBe(second.diagnostics.builtinCount);
    expect(first.diagnostics.registeredCount).toBe(second.diagnostics.registeredCount);
  });

  it("reports hydration diagnostics with source metadata", () => {
    const bootstrap = bootstrapActivityRegistry({
      capabilityRecords: [
        {
          id: "example-cap",
          kind: "module",
          lifecycleState: "active",
          manifest: { activities: { types: [SAMPLE_ACTIVITY_TYPE] } },
        },
      ],
    });

    const diagnostics = buildActivityRegistryHydrationDiagnostics(bootstrap.registry);
    expect(diagnostics.builtinCount).toBe(PLATFORM_ACTIVITY_CATALOGUE.length);
    expect(diagnostics.manifestCount).toBe(1);
  });
});

describe("bootstrapTimelineRegistry", () => {
  it("bootstraps platform catalogue and manifest timeline definitions", () => {
    const result = bootstrapTimelineRegistry({
      capabilityRecords: [
        {
          id: "example-cap",
          kind: "module",
          lifecycleState: "active",
          manifest: { activities: { timelines: [SAMPLE_TIMELINE] } },
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.diagnostics.builtinCount).toBe(PLATFORM_TIMELINE_DEFINITIONS.length);
    expect(result.diagnostics.manifestCount).toBe(1);
    expect(result.registry.has("team.support")).toBe(true);
    expect(result.registry.getDiagnostics().manifestCapabilityIds).toEqual([
      "example-cap",
    ]);
  });

  it("returns errors without registering manifests when extraction fails", () => {
    const registry = createDefaultTimelineRegistry();
    registerPlatformTimelineCatalogue(registry);

    const result = bootstrapTimelineRegistryFromCapabilities(
      [
        {
          id: "cap-a",
          kind: "module",
          lifecycleState: "active",
          manifest: { activities: { timelines: [SAMPLE_TIMELINE] } },
        },
        {
          id: "cap-b",
          kind: "module",
          lifecycleState: "active",
          manifest: { activities: { timelines: [SAMPLE_TIMELINE] } },
        },
      ],
      { registry },
    );

    expect(result.ok).toBe(false);
    expect(result.registry.list()).toHaveLength(PLATFORM_TIMELINE_DEFINITIONS.length);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
  });

  it("is repeatable on fresh registry instances", () => {
    const first = bootstrapTimelineRegistry();
    const second = bootstrapTimelineRegistry();

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(first.diagnostics.builtinCount).toBe(second.diagnostics.builtinCount);
  });

  it("reports hydration diagnostics with source metadata", () => {
    const bootstrap = bootstrapTimelineRegistry({
      capabilityRecords: [
        {
          id: "example-cap",
          kind: "module",
          lifecycleState: "active",
          manifest: { activities: { timelines: [SAMPLE_TIMELINE] } },
        },
      ],
    });

    const diagnostics = buildTimelineRegistryHydrationDiagnostics(bootstrap.registry);
    expect(diagnostics.builtinCount).toBe(PLATFORM_TIMELINE_DEFINITIONS.length);
    expect(diagnostics.manifestCount).toBe(1);
  });
});

describe("mapPlatformCapabilitiesToActivityRecords", () => {
  it("maps runtime capability snapshots to extraction records", () => {
    const records = mapPlatformCapabilitiesToActivityRecords([
      {
        id: "cap.example",
        kind: "module",
        lifecycleState: "active",
        manifest: { activities: { types: [SAMPLE_ACTIVITY_TYPE] } },
        version: "3.0.0",
      },
    ]);

    expect(records[0]?.id).toBe("cap.example");
    expect(records[0]?.version).toBe("3.0.0");
  });
});
