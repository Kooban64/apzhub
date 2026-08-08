import { describe, expect, it } from "vitest";

import { filterByPermissions } from "./permissions";
import { toProductDeepLink } from "./deep-links";
import { listGlobalSearchDescriptors } from "./registry";

describe("Global Search v1", () => {
  it("registers seven product providers", () => {
    expect(listGlobalSearchDescriptors()).toHaveLength(7);
    expect(listGlobalSearchDescriptors().map((p) => p.label)).toEqual([
      "Projects",
      "Support",
      "Workflow",
      "Knowledge",
      "Time",
      "Analytics",
      "QEP",
    ]);
  });

  it("filters hits when required permissions are missing", () => {
    const hits = filterByPermissions(
      [
        {
          id: "1",
          title: "Open",
          productId: "projects",
          href: "/workspace/projects/a",
        },
        {
          id: "2",
          title: "Secret",
          productId: "projects",
          href: "/workspace/projects/b",
          requiredPermissions: ["projects.secret.read"],
        },
      ],
      new Set(["projects.read"]),
    );
    expect(hits.map((hit) => hit.id)).toEqual(["1"]);
  });

  it("never returns external provider URLs", () => {
    expect(toProductDeepLink("https://plane.example/issue/1", "projects")).toBe(
      "/workspace/projects",
    );
    expect(toProductDeepLink("/projects/abc", "projects")).toBe(
      "/workspace/projects/abc",
    );
    expect(toProductDeepLink("/workspace/support/1", "support")).toBe(
      "/workspace/support/1",
    );
  });
});
