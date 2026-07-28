/**
 * Workflow Platform runtime service implementations (APZHUB-PLATFORM-WORKFLOW-004).
 * Orchestration + AuthZ only — no HTTP / Workbench.
 */

import type {
  ApprovalDecisionInput,
  ApprovalService,
  CapabilityService,
  CompleteWorkflowTaskInput,
  CreateWorkflowScheduleInput,
  CreateWorkflowTriggerBindingInput,
  HealthService,
  ListWorkflowRunsInput,
  ListWorkflowTasksInput,
  NotificationService,
  PublishWorkflowNotificationInput,
  StartWorkflowRunInput,
  WorkflowPlatformServiceContext,
  WorkflowRunService,
  WorkflowScheduleService,
  WorkflowService,
  WorkflowTaskService,
  ApprovalTask,
  WorkflowRun,
  WorkflowSchedule,
  WorkflowTask,
  WorkflowNotification,
  WorkflowTriggerBinding,
} from "@apzhub/workflow-contracts";
import {
  asWorkflowNotificationId,
  asWorkflowRunId,
  asWorkflowScheduleId,
  asWorkflowTaskId,
  asWorkflowTriggerId,
  asWorkflowVersionId,
  hasWorkflowNamedOperation,
  type WorkflowPermissionOperationKey,
} from "@apzhub/workflow-contracts";

import { assertWorkflowContext, workflowPermissions } from "./assert-workflow-context";
import {
  workflowAuthorizationError,
  workflowConflictError,
  workflowNotFoundError,
  workflowValidationError,
} from "./workflow-runtime-errors";
import type {
  WorkflowOpsProvider,
  WorkflowRuntimeRegistry,
} from "./workflow-runtime-types";

