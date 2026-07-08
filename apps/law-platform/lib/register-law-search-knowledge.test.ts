import { describe, expect, it } from "vitest";

import { bootstrapKnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

import { registerLawSearchKnowledge } from "./register-law-search-knowledge";

describe("registerLawSearchKnowledge", () => {
  it("registers search help sources", () => {
    const bootstrap = bootstrapKnowledgeRegistry();
    registerLawSearchKnowledge(bootstrap.registry);

    expect(bootstrap.registry.hasSource("legal.help.search.list")).toBe(true);
  });
});
