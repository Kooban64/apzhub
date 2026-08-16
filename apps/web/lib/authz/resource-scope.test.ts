import { describe, expect, it } from "vitest";

import {
  filterItemsByResourceScope,
  isResourceInScope,
  resolveResourceScope,
  resourceGrantKey,
} from "./resource-scope";

describe("resolveResourceScope", () => {
  it("is unrestricted without scoped grants", () => {
    expect(
      resolveResourceScope(["projects.read"], {
        prefix: "projects.project:",
      }),
    ).toEqual({ mode: "unrestricted" });
  });

  it("scopes when grants present", () => {
    expect(
      resolveResourceScope(
        ["projects.read", resourceGrantKey("projects.project:", "p1")],
        { prefix: "projects.project:" },
      ),
    ).toEqual({ mode: "scoped", resourceIds: ["p1"] });
  });

  it("unrestricted when wildcard present", () => {
    expect(
      resolveResourceScope(
        ["projects.*", resourceGrantKey("projects.project:", "p1")],
        {
          prefix: "projects.project:",
          unrestrictedKeys: ["projects.*"],
        },
      ),
    ).toEqual({ mode: "unrestricted" });
  });
});

describe("filterItemsByResourceScope", () => {
  it("filters to scoped ids", () => {
    const items = [{ id: "a" }, { id: "b" }];
    expect(
      filterItemsByResourceScope(
        items,
        { mode: "scoped", resourceIds: ["a"] },
        (i) => i.id,
      ),
    ).toEqual([{ id: "a" }]);
    expect(isResourceInScope(undefined, { mode: "scoped", resourceIds: ["a"] })).toBe(
      false,
    );
  });
});
