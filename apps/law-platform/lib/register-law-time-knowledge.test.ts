import { describe, expect, it } from "vitest";

import { bootstrapKnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

import { registerLawTimeKnowledge } from "./register-law-time-knowledge";

describe("registerLawTimeKnowledge", () => {
  it("registers time help sources", () => {
    const bootstrap = bootstrapKnowledgeRegistry();
    registerLawTimeKnowledge(bootstrap.registry);

    expect(bootstrap.registry.hasSource("legal.help.time.list")).toBe(true);
    expect(bootstrap.registry.hasSource("legal.help.time.create")).toBe(true);
    expect(bootstrap.registry.hasSource("legal.help.time.detail")).toBe(true);
  });
});
