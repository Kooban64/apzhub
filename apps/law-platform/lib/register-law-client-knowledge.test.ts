import { describe, expect, it } from "vitest";

import { createDefaultKnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

import { registerLawClientKnowledge } from "./register-law-client-knowledge";

describe("registerLawClientKnowledge", () => {
  it("registers Client Management help sources", () => {
    const registry = createDefaultKnowledgeRegistry();
    registerLawClientKnowledge(registry);

    expect(registry.hasSource("legal.help.clients.list")).toBe(true);
    expect(registry.hasSource("legal.help.clients.create")).toBe(true);
    expect(registry.hasSource("legal.help.clients.detail")).toBe(true);
  });

  it("is idempotent", () => {
    const registry = createDefaultKnowledgeRegistry();

    registerLawClientKnowledge(registry);
    registerLawClientKnowledge(registry);

    expect(
      registry
        .listSources()
        .filter((source) => source.id.startsWith("legal.help.clients.")),
    ).toHaveLength(3);
  });
});
