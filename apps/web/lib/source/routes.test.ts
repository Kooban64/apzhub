import { describe, expect, it } from "vitest";

import {
  isSourceWorkspaceRoute,
  parseSourceRepositoryId,
  SOURCE_BASE,
  SOURCE_ROUTES,
} from "./routes";

describe("source workspace routes", () => {
  it("matches /workspace/source and nested paths", () => {
    expect(isSourceWorkspaceRoute(SOURCE_BASE)).toBe(true);
    expect(isSourceWorkspaceRoute(`${SOURCE_BASE}/`)).toBe(true);
    expect(isSourceWorkspaceRoute(SOURCE_ROUTES.repositories)).toBe(true);
    expect(isSourceWorkspaceRoute(SOURCE_ROUTES.repository("repo-1"))).toBe(true);
    expect(isSourceWorkspaceRoute("/workspace/qep/scm")).toBe(false);
  });

  it("parses repository ids", () => {
    expect(parseSourceRepositoryId(SOURCE_ROUTES.repository("abc"))).toBe("abc");
    expect(parseSourceRepositoryId(SOURCE_ROUTES.home)).toBeNull();
  });
});
