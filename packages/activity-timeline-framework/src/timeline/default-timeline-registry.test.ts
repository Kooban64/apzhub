import { describe, expect, it } from "vitest";

import type { TimelineDefinition } from "../types/timeline-definition";
import { TIMELINE_SCOPE_PERSONAL, TIMELINE_SCOPE_TEAM } from "../types/timeline-scope";
import {
  TimelineRegistryDuplicateError,
  TimelineRegistryNotFoundError,
  TimelineRegistryValidationError,
  createDefaultTimelineRegistry,
  PLATFORM_TIMELINE_DEFINITIONS,
  registerPlatformTimelineCatalogue,
  validateTimelineDefinition,
} from "./index";

function sampleTimeline(
  overrides: Partial<TimelineDefinition> = {},
): TimelineDefinition {
  return {
    timelineId: TIMELINE_SCOPE_PERSONAL,
    scope: TIMELINE_SCOPE_PERSONAL,
    label: "Personal",
    order: 10,
    version: "1.0.0",
    source: "builtin",
    ...overrides,
  };
}

describe("validateTimelineDefinition", () => {
  it("accepts valid definitions", () => {
    expect(() => validateTimelineDefinition(sampleTimeline())).not.toThrow();
  });

  it("rejects invalid timeline id and scope", () => {
    expect(() =>
      validateTimelineDefinition(sampleTimeline({ timelineId: "Bad" })),
    ).toThrow(TimelineRegistryValidationError);
    expect(() =>
      validateTimelineDefinition(
        sampleTimeline({ scope: "invalid.scope" as typeof TIMELINE_SCOPE_PERSONAL }),
      ),
    ).toThrow(TimelineRegistryValidationError);
  });
});

describe("DefaultTimelineRegistry", () => {
  it("registers definitions and lists immutable sorted snapshots", () => {
    const registry = createDefaultTimelineRegistry();
    registry.register(sampleTimeline());
    registry.register(
      sampleTimeline({
        timelineId: TIMELINE_SCOPE_TEAM,
        scope: TIMELINE_SCOPE_TEAM,
        label: "Team",
        order: 20,
      }),
    );

    const listed = registry.list();
    expect(listed).toHaveLength(2);
    expect(listed[0]?.timelineId).toBe(TIMELINE_SCOPE_PERSONAL);
    expect(Object.isFrozen(listed)).toBe(true);
    expect(Object.isFrozen(listed[0]?.supportedActivityCategories)).toBe(true);
  });

  it("throws on duplicate registration", () => {
    const registry = createDefaultTimelineRegistry();
    registry.register(sampleTimeline());
    expect(() => registry.register(sampleTimeline())).toThrow(
      TimelineRegistryDuplicateError,
    );
  });

  it("registerManyAtomic rejects invalid definitions without registering", () => {
    const registry = createDefaultTimelineRegistry();
    const result = registry.registerManyAtomic([
      sampleTimeline(),
      sampleTimeline({ timelineId: "invalid id" }),
    ]);

    expect(result.ok).toBe(false);
    expect(registry.list()).toHaveLength(0);
  });

  it("replace updates existing definition", () => {
    const registry = createDefaultTimelineRegistry();
    registry.register(sampleTimeline());
    registry.replace(sampleTimeline({ label: "Updated", version: "1.1.0" }));

    expect(registry.get(TIMELINE_SCOPE_PERSONAL)?.label).toBe("Updated");
  });

  it("replace throws when timeline is missing", () => {
    const registry = createDefaultTimelineRegistry();
    expect(() => registry.replace(sampleTimeline())).toThrow(
      TimelineRegistryNotFoundError,
    );
  });

  it("get returns defensive frozen copies", () => {
    const registry = createDefaultTimelineRegistry();
    registry.register(
      sampleTimeline({
        supportedActivityCategories: ["user"],
        metadata: { region: "eu" },
      }),
    );

    const first = registry.get(TIMELINE_SCOPE_PERSONAL);
    const second = registry.get(TIMELINE_SCOPE_PERSONAL);

    expect(first).not.toBe(second);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first?.metadata)).toBe(true);
  });
});

describe("platform timeline catalogue", () => {
  it("registers four built-in timeline definitions", () => {
    const registry = createDefaultTimelineRegistry();
    const result = registerPlatformTimelineCatalogue(registry);

    expect(result.ok).toBe(true);
    expect(result.registeredCount).toBe(4);
    expect(PLATFORM_TIMELINE_DEFINITIONS).toHaveLength(4);
    expect(registry.getDiagnostics().platformCount).toBe(4);
    expect(registry.get(TIMELINE_SCOPE_PERSONAL)?.status).toBe("active");
    expect(registry.get(TIMELINE_SCOPE_TEAM)?.status).toBe("planned");
  });

  it("registerMany commits valid batch", () => {
    const registry = createDefaultTimelineRegistry();
    registry.registerMany([
      sampleTimeline(),
      sampleTimeline({
        timelineId: TIMELINE_SCOPE_TEAM,
        scope: TIMELINE_SCOPE_TEAM,
        label: "Team",
        order: 20,
      }),
    ]);

    expect(registry.list()).toHaveLength(2);
  });

  it("records bootstrap metadata on diagnostics", () => {
    const registry = createDefaultTimelineRegistry();
    registry.register(sampleTimeline());
    registry.recordFrameworkVersion("0.0.0");
    registry.recordManifestCapabilities(["cap.actions"]);
    registry.recordPlatformCatalogue("2026.07");

    const diagnostics = registry.getDiagnostics();
    expect(diagnostics.frameworkVersion).toBe("0.0.0");
    expect(diagnostics.manifestCapabilityIds).toEqual(["cap.actions"]);
    expect(diagnostics.platformCatalogueVersion).toBe("2026.07");
  });

  it("clear resets registry", () => {
    const registry = createDefaultTimelineRegistry();
    registerPlatformTimelineCatalogue(registry);
    registry.clear();

    expect(registry.getDiagnostics().status).toBe("empty");
  });

  it("projects metadata with diagnostics", () => {
    const registry = createDefaultTimelineRegistry();
    registerPlatformTimelineCatalogue(registry);

    const metadata = registry.getMetadata(TIMELINE_SCOPE_TEAM);
    expect(metadata?.diagnostics.message).toContain("planned");
    expect(registry.listMetadata()).toHaveLength(4);
  });
});

describe("createDefaultTimelineRegistryWithPlatformCatalogue", () => {
  it("pre-registers platform catalogue", async () => {
    const { createDefaultTimelineRegistryWithPlatformCatalogue } =
      await import("./default-timeline-registry");
    const registry = createDefaultTimelineRegistryWithPlatformCatalogue();

    expect(registry.list()).toHaveLength(4);
    expect(registry.getRegistryMetadata().platformCatalogueVersion).toBe("1.0.0");
  });
});
