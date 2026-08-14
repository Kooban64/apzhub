import { describe, expect, it } from "vitest";

import {
  impactedPathRoots,
  inferPlatformRefsFromText,
  matchSuitesToChangedPaths,
} from "./infer-edges";

describe("F2 infer-edges", () => {
  it("infers requirement and defect refs from commit text", () => {
    const refs = inferPlatformRefsFromText(
      "fix: REQ-auth-login and defect DEF-42 plus req-abc123",
    );
    expect(refs.some((r) => r.kind === "requirement")).toBe(true);
    expect(refs.some((r) => r.kind === "defect")).toBe(true);
    expect(refs.map((r) => r.platformRef)).toEqual(
      expect.arrayContaining(["req-auth-login", "def-42", "req-abc123"]),
    );
  });

  it("matches suites by path: tags and pathPrefixes metadata", () => {
    const matches = matchSuitesToChangedPaths(
      [
        {
          suiteId: "s1",
          name: "SCM regression",
          tags: ["path:packages/platform-scm", "regression"],
        },
        {
          suiteId: "s2",
          name: "Web shell",
          tags: ["ui"],
          customMetadata: { pathPrefixes: ["apps/web"] },
        },
        {
          suiteId: "s3",
          name: "Unrelated",
          tags: ["path:packages/qep-suites"],
        },
      ],
      [
        "packages/platform-scm/src/impact/infer-edges.ts",
        "apps/web/lib/qep/scm-impact.ts",
      ],
    );
    expect(matches.map((m) => m.suiteId).sort()).toEqual(["s1", "s2"]);
    expect(matches.find((m) => m.suiteId === "s1")?.matchedPaths.length).toBe(1);
  });

  it("computes impacted path roots", () => {
    expect(
      impactedPathRoots([
        "packages/platform-scm/src/x.ts",
        "apps/web/lib/y.ts",
        "docs/readme.md",
      ]),
    ).toEqual(expect.arrayContaining(["packages/platform-scm", "apps/web", "docs"]));
  });
});
