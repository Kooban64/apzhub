import { describe, expect, it } from "vitest";

import {
  createAllowAllWorkbenchPermissionAdapter,
  createAuthWorkbenchPermissionAdapter,
} from "@apzhub/workbench-framework";

import { bootstrapEventRegistry } from "../catalogue/bootstrap-event-registry";
import { createDefaultEventRegistry } from "../event/default-event-registry";
import type { EventDescriptorDto, EventRegistryDto } from "./map-event-registry-dto";
import { filterEventRegistryDto } from "./filter-event-registry-dto";
import { EVENT_REGISTRY_DTO_SCHEMA_VERSION } from "./event-registry-dto-schema-version";
import {
  buildEventRegistryHydrationDiagnostics,
  createEmptyEventRegistryHydrationDiagnostics,
} from "./event-registry-hydration-diagnostics";
import {
  createEmptyEventRegistryDto,
  mapEventRegistryDto,
} from "./map-event-registry-dto";
import { validateEventRegistryDto } from "./validate-event-registry-dto";

const PLATFORM_EVENT_COUNT = 4;

function eventDto(
  overrides: Partial<EventDescriptorDto> & Pick<EventDescriptorDto, "eventId">,
): EventDescriptorDto {
  return {
    category: "capability",
    version: "1.0.0",
    sourceCapability: "command-framework",
    schemaVersion: "1.0.0",
    visibility: "public",
    stability: "stable",
    tags: [],
    status: "active",
    subscribers: [],
    source: "manifest",
    ...overrides,
  };
}

function sampleDto(overrides: Partial<EventRegistryDto> = {}): EventRegistryDto {
  return {
    schemaVersion: EVENT_REGISTRY_DTO_SCHEMA_VERSION,
    frameworkVersion: "3.0.0",
    events: [
      eventDto({
        eventId: "capability.action.executed",
        label: "Action Executed",
        source: "builtin",
        sourceCapability: "command-framework",
      }),
      eventDto({
        eventId: "capability.example.created",
        label: "Example Created",
        permission: "example.write",
        sourceCapability: "example-capability",
      }),
    ],
    ...overrides,
  };
}

describe("mapEventRegistryDto", () => {
  it("maps bootstrapped registry with schema and framework versions", () => {
    const bootstrap = bootstrapEventRegistry();
    const dto = mapEventRegistryDto(bootstrap.registry);

    expect(dto.schemaVersion).toBe(EVENT_REGISTRY_DTO_SCHEMA_VERSION);
    expect(dto.frameworkVersion).toBe("3.0.0");
    expect(dto.events.length).toBeGreaterThan(0);
    expect(
      dto.events.every(
        (entry) => entry.source === "builtin" || entry.source === "manifest",
      ),
    ).toBe(true);
  });

  it("returns empty events for empty registry", () => {
    const dto = mapEventRegistryDto(createDefaultEventRegistry());

    expect(dto).toEqual(createEmptyEventRegistryDto());
  });

  it("sorts events by eventId", () => {
    const bootstrap = bootstrapEventRegistry();
    const dto = mapEventRegistryDto(bootstrap.registry);
    const ids = dto.events.map((entry) => entry.eventId);

    expect(ids).toEqual([...ids].sort());
  });
});

