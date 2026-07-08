import { describe, expect, it } from "vitest";

import {
  createAllowAllWorkbenchPermissionAdapter,
  createAuthWorkbenchPermissionAdapter,
} from "@apzhub/workbench-framework";

import { bootstrapNotificationRegistry } from "../catalogue/bootstrap-notification-registry";
import { PLATFORM_NOTIFICATION_CATALOGUE } from "../catalogue/platform-notification-catalogue";
import { createDefaultNotificationRegistry } from "../notification/default-notification-registry";
import { filterNotificationRegistryDto } from "./filter-notification-registry-dto";
import { NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION } from "./notification-registry-dto-schema-version";
import {
  buildNotificationRegistryHydrationDiagnostics,
  createEmptyNotificationRegistryHydrationDiagnostics,
} from "./notification-registry-hydration-diagnostics";
import {
  createEmptyNotificationRegistryDto,
  mapNotificationRegistryDto,
  type NotificationRegistryDto,
  type NotificationRouteDescriptorDto,
} from "./map-notification-registry-dto";
import { validateNotificationRegistryDto } from "./validate-notification-registry-dto";

const PLATFORM_ROUTE_COUNT = PLATFORM_NOTIFICATION_CATALOGUE.length;

function routeDto(
  overrides: Partial<NotificationRouteDescriptorDto> &
    Pick<NotificationRouteDescriptorDto, "routeId">,
): NotificationRouteDescriptorDto {
  return {
    eventPattern: "capability.action.executed",
    notificationKind: "inbox",
    channel: "in-app",
    templateRef: "action-inbox",
    version: "1.0.0",
    schemaVersion: "1.0.0",
    visibility: "public",
    stability: "stable",
    tags: [],
    status: "active",
    source: "manifest",
    ...overrides,
  };
}

function sampleDto(
  overrides: Partial<NotificationRegistryDto> = {},
): NotificationRegistryDto {
  return {
    schemaVersion: NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION,
    frameworkVersion: "3.0.0",
    routes: [
      routeDto({
        routeId: "platform.action.executed.inbox",
        label: "Action Inbox",
        source: "builtin",
        sourceCapability: "platform-runtime",
      }),
      routeDto({
        routeId: "capability.example.inbox",
        label: "Example Inbox",
        permission: "example.write",
        sourceCapability: "example-capability",
      }),
    ],
    ...overrides,
  };
}

describe("mapNotificationRegistryDto", () => {
  it("maps bootstrapped registry with schema and framework versions", () => {
    const bootstrap = bootstrapNotificationRegistry();
    const dto = mapNotificationRegistryDto(bootstrap.registry);

    expect(dto.schemaVersion).toBe(NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION);
    expect(dto.frameworkVersion).toBe("3.0.0");
    expect(dto.routes.length).toBe(PLATFORM_ROUTE_COUNT);
    expect(
      dto.routes.every(
        (entry) => entry.source === "builtin" || entry.source === "manifest",
      ),
    ).toBe(true);
  });

  it("returns empty routes for empty registry", () => {
    const dto = mapNotificationRegistryDto(createDefaultNotificationRegistry());

    expect(dto).toEqual(createEmptyNotificationRegistryDto());
  });

  it("sorts routes by routeId", () => {
    const bootstrap = bootstrapNotificationRegistry();
    const dto = mapNotificationRegistryDto(bootstrap.registry);
    const ids = dto.routes.map((entry) => entry.routeId);

    expect(ids).toEqual([...ids].sort());
  });
});

