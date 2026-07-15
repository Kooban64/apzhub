export {
  createPlatformServices,
  createPlatformServicesFromEnv,
  createPlatformServicesWithPlane,
  createPlatformServicesWithZammad,
  createPlatformServicesWithGitHubActions,
  registerPlaneProviders,
  registerZammadProviders,
  registerGitHubActionsProviders,
  PLATFORM_SERVICES_VERSION,
} from "./services/create-platform-services";

export {
  createPlatformReportingService,
  bindTemplateToDocument,
  validateTemplateBinding,
  renderOutput,
  sha256Hex,
  ReportingDomainError,
  REPORTING_CORE_VERSION,
} from "./reporting";

export { PlatformReportingServiceImpl } from "./services/reporting";
export {
  createTestingPlatformServices,
  createTestingPlatformServicesForProduction,
  createTestingPlatformServicesForTest,
  wrapTestingPlatformGatewayWithPipeline,
  createTestingReadinessIndicators,
  isTestingServiceEnabled,
  mapTestingDomainError,
  withTestingErrorMapping,
  TestingApprovalServiceImpl,
  TestingAutomationServiceImpl,
  TestingCaseServiceImpl,
  TestingCertificationServiceImpl,
  TestingCoverageServiceImpl,
  TestingDashboardServiceImpl,
  TestingDefectServiceImpl,
  TestingEvidenceServiceImpl,
  TestingExecutionServiceImpl,
  TestingPlanServiceImpl,
  TestingQualityServiceImpl,
  TestingReleaseReadinessServiceImpl,
  TestingReportingServiceImpl,
  TestingRequirementServiceImpl,
  TestingSuiteServiceImpl,
  TestingTraceabilityServiceImpl,
  TestingPipelinesServiceImpl,
  TestingReleaseGovernanceServiceImpl,
  PipelineRepositoryServiceImpl,
  PipelineWorkflowServiceImpl,
  PipelineRunLiveServiceImpl,
  PipelineArtifactServiceImpl,
  PipelineJobServiceImpl,
  PipelineStepServiceImpl,
  PipelineSummaryServiceImpl,
  createTestingServiceImpls,
} from "./services/testing";
export {
  createPlatformQualityPlatformServices,
  createPlatformQualityPlatformServicesForTest,
  wrapPlatformQualityWithPipeline,
  wrapPlatformReleaseWithPipeline,
  wrapPlatformGovernanceWithPipeline,
  createPlatformQualityReadinessIndicators,
  isPlatformQualityEnabled,
} from "./services/platform-quality";
export {
  createDocumentPlatformServices,
  createDocumentPlatformServicesForProduction,
  createDocumentPlatformServicesForTest,
  wrapDocumentPlatformGatewayWithPipeline,
  createDocumentPlatformServiceImpls,
  isDocumentServiceEnabled,
} from "./services/documents";
export {
  createSearchPlatformServices,
  createSearchPlatformServicesForProduction,
  createSearchPlatformServicesForTest,
  wrapSearchPlatformGatewayWithPipeline,
  createSearchPlatformServiceImpls,
  isSearchServiceEnabled,
  mapSearchDomainError,
} from "./services/search";
export {
  createSearchExecutionServices,
  createSearchExecutionServicesWithMeilisearch,
  createSearchExecutionServicesForProduction,
  createSearchExecutionServicesForTest,
  wrapSearchExecutionGatewayWithPipeline,
  MeilisearchSearchProvider,
  SearchExecutionProviderResolver,
  createSearchExecutionProviderResolver,
  applyMandatorySearchSecurityFilters,
  assertMandatoryTenantFilterPresent,
  toProviderIndexUid,
  toProviderDocumentId,
  toPublicIndexId,
  isSearchExecutionMeilisearchConfigured,
  resolveSearchMeilisearchProviderEnv,
  createSearchExecutionServiceImpls,
} from "./services/search-execution";

