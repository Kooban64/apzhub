import { describe, expect, it } from "vitest";

import { OfflineSourceWorkspace } from "./providers/offline-workspace";

describe("Phase E Shared Source content/write", () => {
  it("offline workspace supports tree, file, branch, commit, pr", () => {
    const ws = new OfflineSourceWorkspace();
    const tree = ws.listTree("apzor/apzhub");
    expect(tree.some((e) => e.path === "README.md")).toBe(true);
    expect(tree.some((e) => e.path === "src/app.ts")).toBe(true);

    const file = ws.getFileContent("apzor/apzhub", { path: "README.md" });
    expect(file?.content).toContain("Shared Source");

    const branch = ws.createBranch("apzor/apzhub", {
      name: "feature/phase-e",
      fromRef: "main",
    });
    expect(branch.name).toBe("feature/phase-e");

    const commit = ws.commitFiles("apzor/apzhub", {
      branch: "feature/phase-e",
      message: "docs: tweak readme",
      files: [{ path: "README.md", content: "# Updated\n" }],
    });
    expect(commit.message).toContain("tweak");

    const updated = ws.getFileContent("apzor/apzhub", {
      path: "README.md",
      branch: "feature/phase-e",
    });
    expect(updated?.content).toBe("# Updated\n");

    const diff = ws.getFileDiff("apzor/apzhub", {
      path: "README.md",
      baseRef: "main",
      headRef: "feature/phase-e",
    });
    expect(diff?.status).toBe("modified");
    expect(diff?.patch).toContain("+ # Updated");

    const pr = ws.createPullRequest("apzor/apzhub", {
      title: "Phase E demo",
      sourceBranch: "feature/phase-e",
      targetBranch: "main",
    });
    expect(pr.number).toBe(1);

    const merged = ws.mergePullRequest("apzor/apzhub", { number: 1 });
    expect(merged.state).toBe("merged");

    const hits = ws.searchFiles("apzor/apzhub", { query: "greet" });
    expect(hits.some((hit) => hit.path === "src/app.ts")).toBe(true);
  });
});
