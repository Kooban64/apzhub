import type {
  CreateLabelInput,
  CreateMilestoneInput,
  CreateModuleInput,
  CreateProjectInput,
  CreateProjectStateInput,
  CreateSprintInput,
  CreateUserInput,
  CursorPageRequest,
  Label,
  ListQuery,
  PageResult,
  Project,
  ProjectId,
  ProjectListFilter,
  ProjectModule,
  ProjectService,
  ProjectSortField,
  ProjectStateListFilter,
  ProjectStatusEntity,
  SearchQueryInput,
  SearchService,
  SearchSuggestInput,
  ServiceRequestContext,
  Sprint,
  SprintId,
  StatusId,
  TeamMember,
  TeamService,
  UpdateLabelInput,
  UpdateMilestoneInput,
  UpdateModuleInput,
  UpdateProjectInput,
  UpdateProjectStateInput,
  UpdateSprintInput,
  UpdateTeamMemberInput,
  UpdateUserInput,
  UserId,
  UserService,
  Workspace,
  WorkspaceId,
  WorkspaceListFilter,
  WorkspaceService,
  WorkspaceSortField,
  AddTeamMemberInput,
  TeamMemberId,
  MemberListFilter,
  TeamListFilter,
  TeamSortField,
  UserListFilter,
  UserSortField,
  CycleListFilter,
  LabelListFilter,
  ModuleListFilter,
} from "@apzhub/platform-service-contracts";
import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import { extractProvisionalProviderNativeId } from "../mapping/global-id";
import type { MappingOrchestrator } from "../orchestration/mapping-orchestrator";
import { encodePlaneSprintRef } from "../providers/plane/plane-project-provider";
import type { ProviderResolver } from "../providers/registry/provider-resolver";
import type { ProviderRegistration } from "../providers/types";

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

function findRegistration(
  resolver: ProviderResolver,
  capability: "workspace" | "project" | "team" | "user" | "search",
  provider: unknown,
): ProviderRegistration {
  const match = resolver.registry.list(capability).find((entry) => entry.provider === provider);
  if (!match) {
    throw new PlatformServiceError({
      category: "configuration",
      code: "CONFIGURATION_ERROR",
      message: "Provider registration not found for resolved provider",
      correlationId: "platform-services",
      retryable: false,
      details: { capability },
    });
  }
  return match;
}

/** Mapping-aware workspace service — consumers see APZHUB global IDs only. */
export class WorkspaceServiceImpl implements WorkspaceService {
  constructor(
    private readonly resolver: ProviderResolver,
    private readonly mapping: MappingOrchestrator,
  ) {}

  async listWorkspaces(
    ctx: ServiceRequestContext,
    query?: ListQuery<WorkspaceListFilter, WorkspaceSortField>,
  ): Promise<PageResult<Workspace>> {
    assertRequestContext(ctx);
    const provider = this.resolver.resolveWorkspaceProvider(ctx);
    const registration = findRegistration(this.resolver, "workspace", provider);
    const result = await provider.listWorkspaces(ctx, query);

    const items: Workspace[] = [];
    for (const workspace of result.items) {
      items.push(await this.normalizeWorkspace(ctx, registration, workspace));
    }

    return { ...result, items };
  }

  async getWorkspace(ctx: ServiceRequestContext, workspaceId: WorkspaceId): Promise<Workspace> {
    assertRequestContext(ctx);
    const resolved = await this.mapping.resolveExisting(ctx, workspaceId, "workspace");
    const provider = this.resolver.resolveWorkspaceProvider(ctx, {
      mappedProviderId: resolved.providerId,
      mappedIntegrationId: resolved.integrationId,
    });
    const registration = findRegistration(this.resolver, "workspace", provider);
    const workspace = await provider.getWorkspace(ctx, resolved.providerNativeId);
    return this.normalizeWorkspace(ctx, registration, workspace, resolved.mapping.platformId);
  }

