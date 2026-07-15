import type { ServiceRequestContext } from "../common/context";
import type { CursorPageRequest } from "../common/paging";
import type { ListQuery } from "../common/list-query";
import type { PageResult } from "../common/paging";
import type {
  ActivityPage,
  Label,
  Milestone,
  Project,
  ProjectModule,
  ProjectStatusEntity,
  Roadmap,
  Sprint,
} from "../domain";
import type {
  CreateLabelInput,
  CreateMilestoneInput,
  CreateModuleInput,
  CreateProjectInput,
  CreateProjectStateInput,
  CreateSprintInput,
  UpdateLabelInput,
  UpdateMilestoneInput,
  UpdateModuleInput,
  UpdateProjectInput,
  UpdateProjectStateInput,
  UpdateSprintInput,
} from "../inputs";
import type {
  CycleListFilter,
  LabelListFilter,
  ModuleListFilter,
  ProjectListFilter,
  ProjectSortField,
  ProjectStateListFilter,
} from "../queries";
import type { ProjectId, SprintId, StatusId } from "../domain/identifiers";

/** Vendor-neutral project and project-scoped configuration operations. */
export interface ProjectService {
  listProjects(
    ctx: ServiceRequestContext,
    query?: ListQuery<ProjectListFilter, ProjectSortField>,
  ): Promise<PageResult<Project>>;

  getProject(ctx: ServiceRequestContext, projectId: ProjectId): Promise<Project>;

  createProject(ctx: ServiceRequestContext, input: CreateProjectInput): Promise<Project>;

  updateProject(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    input: UpdateProjectInput,
  ): Promise<Project>;

  archiveProject(ctx: ServiceRequestContext, projectId: ProjectId): Promise<Project>;

  listStatuses(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    query?: ListQuery<ProjectStateListFilter>,
  ): Promise<PageResult<ProjectStatusEntity>>;

  getStatus(ctx: ServiceRequestContext, projectId: ProjectId, statusId: StatusId): Promise<ProjectStatusEntity>;

  createStatus(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    input: CreateProjectStateInput,
  ): Promise<ProjectStatusEntity>;

  updateStatus(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    statusId: StatusId,
    input: UpdateProjectStateInput,
  ): Promise<ProjectStatusEntity>;

  deleteStatus(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    statusId: StatusId,
  ): Promise<void>;

  listLabels(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    query?: ListQuery<LabelListFilter>,
  ): Promise<PageResult<Label>>;

  createLabel(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    input: CreateLabelInput,
  ): Promise<Label>;

  updateLabel(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    labelId: string,
    input: UpdateLabelInput,
  ): Promise<Label>;

  deleteLabel(ctx: ServiceRequestContext, projectId: ProjectId, labelId: string): Promise<void>;

  listSprints(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    query?: ListQuery<CycleListFilter>,
  ): Promise<PageResult<Sprint>>;

  getSprint(ctx: ServiceRequestContext, sprintId: SprintId): Promise<Sprint>;

  createSprint(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    input: CreateSprintInput,
  ): Promise<Sprint>;

  updateSprint(
    ctx: ServiceRequestContext,
    sprintId: SprintId,
    input: UpdateSprintInput,
  ): Promise<Sprint>;

  archiveSprint(ctx: ServiceRequestContext, sprintId: SprintId): Promise<Sprint>;

  startSprint(ctx: ServiceRequestContext, sprintId: SprintId): Promise<Sprint>;

  completeSprint(ctx: ServiceRequestContext, sprintId: SprintId): Promise<Sprint>;

  listModules(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    query?: ListQuery<ModuleListFilter>,
  ): Promise<PageResult<ProjectModule>>;

  getModule(ctx: ServiceRequestContext, projectId: ProjectId, moduleId: string): Promise<ProjectModule>;

  createModule(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    input: CreateModuleInput,
  ): Promise<ProjectModule>;

  updateModule(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    moduleId: string,
    input: UpdateModuleInput,
  ): Promise<ProjectModule>;

  archiveModule(ctx: ServiceRequestContext, projectId: ProjectId, moduleId: string): Promise<ProjectModule>;

  listMilestones(ctx: ServiceRequestContext, projectId: ProjectId): Promise<readonly Milestone[]>;

  createMilestone(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    input: CreateMilestoneInput,
  ): Promise<Milestone>;

  updateMilestone(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    milestoneId: string,
    input: UpdateMilestoneInput,
  ): Promise<Milestone>;

  getRoadmap(ctx: ServiceRequestContext, projectId: ProjectId): Promise<Roadmap>;

  listProjectActivity(
    ctx: ServiceRequestContext,
    projectId: ProjectId,
    page?: CursorPageRequest,
  ): Promise<ActivityPage>;
}
