import { describe, expect, it } from "vitest";

import {
  createAllowAllWorkbenchPermissionAdapter,
  createAuthWorkbenchPermissionAdapter,
} from "@apzhub/workbench-framework";

import type { KnowledgeSource } from "../types/knowledge-source";
import { filterKnowledgeSourceRegistryDto } from "./filter-knowledge-source-registry-dto";
import type { KnowledgeSourceRegistryDto } from "./map-knowledge-source-registry-dto";
import { KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION } from "./knowledge-source-registry-schema-version";

function source(
  overrides: Partial<KnowledgeSource> & Pick<KnowledgeSource, "id" | "label">,
): KnowledgeSource {
  return {
    kind: "registry-projection",
    tier: "T0",
    priority: 10,
    status: "active",
    provides: ["command"],
    ...overrides,
  };
}

function sampleDto(
  overrides: Partial<KnowledgeSourceRegistryDto> = {},
): KnowledgeSourceRegistryDto {
  return {
    schemaVersion: KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
    frameworkVersion: "0.5.0",
    sources: [
      source({ id: "platform.actions", label: "Actions", origin: "builtin" }),
      source({
        id: "example.module.search",
        label: "Example Search",
        permission: "example.read",
        origin: "manifest",
        capabilityId: "example-module",
      }),
    ],
    ...overrides,
  };
}

describe("filterKnowledgeSourceRegistryDto", () => {
  it("passes all sources with allow-all adapter", () => {
    const dto = sampleDto();
    const filtered = filterKnowledgeSourceRegistryDto(
      dto,
      createAllowAllWorkbenchPermissionAdapter(),
    );

    expect(filtered.sources).toHaveLength(2);
    expect(filtered.schemaVersion).toBe(KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION);
    expect(filtered.frameworkVersion).toBe("0.5.0");
  });

  it("returns empty sources for empty input", () => {
    const filtered = filterKnowledgeSourceRegistryDto(
      {
        schemaVersion: KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
        sources: [],
      },
      createAuthWorkbenchPermissionAdapter({ userId: "user-1", permissions: [] }),
    );

    expect(filtered.sources).toEqual([]);
  });

  it("filters sources denied by permission adapter", () => {
    const dto = sampleDto();
    const adapter = createAuthWorkbenchPermissionAdapter({
      userId: "user-1",
      permissions: ["example.read"],
    });

    const filtered = filterKnowledgeSourceRegistryDto(dto, adapter);

    expect(filtered.sources.map((item) => item.id)).toEqual([
      "platform.actions",
      "example.module.search",
    ]);
  });

  it("removes permission-gated sources when user lacks permission", () => {
    const dto = sampleDto();
    const adapter = createAuthWorkbenchPermissionAdapter({
      userId: "user-1",
      permissions: [],
    });

    const filtered = filterKnowledgeSourceRegistryDto(dto, adapter);

    expect(filtered.sources.map((item) => item.id)).toEqual(["platform.actions"]);
  });

  it("delegates filtering to permissionAdapter.filter without evaluating permissions inline", () => {
    const dto = sampleDto();
    let filterInvoked = false;
    const adapter = {
      getContext: () => null,
      can: () => true,
      filter: <T extends { permission?: string }>(items: readonly T[]) => {
        filterInvoked = true;
        return items.filter((item) => item.permission !== "example.read");
      },
    };

    const filtered = filterKnowledgeSourceRegistryDto(dto, adapter);

    expect(filterInvoked).toBe(true);
    expect(filtered.sources.map((item) => item.id)).toEqual(["platform.actions"]);
  });
});
