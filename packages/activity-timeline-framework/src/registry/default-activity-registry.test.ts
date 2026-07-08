import { describe, expect, it } from "vitest";

import type { ActivityDescriptor } from "../types/activity-descriptor";
import { CANONICAL_ACTIVITY_CATEGORIES } from "../types/activity-category";
import { TIMELINE_SCOPE_PERSONAL } from "../types/timeline-scope";
import {
  ActivityRegistryDuplicateError,
  ActivityRegistryNotFoundError,
  ActivityRegistryValidationError,
  createDefaultActivityRegistry,
  validateActivityDescriptor,
} from "./index";

function sampleActivity(
  overrides: Partial<ActivityDescriptor> = {},
): ActivityDescriptor {
  return {
    activityTypeId: "capability.action.executed",
    version: "1.0.0",
    category: "capability",
    sourceEventPattern: "capability.action.executed",
    timelineScopes: [TIMELINE_SCOPE_PERSONAL],
    templateRef: "activity.action.executed",
    label: "Action executed",
    source: "builtin",
    ...overrides,
  };
}

describe("validateActivityDescriptor", () => {
  it("accepts valid descriptors", () => {
    expect(() => validateActivityDescriptor(sampleActivity())).not.toThrow();
  });

  it("rejects invalid activity type id pattern", () => {
    expect(() =>
      validateActivityDescriptor(sampleActivity({ activityTypeId: "Bad_ID" })),
    ).toThrow(ActivityRegistryValidationError);
  });

  it("rejects invalid semver version", () => {
    expect(() => validateActivityDescriptor(sampleActivity({ version: "v1" }))).toThrow(
      ActivityRegistryValidationError,
    );
  });

  it("rejects empty templateRef", () => {
    expect(() =>
      validateActivityDescriptor(sampleActivity({ templateRef: "  " })),
    ).toThrow(ActivityRegistryValidationError);
  });

  it("rejects invalid timeline scope", () => {
    expect(() =>
      validateActivityDescriptor(
        sampleActivity({
          timelineScopes: ["invalid.scope" as typeof TIMELINE_SCOPE_PERSONAL],
        }),
      ),
    ).toThrow(ActivityRegistryValidationError);
  });

  it("rejects invalid visibility", () => {
    expect(() =>
      validateActivityDescriptor(sampleActivity({ visibility: "secret" as "public" })),
    ).toThrow(ActivityRegistryValidationError);
  });
});

describe("DefaultActivityRegistry registration", () => {
  it("registers activity types and lists immutable snapshots", () => {
    const registry = createDefaultActivityRegistry();
    registry.register(sampleActivity());

    const listed = registry.list();
    expect(listed).toHaveLength(1);
    expect(listed[0]?.activityTypeId).toBe("capability.action.executed");
    expect(Object.isFrozen(listed)).toBe(true);
    expect(Object.isFrozen(listed[0]?.timelineScopes)).toBe(true);
  });

  it("supports all canonical activity categories", () => {
    const registry = createDefaultActivityRegistry();

    for (const category of CANONICAL_ACTIVITY_CATEGORIES) {
      const activityTypeId = `${category}.example.activity`;
      registry.register(
        sampleActivity({
          activityTypeId,
          category,
          sourceEventPattern: activityTypeId,
        }),
      );
      expect(registry.get(activityTypeId)?.category).toBe(category);
    }

    expect(registry.list()).toHaveLength(CANONICAL_ACTIVITY_CATEGORIES.length);
  });

  it("throws on duplicate registration", () => {
    const registry = createDefaultActivityRegistry();
    registry.register(sampleActivity());

    expect(() => registry.register(sampleActivity())).toThrow(
      ActivityRegistryDuplicateError,
    );
  });

  it("registerMany rejects batch duplicates", () => {
    const registry = createDefaultActivityRegistry();

    expect(() => registry.registerMany([sampleActivity(), sampleActivity()])).toThrow(
      ActivityRegistryDuplicateError,
    );
  });

  it("registerManyAtomic rejects invalid descriptors without registering", () => {
    const registry = createDefaultActivityRegistry();

    const result = registry.registerManyAtomic([
      sampleActivity(),
      sampleActivity({ activityTypeId: "invalid id" }),
    ]);

    expect(result.ok).toBe(false);
    expect(result.registeredCount).toBe(0);
    expect(result.errors[0]?.code).toBe("VALIDATION");
    expect(registry.list()).toHaveLength(0);
  });

  it("registerManyAtomic rejects duplicates without registering", () => {
    const registry = createDefaultActivityRegistry();
    registry.register(sampleActivity());

    const result = registry.registerManyAtomic([sampleActivity()]);

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
    expect(registry.list()).toHaveLength(1);
  });

  it("registerManyAtomic commits all descriptors on success", () => {
    const registry = createDefaultActivityRegistry();

    const result = registry.registerManyAtomic([
      sampleActivity(),
      sampleActivity({
        activityTypeId: "capability.theme.changed",
        sourceEventPattern: "capability.theme.changed",
        category: "user",
      }),
    ]);

    expect(result.ok).toBe(true);
    expect(result.registeredCount).toBe(2);
    expect(registry.list()).toHaveLength(2);
  });

  it("replace updates existing descriptor", () => {
    const registry = createDefaultActivityRegistry();
    registry.register(sampleActivity());

    registry.replace(sampleActivity({ label: "Updated label", version: "1.1.0" }));

    expect(registry.get("capability.action.executed")?.label).toBe("Updated label");
    expect(registry.get("capability.action.executed")?.version).toBe("1.1.0");
  });

  it("replace throws when activity type is missing", () => {
    const registry = createDefaultActivityRegistry();

    expect(() => registry.replace(sampleActivity())).toThrow(
      ActivityRegistryNotFoundError,
    );
  });

  it("get returns defensive frozen copies", () => {
    const registry = createDefaultActivityRegistry();
    registry.register(sampleActivity({ tags: ["audit"] }));

    const first = registry.get("capability.action.executed");
    const second = registry.get("capability.action.executed");

    expect(first).not.toBe(second);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first?.tags)).toBe(true);
  });
});

