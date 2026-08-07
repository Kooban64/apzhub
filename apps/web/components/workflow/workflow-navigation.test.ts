import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("workflow navigation registration (N-03)", () => {
  it("registers a single APZ Workflow activity bar product", () => {
    const manifest = readFileSync(
      join(process.cwd(), "services/workflow/manifests/workflow/module.yaml"),
      "utf8",
    );
    expect(manifest).toContain("workspace: workflow");
    expect(manifest).toContain("route: /workspace/workflow");
    expect(manifest).toContain("level: activity-bar");
    expect(manifest).toContain("label: APZ Workflow");
    expect(manifest).toContain("title: APZ Workflow");
    expect(manifest).toContain("permission: workflow.view");
    expect(manifest).toContain("/workspace/workflow/journeys");
    expect(manifest).toContain("label: Processes");
    expect(manifest).toContain("label: Participants");
    expect(manifest).toContain("label: Journeys");
    expect(manifest).toContain("label: Help");
    expect(manifest).toContain("label: Settings");
    expect(manifest).toContain("label: Operational history");
    expect(manifest).not.toMatch(/^\s+label: Runs$/m);
    expect(manifest).not.toMatch(/^\s+label: Schedules$/m);
  });

  it("does not expose Workflows or Workflow Engine as activity-bar products", () => {
    const workflows = readFileSync(
      join(
        process.cwd(),
        "packages/workbench-framework/manifests/platform-workflows/module.yaml",
      ),
      "utf8",
    );
    const engine = readFileSync(
      join(
        process.cwd(),
        "packages/workbench-framework/manifests/platform-workflow-engine/module.yaml",
      ),
      "utf8",
    );
    expect(workflows).toContain("level: sidebar");
    expect(workflows).toContain("parent: workflow");
    expect(workflows).toContain("label: Process library");
    expect(workflows).not.toContain("level: activity-bar");
    expect(engine).toContain("level: sidebar");
    expect(engine).toContain("parent: workflow");
    expect(engine).toContain("label: Operator tools");
    expect(engine).toContain("permission: workflow.admin");
    expect(engine).not.toContain("level: activity-bar");
    expect(engine).not.toContain("name: Workflow Engine");
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
