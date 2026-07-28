import { describe, expect, it } from "vitest";

import {
  WORKFLOW_BASE,
  isWorkflowRoute,
  resolveWorkflowRoute,
  workflowDefinitionDetailPath,
  workflowHomePath,
  workflowRunDetailPath,
} from "./routes";

describe("workflow workbench routes", () => {
  it("identifies workspace paths", () => {
    expect(WORKFLOW_BASE).toBe("/workspace/workflow");
    expect(isWorkflowRoute("/workspace/workflow")).toBe(true);
    expect(isWorkflowRoute("/workspace/workflow/runs")).toBe(true);
    expect(isWorkflowRoute("/workspace/workflows")).toBe(false);
    expect(isWorkflowRoute("/workspace/workflow-engine")).toBe(false);
  });

  it("resolves owner view routes", () => {
    expect(resolveWorkflowRoute("/workspace/workflow")).toEqual({ kind: "home" });
    expect(resolveWorkflowRoute("/workspace/workflow/definitions")).toEqual({
      kind: "definitions",
    });
    expect(resolveWorkflowRoute("/workspace/workflow/definitions/wf_1")).toEqual({
      kind: "definition-detail",
      definitionId: "wf_1",
    });
    expect(resolveWorkflowRoute("/workspace/workflow/runs/run_1")).toEqual({
      kind: "run-detail",
      runId: "run_1",
    });
    expect(resolveWorkflowRoute("/workspace/workflow/schedules/sch_1")).toEqual({
      kind: "schedule-detail",
      scheduleId: "sch_1",
    });
    expect(resolveWorkflowRoute("/workspace/workflow/tasks/tsk_1")).toEqual({
      kind: "task-detail",
      taskId: "tsk_1",
    });
    expect(resolveWorkflowRoute("/workspace/workflow/approvals/apr_1")).toEqual({
      kind: "approval-detail",
      approvalId: "apr_1",
    });
    expect(resolveWorkflowRoute("/workspace/workflow/notifications").kind).toBe(
      "notifications",
    );
    expect(resolveWorkflowRoute("/workspace/workflow/health").kind).toBe("health");
    expect(resolveWorkflowRoute("/workspace/workflow/diagnostics").kind).toBe(
      "diagnostics",
    );
    expect(resolveWorkflowRoute("/workspace/workflow/capabilities").kind).toBe(
      "capabilities",
    );
    expect(resolveWorkflowRoute("/workspace/workflow/search").kind).toBe("search");
  });

  it("builds deep-link helpers", () => {
    expect(workflowHomePath()).toBe("/workspace/workflow");
    expect(workflowDefinitionDetailPath("wf_1")).toBe(
      "/workspace/workflow/definitions/wf_1",
    );
    expect(workflowRunDetailPath("run_1")).toBe("/workspace/workflow/runs/run_1");
  });
});
