import { describe, expect, it } from "vitest";

import { createDefaultKnowledgeRegistry } from "../registry/default-knowledge-registry";
import { registerPlatformKnowledgeSourceCatalogue } from "./register-platform-knowledge-sources";
import { PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE } from "./platform-knowledge-source-catalogue";

describe("registerPlatformKnowledgeSourceCatalogue", () => {
  it("registers built-in T0 platform knowledge source references", () => {
    const registry = createDefaultKnowledgeRegistry();
    const result = registerPlatformKnowledgeSourceCatalogue(registry, {
      frameworkVersion: "0.5.0",
    });

    expect(result.ok).toBe(true);
    expect(result.catalogueCount).toBe(PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE.length);
    expect(registry.hasSource("platform.actions")).toBe(true);
    expect(registry.hasSource("platform.navigation")).toBe(true);
    expect(registry.getRegistryMetadata().frameworkVersion).toBe("0.5.0");
  });
});
