import { describe, expect, it } from "vitest";

import { findDependencyCyclePath, hasDependencyCycle } from "./cycle-detection";

describe("cycle detection", () => {
  it("reports no cycle for a DAG", () => {
    const graph = {
      nodes: ["a", "b", "c"],
      edges: [
        { from: "a", to: "b", axis: "services" as const },
        { from: "b", to: "c", axis: "services" as const },
      ],
    };

    expect(hasDependencyCycle(graph)).toBe(false);
    expect(findDependencyCyclePath(graph, "a")).toEqual(["a"]);
  });

  it("detects cycles and explores dead-end branches", () => {
    const graph = {
      nodes: ["a", "b", "c", "d"],
      edges: [
        { from: "d", to: "b", axis: "modules" as const },
        { from: "b", to: "a", axis: "modules" as const },
        { from: "c", to: "a", axis: "modules" as const },
        { from: "a", to: "c", axis: "modules" as const },
      ],
    };

    expect(hasDependencyCycle(graph)).toBe(true);
    const cycle = findDependencyCyclePath(graph, "a");
    expect(cycle.length).toBeGreaterThan(1);
    expect(cycle[0]).toBe(cycle.at(-1));
  });

  it("returns start node when adjacency is empty", () => {
    const graph = { nodes: ["solo"], edges: [] };
    expect(findDependencyCyclePath(graph, "solo")).toEqual(["solo"]);
  });

  it("skips already visited nodes on alternate branches", () => {
    const graph = {
      nodes: ["a", "b", "c", "d"],
      edges: [
        { from: "a", to: "b", axis: "services" as const },
        { from: "a", to: "c", axis: "services" as const },
        { from: "b", to: "d", axis: "services" as const },
        { from: "c", to: "d", axis: "services" as const },
      ],
    };

    expect(findDependencyCyclePath(graph, "a")).toEqual(["a"]);
  });

  it("reports cycle presence for unsortable graphs", () => {
    const graph = {
      nodes: ["x", "y"],
      edges: [
        { from: "x", to: "y", axis: "modules" as const },
        { from: "y", to: "x", axis: "modules" as const },
      ],
    };

    expect(hasDependencyCycle(graph)).toBe(true);
  });
});
