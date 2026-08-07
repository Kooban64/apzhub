import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("APZ Projects navigation registration", () => {
  it("registers native chrome including help/settings and APZ Projects title", () => {
    const root = join(process.cwd(), "services/projects/manifests");
    const parent = readFileSync(join(root, "projects/module.yaml"), "utf8");
    const help = readFileSync(join(root, "projects-help/module.yaml"), "utf8");
    const settings = readFileSync(join(root, "projects-settings/module.yaml"), "utf8");
    const health = readFileSync(join(root, "projects-health/module.yaml"), "utf8");

    expect(parent).toContain("workspace: projects");
    expect(parent).toContain("route: /workspace/projects");
    expect(parent).toContain("title: APZ Projects");
    expect(parent).toContain("engineBranding: hidden");
    expect(parent).toContain("label: Operational Workspace");
    // W002 D18 — Search precedes demoted entity tools
    const workspaceIdx = parent.indexOf("id: projects.dashboard");
    const searchIdx = parent.indexOf("id: projects.search");
    const tasksIdx = parent.indexOf("id: projects.tasks");
    expect(workspaceIdx).toBeGreaterThanOrEqual(0);
    expect(searchIdx).toBeGreaterThan(workspaceIdx);
    expect(tasksIdx).toBeGreaterThan(searchIdx);
    expect(help).toContain("/workspace/projects/help");
    expect(settings).toContain("/workspace/projects/settings");
    expect(health).toContain("permission: projects.admin");
  });

  it("mounts ProjectsWorkspaceRouter from WorkbenchPage", () => {
    const page = readFileSync(
      join(process.cwd(), "apps/web/components/workbench-page.tsx"),
      "utf8",
    );
    expect(page).toContain("ProjectsWorkspaceRouter");
    expect(page).toContain("isProjectsRoute");
  });
});