  private async normalizeWorkspace(
    ctx: ServiceRequestContext,
    registration: ProviderRegistration,
    workspace: Workspace,
    knownPlatformId?: string,
  ): Promise<Workspace> {
    const platformId =
      knownPlatformId ??
      (await this.mapping.toPlatformId(
        ctx,
        "workspace",
        registration.providerId,
        registration.integrationId,
        workspace.id,
      ));

    return { ...workspace, id: platformId, tenantId: ctx.tenantId };
  }
}

/** Mapping-aware project service. */
export class ProjectServiceImpl implements ProjectService {
  constructor(
    private readonly resolver: ProviderResolver,
    private readonly mapping: MappingOrchestrator,
  ) {}

  async listProjects(
    ctx: ServiceRequestContext,
    query?: ListQuery<ProjectListFilter, ProjectSortField>,
  ): Promise<PageResult<Project>> {
    assertRequestContext(ctx);
    const provider = this.resolver.resolveProjectProvider(ctx);
    const registration = findRegistration(this.resolver, "project", provider);
    const result = await provider.listProjects(ctx, query);

    const items: Project[] = [];
    for (const project of result.items) {
      items.push(await this.normalizeProject(ctx, registration, project));
    }
    return { ...result, items };
  }

  async getProject(ctx: ServiceRequestContext, projectId: ProjectId): Promise<Project> {
    assertRequestContext(ctx);
    const resolved = await this.mapping.resolveExisting(ctx, projectId, "project");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: resolved.providerId,
      mappedIntegrationId: resolved.integrationId,
    });
    const registration = findRegistration(this.resolver, "project", provider);
    const project = await provider.getProject(ctx, resolved.providerNativeId);
    return this.normalizeProject(ctx, registration, project, resolved.mapping.platformId);
  }

  async createProject(ctx: ServiceRequestContext, input: CreateProjectInput): Promise<Project> {
    assertRequestContext(ctx);
    const parent = await this.mapping.resolveExisting(ctx, input.workspaceId, "workspace");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: parent.providerId,
      mappedIntegrationId: parent.integrationId,
    });
    const registration = findRegistration(this.resolver, "project", provider);

    const created = await provider.createProject(ctx, {
      ...input,
      workspaceId: parent.mapping.platformId,
    });

    const mapping = await this.mapping.ensureMappingAfterCreate({
      ctx,
      entityType: "project",
      providerId: registration.providerId,
      integrationId: registration.integrationId,
      providerEntityId: created.id,
      parentPlatformId: parent.mapping.platformId,
      parentProviderNativeId: parent.providerNativeId,
    });

    return this.normalizeProject(ctx, registration, created, mapping.platformId);
  }

  async updateProject(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    input: UpdateProjectInput,
  ): Promise<Project> {
    assertRequestContext(ctx);
    const resolved = await this.mapping.resolveExisting(ctx, projectId, "project");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: resolved.providerId,
      mappedIntegrationId: resolved.integrationId,
    });
    const registration = findRegistration(this.resolver, "project", provider);
    const updated = await provider.updateProject(ctx, resolved.providerNativeId, input);
    return this.normalizeProject(ctx, registration, updated, resolved.mapping.platformId);
  }

  async archiveProject(ctx: ServiceRequestContext, projectId: ProjectId): Promise<Project> {
    assertRequestContext(ctx);
    const resolved = await this.mapping.resolveExisting(ctx, projectId, "project");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: resolved.providerId,
      mappedIntegrationId: resolved.integrationId,
    });
    const registration = findRegistration(this.resolver, "project", provider);
    const archived = await provider.archiveProject(ctx, resolved.providerNativeId);
    return this.normalizeProject(ctx, registration, archived, resolved.mapping.platformId);
  }

  async listStatuses(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    query?: ListQuery<ProjectStateListFilter>,
  ): Promise<PageResult<ProjectStatusEntity>> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    const registration = findRegistration(this.resolver, "project", provider);
    const result = await provider.listStatuses(ctx, project.providerNativeId, query);

    const items: ProjectStatusEntity[] = [];
    for (const status of result.items) {
      items.push(
        await this.normalizeStatus(ctx, registration, status, project.mapping.platformId),
      );
    }
    return { ...result, items };
  }

  async getStatus(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    statusId: StatusId,
  ): Promise<ProjectStatusEntity> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const status = await this.mapping.resolveExisting(ctx, statusId, "status");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    const registration = findRegistration(this.resolver, "project", provider);
    const entity = await provider.getStatus(
      ctx,
      project.providerNativeId,
      status.providerNativeId,
    );
    return this.normalizeStatus(ctx, registration, entity, project.mapping.platformId, status.mapping.platformId);
  }

  async createStatus(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    input: CreateProjectStateInput,
  ): Promise<ProjectStatusEntity> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    const registration = findRegistration(this.resolver, "project", provider);
    const created = await provider.createStatus(ctx, project.providerNativeId, input);
    const mapping = await this.mapping.ensureMappingAfterCreate({
      ctx,
      entityType: "status",
      providerId: registration.providerId,
      integrationId: registration.integrationId,
      providerEntityId: created.id,
      parentPlatformId: project.mapping.platformId,
      parentProviderNativeId: project.providerNativeId,
    });
    return this.normalizeStatus(
      ctx,
      registration,
      created,
      project.mapping.platformId,
      mapping.platformId,
    );
  }

  async updateStatus(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    statusId: StatusId,
    input: UpdateProjectStateInput,
  ): Promise<ProjectStatusEntity> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const status = await this.mapping.resolveExisting(ctx, statusId, "status");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    const registration = findRegistration(this.resolver, "project", provider);
    const updated = await provider.updateStatus(
      ctx,
      project.providerNativeId,
      status.providerNativeId,
      input,
    );
    return this.normalizeStatus(
      ctx,
      registration,
      updated,
      project.mapping.platformId,
      status.mapping.platformId,
    );
  }

  async deleteStatus(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    statusId: StatusId,
  ): Promise<void> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const status = await this.mapping.resolveExisting(ctx, statusId, "status");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    await provider.deleteStatus(ctx, project.providerNativeId, status.providerNativeId);
    await this.mapping.store.deactivate(status.mapping.platformId, ctx.tenantId);
  }

  async listLabels(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    query?: ListQuery<LabelListFilter>,
  ): Promise<PageResult<Label>> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    const registration = findRegistration(this.resolver, "project", provider);
    const result = await provider.listLabels(ctx, project.providerNativeId, query);
    const items: Label[] = [];
    for (const label of result.items) {
      items.push(await this.normalizeLabel(ctx, registration, label, project.mapping.platformId));
    }
    return { ...result, items };
  }

  async createLabel(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    input: CreateLabelInput,
  ): Promise<Label> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    const registration = findRegistration(this.resolver, "project", provider);
    const created = await provider.createLabel(ctx, project.providerNativeId, input);
    const mapping = await this.mapping.ensureMappingAfterCreate({
      ctx,
      entityType: "label",
      providerId: registration.providerId,
      integrationId: registration.integrationId,
      providerEntityId: created.id,
      parentPlatformId: project.mapping.platformId,
      parentProviderNativeId: project.providerNativeId,
    });
    return this.normalizeLabel(
      ctx,
      registration,
      created,
      project.mapping.platformId,
      mapping.platformId,
    );
  }

  async updateLabel(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    labelId: string,
    input: UpdateLabelInput,
  ): Promise<Label> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const label = await this.mapping.resolveExisting(ctx, labelId, "label");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    const registration = findRegistration(this.resolver, "project", provider);
    const updated = await provider.updateLabel(
      ctx,
      project.providerNativeId,
      label.providerNativeId,
      input,
    );
    return this.normalizeLabel(
      ctx,
      registration,
      updated,
      project.mapping.platformId,
      label.mapping.platformId,
    );
  }

  async deleteLabel(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    labelId: string,
  ): Promise<void> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const label = await this.mapping.resolveExisting(ctx, labelId, "label");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    await provider.deleteLabel(ctx, project.providerNativeId, label.providerNativeId);
    await this.mapping.store.deactivate(label.mapping.platformId, ctx.tenantId);
  }

  async listSprints(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    query?: ListQuery<CycleListFilter>,
  ): Promise<PageResult<Sprint>> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    const registration = findRegistration(this.resolver, "project", provider);
    const result = await provider.listSprints(ctx, project.providerNativeId, query);
    const items: Sprint[] = [];
    for (const sprint of result.items) {
      items.push(await this.normalizeSprint(ctx, registration, sprint, project.mapping.platformId));
    }
    return { ...result, items };
  }

  async getSprint(ctx: ServiceRequestContext, sprintId: SprintId): Promise<Sprint> {
    assertRequestContext(ctx);
    const sprint = await this.mapping.resolveExisting(ctx, sprintId, "sprint");
    if (!sprint.mapping.parentPlatformId) {
      throw new PlatformServiceError({
        category: "configuration",
        code: "CONFIGURATION_ERROR",
        message: "Sprint mapping is missing parent project reference",
        correlationId: ctx.correlationId,
        retryable: false,
        details: { sprintId },
      });
    }

    const project = await this.mapping.resolveExisting(
      ctx,
      sprint.mapping.parentPlatformId,
      "project",
    );
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: sprint.providerId,
      mappedIntegrationId: sprint.integrationId,
    });
    const registration = findRegistration(this.resolver, "project", provider);
    const sprintRef = encodePlaneSprintRef(project.providerNativeId, sprint.providerNativeId);
    const found = await provider.getSprint(ctx, sprintRef);

    return this.normalizeSprint(
      ctx,
      registration,
      found,
      project.mapping.platformId,
      sprint.mapping.platformId,
    );
  }

  async createSprint(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    input: CreateSprintInput,
  ): Promise<Sprint> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    const registration = findRegistration(this.resolver, "project", provider);
    const created = await provider.createSprint(ctx, project.providerNativeId, input);
    const mapping = await this.mapping.ensureMappingAfterCreate({
      ctx,
      entityType: "sprint",
      providerId: registration.providerId,
      integrationId: registration.integrationId,
      providerEntityId: created.id,
      parentPlatformId: project.mapping.platformId,
      parentProviderNativeId: project.providerNativeId,
    });
    return this.normalizeSprint(
      ctx,
      registration,
      created,
      project.mapping.platformId,
      mapping.platformId,
    );
  }

  async updateSprint(
    ctx: ServiceRequestContext,
    sprintId: SprintId,
    input: UpdateSprintInput,
  ): Promise<Sprint> {
    return this.mutateSprint(ctx, sprintId, (provider, sprintRef) =>
      provider.updateSprint(ctx, sprintRef, input),
    );
  }

  async archiveSprint(ctx: ServiceRequestContext, sprintId: SprintId): Promise<Sprint> {
    return this.mutateSprint(ctx, sprintId, (provider, sprintRef) =>
      provider.archiveSprint(ctx, sprintRef),
    );
  }

  async startSprint(ctx: ServiceRequestContext, sprintId: SprintId): Promise<Sprint> {
    return this.updateSprint(ctx, sprintId, { status: "active" });
  }

  async completeSprint(ctx: ServiceRequestContext, sprintId: SprintId): Promise<Sprint> {
    return this.updateSprint(ctx, sprintId, { status: "completed" });
  }

  async listModules(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    query?: ListQuery<ModuleListFilter>,
  ): Promise<PageResult<ProjectModule>> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    const registration = findRegistration(this.resolver, "project", provider);
    const result = await provider.listModules(ctx, project.providerNativeId, query);
    const items: ProjectModule[] = [];
    for (const mod of result.items) {
      items.push(await this.normalizeModule(ctx, registration, mod, project.mapping.platformId));
    }
    return { ...result, items };
  }

  async getModule(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    moduleId: string,
  ): Promise<ProjectModule> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const mod = await this.mapping.resolveExisting(ctx, moduleId, "module");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    const registration = findRegistration(this.resolver, "project", provider);
    const entity = await provider.getModule(
      ctx,
      project.providerNativeId,
      mod.providerNativeId,
    );
    return this.normalizeModule(
      ctx,
      registration,
      entity,
      project.mapping.platformId,
      mod.mapping.platformId,
    );
  }

  async createModule(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    input: CreateModuleInput,
  ): Promise<ProjectModule> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    const registration = findRegistration(this.resolver, "project", provider);
    const created = await provider.createModule(ctx, project.providerNativeId, input);
    const mapping = await this.mapping.ensureMappingAfterCreate({
      ctx,
      entityType: "module",
      providerId: registration.providerId,
      integrationId: registration.integrationId,
      providerEntityId: created.id,
      parentPlatformId: project.mapping.platformId,
      parentProviderNativeId: project.providerNativeId,
    });
    return this.normalizeModule(
      ctx,
      registration,
      created,
      project.mapping.platformId,
      mapping.platformId,
    );
  }

  async updateModule(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    moduleId: string,
    input: UpdateModuleInput,
  ): Promise<ProjectModule> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const mod = await this.mapping.resolveExisting(ctx, moduleId, "module");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    const registration = findRegistration(this.resolver, "project", provider);
    const updated = await provider.updateModule(
      ctx,
      project.providerNativeId,
      mod.providerNativeId,
      input,
    );
    return this.normalizeModule(
      ctx,
      registration,
      updated,
      project.mapping.platformId,
      mod.mapping.platformId,
    );
  }

  async archiveModule(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    moduleId: string,
  ): Promise<ProjectModule> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const mod = await this.mapping.resolveExisting(ctx, moduleId, "module");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    const registration = findRegistration(this.resolver, "project", provider);
    const archived = await provider.archiveModule(
      ctx,
      project.providerNativeId,
      mod.providerNativeId,
    );
    return this.normalizeModule(
      ctx,
      registration,
      archived,
      project.mapping.platformId,
      mod.mapping.platformId,
    );
  }

  async listMilestones(ctx: ServiceRequestContext, projectId: ProjectId) {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    return provider.listMilestones(ctx, project.providerNativeId);
  }

  async createMilestone(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    input: CreateMilestoneInput,
  ) {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    return provider.createMilestone(ctx, project.providerNativeId, input);
  }

  async updateMilestone(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    milestoneId: string,
    input: UpdateMilestoneInput,
  ) {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    return provider.updateMilestone(ctx, project.providerNativeId, milestoneId, input);
  }

  async getRoadmap(ctx: ServiceRequestContext, projectId: ProjectId) {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    const roadmap = await provider.getRoadmap(ctx, project.providerNativeId);
    return { ...roadmap, projectId: project.mapping.platformId };
  }

  async listProjectActivity(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    page?: CursorPageRequest,
  ) {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    return provider.listProjectActivity(ctx, project.providerNativeId, page);
  }

  private async mutateSprint(
    ctx: ServiceRequestContext,
    sprintId: SprintId,
    mutate: (
      provider: ReturnType<ProviderResolver["resolveProjectProvider"]>,
      sprintRef: string,
    ) => Promise<Sprint>,
  ): Promise<Sprint> {
    assertRequestContext(ctx);
    const sprint = await this.mapping.resolveExisting(ctx, sprintId, "sprint");
    if (!sprint.mapping.parentPlatformId) {
      throw new PlatformServiceError({
        category: "configuration",
        code: "CONFIGURATION_ERROR",
        message: "Sprint mapping is missing parent project reference",
        correlationId: ctx.correlationId,
        retryable: false,
      });
    }
    const project = await this.mapping.resolveExisting(
      ctx,
      sprint.mapping.parentPlatformId,
      "project",
    );
    const provider = this.resolver.resolveProjectProvider(ctx, {
      mappedProviderId: sprint.providerId,
      mappedIntegrationId: sprint.integrationId,
    });
    const registration = findRegistration(this.resolver, "project", provider);
    const sprintRef = encodePlaneSprintRef(project.providerNativeId, sprint.providerNativeId);
    const updated = await mutate(provider, sprintRef);
    return this.normalizeSprint(
      ctx,
      registration,
      updated,
      project.mapping.platformId,
      sprint.mapping.platformId,
    );
  }

  private async normalizeProject(
    ctx: ServiceRequestContext,
    registration: ProviderRegistration,
    project: Project,
    knownPlatformId?: string,
  ): Promise<Project> {
    const platformId =
      knownPlatformId ??
      (await this.mapping.toPlatformId(
        ctx,
        "project",
        registration.providerId,
        registration.integrationId,
        project.id,
      ));

    let workspaceId = project.workspaceId;
    if (workspaceId) {
      workspaceId = await this.mapping.toPlatformId(
        ctx,
        "workspace",
        registration.providerId,
        registration.integrationId,
        workspaceId,
      );
    }

    return { ...project, id: platformId, workspaceId, tenantId: ctx.tenantId };
  }

  private async normalizeStatus(
    ctx: ServiceRequestContext,
    registration: ProviderRegistration,
    status: ProjectStatusEntity,
    parentProjectId: string,
    knownPlatformId?: string,
  ): Promise<ProjectStatusEntity> {
    const platformId =
      knownPlatformId ??
      (await this.mapping.toPlatformId(
        ctx,
        "status",
        registration.providerId,
        registration.integrationId,
        status.id,
        { platformId: parentProjectId },
      ));
    return { ...status, id: platformId, projectId: parentProjectId };
  }

  private async normalizeLabel(
    ctx: ServiceRequestContext,
    registration: ProviderRegistration,
    label: Label,
    parentProjectId: string,
    knownPlatformId?: string,
  ): Promise<Label> {
    const platformId =
      knownPlatformId ??
      (await this.mapping.toPlatformId(
        ctx,
        "label",
        registration.providerId,
        registration.integrationId,
        label.id,
        { platformId: parentProjectId },
      ));
    return { ...label, id: platformId, projectId: parentProjectId };
  }

  private async normalizeSprint(
    ctx: ServiceRequestContext,
    registration: ProviderRegistration,
    sprint: Sprint,
    parentProjectId: string,
    knownPlatformId?: string,
  ): Promise<Sprint> {
    const platformId =
      knownPlatformId ??
      (await this.mapping.toPlatformId(
        ctx,
        "sprint",
        registration.providerId,
        registration.integrationId,
        sprint.id,
        {
          platformId: parentProjectId,
          providerNativeId: extractProvisionalProviderNativeId(sprint.id, "sprint"),
        },
      ));
    return { ...sprint, id: platformId, projectId: parentProjectId };
  }

  private async normalizeModule(
    ctx: ServiceRequestContext,
    registration: ProviderRegistration,
    mod: ProjectModule,
    parentProjectId: string,
    knownPlatformId?: string,
  ): Promise<ProjectModule> {
    const platformId =
      knownPlatformId ??
      (await this.mapping.toPlatformId(
        ctx,
        "module",
        registration.providerId,
        registration.integrationId,
        mod.id,
        { platformId: parentProjectId },
      ));
    return { ...mod, id: platformId, projectId: parentProjectId };
  }
}

