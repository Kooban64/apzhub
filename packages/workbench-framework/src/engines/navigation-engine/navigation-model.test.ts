import { describe, expect, it } from "vitest";

import type { NavigationContribution, NavigationItem } from "../../interfaces/types";
import {
  buildNavigationGroups,
  buildNavigationTree,
  compareNavigationOrder,
  findDuplicateNavigationIds,
  resolveDefaultWorkspace,
} from "./navigation-model";

const sampleItems: NavigationItem[] = [
  {
    id: "platform-home",
    capabilityId: "platform-home",
    capabilityKind: "module",
    level: "activity-bar",
    workspace: "home",
    label: "Home",
    order: 10,
    hidden: false,
    visible: true,
    revealed: false,
    children: [],
  },
  {
    id: "platform-home-overview",
    capabilityId: "platform-home-overview",
    capabilityKind: "module",
    level: "sidebar",
    workspace: "home",
    parent: "platform-home",
    label: "Overview",
    order: 10,
    hidden: false,
    visible: true,
    revealed: false,
    children: [],
  },
];

describe("navigation model helpers", () => {
  it("sorts by order then label", () => {
    const left = { order: 10, label: "A", id: "a" };
    const right = { order: 20, label: "B", id: "b" };
    expect(compareNavigationOrder(left, right)).toBeLessThan(0);
  });

  it("finds duplicate navigation ids", () => {
    const contributions: NavigationContribution[] = [
      { ...sampleItems[0]!, hidden: false },
      { ...sampleItems[0]!, capabilityId: "dup", hidden: false },
    ];
    expect(findDuplicateNavigationIds(contributions)).toEqual(["platform-home"]);
  });

  it("groups items by level and workspace", () => {
    const groups = buildNavigationGroups(sampleItems);
    expect(groups.map((group) => group.id)).toEqual([
      "activity-bar:home",
      "sidebar:home",
    ]);
  });

  it("builds tree from parent references", () => {
    const tree = buildNavigationTree(sampleItems);
    expect(tree[0]?.children[0]?.id).toBe("platform-home-overview");
  });

  it("resolves default workspace from first activity bar item", () => {
    expect(resolveDefaultWorkspace(sampleItems)).toBe("home");
  });
});
