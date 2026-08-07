import { describe, expect, it } from "vitest";

import {
  canAdminWorkflow,
  canApproveWorkflowTasks,
  canStartWorkflowRuns,
  canViewWorkflow,
  canViewWorkflowCapabilities,
  canViewWorkflowDefinitions,
  canViewWorkflowEngine,
  canViewWorkflowHealth,
  canViewWorkflowRuns,
  canViewWorkflowSchedules,
  canViewWorkflowTasks,
  hasWorkflowPermission,
} from "./permissions";

describe("workflow workbench permissions", () => {
  it("denies when source is empty or undefined", () => {
    expect(canViewWorkflow(undefined)).toBe(false);
    expect(canAdminWorkflow([])).toBe(false);
    expect(canViewWorkflowEngine(null)).toBe(false);
  });

  it("honours wildcards and catalogue keys", () => {
    expect(hasWorkflowPermission(["workflow.*"], "workflow.runs.start")).toBe(true);
    expect(canViewWorkflowDefinitions(["workflow.view"])).toBe(true);
    expect(canViewWorkflowRuns(["workflow.runs.view"])).toBe(true);
    expect(canStartWorkflowRuns(["workflow.runs.start"])).toBe(true);
    expect(canApproveWorkflowTasks(["workflow.tasks.approve"])).toBe(true);
  });

  it("does not let workflow.view imply execution or engine surfaces", () => {
    expect(canViewWorkflowRuns(["workflow.view"])).toBe(false);
    expect(canViewWorkflowSchedules(["workflow.view"])).toBe(false);
    expect(canViewWorkflowHealth(["workflow.view"])).toBe(false);
    expect(canViewWorkflowCapabilities(["workflow.view"])).toBe(false);
    expect(canViewWorkflowEngine(["workflow.view"])).toBe(false);
  });

  it("treats tasks/approvals as business-process identity under workflow.view", () => {
    expect(canViewWorkflowTasks(["workflow.view"])).toBe(true);
  });

  it("gates operator surfaces on workflow.admin", () => {
    expect(canAdminWorkflow(["workflow.admin"])).toBe(true);
    expect(canViewWorkflowRuns(["workflow.admin"])).toBe(true);
    expect(canViewWorkflowSchedules(["workflow.admin"])).toBe(true);
    expect(canViewWorkflowHealth(["workflow.admin"])).toBe(true);
    expect(canViewWorkflowEngine(["workflow.admin"])).toBe(true);
    expect(canAdminWorkflow(["workflow.view"])).toBe(false);
  });
});
