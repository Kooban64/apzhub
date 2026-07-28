import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("workflow navigation registration", () => {
  it("registers workbench activity bar and sidebar routes in module.yaml", () => {
    const manifest = readFileSync(
      join(process.cwd(), "services/workflow/manifests/workflow/module.yaml"),
      "utf8",
    );
    expect(manifest).toContain("workspace: workflow");
    expect(manifest).toContain("route: /workspace/workflow");
    expect(manifest).toContain("level: activity-bar");
    expect(manifest).toContain("permission: workflow.view");
    for (const path of [
      "/workspace/workflow/definitions",
      "/workspace/workflow/runs",
      "/workspace/workflow/schedules",
      "/workspace/workflow/tasks",
      "/workspace/workflow/approvals",
      "/workspace/workflow/notifications",
      "/workspace/workflow/search",
      "/workspace/workflow/health",
      "/workspace/workflow/diagnostics",
      "/workspace/workflow/capabilities",
    ]) {
      expect(manifest).toContain(path);
    }
  });

  it("registers sidebar child manifests", () => {
    const child = readFileSync(
      join(process.cwd(), "services/workflow/manifests/workflow-runs/module.yaml"),
      "utf8",
    );
    expect(child).toContain("level: sidebar");
    expect(child).toContain("parent: workflow");
    expect(child).toContain("/workspace/workflow/runs");
  });

  it("mounts WorkflowWorkspaceRouter from WorkbenchPage", () => {
    const page = readFileSync(
      join(process.cwd(), "apps/web/components/workbench-page.tsx"),
      "utf8",
    );
    expect(page).toContain("WorkflowWorkspaceRouter");
    expect(page).toContain("isWorkflowRoute");
  });
});
