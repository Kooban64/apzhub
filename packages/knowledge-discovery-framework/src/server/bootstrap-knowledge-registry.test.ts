import { describe, expect, it } from "vitest";

import { bootstrapKnowledgeRegistry } from "./bootstrap-knowledge-registry";
import {
  KNOWLEDGE_MANIFEST_FIXTURE,
  knowledgeCapabilityRecord,
} from "../extraction/test-fixtures";

describe("bootstrapKnowledgeRegistry", () => {
  it("registers platform catalogue then manifest sources", () => {
    const result = bootstrapKnowledgeRegistry({
      frameworkVersion: "0.5.0",
      capabilityRecords: [
        knowledgeCapabilityRecord({
          id: "example-module",
          manifest: KNOWLEDGE_MANIFEST_FIXTURE.withSource,
        }),
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.platform.ok).toBe(true);
    expect(result.capabilities.ok).toBe(true);
    expect(result.registry.hasSource("platform.actions")).toBe(true);
    expect(result.registry.hasSource("example.module.search")).toBe(true);
    expect(result.diagnostics.status).toBe("degraded");
    expect(result.diagnostics.platformCatalogueRegistered).toBe(3);
    expect(result.diagnostics.manifestSourcesRegistered).toBe(1);
    expect(result.diagnostics.registry.registeredSourceCount).toBe(4);
  });

  it("fails bootstrap when manifest extraction fails without manifest registration", () => {
    const result = bootstrapKnowledgeRegistry({
      capabilityRecords: [
        knowledgeCapabilityRecord({
          id: "bad-module",
          manifest: KNOWLEDGE_MANIFEST_FIXTURE.invalidId,
        }),
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.registry.hasSource("platform.actions")).toBe(true);
    expect(result.registry.hasSource("example.module.search")).toBe(false);
    expect(result.errors[0]?.code).toBe("VALIDATION");
  });

  it("records manifest capability ids on successful bootstrap", () => {
    const result = bootstrapKnowledgeRegistry({
      capabilityRecords: [
        knowledgeCapabilityRecord({
          id: "example-module",
          manifest: KNOWLEDGE_MANIFEST_FIXTURE.withSource,
        }),
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.registry.getRegistryMetadata().manifestCapabilities).toEqual([
      "example-module",
    ]);
  });
});
