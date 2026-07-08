import { describe, expect, it } from "vitest";

import { bootstrapKnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

import { registerLawTaskKnowledge } from "./register-law-task-knowledge";

describe("registerLawTaskKnowledge", () => {
  it("registers task help sources", () => {
    const bootstrap = bootstrapKnowledgeRegistry();
    registerLawTaskKnowledge(bootstrap.registry);

    expect(bootstrap.registry.hasSource("legal.help.tasks.list")).toBe(true);
    expect(bootstrap.registry.hasSource("legal.help.tasks.create")).toBe(true);
    expect(bootstrap.registry.hasSource("legal.help.tasks.detail")).toBe(true);
  });
});
