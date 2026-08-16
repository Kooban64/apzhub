import { describe, expect, it } from "vitest";

import { filterByEntitledProducts, isSurfaceEntitled } from "./surface-entitlements";

describe("surface entitlements", () => {
  it("allows Support Agent products and denies Projects/QEP", () => {
    const allowed = new Set(["support", "time", "knowledge"]);
    expect(isSurfaceEntitled("support", allowed)).toBe(true);
    expect(isSurfaceEntitled("time", allowed)).toBe(true);
    expect(isSurfaceEntitled("knowledge", allowed)).toBe(true);
    expect(isSurfaceEntitled("projects", allowed)).toBe(false);
    expect(isSurfaceEntitled("qep", allowed)).toBe(false);
  });

  it("filters quick-action shaped descriptors", () => {
    const filtered = filterByEntitledProducts(
      [
        { productId: "support", id: "a" },
        { productId: "projects", id: "b" },
        { productId: "qep", id: "c" },
        { productId: "time", id: "d" },
      ],
      new Set(["support", "time", "knowledge"]),
    );
    expect(filtered.map((i) => i.id)).toEqual(["a", "d"]);
  });

  it("treats documents search surface as Knowledge when knowledge is entitled", () => {
    expect(isSurfaceEntitled("documents", new Set(["knowledge"]))).toBe(true);
  });
});
