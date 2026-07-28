/**
 * In-memory Workflow runtime registry (APZHUB-PLATFORM-WORKFLOW-004 MVP).
 * Platform metadata for runs/schedules/tasks — not a provider SoR.
 */

import type {
  WorkflowNotification,
  WorkflowPlatformServiceContext,
  WorkflowRun,
  WorkflowRunStep,
  WorkflowSchedule,
  WorkflowTask,
  WorkflowTriggerBinding,
  WorkflowId,
  WorkflowTaskId,
  WorkflowTriggerId,
  WorkflowNotificationId,
} from "@apzhub/workflow-contracts";

import { workflowNotFoundError } from "./workflow-runtime-errors";
import type { WorkflowRuntimeRegistry } from "./workflow-runtime-types";

function tenantKey(ctx: WorkflowPlatformServiceContext, id: string): string {
  return `${ctx.tenantId}::${id}`;
}

export function createInMemoryWorkflowRuntimeRegistry(): WorkflowRuntimeRegistry {
  const runs = new Map<string, WorkflowRun>();
  const steps = new Map<string, readonly WorkflowRunStep[]>();
  const schedules = new Map<string, WorkflowSchedule>();
  const triggers = new Map<string, WorkflowTriggerBinding>();
  const tasks = new Map<string, WorkflowTask>();
  const notifications = new Map<string, WorkflowNotification>();

  return {
    async createRun(ctx, run) {
      runs.set(tenantKey(ctx, run.id), run);
      steps.set(tenantKey(ctx, run.id), []);
      return run;
    },
    async getRun(ctx, runId) {
      return runs.get(tenantKey(ctx, runId)) ?? null;
    },
    async listRuns(ctx, filter) {
      return [...runs.values()].filter((r) => {
        if (r.tenantId !== ctx.tenantId) return false;
        if (filter?.workflowId && r.workflowId !== filter.workflowId) return false;
        if (filter?.status && r.status !== filter.status) return false;
        return true;
      });
    },
    async updateRun(ctx, runId, patch) {
      const key = tenantKey(ctx, runId);
      const existing = runs.get(key);
      if (!existing) {
        throw workflowNotFoundError(ctx.correlationId, "WorkflowRun", runId);
      }
      const updated: WorkflowRun = {
        ...existing,
        ...patch,
        id: existing.id,
        tenantId: existing.tenantId,
        updatedAt: patch.updatedAt ?? new Date().toISOString(),
      };
      runs.set(key, updated);
      return updated;
    },
    async listSteps(ctx, runId) {
      return steps.get(tenantKey(ctx, runId)) ?? [];
    },
    async setSteps(ctx, runId, next) {
      steps.set(tenantKey(ctx, runId), next);
    },

    async createSchedule(ctx, schedule) {
      schedules.set(tenantKey(ctx, schedule.id), schedule);
      return schedule;
    },
    async getSchedule(ctx, scheduleId) {
      return schedules.get(tenantKey(ctx, scheduleId)) ?? null;
    },
    async listSchedules(ctx, workflowId?: WorkflowId) {
      return [...schedules.values()].filter((s) => {
        if (s.tenantId !== ctx.tenantId) return false;
        if (workflowId && s.workflowId !== workflowId) return false;
        return true;
      });
    },
    async updateSchedule(ctx, scheduleId, patch) {
      const key = tenantKey(ctx, scheduleId);
      const existing = schedules.get(key);
      if (!existing) {
        throw workflowNotFoundError(ctx.correlationId, "WorkflowSchedule", scheduleId);
      }
      const updated: WorkflowSchedule = {
        ...existing,
        ...patch,
        id: existing.id,
        tenantId: existing.tenantId,
        updatedAt: patch.updatedAt ?? new Date().toISOString(),
      };
      schedules.set(key, updated);
      return updated;
    },

    async createTriggerBinding(ctx, binding) {
      triggers.set(tenantKey(ctx, binding.id), binding);
      return binding;
    },
    async getTriggerBinding(ctx, triggerId: WorkflowTriggerId) {
      return triggers.get(tenantKey(ctx, triggerId)) ?? null;
    },

    async createTask(ctx, task) {
      tasks.set(tenantKey(ctx, task.id), task);
      return task;
    },
    async getTask(ctx, taskId: WorkflowTaskId) {
      return tasks.get(tenantKey(ctx, taskId)) ?? null;
    },
    async listTasks(ctx, filter) {
      return [...tasks.values()].filter((t) => {
        if (t.tenantId !== ctx.tenantId) return false;
        if (filter?.runId && t.runId !== filter.runId) return false;
        if (
          filter?.assigneePrincipalId &&
          t.assigneePrincipalId !== filter.assigneePrincipalId
        ) {
          return false;
        }
        if (filter?.status && t.status !== filter.status) return false;
        if (filter?.kind && t.kind !== filter.kind) return false;
        return true;
      });
    },
    async updateTask(ctx, taskId, patch) {
      const key = tenantKey(ctx, taskId);
      const existing = tasks.get(key);
      if (!existing) {
        throw workflowNotFoundError(ctx.correlationId, "WorkflowTask", taskId);
      }
      const updated: WorkflowTask = {
        ...existing,
        ...patch,
        id: existing.id,
        tenantId: existing.tenantId,
        updatedAt: patch.updatedAt ?? new Date().toISOString(),
      };
      tasks.set(key, updated);
      return updated;
    },

    async createNotification(ctx, notification) {
      notifications.set(tenantKey(ctx, notification.id), notification);
      return notification;
    },
    async getNotification(ctx, notificationId: WorkflowNotificationId) {
      return notifications.get(tenantKey(ctx, notificationId)) ?? null;
    },
    async listNotifications(ctx) {
      return [...notifications.values()].filter((n) => n.tenantId === ctx.tenantId);
    },
  };
}
