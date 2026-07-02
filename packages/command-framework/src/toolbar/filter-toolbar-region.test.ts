import { describe, expect, it } from "vitest";

import type { ActionToolbarRegionDto } from "../server/map-action-registry-dto";
import {
  DEFAULT_TOOLBAR_ITEM_ORDER,
  filterToolbarRegionItems,
  findToolbarRegion,
  sortToolbarItems,
} from "./filter-toolbar-region";

const regions: readonly ActionToolbarRegionDto[] = [
  {
    region: "workspace",
    items: [
      { commandId: "b.action", order: 20 },
      { commandId: "a.action", order: 10 },
      { commandId: "c.action" },
    ],
  },
  {
    region: "header",
    items: [{ commandId: "header.action" }],
  },
];

describe("filterToolbarRegionItems", () => {
  it("returns sorted items for a matching region", () => {
    expect(
      filterToolbarRegionItems(regions, "workspace").map((item) => item.commandId),
    ).toEqual(["a.action", "b.action", "c.action"]);
  });

  it("returns empty array when region is missing", () => {
    expect(filterToolbarRegionItems(regions, "sidebar")).toEqual([]);
  });
});

describe("findToolbarRegion", () => {
  it("finds region by id", () => {
    expect(findToolbarRegion(regions, "header")?.items[0]?.commandId).toBe(
      "header.action",
    );
  });
});

describe("sortToolbarItems", () => {
  it("uses default order when omitted", () => {
    const sorted = sortToolbarItems([{ commandId: "z" }, { commandId: "a", order: 5 }]);
    expect(sorted.map((item) => item.commandId)).toEqual(["a", "z"]);
    expect(DEFAULT_TOOLBAR_ITEM_ORDER).toBe(100);
  });
});
