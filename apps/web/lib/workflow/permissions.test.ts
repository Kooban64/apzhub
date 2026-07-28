import { describe, expect, it } from "vitest";

import {
  canApproveWorkflowTasks,
  canStartWorkflowRuns,
  canViewWorkflowDefinitions,
  canViewWorkflowRuns,
  hasWorkflowPermission,
} from "./permissions";

describe("workflow workbench permissions", () => {
  it("honours wildcards and catalogue keys", () => {
    expect(hasWorkflowPermission(["workflow.*"], "workflow.runs.start")).toBe(true);
    expect(hasWorkflowPermission(["workflow.view"], "workflow.runs.view")).toBe(true);
    expect(hasWorkflowPermission(["workflow.runs.view"], "workflow.runs.start")).toBe(
      false,
    );
    expect(canViewWorkflowDefinitions(["workflow.view"])).toBe(true);
    expect(canViewWorkflowRuns(["workflow.runs.view"])).toBe(true);
    expect(canStartWorkflowRuns(["workflow.runs.start"])).toBe(true);
    expect(canApproveWorkflowTasks(["workflow.tasks.approve"])).toBe(true);
  });
});
