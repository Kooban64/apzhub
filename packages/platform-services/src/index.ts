export {
  createPlatformServices,
  createPlatformServicesFromEnv,
  createPlatformServicesWithPlane,
  createPlatformServicesWithZammad,
  createPlatformServicesWithGitHubActions,
  createPlatformServicesWithGitLabCi,
  registerPlaneProviders,
  registerZammadProviders,
  registerGitHubActionsProviders,
  registerGitLabCiProviders,
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
  createTimePlatformServicesForTest,
  createTimePlatformServicesWithKimai,
  wrapTimePlatformGatewayWithPipeline,
  createInMemoryTimeDomainProvider,
  createKimaiOpsProvider,
  createKimaiLimitedDomainProvider,
  PLATFORM_TIME_PERMISSIONS,
  type TimePlatformServicesBundle,
  type TimeOpsProvider,
  type TimeDomainProvider,
  type PlatformTimePermission,
} from "./services/time";
export {
  composeMyWorkQueues,
  composeMyWorkFromGateway,
  createMyWorkCompositionService,
  projectLifecycle,
  type MyWorkGatewaySlice,
  type MyWorkProviderDeps,
} from "./services/my-work";
export {
  composeEnterpriseContext,
  composeEnterpriseContextFromGateway,
  createEnterpriseContextCompositionService,
  matchesProjectFocus,
  type EnterpriseContextGatewaySlice,
  type EnterpriseContextProviderDeps,
} from "./services/enterprise-context";
export {
  summarizeContextLearning,
  recordProductLearningEvent,
  createProductLearningService,
  resolveProductLearningStore,
  setProductLearningStoreForTests,
  createMemoryProductLearningStore,
  getMemoryProductLearningStore,
  resetMemoryProductLearningStoreForTests,
  type ProductLearningService,
  type ProductLearningEventStore,
} from "./services/product-learning";
export {
  createOperationalFrictionService,
  resolveOperationalFrictionStore,
  setOperationalFrictionStoreForTests,
  createMemoryOperationalFrictionStore,
  getMemoryOperationalFrictionStore,
  resetMemoryOperationalFrictionStoreForTests,
  type OperationalFrictionService,
  type OperationalFrictionStore,
} from "./services/operational-friction";
export {
  createProjectsDeliveryService,
  resolveProjectsDeliveryStore,
  setProjectsDeliveryStoreForTests,
  createMemoryProjectsDeliveryStore,
  getMemoryProjectsDeliveryStore,
  resetMemoryProjectsDeliveryStoreForTests,
  createPostgresProjectsDeliveryStore,
  computeProjectDeliveryHealth,
  type ProjectsDeliveryService,
  type ProjectsDeliveryStore,
} from "./services/projects-delivery";
export {
  createProjectsLifecycleService,
  getMemoryProjectsLifecycleStore,
  setProjectsLifecycleStoreForTests,
  resolveProjectsLifecycleStore,
  SYSTEM_GOVERNANCE_PROFILES,
  SYSTEM_PROJECT_TEMPLATES,
  getGovernanceProfile,
  getProjectTemplate,
  suggestProfileFor,
  type ProjectsLifecycleService,
  type MilestoneCountProvider,
} from "./services/projects-lifecycle";
export {
  createProjectsOperationalService,
  getMemoryProjectsOperationalStore,
  setProjectsOperationalStoreForTests,
  resolveProjectsOperationalStore,
  createPostgresProjectsOperationalStore,
  computeDeliveryConfidence,
  computeDeliveryHealth,
  computeForecast,
  computePulse,
  type ProjectsOperationalService,
  type DeliveryRegistersProvider,
} from "./services/projects-operational";
export {
  createProjectsWorkflowBridge,
  getMemoryProjectsWorkflowBridgeStore,
  resetProjectsWorkflowBridgeStoreForTests,
  setProjectsWorkflowBridgeStoreForTests,
  resolveProjectsWorkflowBridgeStore,
  setProjectsWorkflowBridgeRuntimeExecutor,
  getProjectsWorkflowBridgeRuntimeExecutor,
  createInProcessWorkflowApprovalExecutor,
  createUnavailableWorkflowApprovalExecutor,
  createGatewayWorkflowApprovalExecutor,
  createPostgresProjectsWorkflowBridgeStore,
  type ProjectsWorkflowBridge,
  type ProjectsWorkflowBridgeStore,
  type WorkflowApprovalExecutor,
  type CreateProjectsWorkflowBridgeInput,
} from "./services/projects-workflow-bridge";
export {
  createProjectsPortfolioService,
  getMemoryProjectsPortfolioStore,
  resetProjectsPortfolioStoreForTests,
  setProjectsPortfolioStoreForTests,
  resolveProjectsPortfolioStore,
  computePortfolioWeightedConfidence,
  computeObjectiveProgress,
  IMPORTANCE_WEIGHT,
  type ProjectsPortfolioService,
  type ProjectsPortfolioStore,
  type PortfolioConfidenceMember,
  type PortfolioEvidenceLoader,
  type CreateProjectsPortfolioServiceOptions,
  type ObjectiveEvidenceBundle,
  type ObjectiveProgressResult,
} from "./services/projects-portfolio";
export {
  createProjectsTeamDirectoryService,
  getMemoryProjectsTeamDirectoryStore,
  resetProjectsTeamDirectoryStoreForTests,
  setProjectsTeamDirectoryStoreForTests,
  resolveProjectsTeamDirectoryStore,
  type ProjectsTeamDirectoryService,
  type ProjectsTeamDirectoryStore,
} from "./services/projects-team-directory";
export {
  createProjectsResourceService,
  getMemoryProjectsResourceStore,
  resetProjectsResourceStoreForTests,
  setProjectsResourceStoreForTests,
  resolveProjectsResourceStore,
  computeTeamHealth,
  computeDeliveryCapacity,
  computeResourceForecast,
  type ProjectsResourceService,
  type ProjectsResourceStore,
  type TeamSignalLoader,
  type OperationalObjectSeed,
} from "./services/projects-resource";
export {
  createProjectsGovernanceService,
  getMemoryProjectsGovernanceStore,
  resetProjectsGovernanceStoreForTests,
  setProjectsGovernanceStoreForTests,
  resolveProjectsGovernanceStore,
  type ProjectsGovernanceService,
  type ProjectsGovernanceStore,
  type GovernanceImpactLoader,
  type GovernanceAdminSummary,
} from "./services/projects-governance";
export {
  createProjectsCollaborationService,
  getMemoryProjectsCollaborationStore,
  resetProjectsCollaborationStoreForTests,
  setProjectsCollaborationStoreForTests,
  resolveProjectsCollaborationStore,
  type ProjectsCollaborationService,
  type ProjectsCollaborationStore,
  type OperationalHistoryLoader,
} from "./services/projects-collaboration";
export {
  createProjectsReportingService,
  getMemoryProjectsReportingStore,
  resetProjectsReportingStoreForTests,
  setProjectsReportingStoreForTests,
  resolveProjectsReportingStore,
  listReportDefinitions,
  REPORT_DEFINITIONS,
  type ProjectsReportingService,
  type ProjectsReportingStore,
  type ReportingEvidence,
  type ReportingEvidenceLoader,
} from "./services/projects-reporting";
export {
  createProjectsProductivityService,
  getMemoryProjectsProductivityStore,
  resetProjectsProductivityStoreForTests,
  setProjectsProductivityStoreForTests,
  resolveProjectsProductivityStore,
  type ProjectsProductivityService,
  type ProjectsProductivityStore,
} from "./services/projects-productivity";
export {
  createProjectsAdministrationService,
  getMemoryProjectsAdministrationStore,
  resetProjectsAdministrationStoreForTests,
  setProjectsAdministrationStoreForTests,
  resolveProjectsAdministrationStore,
  type ProjectsAdministrationService,
  type ProjectsAdministrationStore,
} from "./services/projects-administration";
export {
  createBusinessProcessService,
  resolveBusinessProcessStore,
  setBusinessProcessStoreForTests,
  createMemoryBusinessProcessStore,
  getMemoryBusinessProcessStore,
  resetMemoryBusinessProcessStoreForTests,
  createPostgresBusinessProcessStore,
  computeBusinessProcessMonitoring,
  BUSINESS_PROCESS_TEMPLATE_SEEDS,
  type BusinessProcessService,
  type BusinessProcessStore,
} from "./services/business-process";
export {
  createDecisionIntelligenceService,
  resolveDecisionIntelligenceStore,
  setDecisionIntelligenceStoreForTests,
  createMemoryDecisionIntelligenceStore,
  getMemoryDecisionIntelligenceStore,
  resetMemoryDecisionIntelligenceStoreForTests,
  createPostgresDecisionIntelligenceStore,
  DECISION_QUESTION_CATALOGUE,
  getDecisionQuestion,
  listDecisionQuestionsByRole,
  type DecisionIntelligenceService,
  type DecisionIntelligenceStore,
} from "./services/decision-intelligence";
export {
  createOrganisationalMemoryService,
  resolveOrganisationalMemoryStore,
  setOrganisationalMemoryStoreForTests,
  createMemoryOrganisationalMemoryStore,
  getMemoryOrganisationalMemoryStore,
  resetMemoryOrganisationalMemoryStoreForTests,
  createPostgresOrganisationalMemoryStore,
  computeKnowledgeQuality,
  type OrganisationalMemoryService,
  type OrganisationalMemoryStore,
} from "./services/organisational-memory";
export {
  createAnalyticsPlatformServicesForTest,
  createAnalyticsPlatformServicesWithMetabase,
  wrapAnalyticsPlatformGatewayWithPipeline,
  createInMemoryAnalyticsRegistry,
  createDefaultAnalyticsRegistrySeed,
  createMetabaseOpsProvider,
  createMockAnalyticsOpsProvider,
  aggregateAnalyticsReadiness,
  type AnalyticsPlatformServicesBundle,
  type AnalyticsOpsProvider,
  type AnalyticsRegistryProvider,
} from "./services/analytics";
export {
  createDocumentsDmsPlatformServicesWithPaperless,
  createPaperlessOpsProvider,
  type DocumentsDmsPlatformServicesBundle,
  type DocumentsDmsGateway,
  type DocumentsDmsHealth,
  type DocumentsDmsDocumentSummary,
  type DocumentsDmsUploadInput,
  type DocumentsDmsUploadResult,
  type DocumentsDmsDownloadResult,
} from "./services/documents-dms";
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
export {
  createWorkflowPlatformServices,
  createWorkflowPlatformServicesForProduction,
  createWorkflowPlatformServicesForTest,
  wrapWorkflowPlatformGatewayWithPipeline,
  createWorkflowPlatformServiceImpls,
  createWorkflowEngineServicesForProduction,
  createWorkflowEngineServicesForTest,
  wrapWorkflowEngineGatewayWithPipeline,
  createWorkflowEngineServiceImpls,
  createUnavailableWorkflowEngineServices,
  isWorkflowServiceEnabled,
  mapWorkflowDomainError,
  mapEngineError,
  createN8nWorkflowOpsProvider,
} from "./services/workflow";
export {
  createNotificationPlatformServices,
  createNotificationPlatformServicesForProduction,
  createNotificationPlatformServicesForTest,
  wrapNotificationPlatformGatewayWithPipeline,
  createNotificationPlatformServiceImpls,
  isNotificationServiceEnabled,
  mapNotificationDomainError,
  createNotificationDeliveryService,
  createObserveNotificationDeliveryHook,
  createDurableNotificationRuntimeBootstrap,
  createDurableDeliveryStoreFromDb,
  createDurableDeliveryStoreForTest,
  createUnimplementedDurableDeliveryStore,
  createDurableNotificationWorker,
  createDurableNotificationWorkerIfEnabled,
  createDurableDispatchOrchestrator,
  dispatchInAppChannel,
  createNotificationDeliveryAdminService,
  isNotificationDeliveryEnabled,
  isNotificationDurableRuntimeEnabled,
  isNotificationInAppEnabled,
  isNotificationEventIntakeEnabled,
  isNotificationCommandIntakeEnabled,
  isNotificationWorkerEnabled,
} from "./services/notification";
export type {
  DurableNotificationRuntimeBootstrap,
  CreateDurableNotificationRuntimeBootstrapInput,
  DurableNotificationWorker,
  DurableNotificationWorkerConfig,
  DurableWorkerTickResult,
  DurableDispatchOrchestrator,
  DurableDispatchOrchestratorConfig,
  DurableDispatchOutcome,
  DurableDispatchResult,
  InAppChannelDispatchInput,
  InAppChannelDispatchResult,
  CreateNotificationDeliveryAdminServiceInput,
  NotificationDeliveryEnv,
} from "./services/notification";
export {
  createConfigurationPlatformServices,
  createConfigurationPlatformServicesForProduction,
  createConfigurationPlatformServicesForTest,
  wrapConfigurationPlatformGatewayWithPipeline,
  createConfigurationPlatformServiceImpls,
  isConfigurationServiceEnabled,
  mapConfigurationDomainError,
} from "./services/configuration";
export {
  createAdministrationPlatformServices,
  createAdministrationPlatformServicesForProduction,
  createAdministrationPlatformServicesForTest,
  wrapAdministrationPlatformGatewayWithPipeline,
  createAdministrationPlatformServiceImpls,
  isAdministrationServiceEnabled,
  mapAdministrationDomainError,
} from "./services/administration";
export {
  createIdentityPlatformServices,
  createIdentityPlatformServicesForProduction,
  createIdentityPlatformServicesForTest,
  wrapIdentityPlatformGatewayWithPipeline,
  createIdentityPlatformServiceImpls,
  isIdentityServiceEnabled,
  mapIdentityDomainError,
} from "./services/identity";
export {
  createObservePlatformServices,
  createObservePlatformServicesForProduction,
  createObservePlatformServicesForTest,
  wrapObservePlatformGatewayWithPipeline,
  createObservePlatformServiceImpls,
  isObserveServiceEnabled,
  isObserveAlertEvaluationEnabled,
  createNoopObserveAlertDeliveryHook,
  createRecordingObserveAlertDeliveryHook,
  mapObserveDomainError,
} from "./services/observe";
export {
  createRealtimeSubscriptionService,
  isRealtimeSseEnabled,
  mapSupportDomainEventToWire,
  SUPPORT_REALTIME_WIRE_EVENTS,
  type CreateRealtimeSubscriptionServiceInput,
  type RealtimeDiagnostics,
  type RealtimeEventBusPort,
  type RealtimeHealth,
  type RealtimeSessionValidator,
  type RealtimeStructuredLogger,
  type RealtimeSubscriptionService,
  type RealtimeSubscriptionTopic,
  type RealtimeWireMessage,
  type SupportRealtimeWireEvent,
} from "./services/realtime";
export {
  isMetricsServiceEnabled,
  createMetricsPlatformServices,
  createMetricsPlatformServicesForProduction,
  createMetricsPlatformServicesForTest,
  wrapMetricsPlatformGatewayWithPipeline,
  createMetricsPlatformServiceImpls,
  mapMetricsDomainError,
  type MetricsPlatformServicesBundle,
  type CreateMetricsPlatformServicesInput,
  type CreateMetricsPlatformServicesForProductionInput,
  type CreateMetricsPlatformServicesForTestInput,
  type MetricsPlatformServiceImpls,
} from "./services/metrics";
export {
  isQepServiceEnabled,
  createQepPlatformServices,
  createQepPlatformServicesForProduction,
  createQepPlatformServicesForTest,
  wrapQepPlatformGatewayWithPipeline,
  createQepRequirementPlatformService,
  mapQepDomainError,
  createQepTraceabilityPlatformServices,
  createQepTraceabilityPlatformServicesForProduction,
  createQepTraceabilityPlatformServicesForTest,
  wrapQepTraceabilityPlatformServiceWithPipeline,
  createQepTraceabilityPlatformService,
  mapTraceDomainError,
  createQepVerificationPlatformServices,
  createQepVerificationPlatformServicesForProduction,
  createQepVerificationPlatformServicesForTest,
  wrapQepVerificationPlatformServiceWithPipeline,
  createQepVerificationPlatformService,
  mapVerificationDomainError,
  createQepTestExecutionPlatformServices,
  createQepTestExecutionPlatformServicesForProduction,
  createQepTestExecutionPlatformServicesForTest,
  wrapQepTestExecutionPlatformServiceWithPipeline,
  createQepTestExecutionPlatformService,
  mapExecutionDomainError,
  performQepTestExecutionAction,
  EXECUTION_ACTION_KEYS,
  createQepEvidencePlatformServices,
  createQepEvidencePlatformServicesForProduction,
  createQepEvidencePlatformServicesForTest,
  wrapQepEvidencePlatformServiceWithPipeline,
  createQepEvidencePlatformService,
  mapEvidenceDomainError,
  isEvidenceApiActionKey,
  QEP_EVIDENCE_PERMISSIONS,
  type EvidenceApiActionKey,
  type QepPlatformServicesBundle,
  type CreateQepPlatformServicesInput,
  type CreateQepPlatformServicesForProductionInput,
  type CreateQepPlatformServicesForTestInput,
  type QepRequirementPlatformService,
  type QepTraceabilityPlatformServicesBundle,
  type CreateQepTraceabilityPlatformServicesInput,
  type CreateQepTraceabilityPlatformServicesForProductionInput,
  type CreateQepTraceabilityPlatformServicesForTestInput,
  type QepTraceabilityPlatformService,
  type QepVerificationPlatformServicesBundle,
  type CreateQepVerificationPlatformServicesInput,
  type CreateQepVerificationPlatformServicesForProductionInput,
  type CreateQepVerificationPlatformServicesForTestInput,
  type QepVerificationPlatformService,
  type QepTestExecutionPlatformServicesBundle,
  type CreateQepTestExecutionPlatformServicesInput,
  type CreateQepTestExecutionPlatformServicesForProductionInput,
  type CreateQepTestExecutionPlatformServicesForTestInput,
  type QepTestExecutionPlatformService,
  type ExecutionActionKey,
  type QepEvidencePlatformServicesBundle,
  type QepEvidencePlatformService,
  type QepEvidencePermission,
  type EvidenceDownloadDto,
} from "./services/qep";
export type { QepPlatformGatewaySurface } from "./services/qep/create-qep-platform-services";

