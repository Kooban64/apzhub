import { describe, expect, it } from "vitest";

import type { KnowledgeDocument } from "../types/knowledge-document";
import {
  scoreKnowledgeDocumentKeywordMatch,
  scoreKnowledgeDocumentMatch,
} from "./scoring";
import { fuzzyRankingStrategy } from "./fuzzy-ranking-strategy";
import { keywordRankingStrategy } from "./keyword-ranking-strategy";
import { passthroughRankingStrategy } from "./passthrough-ranking-strategy";

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

describe("scoreKnowledgeDocumentMatch", () => {
  it("ranks prefix title matches above substring matches", () => {
    const prefixScore = scoreKnowledgeDocumentMatch(
      document({ documentId: "a", title: "Toggle Theme" }),
      "tog",
    );
    const substringScore = scoreKnowledgeDocumentMatch(
      document({ documentId: "b", title: "Navigation Toggle" }),
      "tog",
    );

    expect(prefixScore).toBeGreaterThan(substringScore);
  });

  it("supports fuzzy subsequence matches", () => {
    expect(
      scoreKnowledgeDocumentMatch(
        document({ documentId: "workbench.view.open", title: "Open View" }),
        "ov",
      ),
    ).toBeGreaterThan(0);
  });
});

describe("scoreKnowledgeDocumentKeywordMatch", () => {
  it("does not score fuzzy-only subsequence matches", () => {
    expect(
      scoreKnowledgeDocumentKeywordMatch(
        document({ documentId: "workbench.view.open", title: "Open View" }),
        "ov",
      ),
    ).toBe(0);
  });
});

describe("ranking strategies", () => {
  const documents = [
    document({ documentId: "platform.theme.toggle", title: "Toggle Theme" }),
    document({ documentId: "workbench.view.open", title: "Open View" }),
    document({ documentId: "workbench.navigation.reveal", title: "Reveal Navigation" }),
  ];

  it("passthrough preserves input order for empty query", () => {
    const result = passthroughRankingStrategy.rank({ documents, queryText: "   " });

    expect(result.documents).toEqual(documents);
    expect(result.diagnostics.strategyId).toBe("passthrough");
  });

  it("keyword strategy ranks theme matches without fuzzy-only hits", () => {
    const result = keywordRankingStrategy.rank({ documents, queryText: "theme" });

    expect(result.documents[0]?.documentId).toBe("platform.theme.toggle");
    expect(result.diagnostics.strategyId).toBe("keyword");
  });

  it("fuzzy strategy preserves DF-006 ranking behaviour", () => {
    const result = fuzzyRankingStrategy.rank({ documents, queryText: "nav" });

    expect(result.documents[0]?.documentId).toBe("workbench.navigation.reveal");
    expect(result.diagnostics.strategyId).toBe("fuzzy");
  });

  it("preserves stable ordering for equal scores", () => {
    const ranked = fuzzyRankingStrategy.rank({
      documents: [
        document({ documentId: "first", title: "Alpha Command" }),
        document({ documentId: "second", title: "Alpha Panel" }),
      ],
      queryText: "alpha",
    });

    expect(ranked.documents.map((item) => item.documentId)).toEqual([
      "first",
      "second",
    ]);
  });
});
