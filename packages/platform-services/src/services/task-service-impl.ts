import type {
  AssignTaskInput,
  AssignTasksToSprintInput,
  CreateTaskInput,
  ListQuery,
  PageResult,
  ProjectId,
  ReorderBacklogInput,
  ServiceRequestContext,
  SprintId,
  Task,
  TaskId,
  TaskListFilter,
  TaskService,
  TaskSortField,
  TransitionTaskStatusInput,
  UpdateTaskInput,
  AddCommentInput,
  Backlog,
  Comment,
  Attachment,
} from "@apzhub/platform-service-contracts";
import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import { extractProvisionalProviderNativeId } from "../mapping/global-id";
import type { MappingOrchestrator } from "../orchestration/mapping-orchestrator";
import type { TaskProvider } from "../providers/capability-providers";
import type { ProviderResolver } from "../providers/registry/provider-resolver";
import type { ProviderRegistration } from "../providers/types";
import { throwUnsupportedProviderOperation } from "../errors/map-provider-error";

function assertRequestContext(ctx: ServiceRequestContext): void {
  if (!ctx.tenantId || !ctx.userId || !ctx.correlationId) {
    throw new PlatformServiceError({
      category: "validation",
      code: "INVALID_REQUEST_CONTEXT",
      message: "Service request context requires tenantId, userId, and correlationId",
      correlationId: ctx.correlationId || "missing",
      retryable: false,
    });
  }
}

function findTaskRegistration(
  resolver: ProviderResolver,
  provider: TaskProvider,
): ProviderRegistration {
  const match = resolver.registry
    .list("task")
    .find((entry) => entry.provider === provider);
  if (!match) {
    throw new PlatformServiceError({
      category: "configuration",
      code: "CONFIGURATION_ERROR",
      message: "Provider registration not found for resolved task provider",
      correlationId: "platform-services",
      retryable: false,
      details: { capability: "task" },
    });
  }
  return match;
}

function mappingNotFound(
  ctx: ServiceRequestContext,
  details: Record<string, string>,
): PlatformServiceError {
  return new PlatformServiceError({
    category: "not_found",
    code: "MAPPING_NOT_FOUND",
    message: "Required entity mapping was not found",
    correlationId: ctx.correlationId,
    retryable: false,
    details,
  });
}

/**
 * Mapping-aware TaskService — consumers see APZHUB global IDs only (ADR-0048).
 *
 * Assignee mapping path: APZHUB `user_*` global IDs ↔ provider-native user IDs via
 * entity type `user`. Missing user mappings yield MAPPING_NOT_FOUND (no fabricated identity).
 */
export class TaskServiceImpl implements TaskService {
  constructor(
    private readonly resolver: ProviderResolver,
    private readonly mapping: MappingOrchestrator,
  ) {}

  async listTasks(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    query?: ListQuery<TaskListFilter, TaskSortField>,
  ): Promise<PageResult<Task>> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const provider = this.resolver.resolveTaskProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    const registration = findTaskRegistration(this.resolver, provider);

    const providerQuery = query
      ? {
          ...query,
          filter: await this.translateFilterOutbound(
            ctx,
            registration,
            project,
            query.filter ?? {},
          ),
        }
      : undefined;

