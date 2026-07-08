import { describe, expect, it } from "vitest";

import type { LegalSearchResultView } from "../knowledge/map-legal-search-document";
import {
  scoreLegalSearchResult,
  sortSearchResultsByLegalRelevance,
} from "./legal-search-ranking";

function createResult(
  partial: Partial<LegalSearchResultView> &
    Pick<LegalSearchResultView, "entityType" | "title" | "reference">,
): LegalSearchResultView {
  return {
    subtitle: partial.reference,
    route: "/workspace/law/clients/1",
    document: {
      documentId: "legal.clients.search:1",
      sourceId: "legal.clients.search",
      kind: "person",
      title: partial.title,
    },
    score: partial.score,
    ...partial,
  };
}

describe("legal search ranking", () => {
  it("boosts exact reference matches ahead of partial title matches", () => {
    const exact = createResult({
      entityType: "client",
      title: "Other Name",
      reference: "CL-2026-00001",
      score: 100,
    });
    const partial = createResult({
      entityType: "matter",
      title: "CL-2026 matter discussion",
      reference: "MAT-2026-00001",
      score: 200,
    });

    const sorted = sortSearchResultsByLegalRelevance([partial, exact], "CL-2026-00001");
    expect(sorted[0]?.reference).toBe("CL-2026-00001");
    expect(scoreLegalSearchResult(exact, "CL-2026-00001")).toBeGreaterThan(
      scoreLegalSearchResult(partial, "CL-2026-00001"),
    );
  });
});
