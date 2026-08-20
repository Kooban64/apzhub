export {
  checkDatabaseHealth,
  createDb,
  getDb,
  getPool,
  type Database,
  type DatabaseExecutor,
  type DatabaseTransaction,
} from "./client";
export { lookupUserEmailById } from "./lookup-user-email";
export { lookupUserDisplayNamesByIds } from "./lookup-user-display";
export {
  ensureCredentialUser,
  type EnsureCredentialUserInput,
} from "./ensure-credential-user";
export {
  getDatabaseExecutor,
  getRequestTenantId,
  runInDatabaseTransaction,
  runWithTenantContext,
} from "./transaction-context";
export {
  createPostgresCoreQeIdempotencyStore,
  type CoreQeIdempotencyStore,
} from "./core-qe-idempotency";
export {
  auditCoreQeDataIntegrity,
  type CoreQeIntegrityFinding,
  type CoreQeIntegrityReport,
} from "./core-qe-integrity";
export * from "./schema";
export {
  platformIdentitySchema,
  platformTenant,
  platformUserTenant,
} from "./platform-identity-schema";
export {
  platformAuthorizationSchema,
  platformAuthorizationPermission,
  platformAuthorizationRole,
  platformAuthorizationRoleAssignment,
  platformAuthorizationRolePermission,
  platformAuthorizationTeamRole,
  platformProductOrgSubscription,
  platformProductUserGrant,
} from "./platform-authorization-schema";
export {
  platformPersonalisationSchema,
  platformUserPreference,
  platformUserFavorite,
  platformUserRecentItem,
  platformUserWorkbenchLayout,
} from "./platform-personalisation-schema";
export {
  platformGovernanceSchema,
  platformCapability,
  platformCapabilityDependency,
  platformGovernanceEnablement,
  platformProvisioningRecord,
  platformFeatureFlag,
  platformFeatureFlagOverride,
} from "./platform-governance-schema";
export {
  platformEntityMappingSchema,
  platformEntityMapping,
} from "./platform-entity-mapping-schema";
export {
  platformDocumentSchema,
  platformDocument,
  platformDocumentMetadata,
  platformDocumentTag,
  platformDocumentCategory,
  platformDocumentRelationship,
  platformDocumentRetention,
  platformDocumentAudit,
  platformDocumentVersion,
  platformDocumentStorageObject,
} from "./platform-document-schema";
export {
  platformSearchSchema,
  platformSearchProvider,
  platformSearchProviderRegistration,
  platformSearchProviderStatus,
  platformSearchConfiguration,
  platformSearchConfigurationVersion,
  platformSearchProfile,
  platformSearchCollection,
  platformSearchSource,
  platformSearchScope,
  platformSearchMetadata,
  platformSearchSession,
  platformSearchAudit,
  platformSearchDiagnostics,
  platformSearchHealth,
  platformSearchStatistics,
  platformSearchCapabilities,
} from "./platform-search-schema";
export {
  platformWorkflowSchema,
  platformWorkflow,
  platformWorkflowVersion,
  platformWorkflowTemplate,
  platformWorkflowCategory,
  platformWorkflowFolder,
  platformWorkflowAudit,
} from "./platform-workflow-schema";
export {
  platformNotificationSchema,
  platformNotification,
  platformNotificationRecipient,
  platformNotificationTemplate,
  platformNotificationCategory,
  platformNotificationChannel,
  platformNotificationPreference,
  platformNotificationRule,
  platformNotificationReference,
  platformNotificationAttachmentMetadata,
  platformNotificationDeliveryAttempt,
  platformNotificationAudit,
} from "./platform-notification-schema";
export {
  platformNotificationDeliverySchema,
  platformNotificationIntent,
  platformNotificationDeliveryRecord,
  platformNotificationDeliveryTry,
  platformNotificationInAppItem,
} from "./platform-notification-delivery-schema";
export {
  platformConfigurationSchema,
  platformConfigurationNamespace,
  platformConfigurationGroup,
  platformConfigurationKey,
  platformConfiguration,
  platformConfigurationValue,
  platformConfigurationVersion,
  platformConfigurationOverride,
  platformConfigurationValidation,
  platformConfigurationReference,
  platformConfigurationHistory,
  platformConfigurationAudit,
} from "./platform-configuration-schema";
export {
  platformObserveSchema,
  platformObserveHealthCheck,
  platformObserveReadinessCheck,
  platformObserveLivenessCheck,
  platformObserveServiceHealth,
  platformObserveServiceStatus,
  platformObserveComponentStatus,
  platformObserveMetricDefinition,
  platformObserveMetricSample,
  platformObserveAlertDefinition,
  platformObserveAlertState,
  platformObserveDashboard,
  platformObserveLogSource,
  platformObserveTraceDefinition,
  platformObserveTraceSpan,
  platformObserveIncidentReference,
  platformObserveMaintenanceWindow,
  platformObserveHealthSummary,
  platformObserveDiagnostic,
  platformObserveMetadata,
} from "./platform-observe-schema";
export {
  platformMetricsSchema,
  platformMetricsMetric,
  platformMetricsDefinition,
  platformMetricsVersion,
  platformMetricsCategory,
  platformMetricsGroup,
  platformMetricsDimension,
  platformMetricsLabel,
  platformMetricsUnit,
  platformMetricsFormula,
  platformMetricsAggregation,
  platformMetricsThreshold,
  platformMetricsOwner,
  platformMetricsConsumer,
  platformMetricsRetentionPolicy,
  platformMetricsClassification,
  platformMetricsDependency,
  platformMetricsKpi,
  platformMetricsKpiGroup,
  platformMetricsKpiTarget,
  platformMetricsRelationship,
  platformMetricsMetadata,
} from "./platform-metrics-schema";
export {
  qepRequirementsSchema,
  qepRequirement,
  qepRequirementAudit,
  qepRequirementLifecycleHistory,
  qepRequirementContentVersion,
  qepRequirementBaseline,
  qepRequirementBaselineItem,
  qepRequirementsRelationship,
  qepRequirementsRelationshipHistory,
  qepRequirementsRelationshipTaxonomy,
} from "./qep-requirements-schema";
export {
  qepTraceabilitySchema,
  qepTraceLink,
  qepTraceLinkHistory,
  qepTraceLinkTaxonomy,
} from "./qep-traceability-schema";
export {
  qepVerificationSchema,
  qepVerification,
  qepVerificationHistory,
} from "./qep-verification-schema";
export {
  qepTestSpecificationsSchema,
  qepTestSpecification,
  qepTestSpecificationVersion,
  qepTestSpecificationRelationship,
  qepTestSpecificationHistory,
} from "./qep-test-specifications-schema";
export {
  qepTestPlansSchema,
  qepTestPlan,
  qepTestPlanItem,
  qepTestPlanApproval,
  qepTestPlanRevision,
  qepTestPlanHistory,
} from "./qep-test-plans-schema";
export {
  qepTestExecutionSchema,
  qepTestExecution,
  qepTestExecutionManifest,
  qepTestExecutionStep,
  qepTestExecutionObservation,
  qepTestExecutionEvidenceReference,
  qepTestExecutionReview,
  qepTestExecutionExternalSubmission,
  qepTestExecutionHistory,
  qepTestExecutionAudit,
  qepTestExecutionOutbox,
} from "./qep-test-execution-schema";
export {
  qepEvidenceSchema,
  qepEvidence,
  qepEvidenceVersion,
  qepEvidenceRelationship,
  qepEvidenceAudit,
  qepEvidenceCollection,
  qepEvidenceSet,
  qepEvidenceAccessGrant,
  qepEvidenceLifecycleHistory,
  type QepEvidenceHistoryEntryJson,
  type QepEvidenceProvenanceJson,
  type QepEvidencePolicyRefJson,
} from "./qep-evidence-schema";
export {
  qepCoreQeSchema,
  qepSuite,
  qepExecutionPlan,
  qepExecutionSession,
  qepDefect,
  qepEnterpriseRequirement,
  qepSavedReport,
  qepReportingTrendSample,
  qepCoreQeIdempotency,
} from "./qep-core-qe-schema";
export { qepAutomationSchema, qepAutomationExecution } from "./qep-automation-schema";
export {
  qepOrchestrationSchema,
  qepQoDocument,
  qepQoTriggerIdempotency,
} from "./qep-orchestration-schema";
export {
  qepScmSchema,
  qepScmRepository,
  qepScmWebhookAudit,
  qepScmWebhookIdempotency,
  qepScmTraceabilityLink,
  qepScmChangeEvent,
} from "./qep-scm-schema";
export {
  qepApplicationsSchema,
  qepApplication,
  qepApplicationRepository,
  qepApplicationEnvironment,
  qepApplicationExecutionTarget,
  qepApplicationLegacyRef,
} from "./qep-applications-schema";
export {
  qepDefinitionSchema,
  qepUserStory,
  qepAcceptanceCriterion,
  qepAcceptanceCriterionVerification,
  qepDefinitionKeyCounter,
} from "./qep-definition-schema";
export {
  qepTestManagementSchema,
  qepTestSpecificationStep,
  qepSuiteItem,
  qepTestPlanSuiteItem,
  qepTestPlanStrategyGroup,
  qepTestCaseAutomationMapping,
  qepExecutionDefinitionSnapshot,
  qepExecutionScopeSnapshot,
  qepTestExecutionDefect,
  qepExecutionStrategySnapshot,
  qepTestExecutionRelation,
  qepTestExecutionAutomationLink,
} from "./qep-test-management-schema";
export {
  qepExperienceSchema,
  qepExploratorySession,
  qepExploratoryArea,
  qepExperiencePlan,
  qepExperiencePlanDiscipline,
  qepExperienceContext,
  qepExperienceCriterion,
  qepExperienceVerificationActivity,
  qepExperienceCriterionResult,
  qepExperienceContextActivity,
  qepQualityObservation,
  qepQualityIssue,
  qepQualityNote,
  qepQualityEvidenceLink,
  qepExploratorySessionHistory,
  qepExperiencePlanHistory,
  qepExperienceActivityHistory,
  qepQualityTraceLink,
} from "./qep-experience-schema";
export {
  qepAssuranceSchema,
  qepQualityRisk,
  qepQualityRiskHistory,
  qepQualityRiskSignal,
  qepQualityGateDefinition,
  qepQualityGateEvaluation,
  qepCertificationException,
} from "./qep-assurance-schema";
export { qepAiSchema, qepAiProposal } from "./qep-ai-schema";
export {
  qepQualityIntelligenceSchema,
  qepQiObservation,
  qepQiSignal,
  qepQiRecommendation,
  qepQiExplanation,
  qepQiScore,
  qepQiAudit,
} from "./qep-quality-intelligence-schema";
export {
  qepDashboardSchema,
  qepDashboardLayout,
  qepDashboardSavedView,
} from "./qep-dashboard-schema";
export { platformOutboxSchema, platformOutboxEvent } from "./platform-outbox-schema";
export {
  platformProductLearningSchema,
  platformProductLearningEvent,
} from "./platform-product-learning-schema";
export {
  platformOperationalFrictionSchema,
  platformOperationalFriction,
  platformOperationalFrictionAudit,
} from "./platform-operational-friction-schema";
export {
  platformProjectsDeliverySchema,
  platformProjectMilestone,
  platformProjectRisk,
  platformProjectDecision,
  platformProjectAction,
} from "./platform-projects-delivery-schema";
export {
  platformProjectsLifecycleSchema,
  platformProjectLifecycle,
  platformProjectBaseline,
  platformProjectLifecycleTransition,
  platformProjectLifecycleWaiver,
} from "./platform-projects-lifecycle-schema";
export {
  platformProjectsOperationalSchema,
  platformProjectCommitment,
  platformProjectWaiting,
  platformProjectDependency,
  platformProjectOpsDecision,
  platformProjectCheckpoint,
  platformProjectException,
  platformProjectOperationalHistory,
} from "./platform-projects-operational-schema";
export { platformProjectsApprovalBinding } from "./platform-projects-workflow-bridge-schema";
export {
  platformProjectsPortfolioSchema,
  platformPortfolioEnterprise,
  platformStrategicInitiative,
  platformProgramme,
  platformStrategicObjective,
} from "./platform-projects-portfolio-schema";
export {
  platformProjectsTeamDirectorySchema,
  platformEnterpriseDeliveryTeam,
  platformEnterpriseTeamMembership,
} from "./platform-projects-team-directory-schema";
export {
  platformProjectsResourceSchema,
  platformDeliveryAssignment,
} from "./platform-projects-resource-schema";
export {
  platformProjectsAccountabilitySchema,
  platformDeliveryAssignmentEvent,
  platformResponsibility,
  platformContinuityCase,
  platformStakeholder,
  platformExternalParticipant,
} from "./platform-projects-accountability-schema";
export {
  platformProjectsGovernanceSchema,
  platformOrgGovernanceProfile,
  platformOperationalPolicy,
} from "./platform-projects-governance-schema";
export {
  platformBusinessProcessSchema,
  platformBusinessJourney,
  platformBusinessProcessTemplate,
  platformBusinessProcessInstance,
  platformBusinessProcessAudit,
} from "./platform-business-process-schema";
export {
  platformAnalyticsDecisionSchema,
  platformAnalyticsDecisionPack,
  platformAnalyticsTrendPoint,
  platformAnalyticsDecisionKpi,
  platformAnalyticsDecisionTimeline,
} from "./platform-analytics-decision-schema";
export {
  platformKnowledgeMemorySchema,
  platformKnowledgeObject,
} from "./platform-knowledge-memory-schema";
export {
  platformAdminSchema,
  platformAdminModule,
  platformAdminCategory,
  platformAdminSection,
  platformAdminAction,
  platformAdminPermission,
  platformAdminAudit,
  platformAdminHistory,
  platformAdminDiagnostic,
  platformAdminRegistration,
  platformAdminMetadata,
  platformAdminPolicy,
  platformAdminReference,
  platformAdminCapability,
  platformAdminNavigation,
  platformAdminShortcut,
  platformAdminDashboard,
  platformAdminWidget,
} from "./platform-admin-schema";
export {
  platformIamSchema,
  platformIamUser,
  platformIamGroup,
  platformIamRole,
  platformIamPermissionAssignment,
  platformIamOrganization,
  platformIamTenant,
  platformIamDepartment,
  platformIamPosition,
  platformIamEmployment,
  platformIamServiceAssignment,
  platformIamMembership,
  platformIamInvitation,
  platformIamActivation,
  platformIamDeactivation,
  platformIamStatus,
  platformIamPolicy,
  platformIamAudit,
  platformIamHistory,
  platformIamReference,
  platformIamMetadata,
} from "./platform-iam-schema";

