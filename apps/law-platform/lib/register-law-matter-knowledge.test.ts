import { describe, expect, it } from "vitest";

import { createDefaultKnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

import { registerLawMatterKnowledge } from "./register-law-matter-knowledge";

describe("registerLawMatterKnowledge", () => {
  it("registers Matter Management help sources", () => {
    const registry = createDefaultKnowledgeRegistry();
    registerLawMatterKnowledge(registry);

    expect(registry.hasSource("legal.help.matters.list")).toBe(true);
    expect(registry.hasSource("legal.help.matters.create")).toBe(true);
    expect(registry.hasSource("legal.help.matters.detail")).toBe(true);
    expect(registry.hasSource("legal.help.matter.workspace")).toBe(true);
  });

  it("is idempotent", () => {
    const registry = createDefaultKnowledgeRegistry();
    registerLawMatterKnowledge(registry);
    registerLawMatterKnowledge(registry);

    expect(
      registry
        .listSources()
        .filter((source) => source.id.startsWith("legal.help.matter")),
    ).toHaveLength(4);
  });
});