describe("validateNotificationRegistryDto", () => {
  it("accepts a valid DTO payload", () => {
    const result = validateNotificationRegistryDto(sampleDto());

    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.dto.routes).toHaveLength(2);
    expect(result.dto.schemaVersion).toBe(NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION);
    expect(result.dto.frameworkVersion).toBe("3.0.0");
  });

  it("rejects non-object payloads", () => {
    const result = validateNotificationRegistryDto(null);

    expect(result.ok).toBe(false);
    expect(result.dto).toEqual(createEmptyNotificationRegistryDto());
    expect(result.errors[0]?.code).toBe("VALIDATION");
  });

  it("rejects unsupported schemaVersion", () => {
    const result = validateNotificationRegistryDto({
      schemaVersion: 99,
      routes: [],
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.field).toBe("schemaVersion");
  });

  it("rejects invalid route descriptors", () => {
    const result = validateNotificationRegistryDto(
      sampleDto({
        routes: [
          routeDto({
            routeId: "Invalid_ID",
          }),
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("VALIDATION");
  });

  it("rejects duplicate route ids", () => {
    const entry = routeDto({ routeId: "platform.action.executed.inbox" });
    const result = validateNotificationRegistryDto(
      sampleDto({
        routes: [entry, entry],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
  });
});

describe("filterNotificationRegistryDto", () => {
  it("passes all routes with allow-all adapter", () => {
    const dto = sampleDto();
    const filtered = filterNotificationRegistryDto(
      dto,
      createAllowAllWorkbenchPermissionAdapter(),
    );

    expect(filtered.routes).toHaveLength(2);
    expect(filtered.schemaVersion).toBe(NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION);
    expect(filtered.frameworkVersion).toBe("3.0.0");
  });

  it("returns empty routes for empty input", () => {
    const filtered = filterNotificationRegistryDto(
      createEmptyNotificationRegistryDto(),
      createAuthWorkbenchPermissionAdapter({ userId: "user-1", permissions: [] }),
    );

    expect(filtered.routes).toEqual([]);
  });

  it("removes permission-gated routes when user lacks permission", () => {
    const filtered = filterNotificationRegistryDto(
      sampleDto(),
      createAuthWorkbenchPermissionAdapter({ userId: "user-1", permissions: [] }),
    );

    expect(filtered.routes.map((entry) => entry.routeId)).toEqual([
      "platform.action.executed.inbox",
    ]);
  });
});

describe("buildNotificationRegistryHydrationDiagnostics", () => {
  it("reports registered and filtered counts after permission filter", () => {
    const bootstrap = bootstrapNotificationRegistry({
      capabilityRecords: [
        {
          id: "example-cap",
          kind: "module",
          lifecycleState: "active",
          manifest: {
            notifications: {
              routes: [
                {
                  id: "capability.example.inbox",
                  eventPattern: "capability.example.created",
                  notificationKind: "inbox",
                  channel: "in-app",
                  templateRef: "example-inbox",
                  version: "1.0.0",
                  permission: "example.write",
                },
              ],
            },
          },
        },
      ],
    });

    const dto = mapNotificationRegistryDto(bootstrap.registry);
    const filtered = filterNotificationRegistryDto(
      dto,
      createAuthWorkbenchPermissionAdapter({ userId: "user-1", permissions: [] }),
    );
    const diagnostics = buildNotificationRegistryHydrationDiagnostics(
      bootstrap.registry,
      filtered,
    );

    expect(diagnostics.registeredCount).toBe(PLATFORM_ROUTE_COUNT + 1);
    expect(diagnostics.filteredCount).toBe(PLATFORM_ROUTE_COUNT);
    expect(diagnostics.platformRouteCount).toBe(PLATFORM_ROUTE_COUNT);
    expect(diagnostics.capabilityRouteCount).toBe(1);
    expect(diagnostics.filteredCapabilityRouteCount).toBe(0);
    expect(diagnostics.manifestCapabilityCount).toBe(1);
  });

  it("returns zeroed diagnostics for empty registry", () => {
    expect(createEmptyNotificationRegistryHydrationDiagnostics()).toEqual({
      registeredCount: 0,
      filteredCount: 0,
      platformRouteCount: 0,
      capabilityRouteCount: 0,
      filteredPlatformRouteCount: 0,
      filteredCapabilityRouteCount: 0,
      platformRouteIds: [],
      capabilityRouteIds: [],
      manifestCapabilityCount: 0,
      manifestCapabilities: [],
    });
  });
});

describe("NotificationRegistryDto versioning", () => {
  it("includes schemaVersion and frameworkVersion from day one", () => {
    const bootstrap = bootstrapNotificationRegistry();
    const dto = mapNotificationRegistryDto(bootstrap.registry);

    expect(dto.schemaVersion).toBe(1);
    expect(typeof dto.frameworkVersion).toBe("string");
    expect(dto.frameworkVersion).toBeTruthy();
  });
});