export type {
  CreatePlatformServicesInput,
  CreatePlatformServicesFromEnvInput,
  CreatePlatformServicesWithGitHubActionsOptions,
  PlatformServicesBundle,
  RegisterPlaneProvidersInput,
  RegisterZammadProvidersInput,
  RegisterGitHubActionsProvidersInput,
} from "./services/create-platform-services";
export type {
  CreateDocumentPlatformServicesForProductionInput,
  CreateDocumentPlatformServicesForTestInput,
  CreateDocumentPlatformServicesInput,
  DocumentPlatformServicesBundle,
  DocumentPlatformServiceImpls,
} from "./services/documents";
export type {
  CreateSearchPlatformServicesForProductionInput,
  CreateSearchPlatformServicesForTestInput,
  CreateSearchPlatformServicesInput,
  SearchPlatformServicesBundle,
  SearchPlatformServiceImpls,
} from "./services/search";
export type {
  CreateSearchExecutionServicesForProductionInput,
  CreateSearchExecutionServicesForTestInput,
  CreateSearchExecutionServicesInput,
  CreateSearchExecutionServicesWithMeilisearchInput,
  SearchExecutionServiceImpls,
  SearchExecutionServicesBundle,
  SearchMeilisearchProviderEnv,
  MeilisearchSearchProviderOptions,
} from "./services/search-execution";
export type {
  CreateTestingPlatformServicesForProductionInput,
  CreateTestingPlatformServicesForTestInput,
  CreateTestingPlatformServicesInput,
  TestingPlatformGatewayWithReporting,
  TestingPlatformServiceImpls,
  TestingPlatformServicesBundle,
  TestingReadinessIndicators,
} from "./services/testing";
export type {
  CreatePlatformQualityPlatformServicesForTestInput,
  CreatePlatformQualityPlatformServicesInput,
  PlatformQualityPlatformServicesBundle,
  PlatformQualityReadinessIndicators,
} from "./services/platform-quality";

export {
  ProjectServiceImpl,
  SearchServiceImpl,
  TeamServiceImpl,
  UserServiceImpl,
  WorkspaceServiceImpl,
} from "./services/platform-service-impls";

export { TaskServiceImpl } from "./services/task-service-impl";

export {
  SupportServiceImpl,
  SupportOrganizationServiceImpl,
  SupportGroupServiceImpl,
  SupportUserServiceImpl,
  SupportArticleServiceImpl,
  SupportSearchServiceImpl,
  SupportHistoryServiceImpl,
  SupportAnalyticsServiceImpl,
} from "./services/support-service-impls";

export { ProviderRegistry } from "./providers/registry/provider-registry";
export { ProviderResolver } from "./providers/registry/provider-resolver";
export type { ProviderResolverOptions } from "./providers/registry/provider-resolver";

export type {
  PlatformProviderCapability,
  ProviderRegistration,
  ProviderSelectionCriteria,
} from "./providers/types";

export type {
  ProjectProvider,
  SearchProvider,
  SupportAnalyticsProvider,
  SupportArticleProvider,
  SupportGroupProvider,
  SupportHistoryProvider,
  SupportOrganizationProvider,
  SupportProvider,
  SupportSearchProvider,
  SupportSyncProvider,
  SupportUserProvider,
  SupportWebhookProvider,
  TaskProvider,
  TeamProvider,
  UserProvider,
  WorkspaceProvider,
  PipelineRepositoryProvider,
  PipelineWorkflowProvider,
  PipelineRunProvider,
  PipelineArtifactProvider,
  PipelineJobProvider,
  PipelineStepProvider,
  PipelineSummaryProvider,
} from "./providers/capability-providers";

export {
  createPlaneTaskProvider,
  PLANE_TASK_PROVIDER_REGISTRATION,
} from "./providers/plane/plane-task-provider";

export {
  createPlaneProjectProvider,
  encodePlaneSprintRef,
  decodePlaneSprintRef,
  PLANE_PROJECT_PROVIDER_REGISTRATION,
} from "./providers/plane/plane-project-provider";

export {
  createPlaneTeamProvider,
  PLANE_TEAM_PROVIDER_REGISTRATION,
} from "./providers/plane/plane-team-provider";

export {
  createPlaneWorkspaceProvider,
  PLANE_WORKSPACE_PROVIDER_REGISTRATION,
} from "./providers/plane/plane-workspace-provider";

export {
  createZammadSupportProvider,
  ZAMMAD_SUPPORT_PROVIDER_REGISTRATION,
} from "./providers/zammad/zammad-support-provider";

export {
  createZammadOrganizationProvider,
  ZAMMAD_ORGANIZATION_PROVIDER_REGISTRATION,
} from "./providers/zammad/zammad-organization-provider";

export {
  createZammadGroupProvider,
  ZAMMAD_GROUP_PROVIDER_REGISTRATION,
} from "./providers/zammad/zammad-group-provider";

