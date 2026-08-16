import { describe, expect, it } from "vitest";

import { buildSourceFileTree, flattenSourceFileTree } from "./file-tree";

describe("source file tree", () => {
  it("nests directories and sorts dirs before files", () => {
    const tree = buildSourceFileTree([
      "apps/web/page.tsx",
      "apps/web/lib/util.ts",
      "README.md",
      "apps/api/route.ts",
    ]);
    expect(tree.map((n) => n.name)).toEqual(["apps", "README.md"]);
    expect(tree[0]?.children.map((n) => n.name)).toEqual(["api", "web"]);
    expect(
      tree[0]?.children.find((n) => n.name === "web")?.children.map((n) => n.name),
    ).toEqual(["lib", "page.tsx"]);
  });

  it("ignores empty and parent-traversal paths", () => {
    expect(buildSourceFileTree(["", "../x", "/abs/file.ts"]).length).toBe(1);
  });

  it("flattens with depth for list rendering", () => {
    const flat = flattenSourceFileTree(buildSourceFileTree(["a/b/c.ts", "a/d.ts"]));
    expect(flat.map((row) => `${row.depth}:${row.node.path}`)).toEqual([
      "0:a",
      "1:a/b",
      "2:a/b/c.ts",
      "1:a/d.ts",
    ]);
  });
});
