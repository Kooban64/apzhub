import { describe, expect, it } from "vitest";

import { KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION } from "./knowledge-source-registry-schema-version";
import { createEmptyKnowledgeSourceRegistryDto } from "./map-knowledge-source-registry-dto";
import { validateKnowledgeSourceRegistryDto } from "./validate-knowledge-source-registry-dto";

describe("validateKnowledgeSourceRegistryDto", () => {
  it("accepts a valid DTO payload", () => {
    const result = validateKnowledgeSourceRegistryDto({
      schemaVersion: KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
      frameworkVersion: "0.5.0",
      sources: [
        {
          id: "platform.actions",
          label: "Actions",
          kind: "registry-projection",
          tier: "T0",
          priority: 10,
          status: "active",
          provides: ["command"],
          origin: "builtin",
        },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.dto.sources).toHaveLength(1);
  });

  it("rejects non-object payloads", () => {
    const result = validateKnowledgeSourceRegistryDto(null);

    expect(result.ok).toBe(false);
    expect(result.dto).toEqual(createEmptyKnowledgeSourceRegistryDto());
    expect(result.errors[0]?.code).toBe("VALIDATION");
  });

  it("rejects unsupported schemaVersion", () => {
    const result = validateKnowledgeSourceRegistryDto({
      schemaVersion: 99,
      sources: [],
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.field).toBe("schemaVersion");
  });

  it("rejects invalid source descriptors", () => {
    const result = validateKnowledgeSourceRegistryDto({
      schemaVersion: KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
      sources: [
        {
          id: "Invalid_ID",
          label: "Bad",
          kind: "registry-projection",
          tier: "T0",
          priority: 10,
          status: "active",
          provides: ["command"],
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("VALIDATION");
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

  it("rejects empty frameworkVersion when provided", () => {
    const result = validateKnowledgeSourceRegistryDto({
      schemaVersion: KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
      frameworkVersion: "   ",
      sources: [],
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.field).toBe("frameworkVersion");
  });
});
