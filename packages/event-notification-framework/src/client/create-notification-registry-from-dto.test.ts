import { describe, expect, it } from "vitest";

import { PLATFORM_NOTIFICATION_CATALOGUE } from "../catalogue/platform-notification-catalogue";
import { NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION } from "../server/notification-registry-dto-schema-version";
import { createEmptyNotificationRegistryDto } from "../server/map-notification-registry-dto";
import { createNotificationRegistryFromDto } from "./create-notification-registry-from-dto";
import { sampleNotificationRegistryDto } from "./test-fixtures";

describe("createNotificationRegistryFromDto", () => {
  it("hydrates a read-only registry from a valid dto", () => {
    const result = createNotificationRegistryFromDto(sampleNotificationRegistryDto());

    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.registry.list()).toHaveLength(PLATFORM_NOTIFICATION_CATALOGUE.length);
    expect(result.diagnostics.status).toBe("hydrated");
    expect(result.diagnostics.source).toBe("server-dto");
    expect(result.diagnostics.synchronisation.mode).toBe("hydration");
    expect(result.registry.has("platform.toast.default")).toBe(true);
    expect(result.registry.get("platform.inbox.system")?.notificationKind).toBe(
      "inbox",
    );
  });

  it("returns invalid registry for malformed dto", () => {
    const result = createNotificationRegistryFromDto({
      schemaVersion: 99,
      routes: [],
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.status).toBe("invalid");
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.registry.list()).toEqual([]);
  });

  it("handles empty dto", () => {
    const result = createNotificationRegistryFromDto(
      createEmptyNotificationRegistryDto(),
    );

    expect(result.ok).toBe(true);
    expect(result.registry.list()).toEqual([]);
    expect(result.diagnostics.status).toBe("empty");
  });

  it("freezes hydrated routes", () => {
    const result = createNotificationRegistryFromDto(sampleNotificationRegistryDto());
    const route = result.registry.get("platform.toast.default");

    expect(route).toBeDefined();
    expect(Object.isFrozen(route)).toBe(true);
    expect(Object.isFrozen(route?.tags)).toBe(true);
  });

  it("does not expose registration APIs on client registry", () => {
    const result = createNotificationRegistryFromDto(sampleNotificationRegistryDto());
    const registry = result.registry as unknown as Record<string, unknown>;

    expect(registry.register).toBeUndefined();
    expect(registry.registerMany).toBeUndefined();
    expect(registry.clear).toBeUndefined();
  });

  it("reports schemaVersion in diagnostics", () => {
    const result = createNotificationRegistryFromDto(sampleNotificationRegistryDto());

    expect(result.diagnostics.schemaVersion).toBe(
      NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION,
    );
    expect(result.dto.frameworkVersion).toBe("3.0.0");
  });
});
