import { describe, expect, it } from "vitest";

import { PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE } from "../catalogue/platform-knowledge-source-catalogue";
import { KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION } from "../server/knowledge-source-registry-schema-version";
import { createEmptyKnowledgeSourceRegistryDto } from "../server/map-knowledge-source-registry-dto";
import { ClientKnowledgeRegistry } from "./client-knowledge-registry";
import { createKnowledgeRegistryFromDto } from "./create-knowledge-registry-from-dto";
import { mapKnowledgeSourceRegistryDtoToSources } from "./map-dto-to-knowledge-sources";
import { sampleKnowledgeSourceRegistryDto } from "./test-fixtures";
import { validateKnowledgeSourceRegistryDto } from "./validate-knowledge-source-registry-dto";

describe("validateKnowledgeSourceRegistryDto (client boundary)", () => {
  it("rejects non-object payloads", () => {
    const result = validateKnowledgeSourceRegistryDto(null);
    expect(result.ok).toBe(false);
    expect(result.errors[0]?.message).toContain("object");
  });

  it("rejects unsupported schemaVersion", () => {
    const result = validateKnowledgeSourceRegistryDto({
      schemaVersion: 99,
      sources: [],
    });
    expect(result.ok).toBe(false);
    expect(result.errors[0]?.field).toBe("schemaVersion");
  });

  it("rejects duplicate source ids", () => {
    const source = {
      id: "platform.actions",
      label: "Actions",
      kind: "registry-projection" as const,
      tier: "T0" as const,
      priority: 10,
      status: "active" as const,
      provides: ["command" as const],
    };

    const result = validateKnowledgeSourceRegistryDto({
      schemaVersion: KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
      sources: [source, source],
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
  });
});

describe("createKnowledgeRegistryFromDto", () => {
  it("hydrates a read-only registry from a valid DTO", () => {
    const dto = sampleKnowledgeSourceRegistryDto();
    const result = createKnowledgeRegistryFromDto(dto);

    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.registry.list()).toHaveLength(
      PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE.length,
    );
    expect(result.diagnostics.status).toBe("hydrated");
    expect(result.diagnostics.schemaVersion).toBe(
      KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
    );
    expect(result.diagnostics.frameworkVersion).toBe("0.5.0");
    expect(result.diagnostics.synchronisation.mode).toBe("hydration");
    expect(result.dto.schemaVersion).toBe(KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION);
    expect(result.dto.frameworkVersion).toBe("0.5.0");
  });

  it("returns invalid registry for malformed payloads", () => {
    const result = createKnowledgeRegistryFromDto({ schemaVersion: 99, sources: [] });

    expect(result.ok).toBe(false);
    expect(result.registry.list()).toHaveLength(0);
    expect(result.diagnostics.status).toBe("invalid");
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("returns empty registry for valid empty DTO", () => {
    const result = createKnowledgeRegistryFromDto(
      createEmptyKnowledgeSourceRegistryDto(),
    );

    expect(result.ok).toBe(true);
    expect(result.registry.list()).toHaveLength(0);
    expect(result.diagnostics.status).toBe("empty");
  });

  it("preserves schemaVersion and frameworkVersion on hydrated dto", () => {
    const result = createKnowledgeRegistryFromDto(
      sampleKnowledgeSourceRegistryDto({ frameworkVersion: "1.2.3" }),
    );

    expect(result.dto.frameworkVersion).toBe("1.2.3");
    expect(result.diagnostics.frameworkVersion).toBe("1.2.3");
  });

  it("deep-freezes hydrated sources", () => {
    const registry = createKnowledgeRegistryFromDto(
      sampleKnowledgeSourceRegistryDto(),
    ).registry;
    const source = registry.get("platform.actions");

    expect(source).toBeDefined();
    expect(Object.isFrozen(source)).toBe(true);
    expect(Object.isFrozen(source!.provides)).toBe(true);
  });

  it("does not expose registration APIs on read-only registry", () => {
    const registry = createKnowledgeRegistryFromDto(
      sampleKnowledgeSourceRegistryDto(),
    ).registry;

    expect(registry).not.toHaveProperty("registerSource");
    expect(registry).not.toHaveProperty("registerProvider");
    expect(registry).not.toHaveProperty("clear");
  });

  it("supports validate:false for test fixtures", () => {
    const result = createKnowledgeRegistryFromDto(
      { schemaVersion: 1, sources: [] },
      { validate: false },
    );

    expect(result.ok).toBe(true);
    expect(result.registry).toBeInstanceOf(ClientKnowledgeRegistry);
  });
});

describe("ClientKnowledgeRegistry read-only semantics", () => {
  it("lists sources sorted by priority then id", () => {
    const sources = mapKnowledgeSourceRegistryDtoToSources(
      sampleKnowledgeSourceRegistryDto().sources,
    );
    const registry = new ClientKnowledgeRegistry({ sources, status: "hydrated" });
    const ids = registry.list().map((source) => source.id);

    expect(ids).toEqual([
      "platform.actions",
      "platform.navigation",
      "platform.capabilities",
    ]);
  });

  it("reports builtin and manifest source counts in diagnostics", () => {
    const dto = sampleKnowledgeSourceRegistryDto({
      sources: [
        {
          id: "capability.docs",
          label: "Docs",
          kind: "registry-projection",
          tier: "T1",
          priority: 40,
          status: "active",
          provides: ["document"],
          origin: "manifest",
          capabilityId: "docs-capability",
        },
        ...sampleKnowledgeSourceRegistryDto().sources,
      ],
    });
    const result = createKnowledgeRegistryFromDto(dto);

    expect(result.diagnostics.builtinSourceCount).toBe(3);
    expect(result.diagnostics.manifestSourceCount).toBe(1);
    expect(result.diagnostics.manifestSourceIds).toEqual(["capability.docs"]);
  });
});
