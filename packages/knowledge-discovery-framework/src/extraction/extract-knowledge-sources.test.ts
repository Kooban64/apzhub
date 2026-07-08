import { describe, expect, it } from "vitest";

import { createDefaultKnowledgeRegistry } from "../registry/default-knowledge-registry";
import { extractKnowledgeSourcesFromCapabilities } from "./extract-knowledge-sources";
import { mapKnowledgeManifestToSource } from "./map-knowledge-manifest";
import { populateKnowledgeRegistryFromCapabilities } from "./populate-knowledge-registry";
import { KNOWLEDGE_MANIFEST_FIXTURE, knowledgeCapabilityRecord } from "./test-fixtures";

describe("mapKnowledgeManifestToSource", () => {
  it("maps manifest entry to knowledge source reference with capability origin", () => {
    const source = mapKnowledgeManifestToSource(
      {
        id: "example.module.search",
        label: "Example Search",
        kind: "registry-projection",
        tier: "T0",
        priority: 50,
        provides: ["custom"],
        version: "2.0.0",
      },
      knowledgeCapabilityRecord({ id: "example-module", version: "1.0.0" }),
    );

    expect(source).toMatchObject({
      id: "example.module.search",
      capabilityId: "example-module",
      origin: "manifest",
      version: "2.0.0",
    });
  });
});

describe("extractKnowledgeSourcesFromCapabilities", () => {
  it("extracts knowledge.sources from capability manifests", () => {
    const result = extractKnowledgeSourcesFromCapabilities([
      knowledgeCapabilityRecord({
        id: "example-module",
        manifest: KNOWLEDGE_MANIFEST_FIXTURE.withSource,
      }),
    ]);

    expect(result.ok).toBe(true);
    expect(result.sources).toHaveLength(1);
    expect(result.sources[0]?.id).toBe("example.module.search");
    expect(result.diagnostics.capabilityIds).toEqual(["example-module"]);
  });

  it("rejects duplicate source ids across capabilities", () => {
    const result = extractKnowledgeSourcesFromCapabilities(
      KNOWLEDGE_MANIFEST_FIXTURE.duplicateAcrossCapabilities.map((entry) =>
        knowledgeCapabilityRecord({
          id: entry.id,
          manifest: entry.manifest,
        }),
      ),
    );

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("DUPLICATE_ID");
    expect(result.sources).toHaveLength(0);
  });

  it("rejects invalid manifest entries", () => {
    const result = extractKnowledgeSourcesFromCapabilities([
      knowledgeCapabilityRecord({
        id: "bad-module",
        manifest: KNOWLEDGE_MANIFEST_FIXTURE.invalidId,
      }),
    ]);

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("VALIDATION");
  });

  it("skips inactive capabilities when activeOnly is true", () => {
    const result = extractKnowledgeSourcesFromCapabilities(
      [
        knowledgeCapabilityRecord({
          id: "inactive-module",
          lifecycleState: "disabled",
          manifest: KNOWLEDGE_MANIFEST_FIXTURE.withSource,
        }),
      ],
      { activeOnly: true },
    );

    expect(result.ok).toBe(true);
    expect(result.sources).toHaveLength(0);
    expect(result.diagnostics.skippedInactive).toBe(1);
  });
});

describe("populateKnowledgeRegistryFromCapabilities", () => {
  it("registers extracted sources atomically", () => {
    const registry = createDefaultKnowledgeRegistry();
    const result = populateKnowledgeRegistryFromCapabilities(registry, [
      knowledgeCapabilityRecord({
        id: "example-module",
        manifest: KNOWLEDGE_MANIFEST_FIXTURE.withSource,
      }),
    ]);

    expect(result.ok).toBe(true);
    expect(registry.hasSource("example.module.search")).toBe(true);
    expect(registry.getMetadata("example.module.search")?.declaredCapabilities).toEqual(
      ["custom"],
    );
  });

  it("does not register when extraction fails", () => {
    const registry = createDefaultKnowledgeRegistry();
    const result = populateKnowledgeRegistryFromCapabilities(registry, [
      knowledgeCapabilityRecord({
        id: "bad-module",
        manifest: KNOWLEDGE_MANIFEST_FIXTURE.invalidId,
      }),
    ]);

    expect(result.ok).toBe(false);
    expect(registry.listSources()).toHaveLength(0);
  });

  it("does not register partial batch when duplicate ids are present", () => {
    const registry = createDefaultKnowledgeRegistry();
    const result = populateKnowledgeRegistryFromCapabilities(
      registry,
      KNOWLEDGE_MANIFEST_FIXTURE.duplicateAcrossCapabilities.map((entry) =>
        knowledgeCapabilityRecord({
          id: entry.id,
          manifest: entry.manifest,
        }),
      ),
    );

    expect(result.ok).toBe(false);
    expect(registry.listSources()).toHaveLength(0);
  });
});
