/**
 * Workflow Approval Executor — uses APZ Workflow platform runtime for HITL approvals.
 * Projects never implements its own approval decision engine.
 */

import {
  asWorkflowId,
  type WorkflowPlatformServiceContext,
} from "@apzhub/workflow-contracts";

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import {
  createWorkflowPlatformServicesForTest,
  type WorkflowPlatformServicesBundle,
} from "../workflow/create-workflow-platform-services";
import { createMockWorkflowOpsProvider } from "../workflow/n8n-ops-provider";

import type { WorkflowApprovalExecutor } from "./types";

const PROJECTS_APPROVAL_WORKFLOW_ID = asWorkflowId("wf_projects_approval");

function toWorkflowCtx(ctx: ServiceRequestContext): WorkflowPlatformServiceContext {
  const base = ctx.permissions ?? [];
  const elevated = base.includes("workflow.*")
    ? base
    : [
        ...base,
        "workflow.*",
        "workflow.view",
        "workflow.runs.start",
        "workflow.tasks.view",
        "workflow.tasks.approve",
        "workflow.tasks.claim",
        "workflow.tasks.complete",
      ];
  return {
    tenantId: ctx.tenantId ?? "default",
    organisationId: ctx.organisationId,
    userId: ctx.userId ?? "system",
    correlationId: ctx.correlationId ?? `corr_${Date.now()}`,
    permissions: elevated,
  };
}

export function createInProcessWorkflowApprovalExecutor(
  bundle?: WorkflowPlatformServicesBundle,
): WorkflowApprovalExecutor {
  const runtime =
    bundle ??
    createWorkflowPlatformServicesForTest({
      allowInMemoryPersistence: true,
      ops: createMockWorkflowOpsProvider({ providerExecuteSupported: true }),
    });

  return {
    async health() {
      return {
        available: true,
        providerId: runtime.readiness.opsProviderId,
      };
    },

    async startApproval(ctx, input) {
      const wctx = toWorkflowCtx(ctx);
      try {
        const run = await runtime.gatewaySurface.runs.start(wctx, {
          workflowId: PROJECTS_APPROVAL_WORKFLOW_ID,
          correlationId: wctx.correlationId,
          input: {
            values: {
              source: "apz_projects",
              kind: input.kind,
              projectId: input.projectId,
              subjectType: input.subjectType,
              subjectId: input.subjectId,
              title: input.title,
              reason: input.reason,
            },
          },
        });
        if (run.status === "failed") {
          return {
            available: false,
            reason: run.error?.message ?? "Workflow run failed — approvals unavailable",
          };
        }
        const task = await runtime.runtime.tasks.seedTask(wctx, {
          runId: run.id,
          kind: "approval",
          title: input.title,
        });
        return {
          available: true,
          runId: run.id,
          taskId: task.id,
          providerId: runtime.readiness.opsProviderId,
        };
      } catch (err) {
        return {
          available: false,
          reason:
            err instanceof Error
              ? err.message
              : "Workflow executor error — approvals unavailable",
        };
      }
    },

    async readDecision(ctx, taskId) {
      const wctx = toWorkflowCtx(ctx);
      try {
        const task = await runtime.gatewaySurface.approvals.get(wctx, taskId as never);
        if (task.decision === "approved" || task.status === "approved") {
          return "approved";
        }
        if (task.decision === "rejected" || task.status === "rejected") {
          return "rejected";
        }
        return "pending";
      } catch {
        return null;
      }
    },

    async decide(ctx, taskId, outcome, comment) {
      const wctx = toWorkflowCtx(ctx);
      if (outcome === "approved") {
        const task = await runtime.gatewaySurface.approvals.approve(wctx, {
          taskId: taskId as never,
          comment,
        });
        return task.decision === "rejected" ? "rejected" : "approved";
      }
      const task = await runtime.gatewaySurface.approvals.reject(wctx, {
        taskId: taskId as never,
        comment,
      });
      return task.decision === "approved" ? "approved" : "rejected";
    },
  };
}

export function createUnavailableWorkflowApprovalExecutor(
  reason = "APZ Workflow runtime not configured",
): WorkflowApprovalExecutor {
  return {
    async health() {
      return { available: false, reason };
    },
    async startApproval() {
      return { available: false, reason };
    },
    async readDecision() {
      return null;
    },
    async decide() {
      throw new Error("workflow_approvals_unavailable");
    },
  };
}
