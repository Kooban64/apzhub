import { randomUUID } from "node:crypto";

import type {
  ApplyProjectsApprovalOutcomeInput,
  ProjectsApprovalBinding,
  RequestProjectsApprovalInput,
  ServiceRequestContext,
} from "@apzhub/platform-service-contracts";

import { resolveProjectsWorkflowBridgeStore } from "./memory-store";
import type {
  ProjectsWorkflowBridge,
  ProjectsWorkflowBridgeStore,
  WorkflowApprovalExecutor,
} from "./types";
import {
  createInProcessWorkflowApprovalExecutor,
  createUnavailableWorkflowApprovalExecutor,
} from "./workflow-executor";

function id(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}

function tenant(ctx: ServiceRequestContext) {
  return ctx.tenantId ?? "default";
}

function actor(ctx: ServiceRequestContext) {
  return ctx.impersonation?.actorUserId || ctx.userId || "system";
}

/** Injected by API gateway bootstrap when Workflow production bundle is ready. */
let runtimeExecutor: WorkflowApprovalExecutor | undefined;

export function setProjectsWorkflowBridgeRuntimeExecutor(
  executor: WorkflowApprovalExecutor | undefined,
): void {
  runtimeExecutor = executor;
}

export function getProjectsWorkflowBridgeRuntimeExecutor():
  WorkflowApprovalExecutor | undefined {
  return runtimeExecutor;
}

function preferInProcessExecutor(explicit?: boolean): boolean {
  if (explicit === true) return true;
  if (explicit === false) return false;
  if (process.env.APZHUB_PROJECTS_WORKFLOW_BRIDGE_INPROCESS === "true") return true;
  if (process.env.APZHUB_PROJECTS_WORKFLOW_BRIDGE_INPROCESS === "false") return false;
  // Production without a gateway-injected executor fails closed.
  // Dev / test keep in-process HITL so local gates remain executable.
  return process.env.NODE_ENV !== "production";
}

export type CreateProjectsWorkflowBridgeInput = {
  readonly store?: ProjectsWorkflowBridgeStore;
  readonly executor?: WorkflowApprovalExecutor;
  /**
   * When true, use in-process Workflow HITL runtime (tests / local only).
   * Production injects a gateway-backed executor via setProjectsWorkflowBridgeRuntimeExecutor.
   */
  readonly useInProcessWorkflow?: boolean;
};

export function createProjectsWorkflowBridge(
  input: CreateProjectsWorkflowBridgeInput = {},
): ProjectsWorkflowBridge {
  const store = resolveProjectsWorkflowBridgeStore(input.store);
  const executor =
    input.executor ??
    runtimeExecutor ??
    (preferInProcessExecutor(input.useInProcessWorkflow)
      ? createInProcessWorkflowApprovalExecutor()
      : createUnavailableWorkflowApprovalExecutor());

  const service: ProjectsWorkflowBridge = {
    async health(ctx) {
      return executor.health(ctx);
    },

    async requestApproval(ctx, request: RequestProjectsApprovalInput) {
      const existing = await store.findOpenForSubject(
        tenant(ctx),
        request.projectId,
        request.subjectType,
        request.subjectId,
        request.kind,
      );
      if (existing) return existing;

      const now = new Date().toISOString();
      const started = await executor.startApproval(ctx, {
        kind: request.kind,
        projectId: request.projectId,
        subjectType: request.subjectType,
        subjectId: request.subjectId,
        title: request.title,
        reason: request.reason,
        assigneePrincipalId: request.assigneePrincipalId,
      });

      const binding: ProjectsApprovalBinding = Object.freeze({
        id: id("pab"),
        kind: request.kind,
        projectId: request.projectId,
        subjectType: request.subjectType,
        subjectId: request.subjectId,
        title: request.title.trim(),
        reason: request.reason?.trim() || undefined,
        status: started.available ? "pending" : "unavailable",
        workflowRunId: started.available ? started.runId : undefined,
        workflowTaskId: started.available ? started.taskId : undefined,
        workflowUnavailableReason: started.available ? undefined : started.reason,
        requestedBy: actor(ctx),
        createdAt: now,
        updatedAt: now,
      });
      return store.upsert(tenant(ctx), binding);
    },

    async getBinding(ctx, bindingId) {
      return store.get(tenant(ctx), bindingId);
    },

    async listBindings(ctx, projectId) {
      return store.listForProject(tenant(ctx), projectId);
    },

    async hasApproved(ctx, projectId, kind, subjectType, subjectId) {
      // Sync-before-gate: pull Workflow decision before evaluating approval.
      const open = await store.findOpenForSubject(
        tenant(ctx),
        projectId,
        subjectType,
        subjectId,
        kind,
      );
      if (open) {
        await service.syncFromWorkflow(ctx, open.id);
      }
      const latest = await store.findLatestForSubject(
        tenant(ctx),
        projectId,
        subjectType,
        subjectId,
        kind,
      );
      return latest?.status === "approved";
    },

    async applyOutcome(ctx, bindingId, input: ApplyProjectsApprovalOutcomeInput) {
      const current = await store.get(tenant(ctx), bindingId);
      if (!current) throw new Error("projects_approval_binding_not_found");
      if (
        current.status === "approved" ||
        current.status === "rejected" ||
        current.status === "cancelled"
      ) {
        return current;
      }

      let outcome = input.outcome;
      if (
        current.workflowTaskId &&
        (outcome === "approved" || outcome === "rejected")
      ) {
        try {
          outcome = await executor.decide(
            ctx,
            current.workflowTaskId,
            outcome,
            input.comment,
          );
        } catch {
          /* Projects may record outcome when Workflow task already decided */
        }
      }

      const now = new Date().toISOString();
      const next: ProjectsApprovalBinding = Object.freeze({
        ...current,
        status: outcome,
        decidedBy: actor(ctx),
        decidedAt: now,
        comment: input.comment?.trim() || undefined,
        workflowTaskId: input.workflowTaskId ?? current.workflowTaskId,
        updatedAt: now,
      });
      return store.upsert(tenant(ctx), next);
    },

    async syncFromWorkflow(ctx, bindingId) {
      const current = await store.get(tenant(ctx), bindingId);
      if (!current?.workflowTaskId) return current;
      const decision = await executor.readDecision(ctx, current.workflowTaskId);
      if (!decision || decision === "pending") return current;
      return service.applyOutcome(ctx, bindingId, { outcome: decision });
    },
  };

  return service;
}

export {
  getMemoryProjectsWorkflowBridgeStore,
  resetProjectsWorkflowBridgeStoreForTests,
  setProjectsWorkflowBridgeStoreForTests,
  resolveProjectsWorkflowBridgeStore,
} from "./memory-store";
