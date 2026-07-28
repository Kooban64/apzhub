/**
 * Workflow runtime ops + registry ports (APZHUB-PLATFORM-WORKFLOW-004).
 * Provider-neutral — n8n DTOs never appear here.
 */

import type {
  WorkflowCapability,
  WorkflowHealth,
  WorkflowInput,
  WorkflowPlatformServiceContext,
  WorkflowProvider,
  WorkflowRun,
  WorkflowRunStep,
  WorkflowSchedule,
  WorkflowTask,
  WorkflowTriggerBinding,
  WorkflowNotification,
  WorkflowId,
  WorkflowRunId,
  WorkflowScheduleId,
  WorkflowTaskId,
  WorkflowVersionId,
  WorkflowTriggerId,
  WorkflowNotificationId,
} from "@apzhub/workflow-contracts";

export type WorkflowExecuteAttemptResult =
  | {
      readonly supported: true;
      readonly providerRef: string;
      readonly status: WorkflowRun["status"];
    }
  | {
      readonly supported: false;
      readonly reason: string;
    };

export type WorkflowOpsProvider = {
  readonly providerId: string;
  readonly providerExecuteSupported: boolean;
  getHealth(ctx: WorkflowPlatformServiceContext): Promise<WorkflowHealth>;
  getReadiness(ctx: WorkflowPlatformServiceContext): Promise<{
    readonly readiness: "ready" | "ready_with_limitations" | "not_ready";
    readonly reasons: readonly string[];
  }>;
  listCapabilities(
    ctx: WorkflowPlatformServiceContext,
  ): Promise<readonly WorkflowCapability[]>;
  listProviders(
    ctx: WorkflowPlatformServiceContext,
  ): Promise<readonly WorkflowProvider[]>;
  tryStartExecution(
    ctx: WorkflowPlatformServiceContext,
    input: {
      readonly workflowId: WorkflowId;
      readonly versionId: WorkflowVersionId;
      readonly input?: WorkflowInput;
    },
  ): Promise<WorkflowExecuteAttemptResult>;
};

export type WorkflowRuntimeRegistry = {
  createRun(
    ctx: WorkflowPlatformServiceContext,
    run: WorkflowRun,
  ): Promise<WorkflowRun>;
  getRun(
    ctx: WorkflowPlatformServiceContext,
    runId: WorkflowRunId,
  ): Promise<WorkflowRun | null>;
  listRuns(
    ctx: WorkflowPlatformServiceContext,
    filter?: { readonly workflowId?: WorkflowId; readonly status?: string },
  ): Promise<readonly WorkflowRun[]>;
  updateRun(
    ctx: WorkflowPlatformServiceContext,
    runId: WorkflowRunId,
    patch: Partial<WorkflowRun>,
  ): Promise<WorkflowRun>;
  listSteps(
    ctx: WorkflowPlatformServiceContext,
    runId: WorkflowRunId,
  ): Promise<readonly WorkflowRunStep[]>;
  setSteps(
    ctx: WorkflowPlatformServiceContext,
    runId: WorkflowRunId,
    steps: readonly WorkflowRunStep[],
  ): Promise<void>;

  createSchedule(
    ctx: WorkflowPlatformServiceContext,
    schedule: WorkflowSchedule,
  ): Promise<WorkflowSchedule>;
  getSchedule(
    ctx: WorkflowPlatformServiceContext,
    scheduleId: WorkflowScheduleId,
  ): Promise<WorkflowSchedule | null>;
  listSchedules(
    ctx: WorkflowPlatformServiceContext,
    workflowId?: WorkflowId,
  ): Promise<readonly WorkflowSchedule[]>;
  updateSchedule(
    ctx: WorkflowPlatformServiceContext,
    scheduleId: WorkflowScheduleId,
    patch: Partial<WorkflowSchedule>,
  ): Promise<WorkflowSchedule>;

  createTriggerBinding(
    ctx: WorkflowPlatformServiceContext,
    binding: WorkflowTriggerBinding,
  ): Promise<WorkflowTriggerBinding>;
  getTriggerBinding(
    ctx: WorkflowPlatformServiceContext,
    triggerId: WorkflowTriggerId,
  ): Promise<WorkflowTriggerBinding | null>;

  createTask(
    ctx: WorkflowPlatformServiceContext,
    task: WorkflowTask,
  ): Promise<WorkflowTask>;
  getTask(
    ctx: WorkflowPlatformServiceContext,
    taskId: WorkflowTaskId,
  ): Promise<WorkflowTask | null>;
  listTasks(
    ctx: WorkflowPlatformServiceContext,
    filter?: {
      readonly runId?: WorkflowRunId;
      readonly assigneePrincipalId?: string;
      readonly status?: string;
      readonly kind?: string;
    },
  ): Promise<readonly WorkflowTask[]>;
  updateTask(
    ctx: WorkflowPlatformServiceContext,
    taskId: WorkflowTaskId,
    patch: Partial<WorkflowTask>,
  ): Promise<WorkflowTask>;

  createNotification(
    ctx: WorkflowPlatformServiceContext,
    notification: WorkflowNotification,
  ): Promise<WorkflowNotification>;
  getNotification(
    ctx: WorkflowPlatformServiceContext,
    notificationId: WorkflowNotificationId,
  ): Promise<WorkflowNotification | null>;
  listNotifications(
    ctx: WorkflowPlatformServiceContext,
  ): Promise<readonly WorkflowNotification[]>;
};
