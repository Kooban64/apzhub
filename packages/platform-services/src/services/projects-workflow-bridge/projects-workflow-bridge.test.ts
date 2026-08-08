import { beforeEach, describe, expect, it } from "vitest";

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import {
  createProjectsWorkflowBridge,
  resetProjectsWorkflowBridgeStoreForTests,
  setProjectsWorkflowBridgeRuntimeExecutor,
} from "./create-projects-workflow-bridge";
import {
  getMemoryProjectsWorkflowBridgeStore,
  setProjectsWorkflowBridgeStoreForTests,
} from "./memory-store";

function ctx(): ServiceRequestContext {
  return {
    tenantId: "tenant_pwb",
    userId: "user_pm",
    organisationId: "org_pwb",
    correlationId: "corr_pwb",
    permissions: ["projects.*", "workflow.*"],
  };
}

describe("Projects Workflow Bridge (P1)", () => {
  beforeEach(() => {
    resetProjectsWorkflowBridgeStoreForTests();
    setProjectsWorkflowBridgeStoreForTests(getMemoryProjectsWorkflowBridgeStore());
    setProjectsWorkflowBridgeRuntimeExecutor(undefined);
  });

  it("requests hold approval via Workflow and consumes approve outcome", async () => {
    const bridge = createProjectsWorkflowBridge({
      useInProcessWorkflow: true,
      store: getMemoryProjectsWorkflowBridgeStore(),
    });
    const binding = await bridge.requestApproval(ctx(), {
      kind: "hold_approval",
      projectId: "prj_1",
      subjectType: "lifecycle_transition",
      subjectId: "active->on_hold",
      title: "Approve project hold",
      reason: "Customer freeze",
    });
    expect(binding.status).toBe("pending");
    expect(binding.workflowRunId).toBeTruthy();
    expect(binding.workflowTaskId).toBeTruthy();

    const approved = await bridge.applyOutcome(ctx(), binding.id, {
      outcome: "approved",
      comment: "Agreed",
    });
    expect(approved.status).toBe("approved");
    expect(
      await bridge.hasApproved(
        ctx(),
        "prj_1",
        "hold_approval",
        "lifecycle_transition",
        "active->on_hold",
      ),
    ).toBe(true);
  });

  it("idempotently returns open binding for same subject", async () => {
    const bridge = createProjectsWorkflowBridge({ useInProcessWorkflow: true });
    const a = await bridge.requestApproval(ctx(), {
      kind: "closure_approval",
      projectId: "prj_1",
      subjectType: "project",
      subjectId: "prj_1",
      title: "Approve closure",
    });
    const b = await bridge.requestApproval(ctx(), {
      kind: "closure_approval",
      projectId: "prj_1",
      subjectType: "project",
      subjectId: "prj_1",
      title: "Approve closure again",
    });
    expect(b.id).toBe(a.id);
  });

  it("supports checkpoint and exception approval kinds", async () => {
    const bridge = createProjectsWorkflowBridge({ useInProcessWorkflow: true });
    const checkpoint = await bridge.requestApproval(ctx(), {
      kind: "checkpoint_approval",
      projectId: "prj_1",
      subjectType: "checkpoint",
      subjectId: "cp_1",
      title: "Go-live approval",
    });
    const exception = await bridge.requestApproval(ctx(), {
      kind: "exception_approval",
      projectId: "prj_1",
      subjectType: "exception",
      subjectId: "ex_1",
      title: "Approve exception conclusion",
    });
    expect(checkpoint.kind).toBe("checkpoint_approval");
    expect(exception.kind).toBe("exception_approval");
    expect(checkpoint.status).toBe("pending");
  });

  it("records unavailable when executor cannot start Workflow", async () => {
    const bridge = createProjectsWorkflowBridge({
      useInProcessWorkflow: false,
    });
    const binding = await bridge.requestApproval(ctx(), {
      kind: "governance_approval",
      projectId: "prj_1",
      subjectType: "baseline",
      subjectId: "base_1",
      title: "Re-baseline approval",
    });
    expect(binding.status).toBe("unavailable");
    expect(binding.workflowUnavailableReason).toBeTruthy();
  });
});