export {
  createZammadUserProvider,
  ZAMMAD_USER_PROVIDER_REGISTRATION,
} from "./providers/zammad/zammad-user-provider";

export {
  createZammadArticleProvider,
  ZAMMAD_ARTICLE_PROVIDER_REGISTRATION,
} from "./providers/zammad/zammad-article-provider";

export {
  createZammadSearchProvider,
  ZAMMAD_SEARCH_PROVIDER_REGISTRATION,
} from "./providers/zammad/zammad-search-provider";

export {
  createZammadHistoryProvider,
  ZAMMAD_HISTORY_PROVIDER_REGISTRATION,
} from "./providers/zammad/zammad-history-provider";

export {
  createZammadAnalyticsProvider,
  ZAMMAD_ANALYTICS_PROVIDER_REGISTRATION,
} from "./providers/zammad/zammad-analytics-provider";

export {
  createZammadSyncProvider,
  ZAMMAD_SYNC_PROVIDER_REGISTRATION,
} from "./providers/zammad/zammad-sync-provider";

export {
  createZammadWebhookProvider,
  ZAMMAD_WEBHOOK_PROVIDER_REGISTRATION,
} from "./providers/zammad/zammad-webhook-provider";

export {
  createPlaneSearchProvider,
  createPlaneUserProvider,
  PLANE_SEARCH_PROVIDER_REGISTRATION,
  PLANE_USER_PROVIDER_REGISTRATION,
} from "./providers/plane/plane-user-search-providers";

export {
  createGitHubActionsPipelineRepositoryProvider,
  createGitHubActionsPipelineWorkflowProvider,
  createGitHubActionsPipelineRunProvider,
  createGitHubActionsPipelineArtifactProvider,
  createGitHubActionsPipelineJobProvider,
  createGitHubActionsPipelineStepProvider,
  createGitHubActionsPipelineSummaryProvider,
  GITHUB_ACTIONS_PIPELINE_REPOSITORY_PROVIDER_REGISTRATION,
  GITHUB_ACTIONS_PIPELINE_WORKFLOW_PROVIDER_REGISTRATION,
  GITHUB_ACTIONS_PIPELINE_RUN_PROVIDER_REGISTRATION,
  GITHUB_ACTIONS_PIPELINE_ARTIFACT_PROVIDER_REGISTRATION,
  GITHUB_ACTIONS_PIPELINE_JOB_PROVIDER_REGISTRATION,
  GITHUB_ACTIONS_PIPELINE_STEP_PROVIDER_REGISTRATION,
  GITHUB_ACTIONS_PIPELINE_SUMMARY_PROVIDER_REGISTRATION,
  GITHUB_ACTIONS_INTEGRATION_ID,
} from "./providers/github-actions";

export { toIntegrationContext } from "./context/to-integration-context";
export {
  mapProviderError,
  throwMissingProvider,
  throwUnsupportedProviderOperation,
  withProviderErrorMapping,
} from "./errors/map-provider-error";

export { unwrapListQuery } from "./query/unwrap-list-query";

export {
  generateGlobalId,
  isValidGlobalId,
  parseGlobalId,
  assertGlobalId,
  extractProvisionalProviderNativeId,
  isProvisionalProviderId,
  InMemoryEntityMappingStore,
  PostgresEntityMappingStore,
  createEntityMappingStore,
  resolveEntityMappingStoreMode,
  assertEntityMappingStoreModeAllowed,
  translateMappingPersistenceError,
  safePersistenceDiagnosticCause,
  noopMappingStoreLogger,
  noopMappingStoreMetrics,
  InMemoryMappingStoreLogger,
  InMemoryMappingStoreMetrics,
  ENTITY_TYPE_TO_PREFIX,
  PREFIX_TO_ENTITY_TYPE,
} from "./mapping";

export type {
  CanonicalEntityType,
  GlobalIdPrefix,
  EntityMappingStatus,
  EntityMappingRecord,
  CreateEntityMappingInput,
  UpdateEntityMappingInput,
  ListEntityMappingsFilter,
  EntityMappingScope,
  EntityMappingStore,
  EntityMappingStoreMode,
  EntityMappingStoreBootstrapEnv,
  CreateEntityMappingStoreOptions,
  ResolveEntityMappingStoreModeResult,
  PostgresEntityMappingStoreOptions,
  MappingStoreOperation,
  MappingStoreLogEvent,
  MappingStoreLogger,
  MappingStoreMetricEvent,
  MappingStoreMetrics,
  ParsedGlobalId,
} from "./mapping";