export type {
  CreatePlatformServicesInput,
  CreatePlatformServicesFromEnvInput,
  CreatePlatformServicesWithGitHubActionsOptions,
  CreatePlatformServicesWithGitLabCiOptions,
  PlatformServicesBundle,
  RegisterPlaneProvidersInput,
  RegisterZammadProvidersInput,
  RegisterGitHubActionsProvidersInput,
  RegisterGitLabCiProvidersInput,
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
  CreateWorkflowPlatformServicesForProductionInput,
  CreateWorkflowPlatformServicesForTestInput,
  CreateWorkflowPlatformServicesInput,
  WorkflowPlatformServicesBundle,
  WorkflowPlatformServiceImpls,
  CreateWorkflowEngineServicesForProductionInput,
  CreateWorkflowEngineServicesForTestInput,
  WorkflowEngineServicesBundle,
} from "./services/workflow";
export type {
  CreateNotificationPlatformServicesForProductionInput,
  CreateNotificationPlatformServicesForTestInput,
  CreateNotificationPlatformServicesInput,
  NotificationPlatformServicesBundle,
  NotificationPlatformServiceImpls,
} from "./services/notification";
export type {
  CreateConfigurationPlatformServicesForProductionInput,
  CreateConfigurationPlatformServicesForTestInput,
  CreateConfigurationPlatformServicesInput,
  ConfigurationPlatformServicesBundle,
  ConfigurationPlatformServiceImpls,
} from "./services/configuration";
export type {
  CreateAdministrationPlatformServicesForProductionInput,
  CreateAdministrationPlatformServicesForTestInput,
  CreateAdministrationPlatformServicesInput,
  AdministrationPlatformServicesBundle,
  AdministrationPlatformServiceImpls,
} from "./services/administration";
export type {
  CreateIdentityPlatformServicesForProductionInput,
  CreateIdentityPlatformServicesForTestInput,
  CreateIdentityPlatformServicesInput,
  IdentityPlatformServicesBundle,
  IdentityPlatformServiceImpls,
} from "./services/identity";
export type {
  CreateObservePlatformServicesForProductionInput,
  CreateObservePlatformServicesForTestInput,
  CreateObservePlatformServicesInput,
  ObservePlatformServicesBundle,
  ObservePlatformServiceImpls,
} from "./services/observe";
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

