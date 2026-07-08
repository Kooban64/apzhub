import { describe, expect, it } from "vitest";

import type { KnowledgeDocument } from "../types/knowledge-document";
import {
  aiRerankingStrategy,
  createDefaultRankingStrategyRegistry,
  createPlannedRankingStrategy,
  defaultPlannedRankingStrategies,
  frequencyRankingStrategy,
  personalisationRankingStrategy,
  recencyRankingStrategy,
  semanticRankingStrategy,
} from "./index";

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

describe("planned ranking strategies", () => {
  const documents = [
    document({ documentId: "a", title: "Alpha" }),
    document({ documentId: "b", title: "Beta" }),
  ];

  it.each([
    ["semantic", semanticRankingStrategy],
    ["recency", recencyRankingStrategy],
    ["frequency", frequencyRankingStrategy],
    ["personalisation", personalisationRankingStrategy],
    ["ai-rerank", aiRerankingStrategy],
  ] as const)(
    "returns passthrough documents with not_implemented diagnostics for %s",
    (id, strategy) => {
      const result = strategy.rank({ documents, queryText: "alpha" });

      expect(result.documents.map((entry) => entry.documentId)).toEqual(["a", "b"]);
      expect(result.diagnostics).toMatchObject({
        strategyId: "passthrough",
        plannedStrategyId: id,
        implementationStatus: "not_implemented",
        inputCount: 2,
        outputCount: 2,
        filteredCount: 0,
      });
      expect(result.diagnostics.message).toContain("planned");
      expect(result.diagnostics.durationMs).toBeGreaterThanOrEqual(0);
    },
  );

  it("does not throw when invoked directly", () => {
    expect(() =>
      semanticRankingStrategy.rank({ documents, queryText: "theme" }),
    ).not.toThrow();
  });

  it("registers custom planned strategies via factory", () => {
    const custom = createPlannedRankingStrategy({
      id: "semantic",
      label: "Custom semantic",
      deferredTo: "test milestone",
    });

    const result = custom.rank({ documents, queryText: "alpha" });

    expect(result.diagnostics.plannedStrategyId).toBe("semantic");
    expect(result.diagnostics.message).toContain("Custom semantic");
  });
});

describe("DefaultRankingStrategyRegistry", () => {
  it("lists active and default planned strategies", () => {
    const registry = createDefaultRankingStrategyRegistry();

    expect(registry.listActive()).toEqual(["passthrough", "keyword", "fuzzy"]);
    expect(registry.listPlanned()).toHaveLength(5);
    expect(registry.getPlanned("semantic")).toBe(semanticRankingStrategy);
  });

  it("reports registry diagnostics", () => {
    const registry = createDefaultRankingStrategyRegistry();
    const diagnostics = registry.getDiagnostics();

    expect(diagnostics.activeStrategyIds).toEqual(["passthrough", "keyword", "fuzzy"]);
    expect(diagnostics.plannedStrategyIds).toEqual([
      "semantic",
      "recency",
      "frequency",
      "personalisation",
      "ai-rerank",
    ]);
    expect(diagnostics.plannedStrategyCount).toBe(5);
    expect(diagnostics.registeredPlannedCount).toBe(5);
    expect(diagnostics.strategies).toHaveLength(5);
    expect(
      diagnostics.strategies.every(
        (entry) => entry.implementationStatus === "not_implemented",
      ),
    ).toBe(true);
  });

  it("supports registering additional planned strategies", () => {
    const registry = createDefaultRankingStrategyRegistry({
      plannedStrategies: defaultPlannedRankingStrategies,
    });
    const custom = createPlannedRankingStrategy({
      id: "recency",
      label: "Override recency",
      deferredTo: "override milestone",
    });

    registry.registerPlanned(custom);

    expect(registry.getPlanned("recency")?.label).toBe("Override recency");
    expect(registry.getDiagnostics().registeredPlannedCount).toBe(5);
  });
});
