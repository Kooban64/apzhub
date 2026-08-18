import { describe, expect, it } from "vitest";

import { parseSourceFileQuery, sourceFileWorkbenchHref } from "./qep-source-links";

describe("qep-source-links", () => {
  it("builds deep links with path line and QEP context", () => {
    const href = sourceFileWorkbenchHref({
      repositoryId: "repo-1",
      path: "tests/auth/session.spec.ts",
      line: 84,
      qepTestId: "tspec_1",
      qepRunId: "tex_1",
    });
    expect(href).toContain("/workspace/source/repositories/repo-1?");
    expect(href).toContain("path=tests%2Fauth%2Fsession.spec.ts");
    expect(href).toContain("line=84");
    expect(href).toContain("qepTest=tspec_1");
  });

  it("parses query params", () => {
    const parsed = parseSourceFileQuery(
      "path=tests%2Fa.ts&line=12&qepTest=t1&qepRun=r1",
    );
    expect(parsed.path).toBe("tests/a.ts");
    expect(parsed.line).toBe(12);
    expect(parsed.qepTestId).toBe("t1");
    expect(parsed.qepRunId).toBe("r1");
  });
});