function assertNamed(
  ctx: WorkflowPlatformServiceContext,
  operation: WorkflowPermissionOperationKey,
): void {
  if (!hasWorkflowNamedOperation(workflowPermissions(ctx), operation)) {
    throw workflowAuthorizationError(ctx.correlationId, operation);
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

let seq = 0;
function nextId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${++seq}`;
}

/**
 * Owner-named WorkflowServiceImpl — wraps existing SoR WorkflowService facet.
 */
export class WorkflowServiceImpl implements WorkflowService {
  constructor(private readonly inner: WorkflowService) {}

  create(
    ctx: WorkflowPlatformServiceContext,
    input: Parameters<WorkflowService["create"]>[1],
  ) {
    return this.inner.create(ctx, input);
  }
  get(
    ctx: WorkflowPlatformServiceContext,
    workflowId: Parameters<WorkflowService["get"]>[1],
  ) {
    return this.inner.get(ctx, workflowId);
  }
  update(
    ctx: WorkflowPlatformServiceContext,
    input: Parameters<WorkflowService["update"]>[1],
  ) {
    return this.inner.update(ctx, input);
  }
  delete(
    ctx: WorkflowPlatformServiceContext,
    workflowId: Parameters<WorkflowService["delete"]>[1],
  ) {
    return this.inner.delete(ctx, workflowId);
  }
  find(
    ctx: WorkflowPlatformServiceContext,
    input?: Parameters<WorkflowService["find"]>[1],
  ) {
    return this.inner.find(ctx, input);
  }
  publish(
    ctx: WorkflowPlatformServiceContext,
    workflowId: Parameters<WorkflowService["publish"]>[1],
  ) {
    return this.inner.publish(ctx, workflowId);
  }
  archive(
    ctx: WorkflowPlatformServiceContext,
    workflowId: Parameters<WorkflowService["archive"]>[1],
  ) {
    return this.inner.archive(ctx, workflowId);
  }
  restore(
    ctx: WorkflowPlatformServiceContext,
    workflowId: Parameters<WorkflowService["restore"]>[1],
  ) {
    return this.inner.restore(ctx, workflowId);
  }
  transition(
    ctx: WorkflowPlatformServiceContext,
    input: Parameters<WorkflowService["transition"]>[1],
  ) {
    return this.inner.transition(ctx, input);
  }
}

export class WorkflowRunServiceImpl implements WorkflowRunService {
  constructor(
    private readonly ops: WorkflowOpsProvider,
    private readonly registry: WorkflowRuntimeRegistry,
    private readonly resolveVersionId?: (
      ctx: WorkflowPlatformServiceContext,
      workflowId: StartWorkflowRunInput["workflowId"],
      versionId?: StartWorkflowRunInput["versionId"],
    ) => Promise<StartWorkflowRunInput["versionId"]>,
  ) {}

  async start(
    ctx: WorkflowPlatformServiceContext,
    input: StartWorkflowRunInput,
  ): Promise<WorkflowRun> {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "startRun");
    const versionId =
      input.versionId ??
      (this.resolveVersionId
        ? await this.resolveVersionId(ctx, input.workflowId, input.versionId)
        : asWorkflowVersionId(`wfv_default_${input.workflowId}`));
    if (!versionId) {
      throw workflowValidationError(
        ctx.correlationId,
        "versionId is required to start a run",
      );
    }

    const createdAt = nowIso();
    const runId = asWorkflowRunId(nextId("wfr"));
    const base: WorkflowRun = {
      id: runId,
      tenantId: ctx.tenantId,
      organisationId: ctx.organisationId,
      workflowId: input.workflowId,
      versionId,
      status: "queued",
      input: input.input,
      correlationId: input.correlationId ?? ctx.correlationId,
      provider: {
        providerId: this.ops.providerId,
        providerRef: "pending",
      },
      createdAt,
      updatedAt: createdAt,
      createdBy: ctx.userId,
    };
    await this.registry.createRun(ctx, base);

    const attempt = await this.ops.tryStartExecution(ctx, {
      workflowId: input.workflowId,
      versionId,
      input: input.input,
    });

    if (!attempt.supported) {
      return this.registry.updateRun(ctx, runId, {
        status: "failed",
        error: {
          code: "PROVIDER_EXECUTE_NOT_SUPPORTED",
          message: attempt.reason,
          retryable: false,
        },
        finishedAt: nowIso(),
        provider: {
          providerId: this.ops.providerId,
          providerRef: "unsupported",
        },
      });
    }

    return this.registry.updateRun(ctx, runId, {
      status: attempt.status,
      startedAt: nowIso(),
      provider: {
        providerId: this.ops.providerId,
        providerRef: attempt.providerRef,
      },
    });
  }

  async get(
    ctx: WorkflowPlatformServiceContext,
    runId: Parameters<WorkflowRunService["get"]>[1],
  ) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "viewRuns");
    const run = await this.registry.getRun(ctx, runId);
    if (!run) throw workflowNotFoundError(ctx.correlationId, "WorkflowRun", runId);
    return run;
  }

  async list(ctx: WorkflowPlatformServiceContext, input?: ListWorkflowRunsInput) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "viewRuns");
    const rows = await this.registry.listRuns(ctx, {
      workflowId: input?.workflowId,
      status: input?.status,
    });
    const limit = input?.limit ?? 50;
    return rows.slice(0, limit);
  }

  async cancel(
    ctx: WorkflowPlatformServiceContext,
    runId: Parameters<WorkflowRunService["cancel"]>[1],
    reason?: string,
  ) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "cancelRun");
    const run = await this.registry.getRun(ctx, runId);
    if (!run) throw workflowNotFoundError(ctx.correlationId, "WorkflowRun", runId);
    if (run.status === "succeeded" || run.status === "cancelled") {
      throw workflowConflictError(
        ctx.correlationId,
        `Cannot cancel run in status ${run.status}`,
      );
    }
    return this.registry.updateRun(ctx, runId, {
      status: "cancelled",
      finishedAt: nowIso(),
      error: reason
        ? { code: "CANCELLED", message: reason, retryable: false }
        : run.error,
    });
  }

  async listSteps(
    ctx: WorkflowPlatformServiceContext,
    runId: Parameters<WorkflowRunService["listSteps"]>[1],
  ) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "viewRuns");
    const run = await this.registry.getRun(ctx, runId);
    if (!run) throw workflowNotFoundError(ctx.correlationId, "WorkflowRun", runId);
    return this.registry.listSteps(ctx, runId);
  }
}

export class WorkflowScheduleServiceImpl implements WorkflowScheduleService {
  constructor(private readonly registry: WorkflowRuntimeRegistry) {}

  async create(
    ctx: WorkflowPlatformServiceContext,
    input: CreateWorkflowScheduleInput,
  ) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "manageSchedules");
    const triggerId = input.triggerId ?? asWorkflowTriggerId(nextId("wtrg"));
    const createdAt = nowIso();
    if (!input.triggerId) {
      const binding: WorkflowTriggerBinding = {
        id: triggerId,
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        workflowId: input.workflowId,
        versionId: input.versionId,
        kind: "schedule",
        enabled: true,
        createdAt,
        updatedAt: createdAt,
      };
      await this.registry.createTriggerBinding(ctx, binding);
    }
    const schedule: WorkflowSchedule = {
      id: asWorkflowScheduleId(nextId("wsch")),
      tenantId: ctx.tenantId,
      organisationId: ctx.organisationId,
      workflowId: input.workflowId,
      versionId: input.versionId,
      triggerId,
      cron: input.cron,
      timezone: input.timezone ?? "UTC",
      status: "draft",
      createdAt,
      updatedAt: createdAt,
      createdBy: ctx.userId,
    };
    return this.registry.createSchedule(ctx, schedule);
  }

  async get(
    ctx: WorkflowPlatformServiceContext,
    scheduleId: Parameters<WorkflowScheduleService["get"]>[1],
  ) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "viewSchedules");
    const schedule = await this.registry.getSchedule(ctx, scheduleId);
    if (!schedule) {
      throw workflowNotFoundError(ctx.correlationId, "WorkflowSchedule", scheduleId);
    }
    return schedule;
  }

  async list(
    ctx: WorkflowPlatformServiceContext,
    workflowId?: Parameters<WorkflowScheduleService["list"]>[1],
  ) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "viewSchedules");
    return this.registry.listSchedules(ctx, workflowId);
  }

  async arm(
    ctx: WorkflowPlatformServiceContext,
    scheduleId: Parameters<WorkflowScheduleService["arm"]>[1],
  ) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "manageSchedules");
    return this.registry.updateSchedule(ctx, scheduleId, { status: "armed" });
  }

  async pause(
    ctx: WorkflowPlatformServiceContext,
    scheduleId: Parameters<WorkflowScheduleService["pause"]>[1],
  ) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "manageSchedules");
    return this.registry.updateSchedule(ctx, scheduleId, { status: "paused" });
  }

  async retire(
    ctx: WorkflowPlatformServiceContext,
    scheduleId: Parameters<WorkflowScheduleService["retire"]>[1],
  ) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "manageSchedules");
    return this.registry.updateSchedule(ctx, scheduleId, { status: "retired" });
  }

  async createTriggerBinding(
    ctx: WorkflowPlatformServiceContext,
    input: CreateWorkflowTriggerBindingInput,
  ) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "manageSchedules");
    const createdAt = nowIso();
    const binding: WorkflowTriggerBinding = {
      id: asWorkflowTriggerId(nextId("wtrg")),
      tenantId: ctx.tenantId,
      organisationId: ctx.organisationId,
      workflowId: input.workflowId,
      versionId: input.versionId,
      kind: input.kind,
      label: input.label,
      eventType: input.eventType,
      enabled: input.enabled ?? true,
      createdAt,
      updatedAt: createdAt,
    };
    return this.registry.createTriggerBinding(ctx, binding);
  }
}

export class WorkflowTaskServiceImpl implements WorkflowTaskService {
  constructor(private readonly registry: WorkflowRuntimeRegistry) {}

  async listInbox(ctx: WorkflowPlatformServiceContext, input?: ListWorkflowTasksInput) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "viewTasks");
    const rows = await this.registry.listTasks(ctx, {
      runId: input?.runId,
      assigneePrincipalId: input?.assigneePrincipalId ?? ctx.userId,
      status: input?.status,
      kind: input?.kind,
    });
    return rows.slice(0, input?.limit ?? 50);
  }

  async get(
    ctx: WorkflowPlatformServiceContext,
    taskId: Parameters<WorkflowTaskService["get"]>[1],
  ) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "viewTasks");
    const task = await this.registry.getTask(ctx, taskId);
    if (!task) throw workflowNotFoundError(ctx.correlationId, "WorkflowTask", taskId);
    return task;
  }

  async claim(
    ctx: WorkflowPlatformServiceContext,
    taskId: Parameters<WorkflowTaskService["claim"]>[1],
  ) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "claimTask");
    const task = await this.registry.getTask(ctx, taskId);
    if (!task) throw workflowNotFoundError(ctx.correlationId, "WorkflowTask", taskId);
    if (task.status !== "open") {
      throw workflowConflictError(
        ctx.correlationId,
        `Task is not open (${task.status})`,
      );
    }
    return this.registry.updateTask(ctx, taskId, {
      status: "claimed",
      assigneePrincipalId: ctx.userId,
    });
  }

  async complete(
    ctx: WorkflowPlatformServiceContext,
    input: CompleteWorkflowTaskInput,
  ) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "completeTask");
    const task = await this.registry.getTask(ctx, input.taskId);
    if (!task)
      throw workflowNotFoundError(ctx.correlationId, "WorkflowTask", input.taskId);
    return this.registry.updateTask(ctx, input.taskId, {
      status: "completed",
      formValues: input.formValues,
      completedAt: nowIso(),
    });
  }

  /** Test helper — seed an open task against a run. */
  async seedTask(
    ctx: WorkflowPlatformServiceContext,
    input: {
      readonly runId: WorkflowTask["runId"];
      readonly kind?: WorkflowTask["kind"];
      readonly title?: string;
    },
  ): Promise<WorkflowTask> {
    const createdAt = nowIso();
    return this.registry.createTask(ctx, {
      id: asWorkflowTaskId(nextId("wtk")),
      tenantId: ctx.tenantId,
      organisationId: ctx.organisationId,
      runId: input.runId,
      kind: input.kind ?? "manual",
      status: "open",
      title: input.title ?? "Manual task",
      createdAt,
      updatedAt: createdAt,
    });
  }
}

export class ApprovalServiceImpl implements ApprovalService {
  constructor(private readonly registry: WorkflowRuntimeRegistry) {}

  async approve(ctx: WorkflowPlatformServiceContext, input: ApprovalDecisionInput) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "approveTask");
    return this.decide(ctx, input.taskId, "approved", input.comment);
  }

  async reject(ctx: WorkflowPlatformServiceContext, input: ApprovalDecisionInput) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "approveTask");
    return this.decide(ctx, input.taskId, "rejected", input.comment);
  }

  async get(
    ctx: WorkflowPlatformServiceContext,
    taskId: Parameters<ApprovalService["get"]>[1],
  ) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "viewTasks");
    const task = await this.registry.getTask(ctx, taskId);
    if (!task || task.kind !== "approval") {
      throw workflowNotFoundError(ctx.correlationId, "ApprovalTask", taskId);
    }
    return task as ApprovalTask;
  }

  private async decide(
    ctx: WorkflowPlatformServiceContext,
    taskId: ApprovalDecisionInput["taskId"],
    decision: "approved" | "rejected",
    _comment?: string,
  ): Promise<ApprovalTask> {
    const task = await this.registry.getTask(ctx, taskId);
    if (!task || task.kind !== "approval") {
      throw workflowNotFoundError(ctx.correlationId, "ApprovalTask", taskId);
    }
    const updated = await this.registry.updateTask(ctx, taskId, {
      status: decision,
      decision,
      completedAt: nowIso(),
      assigneePrincipalId: ctx.userId,
    });
    return updated as ApprovalTask;
  }
}

export class NotificationServiceImpl implements NotificationService {
  constructor(private readonly registry: WorkflowRuntimeRegistry) {}

  async publishIntent(
    ctx: WorkflowPlatformServiceContext,
    input: PublishWorkflowNotificationInput,
  ): Promise<WorkflowNotification> {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "viewRuns");
    const createdAt = nowIso();
    return this.registry.createNotification(ctx, {
      id: asWorkflowNotificationId(nextId("wnotif")),
      tenantId: ctx.tenantId,
      runId: input.runId,
      taskId: input.taskId,
      channelHint: input.channelHint,
      templateKey: input.templateKey,
      recipientPrincipalIds: input.recipientPrincipalIds,
      payload: input.payload,
      createdAt,
    });
  }

  async getIntent(
    ctx: WorkflowPlatformServiceContext,
    notificationId: Parameters<NotificationService["getIntent"]>[1],
  ) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "viewRuns");
    const row = await this.registry.getNotification(ctx, notificationId);
    if (!row) {
      throw workflowNotFoundError(
        ctx.correlationId,
        "WorkflowNotification",
        notificationId,
      );
    }
    return row;
  }

  async listIntents(
    ctx: WorkflowPlatformServiceContext,
    input?: { readonly limit?: number },
  ) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "viewRuns");
    const rows = await this.registry.listNotifications(ctx);
    return rows.slice(0, input?.limit ?? 50);
  }
}

export class CapabilityServiceImpl implements CapabilityService {
  constructor(private readonly ops: WorkflowOpsProvider) {}

  async listCapabilities(ctx: WorkflowPlatformServiceContext) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "engineCapabilities");
    return this.ops.listCapabilities(ctx);
  }

  async listProviders(ctx: WorkflowPlatformServiceContext) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "engineCapabilities");
    return this.ops.listProviders(ctx);
  }

  async getProvider(ctx: WorkflowPlatformServiceContext, providerKey: string) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "engineCapabilities");
    const providers = await this.ops.listProviders(ctx);
    const found = providers.find((p) => p.key === providerKey);
    if (!found) {
      throw workflowNotFoundError(ctx.correlationId, "WorkflowProvider", providerKey);
    }
    return found;
  }
}

export class HealthServiceImpl implements HealthService {
  constructor(private readonly ops: WorkflowOpsProvider) {}

  async getHealth(ctx: WorkflowPlatformServiceContext) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "engineHealth");
    return this.ops.getHealth(ctx);
  }

  async getComponentHealth(ctx: WorkflowPlatformServiceContext, componentKey: string) {
    assertWorkflowContext(ctx);
    assertNamed(ctx, "engineHealth");
    const health = await this.ops.getHealth(ctx);
    return { ...health, componentKey };
  }
}

export type WorkflowRuntimeServiceImpls = {
  readonly workflows?: WorkflowServiceImpl;
  readonly runs: WorkflowRunServiceImpl;
  readonly schedules: WorkflowScheduleServiceImpl;
  readonly tasks: WorkflowTaskServiceImpl;
  readonly approvals: ApprovalServiceImpl;
  readonly notifications: NotificationServiceImpl;
  readonly capabilities: CapabilityServiceImpl;
  readonly health: HealthServiceImpl;
};

export function createWorkflowRuntimeServiceImpls(input: {
  readonly ops: WorkflowOpsProvider;
  readonly registry: WorkflowRuntimeRegistry;
  readonly workflows?: WorkflowService;
}): WorkflowRuntimeServiceImpls {
  return {
    workflows: input.workflows ? new WorkflowServiceImpl(input.workflows) : undefined,
    runs: new WorkflowRunServiceImpl(input.ops, input.registry),
    schedules: new WorkflowScheduleServiceImpl(input.registry),
    tasks: new WorkflowTaskServiceImpl(input.registry),
    approvals: new ApprovalServiceImpl(input.registry),
    notifications: new NotificationServiceImpl(input.registry),
    capabilities: new CapabilityServiceImpl(input.ops),
    health: new HealthServiceImpl(input.ops),
  };
}
