export { PlaneAdapter } from "./plane-adapter";
export type { PlaneDiagnosticsExtension, PlaneAdapterOptions } from "./plane-adapter";

export type {
  Workspace,
  Project,
  ProjectStatusEntity,
  Label,
  Sprint,
  ProjectModule,
  TeamMember,
  Task,
  TaskStatus,
  TaskPriority,
  ProjectStatus,
  SprintStatus,
  TeamRole,
  StatusGroup,
  ProjectId,
  SprintId,
  TeamMemberId,
  LabelId,
  StatusId,
  UserId,
  WorkspaceId,
  ProjectModuleId,
  TaskId,
  Comment,
  CommentId,
  ActivityEntry,
  ActivityPage,
  ActivityId,
  Watcher,
  WatcherId,
  ProjectStatistics,
  TaskStatistics,
  VelocitySnapshot,
  BurndownSnapshot,
  BurndownPoint,
  CycleProgressSnapshot,
  MemberWorkloadSummary,
  DistributionBucket,
} from "./models/canonical";

export type {
  PageRequest,
  PageResult,
  SortField,
  SortDirection,
  WorkspaceListFilter,
  ProjectListFilter,
  ProjectStateListFilter,
  LabelListFilter,
  CycleListFilter,
  ModuleListFilter,
  MemberListFilter,
  TaskListFilter,
  TaskSortField,
  ActivityListFilter,
  CommentListFilter,
} from "./models/query";

export type {
  CreateProjectInput,
  UpdateProjectInput,
  CreateLabelInput,
  UpdateLabelInput,
  CreateCycleInput,
  UpdateCycleInput,
  CreateModuleInput,
  UpdateModuleInput,
  CreateProjectStateInput,
  UpdateProjectStateInput,
  AddMemberInput,
  UpdateMemberInput,
  CreateTaskInput,
  UpdateTaskInput,
  TransitionTaskStatusInput,
  AssignTaskInput,
  AddCommentInput,
  UpdateCommentInput,
  AddWatcherInput,
  CreateWebhookInput,
  UpdateWebhookInput,
  WebhookRegistration,
  EventTranslationResult,
  IntegrationEventEnvelope,
  SyncStatus,
  SyncRunResult,
  SyncRunOptions,
} from "./models/inputs";

export type {
  PlaneConfiguration,
  PlaneConfigurationInput,
  PlaneRetryConfiguration,
  PlaneSslOptions,
  PlaneConfigurationValidationResult,
} from "./plane-config";
export {
  DEFAULT_PLANE_RETRY,
  DEFAULT_PLANE_SSL,
  normalizePlaneConfiguration,
  validatePlaneConfiguration,
} from "./plane-config";

export type {
  PlaneBootstrapConfiguration,
  CreatePlaneBootstrapInput,
  PlaneExtendedCapabilityId,
} from "./plane-bootstrap";
export {
  createPlaneBootstrapConfiguration,
  PLANE_SDK_CAPABILITIES,
  PLANE_EXTENDED_CAPABILITIES,
  getPlaneExtendedCapabilities,
} from "./plane-bootstrap";

export {
  createPlaneVendorErrorMapper,
  PlaneVendorErrorMapper,
  PLANE_INTEGRATION_ID,
} from "./plane-error-mapper";

export type {
  CreatePlaneAdapterInput,
  CreatePlaneAdapterResult,
} from "./plane-factory";
export { createPlaneAdapter, disposePlaneAdapter } from "./plane-factory";

export {
  createPlaneMappingProvider,
  createPlaneMappingRegistry,
  createPlaneMappingPipeline,
  PLANE_MAPPING_PROVIDER_ID,
} from "./mappers/plane-mapping-registry";

export {
  PlaneCoreServices,
  createPlaneCoreServices,
} from "./services/plane-core-services";
export { PlaneWorkspaceService } from "./services/workspace-service";
export { PlaneProjectService } from "./services/project-service";
export { PlaneProjectStateService } from "./services/project-state-service";
export { PlaneLabelService } from "./services/label-service";
export { PlaneCycleService } from "./services/cycle-service";
export { PlaneModuleService } from "./services/module-service";
export { PlaneMemberService } from "./services/member-service";
export { PlaneTaskService } from "./services/task-service";
export { PlaneCommentService } from "./services/comment-service";
export { PlaneActivityService } from "./services/activity-service";
export { PlaneWatcherService } from "./services/watcher-service";
export { PlaneAnalyticsService } from "./services/analytics-service";
export { PlaneWebhookService } from "./services/webhook-service";
export { PlaneEventService } from "./services/event-service";
export { PlaneSyncService } from "./services/sync-service";

export {
  translatePlaneWebhookPayload,
  isPlaneWebhookPayload,
  PLANE_SUPPORTED_WEBHOOK_EVENT_TYPES,
} from "./events/event-translator";

export {
  asPlaneWebhookManager,
  translatePlaneWebhookToSourceEvent,
  PLANE_PROVIDER_ID,
} from "./events/sdk-events";
export type { PlaneWebhookManagerAdapter } from "./events/sdk-events";

export {
  createPlanePollingSource,
  toPlanePollingCursor,
  PLANE_POLLING_SOURCE_DEFINITION,
} from "./events/polling-source";

export {
  discoverPlaneCoreServiceCapabilities,
  getPlaneServiceCapability,
  PLANE_CORE_SERVICE_CAPABILITIES,
  PLANE_CORE_SERVICE_IDS,
} from "./capabilities/service-capabilities";
export type {
  PlaneCoreServiceId,
  PlaneServiceCapability,
  PlaneServiceOperation,
} from "./capabilities/service-capabilities";

export {
  certifyPlaneCapabilities,
  buildPlaneCompatibilityMatrix,
  classifyPlaneOperationalHealth,
  evaluatePlaneReadiness,
  detectPlaneFeatures,
  createPlaneOperationsService,
  PlaneOperationsService,
  PLANE_REFERENCE_ADAPTER_PATTERNS,
  PLANE_SUPPORTED_VERSION_RANGE,
  PLANE_CERTIFICATION_CAPABILITY_IDS,
  PLANE_OPTIONAL_CAPABILITIES,
} from "./operations";
export type {
  PlaneOperationalHealthLevel,
  PlaneCapabilityCertification,
  PlaneCompatibilityMatrix,
  PlaneReadinessResult,
  PlaneReadinessCheckResult,
  PlaneFeatureDetectionResult,
  PlaneRuntimeDiagnosticsSnapshot,
  PlaneOperationalReport,
  PlaneEdition,
} from "./operations";

export const PLANE_ADAPTER_VERSION = "0.6.0";

export {
  createPlaneAdapterHarness,
  certifyPlaneWithSdkHarness,
  getPlaneHarnessMetadata,
} from "./harness/plane-harness";
export type {
  PlaneHarnessMetadata,
  CertifyPlaneWithSdkHarnessInput,
  CertifyPlaneWithSdkHarnessResult,
} from "./harness/plane-harness";
