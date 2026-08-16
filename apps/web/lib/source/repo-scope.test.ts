import { describe, expect, it } from "vitest";

import {
  filterRepositoriesBySourceScope,
  resolveSourceRepoScope,
  sourceRepoGrantKey,
} from "./repo-scope";

describe("source repo scope", () => {
  it("scopes to granted repositories", () => {
    const scope = resolveSourceRepoScope(["source.read", sourceRepoGrantKey("repo_a")]);
    expect(scope).toEqual({ mode: "scoped", resourceIds: ["repo_a"] });
    expect(
      filterRepositoriesBySourceScope([{ id: "repo_a" }, { id: "repo_b" }], scope),
    ).toEqual([{ id: "repo_a" }]);
  });

  it("unrestricted with source.*", () => {
    expect(resolveSourceRepoScope(["source.*"])).toEqual({ mode: "unrestricted" });
  });
});