/** Mapping-aware team service. */
export class TeamServiceImpl implements TeamService {
  constructor(
    private readonly resolver: ProviderResolver,
    private readonly mapping: MappingOrchestrator,
  ) {}

  async listTeam(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    query?: ListQuery<TeamListFilter | MemberListFilter, TeamSortField>,
  ): Promise<PageResult<TeamMember>> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const provider = this.resolver.resolveTeamProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    const registration = findRegistration(this.resolver, "team", provider);
    const result = await provider.listTeam(ctx, project.providerNativeId, query);
    const items: TeamMember[] = [];
    for (const member of result.items) {
      items.push(await this.normalizeMember(ctx, registration, member, project.mapping.platformId));
    }
    return { ...result, items };
  }

  async getTeamMember(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    memberId: TeamMemberId,
  ): Promise<TeamMember> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const member = await this.mapping.resolveExisting(ctx, memberId, "member");
    const provider = this.resolver.resolveTeamProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    const registration = findRegistration(this.resolver, "team", provider);
    const entity = await provider.getTeamMember(
      ctx,
      project.providerNativeId,
      member.providerNativeId,
    );
    return this.normalizeMember(
      ctx,
      registration,
      entity,
      project.mapping.platformId,
      member.mapping.platformId,
    );
  }

  async addTeamMember(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    input: AddTeamMemberInput,
  ): Promise<TeamMember> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const provider = this.resolver.resolveTeamProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    const registration = findRegistration(this.resolver, "team", provider);
    const created = await provider.addTeamMember(ctx, project.providerNativeId, input);
    const mapping = await this.mapping.ensureMappingAfterCreate({
      ctx,
      entityType: "member",
      providerId: registration.providerId,
      integrationId: registration.integrationId,
      providerEntityId: created.id,
      parentPlatformId: project.mapping.platformId,
      parentProviderNativeId: project.providerNativeId,
    });
    return this.normalizeMember(
      ctx,
      registration,
      created,
      project.mapping.platformId,
      mapping.platformId,
    );
  }

  async updateTeamMember(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    memberId: TeamMemberId,
    input: UpdateTeamMemberInput,
  ): Promise<TeamMember> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const member = await this.mapping.resolveExisting(ctx, memberId, "member");
    const provider = this.resolver.resolveTeamProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    const registration = findRegistration(this.resolver, "team", provider);
    const updated = await provider.updateTeamMember(
      ctx,
      project.providerNativeId,
      member.providerNativeId,
      input,
    );
    return this.normalizeMember(
      ctx,
      registration,
      updated,
      project.mapping.platformId,
      member.mapping.platformId,
    );
  }

  async removeTeamMember(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    userId: UserId,
  ): Promise<void> {
    assertRequestContext(ctx);
    const project = await this.mapping.resolveExisting(ctx, projectId, "project");
    const provider = this.resolver.resolveTeamProvider(ctx, {
      mappedProviderId: project.providerId,
      mappedIntegrationId: project.integrationId,
    });
    await provider.removeTeamMember(ctx, project.providerNativeId, userId);
  }

  private async normalizeMember(
    ctx: ServiceRequestContext,
    registration: ProviderRegistration,
    member: TeamMember,
    parentProjectId: string,
    knownPlatformId?: string,
  ): Promise<TeamMember> {
    const platformId =
      knownPlatformId ??
      (await this.mapping.toPlatformId(
        ctx,
        "member",
        registration.providerId,
        registration.integrationId,
        member.id,
        { platformId: parentProjectId },
      ));
    return { ...member, id: platformId, projectId: parentProjectId };
  }
}

