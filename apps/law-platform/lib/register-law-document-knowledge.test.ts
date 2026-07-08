import { describe, expect, it } from "vitest";

import { createDefaultKnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

import { registerLawDocumentKnowledge } from "./register-law-document-knowledge";

describe("registerLawDocumentKnowledge", () => {
  it("registers Document Management help sources", () => {
    const registry = createDefaultKnowledgeRegistry();
    registerLawDocumentKnowledge(registry);

    expect(registry.hasSource("legal.help.documents.list")).toBe(true);
    expect(registry.hasSource("legal.help.documents.create")).toBe(true);
    expect(registry.hasSource("legal.help.documents.detail")).toBe(true);
  });
});
