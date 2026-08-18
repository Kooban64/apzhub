import { describe, expect, it } from "vitest";

import { parseSourcePenQuery, sourceFilePenHref } from "./pen-source-links";

describe("pen-source-links", () => {
  it("builds workbench source href with PEN context params", () => {
    const href = sourceFilePenHref({
      repositoryId: "repo-1",
      path: "apps/api/account.ts",
      line: 142,
      penFindingId: "AUTH-014",
      penEngagementId: "eng-1",
    });
    expect(href).toContain("/workspace/source/");
    expect(href).toContain("path=apps%2Fapi%2Faccount.ts");
    expect(href).toContain("line=142");
    expect(href).toContain("penFinding=AUTH-014");
    expect(href).toContain("penEngagement=eng-1");
  });

  it("parses PEN query without inventing fields", () => {
    const parsed = parseSourcePenQuery(
      "?path=x.ts&line=3&penFinding=F1&penEngagement=E1",
    );
    expect(parsed.path).toBe("x.ts");
    expect(parsed.line).toBe(3);
    expect(parsed.penFindingId).toBe("F1");
    expect(parsed.penEngagementId).toBe("E1");
  });
});