describe("validateEventRegistryDto", () => {
  it("accepts a valid DTO payload", () => {
    const result = validateEventRegistryDto(sampleDto());

    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.dto.events).toHaveLength(2);
    expect(result.dto.schemaVersion).toBe(EVENT_REGISTRY_DTO_SCHEMA_VERSION);
    expect(result.dto.frameworkVersion).toBe("3.0.0");
  });

  it("rejects non-object payloads", () => {
    const result = validateEventRegistryDto(null);

    expect(result.ok).toBe(false);
    expect(result.dto).toEqual(createEmptyEventRegistryDto());
    expect(result.errors[0]?.code).toBe("VALIDATION");
  });

  it("rejects unsupported schemaVersion", () => {
    const result = validateEventRegistryDto({
      schemaVersion: 99,
      events: [],
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.field).toBe("schemaVersion");
  });

  it("rejects invalid event descriptors", () => {
    const result = validateEventRegistryDto(
      sampleDto({
        events: [
          eventDto({
            eventId: "Invalid_ID",
          }),
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("VALIDATION");
  });

  it("rejects duplicate event ids", () => {
    const entry = eventDto({ eventId: "capability.action.executed" });
    const result = validateEventRegistryDto(
      sampleDto({
        events: [entry, entry],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
  });

  it("rejects empty frameworkVersion when provided", () => {
    const result = validateEventRegistryDto({
      schemaVersion: EVENT_REGISTRY_DTO_SCHEMA_VERSION,
      frameworkVersion: "   ",
      events: [],
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.field).toBe("frameworkVersion");
  });
});

describe("filterEventRegistryDto", () => {
  it("passes all events with allow-all adapter", () => {
    const dto = sampleDto();
    const filtered = filterEventRegistryDto(
      dto,
      createAllowAllWorkbenchPermissionAdapter(),
    );

    expect(filtered.events).toHaveLength(2);
    expect(filtered.schemaVersion).toBe(EVENT_REGISTRY_DTO_SCHEMA_VERSION);
    expect(filtered.frameworkVersion).toBe("3.0.0");
  });

  it("returns empty events for empty input", () => {
    const filtered = filterEventRegistryDto(
      createEmptyEventRegistryDto(),
      createAuthWorkbenchPermissionAdapter({ userId: "user-1", permissions: [] }),
    );

    expect(filtered.events).toEqual([]);
  });

  it("removes permission-gated events when user lacks permission", () => {
    const filtered = filterEventRegistryDto(
      sampleDto(),
      createAuthWorkbenchPermissionAdapter({ userId: "user-1", permissions: [] }),
    );

    expect(filtered.events.map((entry) => entry.eventId)).toEqual([
      "capability.action.executed",
    ]);
  });

  it("delegates filtering to permissionAdapter.filter without evaluating permissions inline", () => {
    let filterInvoked = false;
    const adapter = {
      getContext: () => null,
      can: () => true,
      filter: <T extends { permission?: string }>(items: readonly T[]) => {
        filterInvoked = true;
        return items.filter((item) => item.permission !== "example.write");
      },
    };

    const filtered = filterEventRegistryDto(sampleDto(), adapter);

    expect(filterInvoked).toBe(true);
    expect(filtered.events.map((entry) => entry.eventId)).toEqual([
      "capability.action.executed",
    ]);
  });
});

describe("buildEventRegistryHydrationDiagnostics", () => {
  it("reports registered and filtered counts after permission filter", () => {
    const bootstrap = bootstrapEventRegistry({
      capabilityRecords: [
        {
          id: "example-cap",
          kind: "module",
          lifecycleState: "active",
          manifest: {
            events: [
              {
                id: "capability.example.created",
                version: "1.0.0",
                category: "capability",
                publisher: "example-capability",
                permission: "example.write",
                payload: { exampleId: "string" },
              },
            ],
          },
        },
      ],
    });

    const dto = mapEventRegistryDto(bootstrap.registry);
    const filtered = filterEventRegistryDto(
      dto,
      createAuthWorkbenchPermissionAdapter({ userId: "user-1", permissions: [] }),
    );
    const diagnostics = buildEventRegistryHydrationDiagnostics(
      bootstrap.registry,
      filtered,
    );

    expect(diagnostics.registeredCount).toBe(PLATFORM_EVENT_COUNT + 1);
    expect(diagnostics.filteredCount).toBe(PLATFORM_EVENT_COUNT);
    expect(diagnostics.platformEventCount).toBe(PLATFORM_EVENT_COUNT);
    expect(diagnostics.capabilityEventCount).toBe(1);
    expect(diagnostics.filteredCapabilityEventCount).toBe(0);
    expect(diagnostics.manifestCapabilityCount).toBe(1);
  });

  it("returns zeroed diagnostics for empty registry", () => {
    expect(createEmptyEventRegistryHydrationDiagnostics()).toEqual({
      registeredCount: 0,
      filteredCount: 0,
      platformEventCount: 0,
      capabilityEventCount: 0,
      filteredPlatformEventCount: 0,
      filteredCapabilityEventCount: 0,
      platformEventIds: [],
      capabilityEventIds: [],
      manifestCapabilityCount: 0,
      manifestCapabilities: [],
    });
  });
});

describe("EventRegistryDto versioning", () => {
  it("includes schemaVersion and frameworkVersion from day one", () => {
    const bootstrap = bootstrapEventRegistry();
    const dto = mapEventRegistryDto(bootstrap.registry);

    expect(dto.schemaVersion).toBe(1);
    expect(typeof dto.frameworkVersion).toBe("string");
    expect(dto.frameworkVersion).toBeTruthy();
  });
});