describe("DefaultActivityRegistry metadata", () => {
  it("projects metadata with defaults", () => {
    const registry = createDefaultActivityRegistry();
    registry.register(sampleActivity());

    const metadata = registry.getMetadata("capability.action.executed");

    expect(metadata?.visibility).toBe("public");
    expect(metadata?.stability).toBe("stable");
    expect(metadata?.status).toBe("active");
    expect(metadata?.source).toBe("builtin");
    expect(Object.isFrozen(metadata)).toBe(true);
  });

  it("returns registry metadata snapshot", () => {
    const registry = createDefaultActivityRegistry();
    registry.register(sampleActivity());
    registry.recordFrameworkVersion("0.0.0");
    registry.recordManifestCapabilities(["platform.actions"]);

    const metadata = registry.getRegistryMetadata();

    expect(metadata.activityMetadata).toHaveLength(1);
    expect(metadata.frameworkVersion).toBe("0.0.0");
    expect(metadata.manifestCapabilityCount).toBe(1);
  });
});

describe("DefaultActivityRegistry diagnostics", () => {
  it("reports empty registry status", () => {
    const registry = createDefaultActivityRegistry();

    expect(registry.getDiagnostics().status).toBe("empty");
  });

  it("reports ready status with category and scope counts", () => {
    const registry = createDefaultActivityRegistry();
    registry.register(sampleActivity());

    const diagnostics = registry.getDiagnostics();

    expect(diagnostics.status).toBe("ready");
    expect(diagnostics.registeredActivityTypeCount).toBe(1);
    expect(diagnostics.activeCount).toBe(1);
    expect(diagnostics.platformCount).toBe(1);
    expect(diagnostics.categoryCounts.capability).toBe(1);
    expect(diagnostics.scopeCounts[TIMELINE_SCOPE_PERSONAL]).toBe(1);
  });

  it("reports manifest and platform catalogue metadata", () => {
    const registry = createDefaultActivityRegistry();
    registry.register(
      sampleActivity({ activityTypeId: "manifest.activity", source: "manifest" }),
    );
    registry.register(sampleActivity());
    registry.recordPlatformCatalogue("2026.07");
    registry.recordManifestCapabilities(["cap.actions"]);

    expect(registry.has("capability.action.executed")).toBe(true);
    expect(registry.has("manifest.activity")).toBe(true);
    expect(registry.listMetadata()).toHaveLength(2);
    expect(registry.getDiagnostics().manifestCount).toBe(1);
    expect(registry.getDiagnostics().platformCount).toBe(1);
    expect(registry.getDiagnostics().platformCatalogueVersion).toBe("2026.07");
  });

  it("clear resets registry and diagnostics", () => {
    const registry = createDefaultActivityRegistry();
    registry.register(sampleActivity());
    registry.clear();

    expect(registry.list()).toHaveLength(0);
    expect(registry.getDiagnostics().status).toBe("empty");
  });
});
