import { describe, expect, it } from "vitest";

import { TIMELINE_REGISTRY_DTO_SCHEMA_VERSION } from "../server/filter/timeline-registry-dto-schema-version";
import { createEmptyTimelineRegistryDto } from "../server/filter/map-timeline-registry-dto";
import { TIMELINE_SCOPE_PERSONAL } from "../types/timeline-scope";
import { createTimelineRegistryFromDto } from "./create-timeline-registry-from-dto";
import { sampleTimelineRegistryDto } from "./test-fixtures";

describe("createTimelineRegistryFromDto", () => {
  it("hydrates a read-only registry from a valid dto", () => {
    const result = createTimelineRegistryFromDto(sampleTimelineRegistryDto());

    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.registry.list()).toHaveLength(2);
    expect(result.diagnostics.status).toBe("hydrated");
    expect(result.registry.has(TIMELINE_SCOPE_PERSONAL)).toBe(true);
    expect(result.registry.listByScope(TIMELINE_SCOPE_PERSONAL)).toHaveLength(1);
  });

  it("returns invalid registry for malformed dto", () => {
    const result = createTimelineRegistryFromDto({
      schemaVersion: 99,
      timelines: [],
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.status).toBe("invalid");
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("handles empty dto", () => {
    const result = createTimelineRegistryFromDto(createEmptyTimelineRegistryDto());

    expect(result.ok).toBe(true);
    expect(result.registry.list()).toEqual([]);
    expect(result.diagnostics.status).toBe("empty");
  });

  it("freezes hydrated timeline definitions", () => {
    const result = createTimelineRegistryFromDto(sampleTimelineRegistryDto());
    const timeline = result.registry.get(TIMELINE_SCOPE_PERSONAL);

    expect(timeline).toBeDefined();
    expect(Object.isFrozen(timeline)).toBe(true);
  });

  it("does not expose registration APIs on client registry", () => {
    const result = createTimelineRegistryFromDto(sampleTimelineRegistryDto());
    const registry = result.registry as unknown as Record<string, unknown>;

    expect(registry.register).toBeUndefined();
    expect(registry.registerMany).toBeUndefined();
    expect(registry.clear).toBeUndefined();
  });

  it("reports schemaVersion and scope counts in diagnostics", () => {
    const result = createTimelineRegistryFromDto(sampleTimelineRegistryDto());

    expect(result.diagnostics.schemaVersion).toBe(TIMELINE_REGISTRY_DTO_SCHEMA_VERSION);
    expect(result.diagnostics.timelineCount).toBe(2);
    expect(result.diagnostics.scopeCounts[TIMELINE_SCOPE_PERSONAL]).toBe(1);
  });
});
