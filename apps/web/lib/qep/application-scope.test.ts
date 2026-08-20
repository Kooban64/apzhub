import { describe, expect, it } from "vitest";

import {
  filterApplicationsByScope,
  resolveQepApplicationScope,
} from "./application-scope";

describe("resolveQepApplicationScope", () => {
  it("is unrestricted when no application grants exist", () => {
    const scope = resolveQepApplicationScope(["qep.portfolio.read"]);
    expect(scope.mode).toBe("unrestricted");
  });

  it("filters to granted application ids", () => {
    const scope = resolveQepApplicationScope([
      "qep.portfolio.read",
      "qep.application:app_a",
    ]);
    expect(scope).toEqual({ mode: "scoped", resourceIds: ["app_a"] });
    expect(
      filterApplicationsByScope([{ id: "app_a" }, { id: "app_b" }], scope).map(
        (row) => row.id,
      ),
    ).toEqual(["app_a"]);
  });
});