/** User service — mapping-aware context enforcement; directory still provider-owned. */
export class UserServiceImpl implements UserService {
  constructor(
    private readonly resolver: ProviderResolver,
    private readonly _mapping: MappingOrchestrator,
  ) {}

  listUsers(ctx: ServiceRequestContext, query?: ListQuery<UserListFilter, UserSortField>) {
    assertRequestContext(ctx);
    return this.resolver.resolveUserProvider(ctx).listUsers(ctx, query);
  }

  getUser(ctx: ServiceRequestContext, userId: UserId) {
    assertRequestContext(ctx);
    return this.resolver.resolveUserProvider(ctx).getUser(ctx, userId);
  }

  getUserByEmail(ctx: ServiceRequestContext, email: string) {
    assertRequestContext(ctx);
    return this.resolver.resolveUserProvider(ctx).getUserByEmail(ctx, email);
  }

  getUserProfile(ctx: ServiceRequestContext, userId: UserId) {
    assertRequestContext(ctx);
    return this.resolver.resolveUserProvider(ctx).getUserProfile(ctx, userId);
  }

  createUser(ctx: ServiceRequestContext, input: CreateUserInput) {
    assertRequestContext(ctx);
    return this.resolver.resolveUserProvider(ctx).createUser(ctx, input);
  }

  updateUser(ctx: ServiceRequestContext, userId: UserId, input: UpdateUserInput) {
    assertRequestContext(ctx);
    return this.resolver.resolveUserProvider(ctx).updateUser(ctx, userId, input);
  }
}

/** Search service — context enforcement; indexing deferred. */
export class SearchServiceImpl implements SearchService {
  constructor(
    private readonly resolver: ProviderResolver,
    private readonly _mapping: MappingOrchestrator,
  ) {}

  search(ctx: ServiceRequestContext, input: SearchQueryInput) {
    assertRequestContext(ctx);
    return this.resolver.resolveSearchProvider(ctx).search(ctx, input);
  }

  suggest(ctx: ServiceRequestContext, input: SearchSuggestInput) {
    assertRequestContext(ctx);
    return this.resolver.resolveSearchProvider(ctx).suggest(ctx, input);
  }
}
