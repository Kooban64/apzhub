import { describe, expect, it } from "vitest";

import {
  createAllowAllWorkbenchPermissionAdapter,
  createAuthWorkbenchPermissionAdapter,
} from "@apzhub/workbench-framework";

import { bootstrapActivityRegistry } from "../../bootstrap/bootstrap-activity-registry";
import { bootstrapTimelineRegistry } from "../../bootstrap/bootstrap-timeline-registry";
import { PLATFORM_ACTIVITY_CATALOGUE } from "../../catalogue/platform-activity-catalogue";
import { createDefaultActivityRegistry } from "../../registry/default-activity-registry";
import {
  buildActivityRegistryHydrationDiagnostics,
  createEmptyActivityRegistryHydrationDiagnostics,
} from "../activity-registry-hydration-diagnostics";
import {
  buildTimelineRegistryHydrationDiagnostics,
  createEmptyTimelineRegistryHydrationDiagnostics,
} from "../timeline-registry-hydration-diagnostics";
import { ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION } from "./activity-registry-dto-schema-version";
import { TIMELINE_REGISTRY_DTO_SCHEMA_VERSION } from "./timeline-registry-dto-schema-version";
import { filterActivityRegistryDto } from "./filter-activity-registry-dto";
import { filterTimelineRegistryDto } from "./filter-timeline-registry-dto";
import {
  createEmptyActivityRegistryDto,
  mapActivityRegistryDto,
  type ActivityRegistryDto,
  type ActivityTypeDescriptorDto,
} from "./map-activity-registry-dto";
import {
  mapTimelineRegistryDto,
  type TimelineDescriptorDto,
  type TimelineRegistryDto,
} from "./map-timeline-registry-dto";
import { validateActivityRegistryDto } from "./validate-activity-registry-dto";
import { validateTimelineRegistryDto } from "./validate-timeline-registry-dto";
import { TIMELINE_SCOPE_PERSONAL } from "../../types/timeline-scope";

const PLATFORM_ACTIVITY_COUNT = PLATFORM_ACTIVITY_CATALOGUE.length;
const PLATFORM_TIMELINE_COUNT = 4;

function activityTypeDto(
  overrides: Partial<ActivityTypeDescriptorDto> &
    Pick<ActivityTypeDescriptorDto, "activityTypeId">,
): ActivityTypeDescriptorDto {
  return {
    sourceEventPattern: "capability.example.created",
    category: "capability",
    timelineScopes: [TIMELINE_SCOPE_PERSONAL],
    templateRef: "example-created",
    version: "1.0.0",
    schemaVersion: "1.0.0",
    visibility: "public",
    stability: "stable",
    status: "active",
    source: "manifest",
    tags: [],
    ...overrides,
  };
}

function sampleActivityDto(
  overrides: Partial<ActivityRegistryDto> = {},
): ActivityRegistryDto {
  return {
    schemaVersion: ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION,
    frameworkVersion: "1.0.0",
    types: [
      activityTypeDto({
        activityTypeId: "platform.action.executed",
        sourceEventPattern: "capability.action.executed",
        source: "builtin",
      }),
      activityTypeDto({
        activityTypeId: "capability.example.created",
        permissionKeys: ["example.write"],
      }),
    ],
    ...overrides,
  };
}

function timelineDto(
  overrides: Partial<TimelineDescriptorDto> & Pick<TimelineDescriptorDto, "timelineId">,
): TimelineDescriptorDto {
  return {
    scope: TIMELINE_SCOPE_PERSONAL,
    label: "Example timeline",
    grouping: "flat",
    version: "1.0.0",
    status: "active",
    source: "manifest",
    visibility: "public",
    stability: "stable",
    ...overrides,
  };
}

function sampleTimelineRegistryDto(
  overrides: Partial<TimelineRegistryDto> = {},
): TimelineRegistryDto {
  return {
    schemaVersion: TIMELINE_REGISTRY_DTO_SCHEMA_VERSION,
    frameworkVersion: "1.0.0",
    timelines: [
      timelineDto({
        timelineId: TIMELINE_SCOPE_PERSONAL,
        source: "builtin",
      }),
      timelineDto({
        timelineId: "team.support",
        permissionKeys: ["platform.team.support.read"],
      }),
    ],
    ...overrides,
  };
}

