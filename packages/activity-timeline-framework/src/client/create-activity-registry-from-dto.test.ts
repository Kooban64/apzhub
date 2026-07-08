import { describe, expect, it } from "vitest";

import { ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION } from "../server/filter/activity-registry-dto-schema-version";
import { createEmptyActivityRegistryDto } from "../server/filter/map-activity-registry-dto";
import { createActivityRegistryFromDto } from "./create-activity-registry-from-dto";
import { sampleActivityRegistryDto } from "./test-fixtures";

describe("createActivityRegistryFromDto", () => {
  it("hydrates a read-only registry from a valid dto", () => {
    const result = createActivityRegistryFromDto(sampleActivityRegistryDto());

    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.registry.list()).toHaveLength(2);
    expect(result.diagnostics.status).toBe("hydrated");
    expect(result.diagnostics.source).toBe("server-dto");
    expect(result.diagnostics.synchronisation.mode).toBe("hydration");
    expect(result.registry.has("platform.action.executed")).toBe(true);
    expect(result.registry.get("capability.example.created")?.label).toBe(
      "Example created",
    );
  });

  it("returns invalid registry for malformed dto", () => {
    const result = createActivityRegistryFromDto({
      schemaVersion: 99,
      types: [],
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.status).toBe("invalid");
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.registry.list()).toEqual([]);
  });

  it("handles empty dto", () => {
    const result = createActivityRegistryFromDto(createEmptyActivityRegistryDto());

    expect(result.ok).toBe(true);
    expect(result.registry.list()).toEqual([]);
    expect(result.diagnostics.status).toBe("empty");
  });

  it("freezes hydrated activity types", () => {
    const result = createActivityRegistryFromDto(sampleActivityRegistryDto());
    const type = result.registry.get("platform.action.executed");

    expect(type).toBeDefined();
    expect(Object.isFrozen(type)).toBe(true);
    expect(Object.isFrozen(type?.tags)).toBe(true);
    expect(Object.isFrozen(type?.timelineScopes)).toBe(true);
  });

  it("does not expose registration APIs on client registry", () => {
    const result = createActivityRegistryFromDto(sampleActivityRegistryDto());
    const registry = result.registry as unknown as Record<string, unknown>;

    expect(registry.register).toBeUndefined();
    expect(registry.registerMany).toBeUndefined();
    expect(registry.clear).toBeUndefined();
  });

  it("reports schemaVersion in diagnostics", () => {
    const result = createActivityRegistryFromDto(sampleActivityRegistryDto());

    expect(result.diagnostics.schemaVersion).toBe(ACTIVITY_REGISTRY_DTO_SCHEMA_VERSION);
    expect(result.dto.frameworkVersion).toBe("1.0.0");
    expect(result.diagnostics.typeCount).toBe(2);
    expect(result.diagnostics.platformTypeCount).toBe(1);
    expect(result.diagnostics.capabilityTypeCount).toBe(1);
  });
});
