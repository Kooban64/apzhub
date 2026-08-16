import { describe, expect, it } from "vitest";

import {
  isSourceWorkspaceRoute,
  parseSourceChangeId,
  parseSourceRepositoryId,
  parseSourceRepositoryMode,
  SOURCE_BASE,
  SOURCE_ROUTES,
} from "./routes";

describe("source workspace routes", () => {
  it("matches /workspace/source and nested paths", () => {
    expect(isSourceWorkspaceRoute(SOURCE_BASE)).toBe(true);
    expect(isSourceWorkspaceRoute(`${SOURCE_BASE}/`)).toBe(true);
    expect(isSourceWorkspaceRoute(SOURCE_ROUTES.repositories)).toBe(true);
    expect(isSourceWorkspaceRoute(SOURCE_ROUTES.repository("repo-1"))).toBe(true);
    expect(isSourceWorkspaceRoute(SOURCE_ROUTES.repositoryReview("repo-1"))).toBe(true);
    expect(isSourceWorkspaceRoute(SOURCE_ROUTES.change("chg-1"))).toBe(true);
    expect(isSourceWorkspaceRoute("/workspace/qep/scm")).toBe(false);
  });

  it("parses repository ids and modes", () => {
    expect(parseSourceRepositoryId(SOURCE_ROUTES.repository("abc"))).toBe("abc");
    expect(parseSourceRepositoryId(SOURCE_ROUTES.home)).toBeNull();
    expect(parseSourceRepositoryMode(SOURCE_ROUTES.repository("abc"))).toBe("files");
    expect(parseSourceRepositoryMode(SOURCE_ROUTES.repositoryReview("abc"))).toBe(
      "review",
    );
    expect(parseSourceRepositoryMode(SOURCE_ROUTES.repositoryAdmin("abc"))).toBe(
      "admin",
    );
    expect(parseSourceChangeId(SOURCE_ROUTES.change("chg-9"))).toBe("chg-9");
    expect(parseSourceChangeId(SOURCE_ROUTES.home)).toBeNull();
  });
});
