import { describe, expect, it } from "vitest";

import type { KnowledgeDocument } from "../types/knowledge-document";
import { createKnowledgeDiscoveryContext } from "../index";

function document(
  overrides: Partial<KnowledgeDocument> &
    Pick<KnowledgeDocument, "documentId" | "title">,
): KnowledgeDocument {
  return {
    sourceId: "mock.source",
    kind: "command",
    ...overrides,
  };
}

describe("createKnowledgeDiscoveryContext ranking strategy registry", () => {
  it("defaults to DefaultRankingStrategyRegistry without changing ranking engine behaviour", () => {
    const context = createKnowledgeDiscoveryContext();
    const documents = [document({ documentId: "a", title: "Alpha" })];

    expect(
      context.rankingStrategyRegistry.getDiagnostics().registeredPlannedCount,
    ).toBe(5);
    expect(
      context.rankingEngine.rank({ documents, queryText: "alpha" }).diagnostics
        .strategyId,
    ).toBe("fuzzy");
    expect(
      context.rankingEngine.rank({ documents, queryText: "   " }).diagnostics
        .strategyId,
    ).toBe("passthrough");
  });

  it("allows ranking strategy registry injection", () => {
    const registry = createKnowledgeDiscoveryContext().rankingStrategyRegistry;
    const context = createKnowledgeDiscoveryContext({
      rankingStrategyRegistry: registry,
    });

    expect(context.rankingStrategyRegistry).toBe(registry);
  });
});