describe("mapActivityRegistryDto", () => {
  it("maps bootstrapped registry with schema and framework versions", () => {
    const bootstrap = bootstrapActivityRegistry();
    const dto = mapActivityRegistryDto(bootstrap.registry);

    expect(dto.schemaVersion).toBe(ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION);
    expect(dto.frameworkVersion).toBe("1.0.0");
    expect(dto.types.length).toBe(PLATFORM_ACTIVITY_COUNT);
    expect(dto.types.every((entry) => entry.source === "builtin")).toBe(true);
  });

  it("returns empty types for empty registry", () => {
    expect(mapActivityRegistryDto(createDefaultActivityRegistry())).toEqual(
      createEmptyActivityRegistryDto(),
    );
  });

  it("sorts types by activityTypeId", () => {
    const bootstrap = bootstrapActivityRegistry();
    const ids = mapActivityRegistryDto(bootstrap.registry).types.map(
      (entry) => entry.activityTypeId,
    );

    expect(ids).toEqual([...ids].sort());
  });
});

describe("validateActivityRegistryDto", () => {
  it("accepts a valid DTO payload", () => {
    const result = validateActivityRegistryDto(sampleActivityDto());

    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.dto.types).toHaveLength(2);
    expect(result.dto.schemaVersion).toBe(ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION);
  });

  it("rejects non-object payloads", () => {
    const result = validateActivityRegistryDto(null);

    expect(result.ok).toBe(false);
    expect(result.dto).toEqual(createEmptyActivityRegistryDto());
    expect(result.errors[0]?.code).toBe("VALIDATION");
  });

  it("rejects unsupported schemaVersion", () => {
    const result = validateActivityRegistryDto({
      schemaVersion: 99,
      types: [],
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.field).toBe("schemaVersion");
  });

  it("rejects invalid activity type descriptors", () => {
    const result = validateActivityRegistryDto(
      sampleActivityDto({
        types: [activityTypeDto({ activityTypeId: "Invalid_ID" })],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("VALIDATION");
  });

  it("rejects duplicate activity type ids", () => {
    const entry = activityTypeDto({ activityTypeId: "capability.example.created" });
    const result = validateActivityRegistryDto(
      sampleActivityDto({
        types: [entry, entry],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
  });
});

describe("filterActivityRegistryDto", () => {
  it("passes all types with allow-all adapter", () => {
    const filtered = filterActivityRegistryDto(
      sampleActivityDto(),
      createAllowAllWorkbenchPermissionAdapter(),
    );

    expect(filtered.types).toHaveLength(2);
    expect(filtered.schemaVersion).toBe(ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION);
  });

  it("removes permission-gated types when user lacks permission", () => {
    const filtered = filterActivityRegistryDto(
      sampleActivityDto(),
      createAuthWorkbenchPermissionAdapter({ userId: "user-1", permissions: [] }),
    );

    expect(filtered.types.map((entry) => entry.activityTypeId)).toEqual([
      "platform.action.executed",
    ]);
  });

  it("delegates permission evaluation to WorkbenchPermissionAdapter.can", () => {
    let canInvoked = false;
    const adapter = {
      getContext: () => null,
      can: (permission?: string) => {
        canInvoked = true;
        return permission !== "example.write";
      },
      filter: <T extends { permission?: string }>(items: readonly T[]) => [...items],
    };

    const filtered = filterActivityRegistryDto(sampleActivityDto(), adapter);

    expect(canInvoked).toBe(true);
    expect(filtered.types.map((entry) => entry.activityTypeId)).toEqual([
      "platform.action.executed",
    ]);
  });
});

describe("mapTimelineRegistryDto", () => {
  it("maps bootstrapped registry with schema and framework versions", () => {
    const bootstrap = bootstrapTimelineRegistry();
    const dto = mapTimelineRegistryDto(bootstrap.registry);

    expect(dto.schemaVersion).toBe(TIMELINE_REGISTRY_DTO_SCHEMA_VERSION);
    expect(dto.frameworkVersion).toBe("1.0.0");
    expect(dto.timelines.length).toBe(PLATFORM_TIMELINE_COUNT);
  });
});

describe("validateTimelineRegistryDto", () => {
  it("accepts a valid DTO payload", () => {
    const result = validateTimelineRegistryDto(sampleTimelineRegistryDto());

    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.dto.timelines).toHaveLength(2);
  });

  it("rejects invalid timeline descriptors", () => {
    const result = validateTimelineRegistryDto(
      sampleTimelineRegistryDto({
        timelines: [timelineDto({ timelineId: "Invalid_ID" })],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("VALIDATION");
  });
});

describe("filterTimelineRegistryDto", () => {
  it("removes permission-gated timelines when user lacks permission", () => {
    const filtered = filterTimelineRegistryDto(
      sampleTimelineRegistryDto(),
      createAuthWorkbenchPermissionAdapter({ userId: "user-1", permissions: [] }),
    );

    expect(filtered.timelines.map((entry) => entry.timelineId)).toEqual([
      TIMELINE_SCOPE_PERSONAL,
    ]);
  });
});

describe("buildActivityRegistryHydrationDiagnostics", () => {
  it("reports registered and filtered counts after permission filter", () => {
    const bootstrap = bootstrapActivityRegistry({
      capabilityRecords: [
        {
          id: "example-cap",
          kind: "module",
          lifecycleState: "active",
          manifest: {
            activities: {
              types: [
                {
                  id: "capability.example.created",
                  eventPattern: "capability.example.created",
                  category: "capability",
                  timelineScopes: ["personal"],
                  templateRef: "example-created",
                  version: "1.0.0",
                  permissionKeys: ["example.write"],
                },
              ],
            },
          },
        },
      ],
    });

    const dto = mapActivityRegistryDto(bootstrap.registry);
    const filtered = filterActivityRegistryDto(
      dto,
      createAuthWorkbenchPermissionAdapter({ userId: "user-1", permissions: [] }),
    );
    const diagnostics = buildActivityRegistryHydrationDiagnostics(
      bootstrap.registry,
      filtered,
    );

    expect(diagnostics.registeredCount).toBe(PLATFORM_ACTIVITY_COUNT + 1);
    expect(diagnostics.filteredCount).toBe(PLATFORM_ACTIVITY_COUNT);
    expect(diagnostics.builtinCount).toBe(PLATFORM_ACTIVITY_COUNT);
    expect(diagnostics.manifestCount).toBe(1);
    expect(diagnostics.filteredManifestCount).toBe(0);
    expect(diagnostics.schemaVersion).toBe(ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION);
    expect(diagnostics.frameworkVersion).toBe("1.0.0");
  });

  it("returns zeroed diagnostics for empty registry", () => {
    expect(createEmptyActivityRegistryHydrationDiagnostics()).toEqual({
      registeredCount: 0,
      filteredCount: 0,
      builtinCount: 0,
      manifestCount: 0,
      filteredBuiltinCount: 0,
      filteredManifestCount: 0,
      schemaVersion: ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION,
      manifestCapabilityCount: 0,
      manifestCapabilities: [],
    });
  });
});

describe("buildTimelineRegistryHydrationDiagnostics", () => {
  it("reports registered and filtered counts after permission filter", () => {
    const bootstrap = bootstrapTimelineRegistry({
      capabilityRecords: [
        {
          id: "example-cap",
          kind: "module",
          lifecycleState: "active",
          manifest: {
            activities: {
              timelines: [
                {
                  id: "team.support",
                  scope: "team",
                  label: "Support queue",
                  version: "1.0.0",
                  grouping: "by-actor",
                  permissionKeys: ["platform.team.support.read"],
                },
              ],
            },
          },
        },
      ],
    });

    const dto = mapTimelineRegistryDto(bootstrap.registry);
    const filtered = filterTimelineRegistryDto(
      dto,
      createAuthWorkbenchPermissionAdapter({ userId: "user-1", permissions: [] }),
    );
    const diagnostics = buildTimelineRegistryHydrationDiagnostics(
      bootstrap.registry,
      filtered,
    );

    expect(diagnostics.registeredCount).toBe(PLATFORM_TIMELINE_COUNT + 1);
    expect(diagnostics.filteredCount).toBe(PLATFORM_TIMELINE_COUNT);
    expect(diagnostics.schemaVersion).toBe(TIMELINE_REGISTRY_DTO_SCHEMA_VERSION);
  });

  it("returns zeroed diagnostics for empty registry", () => {
    expect(createEmptyTimelineRegistryHydrationDiagnostics()).toEqual({
      registeredCount: 0,
      filteredCount: 0,
      builtinCount: 0,
      manifestCount: 0,
      filteredBuiltinCount: 0,
      filteredManifestCount: 0,
      schemaVersion: TIMELINE_REGISTRY_DTO_SCHEMA_VERSION,
      manifestCapabilityCount: 0,
      manifestCapabilities: [],
    });
  });
});

describe("registry DTO versioning", () => {
  it("includes schemaVersion and frameworkVersion from day one", () => {
    const activityDto = mapActivityRegistryDto(bootstrapActivityRegistry().registry);
    const timelineDto = mapTimelineRegistryDto(bootstrapTimelineRegistry().registry);

    expect(activityDto.schemaVersion).toBe(1);
    expect(timelineDto.schemaVersion).toBe(1);
    expect(typeof activityDto.frameworkVersion).toBe("string");
    expect(typeof timelineDto.frameworkVersion).toBe("string");
  });
});