export {
  testingSchema,
  testingRequirement,
  testingWorkItem,
  testingRisk,
  testingTestPlan,
  testingTestSuite,
  testingTestCase,
  testingTestCaseVersion,
  testingTestPlanVersion,
  testingTestSuiteVersion,
  testingTestStep,
  testingPlanSuite,
  testingSuiteCase,
  testingCaseRequirement,
  testingPlanRequirement,
  testingRiskRequirement,
  testingPlanRisk,
  testingRegressionSet,
  testingExecutionSession,
  testingExecutionHistory,
  testingManualExecution,
  testingManualStepActual,
  testingEvidence,
  testingApproval,
  testingApprovalHistory,
  testingCertificationRecord,
  testingCertificationGateDefinition,
  testingCertificationGateEvaluation,
  testingCertificationRule,
  testingCertificationAudit,
  testingCertificationHistory,
  testingReleaseReadiness,
  testingCoverageRecord,
  testingDefectLink,
  testingQualitySnapshot,
  testingRegressionAnalysis,
  testingAutomationDefinition,
  testingAutomationImport,
  testingAutomatedExecution,
  testingAutomationRun,
  testingAutomationResultItem,
  testingAutomationImportHistory,
  testingAutomationCoverageSnapshot,
  testingTraceabilityLink,
  testingAuditRecord,
  testingConfiguration,
  testingRegistryEntry,
  testingRelease,
  testingReleaseScope,
  testingReleasePackage,
  testingReleaseCandidate,
  testingReleaseApproval,
  testingReleaseDecision,
  testingReleaseEvidence,
  testingReleaseDependency,
  testingReleaseNote,
  testingReleaseRiskAssessment,
  testingReleaseReadinessSnapshot,
  testingReleaseSummarySnapshot,
  testingReleaseAuditEntry,
  testingPipeline,
  testingPipelineImport,
  testingPipelineRun,
  testingPipelineImportHistory,
  testingEngineeringSnapshot,
  testingEngineeringHistoricalSnapshot,
  testingEngineeringTrendSeries,
  testingEngineeringBenchmark,
  testingEngineeringBaseline,
  testingEngineeringQualitySummary,
  testingReportTemplate,
  testingReportGenerationMetadata,
} from "./testing-schema";
export {
  legalSchema,
  lawClient,
  lawMatter,
  lawDocument,
  lawTask,
  lawCalendarEvent,
  lawTimeEntry,
  lawInvoice,
  lawInvoiceLineItem,
  lawOutboxEvent,
  lawTrustAccount,
  lawTrustJournalEntry,
  lawTrustTransaction,
  lawTrustBalance,
  lawTrustTransactionDraft,
  lawTrustTransactionAudit,
  lawTrustAllocation,
  lawTrustReconciliationRun,
  lawTrustInterestRule,
  lawTrustInterestPosting,
  lawTrustTransfer,
  lawTrustApprovalRule,
  lawTrustApprovalRequest,
  lawTrustApprovalHistory,
  lawTrustReport,
} from "./legal-schema";
export { applyPostgresTenantSession } from "./postgres-tenant-session";
export {
  createClientOutboxDraft,
  createMatterOutboxDraft,
  createDocumentOutboxDraft,
  createTaskOutboxDraft,
  createCalendarOutboxDraft,
  createTimeOutboxDraft,
  createInvoiceOutboxDraft,
  createTrustOutboxDraft,
  type PostgresOutboxEventDraft,
} from "./law-mappers/outbox-drafts";
export { clientToRow, rowToClient } from "./law-mappers/client-row-mapper";
export { matterToRow, rowToMatter } from "./law-mappers/matter-row-mapper";
export { documentToRow, rowToDocument } from "./law-mappers/document-row-mapper";
export {
  taskToRow,
  rowToTask,
  type LawTaskPersistenceModel,
} from "./law-mappers/task-row-mapper";
export {
  calendarEventToRow,
  rowToCalendarEvent,
  type LawCalendarEventPersistenceModel,
} from "./law-mappers/calendar-event-row-mapper";
export {
  timeEntryToRow,
  rowToTimeEntry,
  type LawTimeEntryPersistenceModel,
} from "./law-mappers/time-entry-row-mapper";
export {
  invoiceToRow,
  lineItemToRow,
  rowToInvoice,
  rowToLineItem,
  type LawInvoicePersistenceModel,
} from "./law-mappers/invoice-row-mapper";
export {
  PostgresClientRepository,
  type PostgresClientRepositoryContract,
} from "./adapters/postgres-client-repository";
export {
  PostgresMatterRepository,
  type PostgresMatterRepositoryContract,
  type PostgresMatterListCriteria,
} from "./adapters/postgres-matter-repository";
export {
  PostgresDocumentRepository,
  type PostgresDocumentRepositoryContract,
  type PostgresDocumentListCriteria,
} from "./adapters/postgres-document-repository";
export {
  PostgresTaskRepository,
  type PostgresTaskRepositoryContract,
  type PostgresTaskListCriteria,
} from "./adapters/postgres-task-repository";
export {
  PostgresCalendarEventRepository,
  type PostgresCalendarEventRepositoryContract,
  type PostgresCalendarEventListCriteria,
} from "./adapters/postgres-calendar-event-repository";
export {
  PostgresTimeEntryRepository,
  type PostgresTimeEntryRepositoryContract,
  type PostgresTimeEntryListCriteria,
} from "./adapters/postgres-time-entry-repository";
export {
  PostgresInvoiceRepository,
  type PostgresInvoiceRepositoryContract,
  type PostgresInvoiceListCriteria,
} from "./adapters/postgres-invoice-repository";
export {
  PostgresTrustStore,
  type PostgresTrustStoreOptions,
} from "./adapters/postgres-trust-store";
export {
  trustAccountToRow,
  rowToTrustAccount,
  trustTransactionToRow,
  rowToTrustTransaction,
  trustJournalEntryToRow,
  rowToTrustJournalEntry,
  trustBalanceToRow,
  rowToTrustBalance,
  type LawTrustAccountPersistenceModel,
  type LawTrustTransactionPersistenceModel,
  type LawTrustJournalEntryPersistenceModel,
  type LawTrustBalancePersistenceModel,
} from "./law-mappers/trust-row-mapper";
export { runMigrations } from "./migrate";
export {
  verifyLawMigrations,
  type LawMigrationVerification,
} from "./migration-verification";
export {
  verifyProjectsMigrations,
  REQUIRED_PROJECTS_MIGRATION_TAGS,
  type ProjectsMigrationVerification,
} from "./projects-migration-verification";
export { seedDatabase } from "./seed";
