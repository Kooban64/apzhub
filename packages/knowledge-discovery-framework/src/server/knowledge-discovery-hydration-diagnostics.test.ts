import { describe, expect, it } from "vitest";

import { createAllowAllWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

import { bootstrapKnowledgeRegistry } from "./bootstrap-knowledge-registry";
import {
  KNOWLEDGE_MANIFEST_FIXTURE,
  knowledgeCapabilityRecord,
} from "../extraction/test-fixtures";
import { filterKnowledgeSourceRegistryDto } from "./filter-knowledge-source-registry-dto";
import {
  buildKnowledgeDiscoveryHydrationDiagnostics,
  createEmptyKnowledgeDiscoveryHydrationDiagnostics,
} from "./knowledge-discovery-hydration-diagnostics";
import { mapKnowledgeSourceRegistryDto } from "./map-knowledge-source-registry-dto";
import { KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION } from "./knowledge-source-registry-schema-version";

describe("buildKnowledgeDiscoveryHydrationDiagnostics", () => {
  it("reports registered vs filtered counts", () => {
    const bootstrap = bootstrapKnowledgeRegistry({
      frameworkVersion: "0.5.0",
      capabilityRecords: [
        knowledgeCapabilityRecord({
          id: "example-module",
          manifest: KNOWLEDGE_MANIFEST_FIXTURE.withSource,
        }),
      ],
    });

    const dto = mapKnowledgeSourceRegistryDto(bootstrap.registry);
    const filtered = filterKnowledgeSourceRegistryDto(
      dto,
      createAllowAllWorkbenchPermissionAdapter(),
    );
    const diagnostics = buildKnowledgeDiscoveryHydrationDiagnostics(
      bootstrap.registry,
      filtered,
    );

    expect(diagnostics.schemaVersion).toBe(
      KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
    );
    expect(diagnostics.registeredCount).toBe(4);
    expect(diagnostics.filteredCount).toBe(4);
    expect(diagnostics.frameworkVersion).toBe("0.5.0");
    expect(diagnostics.builtinSourceCount).toBe(3);
    expect(diagnostics.manifestSourceCount).toBe(1);
    expect(diagnostics.manifestCapabilities).toEqual(["example-module"]);
  });

  it("reflects permission filtering in filteredCount", () => {
    const bootstrap = bootstrapKnowledgeRegistry({
      capabilityRecords: [
        knowledgeCapabilityRecord({
          id: "example-module",
          manifest: {
            knowledge: {
              sources: [
                {
                  id: "example.module.search",
                  label: "Example Search",
                  kind: "registry-projection",
                  tier: "T0",
                  priority: 50,
                  permission: "example.read",
                  provides: ["custom"],
                },
              ],
            },
          },
        }),
      ],
    });

    const dto = mapKnowledgeSourceRegistryDto(bootstrap.registry);
    const filtered = filterKnowledgeSourceRegistryDto(dto, {
      getContext: () => null,
      can: () => false,
      filter: <T extends { permission?: string }>(items: readonly T[]) =>
        items.filter((item) => item.permission === undefined),
    });
    const diagnostics = buildKnowledgeDiscoveryHydrationDiagnostics(
      bootstrap.registry,
      filtered,
    );

    expect(diagnostics.registeredCount).toBe(4);
    expect(diagnostics.filteredCount).toBe(3);
    expect(diagnostics.manifestSourceCount).toBe(0);
  });

  it("creates empty diagnostics", () => {
    expect(createEmptyKnowledgeDiscoveryHydrationDiagnostics()).toEqual({
      schemaVersion: KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
      registeredCount: 0,
      filteredCount: 0,
      builtinSourceCount: 0,
      manifestSourceCount: 0,
      builtinSourceIds: [],
      manifestSourceIds: [],
      manifestCapabilityCount: 0,
      manifestCapabilities: [],
      activeSourceCount: 0,
      registeredProviderCount: 0,
    });
  });
});
