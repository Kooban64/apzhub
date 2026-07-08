import { describe, expect, it } from "vitest";

import { bootstrapKnowledgeRegistry } from "./bootstrap-knowledge-registry";
import {
  KNOWLEDGE_MANIFEST_FIXTURE,
  knowledgeCapabilityRecord,
} from "../extraction/test-fixtures";
import { mapKnowledgeSourceRegistryDto } from "./map-knowledge-source-registry-dto";
import { KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION } from "./knowledge-source-registry-schema-version";

describe("mapKnowledgeSourceRegistryDto", () => {
  it("maps registry sources with schema and framework version", () => {
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

    expect(dto.schemaVersion).toBe(KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION);
    expect(dto.frameworkVersion).toBe("0.5.0");
    expect(dto.sources.map((item) => item.id)).toEqual([
      "platform.actions",
      "platform.navigation",
      "platform.capabilities",
      "example.module.search",
    ]);
    expect(dto.sources.every((item) => item.label.length > 0)).toBe(true);
  });

  it("sorts sources by priority then id", () => {
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
    const priorities = dto.sources.map((item) => item.priority);

    expect(priorities).toEqual([...priorities].sort((left, right) => left - right));
  });
});