    const result = await provider.listTasks(
      ctx,
      project.providerNativeId,
      providerQuery,
    );
    const items: Task[] = [];
    for (const task of result.items) {
      items.push(
        await this.normalizeTask(ctx, registration, task, project.mapping.platformId),
      );
    }
    return { ...result, items };
  }

  async getTask(ctx: ServiceRequestContext, taskId: TaskId): Promise<Task> {
    assertRequestContext(ctx);
    const resolved = await this.mapping.resolveExisting(ctx, taskId, "task");
    const projectPlatformId = resolved.mapping.parentPlatformId;
    if (!projectPlatformId || !resolved.mapping.parentProviderNativeId) {
      throw mappingNotFound(ctx, {
        taskId,
        reason: "task_mapping_missing_parent_project",
      });
    }

    const provider = this.resolver.resolveTaskProvider(ctx, {
      mappedProviderId: resolved.providerId,
      mappedIntegrationId: resolved.integrationId,
    });
    const registration = findTaskRegistration(this.resolver, provider);
    const task = await provider.getTask(
      ctx,
      resolved.mapping.parentProviderNativeId,
      resolved.providerNativeId,
    );
    return this.normalizeTask(
      ctx,
      registration,
      task,
      projectPlatformId,
      resolved.mapping.platformId,
    );
  }

  async createTask(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    input: CreateTaskInput,
  ): Promise<Task> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const provider = this.resolver.resolveTaskProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    const registration = findTaskRegistration(this.resolver, provider);

    const providerInput = await this.translateCreateInputOutbound(
      ctx,
      registration,
      project,
      input,
    );

    const created = await provider.createTask(
      ctx,
      project.providerNativeId,
      providerInput,
    );

    const mapping = await this.mapping.ensureMappingAfterCreate({
      ctx,
      entityType: "task",
      providerId: registration.providerId,
      integrationId: registration.integrationId,
      providerEntityId: created.id,
      parentPlatformId: project.mapping.platformId,
      parentProviderNativeId: project.providerNativeId,
    });

    return this.normalizeTask(
      ctx,
      registration,
      created,
      project.mapping.platformId,
      mapping.platformId,
    );
  }

  async updateTask(
    ctx: ServiceRequestContext,
    taskId: TaskId,
    input: UpdateTaskInput,
  ): Promise<Task> {
    assertRequestContext(ctx);
    const { resolved, projectNativeId, projectPlatformId, provider, registration } =
      await this.resolveTaskContext(ctx, taskId);

    if (input.parentTaskId === taskId) {
      throw new PlatformServiceError({
        category: "validation",
        code: "VALIDATION_FAILED",
        message: "A task cannot be its own parent",
        correlationId: ctx.correlationId,
        retryable: false,
      });
    }

    const providerInput = await this.translateUpdateInputOutbound(
      ctx,
      registration,
      { platformId: projectPlatformId, providerNativeId: projectNativeId },
      input,
      resolved.mapping.platformId,
    );

    const updated = await provider.updateTask(
      ctx,
      projectNativeId,
      resolved.providerNativeId,
      providerInput,
    );

    return this.normalizeTask(
      ctx,
      registration,
      updated,
      projectPlatformId,
      resolved.mapping.platformId,
    );
  }

  async archiveTask(ctx: ServiceRequestContext, taskId: TaskId): Promise<Task> {
    assertRequestContext(ctx);
    const { resolved, projectNativeId, projectPlatformId, provider, registration } =
      await this.resolveTaskContext(ctx, taskId);

    const archived = await provider.archiveTask(
      ctx,
      projectNativeId,
      resolved.providerNativeId,
    );

    return this.normalizeTask(
      ctx,
      registration,
      archived,
      projectPlatformId,
      resolved.mapping.platformId,
    );
  }

  async transitionTaskStatus(
    ctx: ServiceRequestContext,
    taskId: TaskId,
    input: TransitionTaskStatusInput,
  ): Promise<Task> {
    assertRequestContext(ctx);
    const { resolved, projectNativeId, projectPlatformId, provider, registration } =
      await this.resolveTaskContext(ctx, taskId);

    const status = await this.mapping.resolveExisting(ctx, input.statusId, "status");
    this.assertSameProjectParent(
      ctx,
      status.mapping.parentPlatformId,
      projectPlatformId,
      "status",
    );

    const transitioned = await provider.transitionTaskStatus(
      ctx,
      projectNativeId,
      resolved.providerNativeId,
      { statusId: status.providerNativeId },
    );

    return this.normalizeTask(
      ctx,
      registration,
      transitioned,
      projectPlatformId,
      resolved.mapping.platformId,
    );
  }

  async assignTask(
    ctx: ServiceRequestContext,
    taskId: TaskId,
    input: AssignTaskInput,
  ): Promise<Task> {
    assertRequestContext(ctx);
    const { resolved, projectNativeId, projectPlatformId, provider, registration } =
      await this.resolveTaskContext(ctx, taskId);

    const providerInput = await this.translateAssignInputOutbound(
      ctx,
      registration,
      input,
    );

    const assigned = await provider.assignTask(
      ctx,
      projectNativeId,
      resolved.providerNativeId,
      providerInput,
    );

    return this.normalizeTask(
      ctx,
      registration,
      assigned,
      projectPlatformId,
      resolved.mapping.platformId,
    );
  }

  async getBacklog(ctx: ServiceRequestContext, projectId: ProjectId): Promise<Backlog> {
    assertRequestContext(ctx);
    const listed = await this.listTasks(ctx, projectId, {
      filter: { parentTaskId: null, archived: false },
    });
    return { projectId, tasks: listed.items };
  }

  async reorderBacklog(
    ctx: ServiceRequestContext,
    _projectId: ProjectId,
    _input: ReorderBacklogInput,
  ): Promise<Backlog> {
    assertRequestContext(ctx);
    throwUnsupportedProviderOperation(ctx.correlationId, "reorderBacklog");
  }

  async assignTasksToSprint(
    ctx: ServiceRequestContext,
    sprintId: SprintId,
    input: AssignTasksToSprintInput,
  ): Promise<void> {
    assertRequestContext(ctx);
    const sprint = await this.mapping.resolveExisting(ctx, sprintId, "sprint");
    if (!sprint.mapping.parentPlatformId || !sprint.mapping.parentProviderNativeId) {
      throw mappingNotFound(ctx, { sprintId, reason: "sprint_missing_parent_project" });
    }

    for (const taskId of input.taskIds) {
      await this.updateTask(ctx, taskId, { sprintId });
    }
  }

  async listMyTasks(
    ctx: ServiceRequestContext,
    _query?: ListQuery<TaskListFilter, TaskSortField>,
  ): Promise<PageResult<Task>> {
    assertRequestContext(ctx);
    throwUnsupportedProviderOperation(ctx.correlationId, "listMyTasks");
  }

  async listComments(
    ctx: ServiceRequestContext,
    _taskId: TaskId,
  ): Promise<readonly Comment[]> {
    assertRequestContext(ctx);
    throwUnsupportedProviderOperation(ctx.correlationId, "listComments");
  }

  async addComment(
    ctx: ServiceRequestContext,
    _taskId: TaskId,
    _input: AddCommentInput,
  ): Promise<Comment> {
    assertRequestContext(ctx);
    throwUnsupportedProviderOperation(ctx.correlationId, "addComment");
  }

  async listAttachments(
    ctx: ServiceRequestContext,
    _taskId: TaskId,
  ): Promise<readonly Attachment[]> {
    assertRequestContext(ctx);
    throwUnsupportedProviderOperation(ctx.correlationId, "listAttachments");
  }

  private async resolveTaskContext(ctx: ServiceRequestContext, taskId: TaskId) {
    const resolved = await this.mapping.resolveExisting(ctx, taskId, "task");
    const projectPlatformId = resolved.mapping.parentPlatformId;
    const projectNativeId = resolved.mapping.parentProviderNativeId;
    if (!projectPlatformId || !projectNativeId) {
      throw mappingNotFound(ctx, {
        taskId,
        reason: "task_mapping_missing_parent_project",
      });
    }

    const provider = this.resolver.resolveTaskProvider(ctx, {
      mappedProviderId: resolved.providerId,
      mappedIntegrationId: resolved.integrationId,
    });
    const registration = findTaskRegistration(this.resolver, provider);

    return { resolved, projectNativeId, projectPlatformId, provider, registration };
  }

  private assertSameProjectParent(
    ctx: ServiceRequestContext,
    relatedParentPlatformId: string | undefined,
    projectPlatformId: string,
    kind: string,
  ): void {
    if (relatedParentPlatformId && relatedParentPlatformId !== projectPlatformId) {
      throw new PlatformServiceError({
        category: "validation",
        code: "VALIDATION_FAILED",
        message: `Related ${kind} does not belong to the task project`,
        correlationId: ctx.correlationId,
        retryable: false,
        details: { kind },
      });
    }
  }

  private async resolveOutboundId(
    ctx: ServiceRequestContext,
    platformId: string,
    expectedType: "status" | "label" | "sprint" | "module" | "user" | "task",
    projectPlatformId: string,
  ): Promise<string> {
    const resolved = await this.mapping.resolveExisting(ctx, platformId, expectedType);
    if (expectedType !== "user") {
      this.assertSameProjectParent(
        ctx,
        resolved.mapping.parentPlatformId,
        projectPlatformId,
        expectedType,
      );
    }
    return resolved.providerNativeId;
  }

  private async translateFilterOutbound(
    ctx: ServiceRequestContext,
    _registration: ProviderRegistration,
    project: { mapping: { platformId: string } },
    filter: TaskListFilter,
  ): Promise<TaskListFilter> {
    return {
      ...filter,
      statusId: filter.statusId
        ? await this.resolveOutboundId(
            ctx,
            filter.statusId,
            "status",
            project.mapping.platformId,
          )
        : filter.statusId,
      assigneeId: filter.assigneeId
        ? await this.resolveOutboundId(
            ctx,
            filter.assigneeId,
            "user",
            project.mapping.platformId,
          )
        : filter.assigneeId,
      labelId: filter.labelId
        ? await this.resolveOutboundId(
            ctx,
            filter.labelId,
            "label",
            project.mapping.platformId,
          )
        : filter.labelId,
      sprintId: filter.sprintId
        ? await this.resolveOutboundId(
            ctx,
            filter.sprintId,
            "sprint",
            project.mapping.platformId,
          )
        : filter.sprintId,
      projectModuleId: filter.projectModuleId
        ? await this.resolveOutboundId(
            ctx,
            filter.projectModuleId,
            "module",
            project.mapping.platformId,
          )
        : filter.projectModuleId,
      parentTaskId:
        typeof filter.parentTaskId === "string"
          ? await this.resolveOutboundId(
              ctx,
              filter.parentTaskId,
              "task",
              project.mapping.platformId,
            )
          : filter.parentTaskId,
    };
  }

  private async translateCreateInputOutbound(
    ctx: ServiceRequestContext,
    _registration: ProviderRegistration,
    project: { mapping: { platformId: string }; providerNativeId: string },
    input: CreateTaskInput,
  ): Promise<CreateTaskInput> {
    return {
      ...input,
      statusId: input.statusId
        ? await this.resolveOutboundId(
            ctx,
            input.statusId,
            "status",
            project.mapping.platformId,
          )
        : input.statusId,
      assigneeId: input.assigneeId
        ? await this.resolveOutboundId(
            ctx,
            input.assigneeId,
            "user",
            project.mapping.platformId,
          )
        : input.assigneeId,
      assigneeIds: input.assigneeIds
        ? await Promise.all(
            input.assigneeIds.map((id) =>
              this.resolveOutboundId(ctx, id, "user", project.mapping.platformId),
            ),
          )
        : input.assigneeIds,
      labelIds: input.labelIds
        ? await Promise.all(
            input.labelIds.map((id) =>
              this.resolveOutboundId(ctx, id, "label", project.mapping.platformId),
            ),
          )
        : input.labelIds,
      sprintId: input.sprintId
        ? await this.resolveOutboundId(
            ctx,
            input.sprintId,
            "sprint",
            project.mapping.platformId,
          )
        : input.sprintId,
      projectModuleId: input.projectModuleId
        ? await this.resolveOutboundId(
            ctx,
            input.projectModuleId,
            "module",
            project.mapping.platformId,
          )
        : input.projectModuleId,
      parentTaskId: input.parentTaskId
        ? await this.resolveOutboundId(
            ctx,
            input.parentTaskId,
            "task",
            project.mapping.platformId,
          )
        : input.parentTaskId,
    };
  }

  private async translateUpdateInputOutbound(
    ctx: ServiceRequestContext,
    _registration: ProviderRegistration,
    project: { platformId: string; providerNativeId: string },
    input: UpdateTaskInput,
    taskPlatformId: string,
  ): Promise<UpdateTaskInput> {
    if (
      typeof input.parentTaskId === "string" &&
      input.parentTaskId === taskPlatformId
    ) {
      throw new PlatformServiceError({
        category: "validation",
        code: "VALIDATION_FAILED",
        message: "A task cannot be its own parent",
        correlationId: ctx.correlationId,
        retryable: false,
      });
    }

    return {
      ...input,
      statusId: input.statusId
        ? await this.resolveOutboundId(
            ctx,
            input.statusId,
            "status",
            project.platformId,
          )
        : input.statusId,
      assigneeId: input.assigneeId
        ? await this.resolveOutboundId(
            ctx,
            input.assigneeId,
            "user",
            project.platformId,
          )
        : input.assigneeId,
      assigneeIds: input.assigneeIds
        ? await Promise.all(
            input.assigneeIds.map((id) =>
              this.resolveOutboundId(ctx, id, "user", project.platformId),
            ),
          )
        : input.assigneeIds,
      labelIds: input.labelIds
        ? await Promise.all(
            input.labelIds.map((id) =>
              this.resolveOutboundId(ctx, id, "label", project.platformId),
            ),
          )
        : input.labelIds,
      sprintId:
        typeof input.sprintId === "string"
          ? await this.resolveOutboundId(
              ctx,
              input.sprintId,
              "sprint",
              project.platformId,
            )
          : input.sprintId,
      projectModuleId:
        typeof input.projectModuleId === "string"
          ? await this.resolveOutboundId(
              ctx,
              input.projectModuleId,
              "module",
              project.platformId,
            )
          : input.projectModuleId,
      parentTaskId:
        typeof input.parentTaskId === "string"
          ? await this.resolveOutboundId(
              ctx,
              input.parentTaskId,
              "task",
              project.platformId,
            )
          : input.parentTaskId,
    };
  }

  private async translateAssignInputOutbound(
    ctx: ServiceRequestContext,
    _registration: ProviderRegistration,
    input: AssignTaskInput,
  ): Promise<AssignTaskInput> {
    if (input.assigneeIds) {
      const nativeIds = await Promise.all(
        input.assigneeIds.map(async (id) => {
          const resolved = await this.mapping.resolveExisting(ctx, id, "user");
          return resolved.providerNativeId;
        }),
      );
      return { assigneeId: nativeIds[0] ?? null, assigneeIds: nativeIds };
    }

    if (input.assigneeId === null) {
      return { assigneeId: null };
    }

    const resolved = await this.mapping.resolveExisting(ctx, input.assigneeId, "user");
    return { assigneeId: resolved.providerNativeId };
  }

  private async normalizeTask(
    ctx: ServiceRequestContext,
    registration: ProviderRegistration,
    task: Task,
    parentProjectId: string,
    knownPlatformId?: string,
  ): Promise<Task> {
    const platformId =
      knownPlatformId ??
      (await this.mapping.toPlatformId(
        ctx,
        "task",
        registration.providerId,
        registration.integrationId,
        task.id,
        {
          platformId: parentProjectId,
          providerNativeId: extractProvisionalProviderNativeId(task.id, "task"),
        },
      ));

    const statusId = await this.mapping.toPlatformId(
      ctx,
      "status",
      registration.providerId,
      registration.integrationId,
      task.statusId,
      { platformId: parentProjectId },
    );

    const labelIds = await Promise.all(
      task.labelIds.map((id) =>
        this.mapping.toPlatformId(
          ctx,
          "label",
          registration.providerId,
          registration.integrationId,
          id,
          { platformId: parentProjectId },
        ),
      ),
    );

    let assigneeId: string | undefined;
    if (task.assigneeId) {
      assigneeId = await this.mapping.toPlatformId(
        ctx,
        "user",
        registration.providerId,
        registration.integrationId,
        task.assigneeId,
      );
    }

    let assigneeIds: readonly string[] | undefined;
    if (task.assigneeIds && task.assigneeIds.length > 0) {
      assigneeIds = await Promise.all(
        task.assigneeIds.map((id) =>
          this.mapping.toPlatformId(
            ctx,
            "user",
            registration.providerId,
            registration.integrationId,
            id,
          ),
        ),
      );
    }

    let sprintId: string | undefined;
    if (task.sprintId) {
      sprintId = await this.mapping.toPlatformId(
        ctx,
        "sprint",
        registration.providerId,
        registration.integrationId,
        task.sprintId,
        { platformId: parentProjectId },
      );
    }

    let projectModuleId: string | undefined;
    if (task.projectModuleId) {
      projectModuleId = await this.mapping.toPlatformId(
        ctx,
        "module",
        registration.providerId,
        registration.integrationId,
        task.projectModuleId,
        { platformId: parentProjectId },
      );
    }

    let parentTaskId: string | undefined;
    if (task.parentTaskId) {
      parentTaskId = await this.mapping.toPlatformId(
        ctx,
        "task",
        registration.providerId,
        registration.integrationId,
        task.parentTaskId,
        { platformId: parentProjectId },
      );
    }

    return {
      ...task,
      id: platformId,
      projectId: parentProjectId,
      statusId,
      labelIds,
      assigneeId,
      assigneeIds,
      sprintId,
      projectModuleId,
      parentTaskId,
    };
  }
}