export {
  createDomainEventEnvelopeId,
  createDomainEventPublisherFromBus,
  publishDomainEventFailSoft,
  resetDomainEventEnvelopeCounter,
  SUPPORT_DOMAIN_EVENT_IDS,
  publishSupportArticleEvent,
  publishSupportRequestEvent,
  fanOutSupportDomainEventsFromSourceEvents,
  OBSERVE_ALERT_DOMAIN_EVENT_IDS,
  publishObserveAlertEvent,
  type DomainEventCategory,
  type DomainEventEnvelope,
  type DomainEventPublishResult,
  type DomainEventPublisher,
  type SupportArticleEventPayload,
  type SupportDomainEventId,
  type SupportRequestEventPayload,
  type ObserveAlertDomainEventId,
  type ObserveAlertEventPayload,
} from "./events";

export {
  AUTOMATION_JOURNAL_HANDLER_ID,
  createAutomationFoundation,
  createAutomationHandlerRegistry,
  createAutomationJournalHandler,
  createInMemoryAutomationExecutionJournal,
  createPostgresAutomationExecutionJournal,
  createProductionAutomationExecutionJournal,
  createInMemoryAutomationRegistrationStore,
  matchesEventPattern,
  nextAutomationExecutionId,
  registerDefaultSupportAutomationRegistrations,
  registerWorkflowTriggerAsAutomation,
  resetAutomationExecutionSeq,
  resetAutomationRegistrationSeq,
  wireEventAutomation,
  type AutomationActionKind,
  type AutomationEventBus,
  type AutomationExecutionJournal,
  type AutomationExecutionRecord,
  type AutomationExecutionStatus,
  type AutomationFoundation,
  type AutomationHandler,
  type AutomationHandlerContext,
  type AutomationHandlerRegistry,
  type AutomationHandlerResult,
  type AutomationRegistration,
  type AutomationRegistrationStore,
  type CreateAutomationFoundationOptions,
  type RegisterAutomationInput,
  type WorkflowEventTriggerBindingView,
  type WorkflowEventTriggerSource,
} from "./services/automation";

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
export type {
  PlatformServiceGatewayDeps,
  QepPlatformGateway,
} from "./gateway/platform-service-gateway";

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
export { InMemoryPipelineMetrics, noopPipelineMetrics } from "./execution/metrics";
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

/** SPR-FULL-002-A — QEP ↔ APZPEN security assurance pure compose */
export {
  buildEngagementRows,
  isSecurityReadinessClear,
  summariseSecurityAssurance,
} from "./security-assurance/index";
export type {
  AssuranceAssessmentPosition,
  AssurancePosture,
  AssuranceSourceBinding,
  AssuranceStatus,
  SecurityAssuranceEngagementRow,
  SecurityAssuranceSummary,
} from "./security-assurance/index";
