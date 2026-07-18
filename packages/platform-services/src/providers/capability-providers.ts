import type {
  ProjectService,
  SearchService,
  SupportAnalyticsService,
  SupportArticleService,
  SupportGroupService,
  SupportHistoryService,
  SupportOrganizationService,
  SupportSearchService,
  SupportService,
  SupportUserService,
  TeamService,
  UserService,
  WorkspaceService,
  ServiceRequestContext,
  ListQuery,
  TaskListFilter,
  TaskSortField,
  PageResult,
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TransitionTaskStatusInput,
  AssignTaskInput,
  SyncRunOptions,
  SyncRunResult,
  SyncStatus,
  WebhookRegistration,
  CreateWebhookInput,
  UpdateWebhookInput,
  WebhookValidationResult,
} from "@apzhub/platform-service-contracts";
import type {
  TestingPipelineArtifactService,
  TestingPipelineJobService,
  TestingPipelineRepositoryService,
  TestingPipelineRunLiveService,
  TestingPipelineStepService,
  TestingPipelineSummaryService,
  TestingPipelineWorkflowService,
} from "@apzhub/platform-service-contracts";

/** Vendor-neutral workspace capability provider. */
export type WorkspaceProvider = WorkspaceService;

/** Vendor-neutral project capability provider. */
export type ProjectProvider = ProjectService;

/**
 * Vendor-neutral task capability provider.
 *
 * Project-scoped (unlike public TaskService.getTask which uses only taskId).
 * Mapping-aware TaskServiceImpl resolves project/task native IDs before delegation.
 */
export interface TaskProvider {
  listTasks(
    ctx: ServiceRequestContext,
    projectId: string,
    query?: ListQuery<TaskListFilter, TaskSortField>,
  ): Promise<PageResult<Task>>;

  getTask(ctx: ServiceRequestContext, projectId: string, taskId: string): Promise<Task>;

  createTask(
    ctx: ServiceRequestContext,
    projectId: string,
    input: CreateTaskInput,
  ): Promise<Task>;

  updateTask(
    ctx: ServiceRequestContext,
    projectId: string,
    taskId: string,
    input: UpdateTaskInput,
  ): Promise<Task>;

  archiveTask(
    ctx: ServiceRequestContext,
    projectId: string,
    taskId: string,
  ): Promise<Task>;

  transitionTaskStatus(
    ctx: ServiceRequestContext,
    projectId: string,
    taskId: string,
    input: TransitionTaskStatusInput,
  ): Promise<Task>;

  assignTask(
    ctx: ServiceRequestContext,
    projectId: string,
    taskId: string,
    input: AssignTaskInput,
  ): Promise<Task>;
}

/** Vendor-neutral team capability provider. */
export type TeamProvider = TeamService;

/** Vendor-neutral user capability provider. */
export type UserProvider = UserService;

/** Vendor-neutral search capability provider. */
export type SearchProvider = SearchService;

/** Vendor-neutral Support Request capability provider — uses provider-native IDs. */
export type SupportProvider = SupportService;

/** Vendor-neutral Support organisation capability provider. */
export type SupportOrganizationProvider = SupportOrganizationService;

/** Vendor-neutral Support group capability provider. */
export type SupportGroupProvider = SupportGroupService;

/** Vendor-neutral Support user capability provider. */
export type SupportUserProvider = SupportUserService;

/** Vendor-neutral Support article capability provider. */
export type SupportArticleProvider = SupportArticleService;

/** Vendor-neutral Support search capability provider. */
export type SupportSearchProvider = SupportSearchService;

/** Vendor-neutral Support history capability provider. */
export type SupportHistoryProvider = SupportHistoryService;

/** Vendor-neutral Support analytics capability provider. */
export type SupportAnalyticsProvider = SupportAnalyticsService;

/** Support synchronisation capability provider. */
export interface SupportSyncProvider {
  getSyncState(ctx: ServiceRequestContext): Promise<SyncStatus>;
  getLastSyncTimestamp(ctx: ServiceRequestContext): Promise<string | undefined>;
  safeRestart(ctx: ServiceRequestContext): Promise<SyncStatus>;
  runFullSync(
    ctx: ServiceRequestContext,
    options?: SyncRunOptions,
  ): Promise<SyncRunResult>;
  runIncrementalSync(
    ctx: ServiceRequestContext,
    options?: SyncRunOptions,
  ): Promise<SyncRunResult>;
}

/** Support webhook registration capability provider. */
export interface SupportWebhookProvider {
  validateConfiguration(
    input: CreateWebhookInput | UpdateWebhookInput,
  ): WebhookValidationResult;
  list(ctx: ServiceRequestContext): Promise<readonly WebhookRegistration[]>;
  get(ctx: ServiceRequestContext, webhookId: string): Promise<WebhookRegistration>;
  create(
    ctx: ServiceRequestContext,
    input: CreateWebhookInput,
  ): Promise<WebhookRegistration>;
  update(
    ctx: ServiceRequestContext,
    webhookId: string,
    input: UpdateWebhookInput,
  ): Promise<WebhookRegistration>;
  delete(ctx: ServiceRequestContext, webhookId: string): Promise<void>;
  supportedEventTypes(): readonly string[];
  supportedOperations(): readonly string[];
}

/** Vendor-neutral live CI repository capability provider. */
export type PipelineRepositoryProvider = TestingPipelineRepositoryService;

/** Vendor-neutral live CI workflow capability provider. */
export type PipelineWorkflowProvider = TestingPipelineWorkflowService;

/** Vendor-neutral live CI run capability provider. */
export type PipelineRunProvider = TestingPipelineRunLiveService;

/** Vendor-neutral live CI artifact capability provider. */
export type PipelineArtifactProvider = TestingPipelineArtifactService;

/** Vendor-neutral live CI job capability provider. */
export type PipelineJobProvider = TestingPipelineJobService;

/** Vendor-neutral live CI step capability provider. */
export type PipelineStepProvider = TestingPipelineStepService;

/** Vendor-neutral live CI summary capability provider. */
export type PipelineSummaryProvider = TestingPipelineSummaryService;