export { MappingOrchestrator } from "./orchestration/mapping-orchestrator";
export type {
  MappingOrchestratorOptions,
  EnsureMappingInput,
  ResolvedProviderIdentity,
} from "./orchestration/mapping-orchestrator";

export { reconcileEntityMappings } from "./reconciliation/reconcile-entity-mappings";
export type {
  ReconciliationIssueKind,
  ReconciliationIssue,
  ReconciliationReport,
  ProviderEntitySnapshot,
  ReconciliationInput,
} from "./reconciliation/reconcile-entity-mappings";

export { PlatformServiceGateway } from "./gateway/platform-service-gateway";
export type { PlatformServiceGatewayDeps } from "./gateway/platform-service-gateway";

export { RequestPipeline } from "./execution/request-pipeline";
export type {
  RequestPipelineOptions,
  PipelineOperationInput,
} from "./execution/request-pipeline";
export { wrapServiceWithPipeline } from "./execution/wrap-service";
export {
  InMemoryPipelineLogger,
  noopPipelineLogger,
  createRequestId,
} from "./execution/logging";
export type {
  PipelineLogLevel,
  PipelineLogEvent,
  PipelineLogger,
} from "./execution/logging";
export {
  InMemoryPipelineMetrics,
  noopPipelineMetrics,
} from "./execution/metrics";
export type {
  PipelineMetricKind,
  PipelineMetricEvent,
  PipelineMetrics,
} from "./execution/metrics";

export {
  AllowAllAuthorizationProvider,
  DenyAllAuthorizationProvider,
  ProductionAuthorizationProvider,
  InMemoryAuthorizationAccessResolver,
  PlatformAuthorizationAccessResolver,
  createAuthorizationProvider,
  createAuthorizationRuntime,
  resolveAuthorizationProviderMode,
  assertAuthorizationProviderModeAllowed,
  createDefaultProductionPolicies,
  createAuthenticatedActorPolicy,
  createActiveAccountPolicy,
  createActiveTenantMembershipPolicy,
  createOrganisationScopePolicy,
  createImpersonationRestrictionPolicy,
  createMappingTenantIsolationPolicy,
  createMaintenanceModePolicy,
  InMemoryAuthorizationAuditSink,
  noopAuthorizationAuditSink,
  PLATFORM_SERVICE_PERMISSION_CATALOGUE,
  permissionKey,
  isCataloguedPermission,
  resolveOperationAuthorization,
  extractResourceId,
  OPERATION_AUTHORIZATION_MAPPINGS,
  permissionPatternMatches,
  anyPermissionMatches,
} from "./authorization/authorization-public";

export type {
  PermissionKey,
  AuthorizationResource,
  AuthorizationAction,
  AuthorizationDecisionEffect,
  AuthorizationDecision,
  AuthorizeRequest,
  AuthorizationProvider,
  AuthorizationAccessResolver,
  AuthorizationAccessSnapshot,
  ActorAccessStatus,
  MembershipAccessStatus,
  AuthorizationSubject,
  TenantMembershipFact,
  OrganisationMembershipFact,
  ResourceMembershipFact,
  ResolveAuthorizationAccessInput,
  ProductionAuthorizationDecision,
  AuthorizationDenialCode,
  AuthorizationProviderMode,
  AuthorizationBootstrapEnv,
  AuthorizationRuntime,
  AuthorizationAuditEvent,
  AuthorizationAuditSink,
  PlatformCapability,
  PlatformPermissionAction,
  PlatformPermissionKey,
  CataloguedPlatformPermission,
  OperationAuthorizationMapping,
  AuthorizationResourceType,
  AuthorizationActionName,
  PlatformAuthorizationAccessResolverOptions,
} from "./authorization/authorization-public";

export { PolicyPipeline } from "./policy/policy-pipeline";
export type {
  PolicyKind,
  PolicyDecisionEffect,
  PolicyDecision,
  PolicyExecutionContext,
  Policy,
  PolicyPipelineOptions,
} from "./policy/policy-pipeline";

export { MiddlewareRegistry } from "./middleware/service-middleware";
export type {
  ServiceMiddlewareContext,
  ServiceMiddlewareResult,
  ServiceMiddleware,
} from "./middleware/service-middleware";
