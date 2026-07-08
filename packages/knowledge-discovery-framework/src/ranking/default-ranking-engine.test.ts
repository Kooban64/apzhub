import { describe, expect, it } from "vitest";

import type { KnowledgeDocument } from "../types/knowledge-document";
import {
  createDefaultRankingEngine,
  fuzzyRankingStrategy,
  keywordRankingStrategy,
  passthroughRankingStrategy,
  selectRankingMode,
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

describe("DefaultRankingEngine", () => {
  const documents = [
    document({ documentId: "platform.theme.toggle", title: "Toggle Theme" }),
    document({ documentId: "workbench.view.open", title: "Open View" }),
  ];

  it("selects passthrough strategy for empty query in auto mode", () => {
    const engine = createDefaultRankingEngine();
    const strategy = engine.resolveStrategy({ documents, queryText: "   " });

    expect(strategy.id).toBe("passthrough");
    expect(selectRankingMode("   ")).toBe("passthrough");
  });

  it("selects fuzzy strategy for non-empty query in auto mode", () => {
    const engine = createDefaultRankingEngine();
    const strategy = engine.resolveStrategy({ documents, queryText: "theme" });

    expect(strategy.id).toBe("fuzzy");
    expect(selectRankingMode("theme")).toBe("fuzzy");
  });

  it("supports explicit keyword strategy selection", () => {
    const engine = createDefaultRankingEngine();
    const result = engine.rank({ documents, queryText: "theme", mode: "keyword" });

    expect(result.diagnostics.strategyId).toBe("keyword");
    expect(result.documents[0]?.documentId).toBe("platform.theme.toggle");
  });

  it("reports ranking diagnostics", () => {
    const engine = createDefaultRankingEngine({
      fuzzyStrategy: fuzzyRankingStrategy,
      keywordStrategy: keywordRankingStrategy,
      passthroughStrategy: passthroughRankingStrategy,
    });

    const result = engine.rank({ documents, queryText: "theme" });

    expect(result.diagnostics).toMatchObject({
      strategyId: "fuzzy",
      inputCount: 2,
      outputCount: 1,
      filteredCount: 1,
    });
    expect(result.diagnostics.durationMs).toBeGreaterThanOrEqual(0);
  });
});
