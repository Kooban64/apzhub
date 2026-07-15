import type {
  ApprovalStatus,
  AutomationType,
  BusinessCriticality,
  CaseVersionReason,
  CertificationStatus,
  CoverageMetricKind,
  EvidenceLifecycleStatus,
  EvidenceType,
  ExecutionApprovalState,
  ExecutionStatus,
  ExecutionType,
  Impact,
  Likelihood,
  Priority,
  RegressionImportance,
  ReleaseApprovalStageKind,
  ReleaseGovernanceStatus,
  ReleaseReadinessStatus,
  ReleaseScopeKind,
  RiskLevel,
  Severity,
  TestResultStatus,
  TestStatus,
  TraceabilityLinkType,
  WorkItemRefKind,
  WorkItemRef,
} from "@apzhub/testing-contracts";

import type { PersistenceMeta } from "../types";

export interface RequirementRecord extends PersistenceMeta {
  readonly key: string;
  readonly title: string;
  readonly description?: string;
  readonly priority: Priority;
  readonly tags: readonly string[];
  readonly workItemRefs: readonly WorkItemRef[];
  readonly riskIds: readonly string[];
  readonly ownerId?: string;
}

export interface WorkItemRecord extends PersistenceMeta {
  readonly kind: WorkItemRefKind;
  readonly key: string;
  readonly title: string;
  readonly description?: string;
  readonly projectRefId?: string;
  readonly externalWorkItemId?: string;
  readonly status: string;
}

export interface RiskRecord extends PersistenceMeta {
  readonly key: string;
  readonly title: string;
  readonly description?: string;
  readonly level: RiskLevel;
  readonly mitigationSummary?: string;
  readonly requirementIds: readonly string[];
  readonly severity?: Severity;
  readonly likelihood?: Likelihood;
  readonly impact?: Impact;
  readonly businessCriticality?: BusinessCriticality;
  readonly regressionImportance?: RegressionImportance;
  readonly ownerId?: string;
}

export interface TestPlanRecord extends PersistenceMeta {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: TestStatus;
  readonly releaseLabel?: string;
  readonly milestoneLabel?: string;
  readonly suiteIds: readonly string[];
  readonly requirementIds: readonly string[];
  readonly riskIds: readonly string[];
  readonly ownerId?: string;
  readonly assigneeId?: string;
  readonly versionNumber?: number;
  readonly parentPlanId?: string;
}

export interface TestSuiteRecord extends PersistenceMeta {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: TestStatus;
  readonly isRegression: boolean;
  readonly planIds: readonly string[];
  readonly caseIds: readonly string[];
  readonly ownerId?: string;
  readonly parentSuiteId?: string;
  readonly sortOrder?: number;
  readonly versionNumber?: number;
  readonly groupKey?: string;
}

export interface TestCaseRecord extends PersistenceMeta {
  readonly key: string;
  readonly title: string;
  readonly description?: string;
  readonly status: TestStatus;
  readonly priority: Priority;
  readonly tags: readonly string[];
  readonly estimatedMinutes?: number;
  readonly suiteIds: readonly string[];
  readonly requirementIds: readonly string[];
  readonly stepIds: readonly string[];
  readonly preconditions?: string;
  readonly postconditions?: string;
  readonly expectedResultsSummary?: string;
  readonly templateKey?: string;
  readonly parameters?: readonly Readonly<{
    key: string;
    label?: string;
    defaultValue?: string;
    required?: boolean;
  }>[];
  readonly components?: readonly string[];
  readonly ownerId?: string;
  readonly reviewerId?: string;
  readonly versionNumber?: number;
  readonly parentCaseId?: string;
  readonly riskLevel?: Severity;
}

export interface TestStepRecord extends PersistenceMeta {
  readonly caseId: string;
  readonly ordinal: number;
  readonly action: string;
  readonly expectedResult: string;
  readonly dataHint?: string;
}

export interface TestCaseVersionRecord extends PersistenceMeta {
  readonly caseId: string;
  readonly versionNumber: number;
  readonly reason: CaseVersionReason;
  readonly snapshot: Readonly<Record<string, unknown>>;
  readonly changedByUserId?: string;
  readonly changeSummary?: string;
}

export interface TestPlanVersionRecord extends PersistenceMeta {
  readonly planId: string;
  readonly versionNumber: number;
  readonly reason: CaseVersionReason;
  readonly snapshot: Readonly<Record<string, unknown>>;
  readonly changedByUserId?: string;
  readonly changeSummary?: string;
}

export interface TestSuiteVersionRecord extends PersistenceMeta {
  readonly suiteId: string;
  readonly versionNumber: number;
  readonly reason: CaseVersionReason;
  readonly snapshot: Readonly<Record<string, unknown>>;
  readonly changedByUserId?: string;
  readonly changeSummary?: string;
}

export interface ApprovalHistoryRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly approvalId: string;
  readonly eventType: string;
  readonly occurredAt: string;
  readonly actorUserId?: string;
  readonly correlationId?: string;
  readonly summary: string;
  readonly details: Readonly<Record<string, unknown>>;
  readonly fromStatus?: string;
  readonly toStatus?: string;
}

export interface RegressionSetRecord extends PersistenceMeta {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly planId?: string;
  readonly suiteIds: readonly string[];
  readonly ownerId?: string;
}

export interface ExecutionSessionRecord extends PersistenceMeta {
  readonly planId?: string;
  readonly suiteId?: string;
  readonly executionType: ExecutionType;
  readonly status: ExecutionStatus;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly assigneeId?: string;
  readonly notes?: string;
}

export interface ExecutionHistoryRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly sessionId: string;
  readonly eventType: string;
  readonly occurredAt: string;
  readonly actorUserId?: string;
  readonly correlationId?: string;
  readonly summary: string;
  readonly details: Readonly<Record<string, unknown>>;
}

export interface ManualStepActualRecord {
  readonly stepId: string;
  readonly actualResult?: string;
  readonly status?: TestResultStatus;
  readonly evidenceIds?: readonly string[];
  readonly notes?: string;
  readonly comment?: string;
  readonly comments?: string;
  readonly recordedAt?: string;
  readonly expectedSnapshot?: string;
  readonly expectedResult?: string;
  readonly recordedByUserId?: string;
  readonly parentStepId?: string;
  readonly nestLevel?: number;
  readonly repeatIndex?: number;
  readonly parameters?: Readonly<Record<string, string>>;
  readonly attachmentIds?: readonly string[];
  readonly ordinal?: number;
}

export interface ExecutionCommentRecord {
  readonly id: string;
  readonly authorUserId: string;
  readonly body: string;
  readonly createdAt: string;
}

export interface ManualExecutionRecord extends PersistenceMeta {
  readonly sessionId: string;
  readonly caseId: string;
  readonly status: ExecutionStatus;
  readonly assigneeId?: string;
  readonly testerId?: string;
  readonly reviewerId?: string;
  readonly startedAt?: string;
  readonly pausedAt?: string;
  readonly resumedAt?: string;
  readonly completedAt?: string;
  readonly approvalState?: ExecutionApprovalState;
  readonly comments: readonly ExecutionCommentRecord[];
  readonly stepActuals: readonly ManualStepActualRecord[];
  readonly overallResult?: TestResultStatus;
  readonly restartOfId?: string;
  readonly parameterOverrides?: Readonly<Record<string, string>>;
  readonly blockReason?: string;
}

/** Optional flattened step-actual row for SQL storage. */
export interface ManualStepActualEntityRecord extends PersistenceMeta {
  readonly executionId: string;
  readonly stepId: string;
  readonly actualResult?: string;
  readonly status?: TestResultStatus;
  readonly evidenceIds: readonly string[];
  readonly notes?: string;
  readonly comment?: string;
  readonly recordedAt?: string;
  readonly expectedSnapshot?: string;
  readonly recordedByUserId?: string;
}

export interface EvidenceRecord extends PersistenceMeta {
  readonly type: EvidenceType;
  readonly title: string;
  readonly description?: string;
  readonly storageRef: string;
  readonly contentType?: string;
  readonly contentHash?: string;
  readonly sizeBytes?: number;
  readonly sessionId?: string;
  readonly caseId?: string;
  readonly stepId?: string;
  readonly url?: string;
  readonly checksum?: string;
  readonly mimeType?: string;
  readonly relationships?: readonly Readonly<{
    kind: string;
    targetId: string;
    label?: string;
  }>[];
  readonly executionId?: string;
  readonly lifecycleStatus?: EvidenceLifecycleStatus;
  readonly verificationState?: string;
  readonly evidenceApprovalState?: string;
  readonly captureTime?: string;
  readonly authorUserId?: string;
}

export interface ApprovalRecord extends PersistenceMeta {
  readonly certificationRecordId: string;
  readonly gateId?: string;
  readonly status: ApprovalStatus;
  readonly requestedFromUserId?: string;
  readonly decidedByUserId?: string;
  readonly decidedAt?: string;
  readonly comments?: string;
  readonly conditions?: string;
  readonly signatureJson?: Readonly<Record<string, unknown>>;
  readonly witnessesJson?: readonly Readonly<Record<string, unknown>>[];
  readonly authorUserId?: string;
  readonly reviewerUserId?: string;
  readonly approverUserId?: string;
  readonly historyJson?: readonly Readonly<Record<string, unknown>>[];
  readonly subjectKind?: string;
  readonly subjectId?: string;
  readonly stagesJson?: readonly Readonly<Record<string, unknown>>[];
  readonly currentStageOrdinal?: number;
  readonly stageDecisionsJson?: readonly Readonly<Record<string, unknown>>[];
}

export interface CertificationRecordRecord extends PersistenceMeta {
  readonly key: string;
  readonly name: string;
  readonly status: CertificationStatus;
  readonly planId?: string;
  readonly productLabel?: string;
  readonly releaseLabel?: string;
  readonly gateIds: readonly string[];
  readonly approvalIds: readonly string[];
  readonly conditions?: string;
  readonly certifiedAt?: string;
  readonly expiresAt?: string;
  readonly gateEvaluationIds?: readonly string[];
  readonly currentRecommendation?: string;
  readonly recommendationJson?: Readonly<Record<string, unknown>>;
  readonly evidenceLinksJson?: Readonly<Record<string, unknown>>;
  readonly ruleId?: string;
}

export interface CertificationGateDefinitionRecord extends PersistenceMeta {
  readonly gateKey: string;
  readonly name: string;
  readonly description?: string;
  readonly kind: string;
  readonly required: boolean;
  readonly configJson?: Readonly<Record<string, unknown>>;
  readonly templateKey?: string;
  readonly ordinal?: number;
  readonly enabled: boolean;
}

export interface CertificationGateEvaluationRecord extends PersistenceMeta {
  readonly certificationRecordId: string;
  readonly gateDefinitionId?: string;
  readonly gateKey: string;
  readonly status: string;
  readonly reason: string;
  readonly supportingEvidence: readonly string[];
  readonly evaluatedAt: string;
  readonly evaluatorUserId?: string;
  readonly traceabilityRefs: readonly string[];
  readonly detailsJson?: Readonly<Record<string, unknown>>;
}

export interface CertificationRuleRecord extends PersistenceMeta {
  readonly key: string;
  readonly name: string;
  readonly certificationRecordId?: string;
  readonly planId?: string;
  readonly productLabel?: string;
  readonly requiredGateKeys: readonly string[];
  readonly optionalGateKeys: readonly string[];
  readonly approvalStagesJson?: readonly Readonly<Record<string, unknown>>[];
  readonly enabled: boolean;
  readonly configJson?: Readonly<Record<string, unknown>>;
}

export interface CertificationAuditRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly certificationRecordId: string;
  readonly occurredAt: string;
  readonly actorUserId?: string;
  readonly action: string;
  readonly summary: string;
  readonly detailsJson?: Readonly<Record<string, unknown>>;
  readonly correlationId?: string;
}

export interface CertificationHistoryRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly certificationRecordId: string;
  readonly occurredAt: string;
  readonly actorUserId?: string;
  readonly fromStatus?: string;
  readonly toStatus: string;
  readonly reason?: string;
  readonly correlationId?: string;
  readonly detailsJson?: Readonly<Record<string, unknown>>;
}

export interface ReleaseReadinessRecord extends PersistenceMeta {
  readonly certificationRecordId: string;
  readonly status: ReleaseReadinessStatus;
  readonly summary: string;
  readonly blockingGateIds: readonly string[];
  readonly assessedAt: string;
}

export interface ReleaseRecord extends PersistenceMeta {
  readonly key: string;
  readonly name: string;
  readonly status: ReleaseGovernanceStatus;
  readonly description?: string;
  readonly windowJson?: Readonly<Record<string, unknown>>;
  readonly metadataJson?: Readonly<Record<string, unknown>>;
}

export interface ReleaseScopeRecord extends PersistenceMeta {
  readonly releaseId: string;
  readonly kind: ReleaseScopeKind;
  readonly refId: string;
  readonly label?: string;
}

export interface ReleasePackageRecord extends PersistenceMeta {
  readonly releaseId: string;
  readonly name: string;
  readonly versionLabel: string;
  readonly description?: string;
}

export interface ReleaseCandidateRecord extends PersistenceMeta {
  readonly releaseId: string;
  readonly label: string;
  readonly status: ReleaseGovernanceStatus;
  readonly notes?: string;
}

export interface ReleaseApprovalRecord extends PersistenceMeta {
  readonly releaseId: string;
  readonly stageKind: ReleaseApprovalStageKind;
  readonly status: "pending" | "approved" | "rejected" | "withdrawn" | "conditional";
  readonly requestedFromUserId?: string;
  readonly decidedByUserId?: string;
  readonly decidedAt?: string;
  readonly comments?: string;
  readonly conditions?: string;
}

export interface ReleaseDecisionRecord extends PersistenceMeta {
  readonly releaseId: string;
  readonly verdict: "approved" | "conditionally_approved" | "rejected";
  readonly decidedByUserId: string;
  readonly decidedAt: string;
  readonly rationale: string;
  readonly isAutomatic: false;
}

export interface ReleaseEvidenceRecord extends PersistenceMeta {
  readonly releaseId: string;
  readonly kind: string;
  readonly refId: string;
  readonly summary?: string;
}

export interface ReleaseDependencyRecord extends PersistenceMeta {
  readonly releaseId: string;
  readonly dependsOnReleaseId?: string;
  readonly kind: string;
  readonly required: boolean;
  readonly notes?: string;
  readonly blocked: boolean;
}

export interface ReleaseNoteRecord extends PersistenceMeta {
  readonly releaseId: string;
  readonly title: string;
  readonly body: string;
  readonly authoredAt: string;
  readonly authorUserId?: string;
}

export interface ReleaseRiskAssessmentRecord extends PersistenceMeta {
  readonly releaseId: string;
  readonly snapshotJson: Readonly<Record<string, unknown>>;
  readonly computedAt: string;
  readonly isDecision: false;
}

export interface ReleaseReadinessSnapshotRecord extends PersistenceMeta {
  readonly releaseId: string;
  readonly snapshotJson: Readonly<Record<string, unknown>>;
  readonly computedAt: string;
  readonly isDecision: false;
}

export interface ReleaseSummarySnapshotRecord extends PersistenceMeta {
  readonly releaseId: string;
  readonly snapshotJson: Readonly<Record<string, unknown>>;
  readonly computedAt: string;
  readonly isDecision: false;
}

export interface ReleaseAuditRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly releaseId: string;
  readonly occurredAt: string;
  readonly actorUserId?: string;
  readonly action: string;
  readonly summary: string;
  readonly detailsJson?: Readonly<Record<string, unknown>>;
  readonly correlationId?: string;
}

export interface CoverageRecord extends PersistenceMeta {
  readonly kind: CoverageMetricKind;
  readonly subjectId: string;
  readonly coveredCount: number;
  readonly totalCount: number;
  readonly percentage: number;
  readonly computedAt: string;
  readonly planId?: string;
  readonly suiteId?: string;
  readonly requirementId?: string;
  readonly riskId?: string;
}

export interface AutomationDefinitionRecord extends PersistenceMeta {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly automationType: AutomationType;
  readonly adapterSourceId?: string;
  readonly caseId?: string;
  readonly suiteId?: string;
  readonly configJson: Readonly<Record<string, unknown>>;
  readonly status: string;
}

export interface TraceabilityLinkRecord extends PersistenceMeta {
  readonly type: TraceabilityLinkType;
  readonly sourceKind: string;
  readonly sourceId: string;
  readonly targetKind: string;
  readonly targetId: string;
  readonly notes?: string;
}

export interface AuditRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly occurredAt: string;
  readonly actorUserId?: string;
  readonly action: string;
  readonly entityKind: string;
  readonly entityId: string;
  readonly correlationId?: string;
  readonly summary: string;
  readonly details: Readonly<Record<string, string>>;
}

export interface ConfigurationRecord extends PersistenceMeta {
  readonly configKey: string;
  readonly configJson: Readonly<Record<string, unknown>>;
}

export interface RegistryEntryRecord extends PersistenceMeta {
  readonly registryKind: string;
  readonly entryKey: string;
  readonly name: string;
  readonly description?: string;
  readonly status: string;
  readonly version?: string;
  readonly tags: readonly string[];
  readonly metadata: Readonly<Record<string, string>>;
}

export interface AutomationImportRecord extends PersistenceMeta {
  readonly adapterKind: string;
  readonly adapterVersion: string;
  readonly externalRunRef: string;
  readonly status: string;
  readonly correlationId?: string;
  readonly checksum?: string;
  readonly payloadFingerprint?: string;
  readonly summary?: Readonly<Record<string, unknown>>;
  readonly errorSummary?: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly canonicalSnapshot?: Readonly<Record<string, unknown>>;
  readonly automatedExecutionId?: string;
}

export interface AutomatedExecutionRecord extends PersistenceMeta {
  readonly sessionId?: string;
  readonly importId: string;
  readonly automationType: AutomationType;
  readonly status: ExecutionStatus;
  readonly adapterSourceId?: string;
  readonly externalRunRef: string;
  readonly environment: Readonly<Record<string, unknown>>;
  readonly overallStatus: string;
  readonly durationMs?: number;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly adapterKind: string;
}

export interface AutomationRunRecord extends PersistenceMeta {
  readonly executionId: string;
  readonly suiteKey?: string;
  readonly caseKey?: string;
  readonly title: string;
  readonly status: string;
  readonly durationMs?: number;
  readonly message?: string;
  readonly stack?: string;
  readonly result?: Readonly<Record<string, unknown>>;
  readonly tags: readonly string[];
  readonly requirementRefs: readonly string[];
}

export interface AutomationResultItemRecord extends PersistenceMeta {
  readonly runId: string;
  readonly status: string;
  readonly stepPayload?: Readonly<Record<string, unknown>>;
  readonly name?: string;
  readonly durationMs?: number;
  readonly message?: string;
}

export interface AutomationImportHistoryRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly importId: string;
  readonly eventType: string;
  readonly occurredAt: string;
  readonly actorUserId?: string;
  readonly summary: string;
  readonly details: Readonly<Record<string, unknown>>;
  readonly adapterVersion?: string;
  readonly normalizationNotes?: string;
  readonly correlationId?: string;
}

export interface AutomationCoverageSnapshotRecord extends PersistenceMeta {
  readonly importId?: string;
  readonly executionId?: string;
  readonly summary: Readonly<Record<string, unknown>>;
  readonly coveredCount?: number;
  readonly totalCount?: number;
  readonly percentage?: number;
}

export interface DefectLinkRecord extends PersistenceMeta {
  readonly providerKind: string;
  readonly providerKey?: string;
  readonly status: string;
  readonly internalRef?: string;
  readonly externalRef?: string;
  readonly severity?: string;
  readonly priority?: string;
  readonly ownerUserId?: string;
  readonly resolution?: string;
  readonly verificationState?: string;
  readonly summary?: string;
  readonly url?: string;
  readonly requirementIds: readonly string[];
  readonly planIds: readonly string[];
  readonly suiteIds: readonly string[];
  readonly caseIds: readonly string[];
  readonly manualExecutionIds: readonly string[];
  readonly automationExecutionIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly releaseLabel?: string;
  readonly riskIds: readonly string[];
  readonly workItemRefs: readonly Readonly<Record<string, unknown>>[];
  readonly target?: string;
  readonly externalId?: string;
  readonly resultId?: string;
  readonly runId?: string;
}

export interface QualitySnapshotRecord extends PersistenceMeta {
  readonly scope: Readonly<Record<string, unknown>>;
  readonly metrics: Readonly<Record<string, unknown>>;
  readonly computedAt: string;
  readonly label?: string;
}

export interface RegressionAnalysisRecord extends PersistenceMeta {
  readonly baselineLabel: string;
  readonly currentLabel: string;
  readonly newFailures: readonly string[];
  readonly resolvedFailures: readonly string[];
  readonly reopenedFailures: readonly string[];
  readonly coverageDelta: number;
  readonly executionDelta: number;
  readonly computedAt: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

/** Registered CI/CD pipeline definition (APZTCMS-015). */
export interface PipelineRecord extends PersistenceMeta {
  readonly key: string;
  readonly name: string;
  readonly providerKind: string;
  readonly externalPipelineRef?: string;
  readonly description?: string;
  readonly status: "active" | "archived";
  readonly defaultBranch?: string;
  readonly repositoryRef?: string;
  readonly variablesJson: readonly unknown[];
  readonly secretRefsJson: readonly unknown[];
  readonly metadataJson?: Readonly<Record<string, unknown>>;
}

export interface PipelineImportRecord extends PersistenceMeta {
  readonly providerKind: string;
  readonly adapterVersion: string;
  readonly externalRunRef: string;
  readonly pipelineId?: string;
  readonly status: string;
  readonly correlationId?: string;
  readonly checksum?: string;
  readonly payloadFingerprint?: string;
  readonly summary?: Readonly<Record<string, unknown>>;
  readonly errorSummary?: string;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly canonicalSnapshot?: Readonly<Record<string, unknown>>;
  readonly pipelineRunId?: string;
}

export interface PipelineRunRecord extends PersistenceMeta {
  readonly pipelineId: string;
  readonly importId: string;
  readonly providerKind: string;
  readonly externalRunRef: string;
  readonly status: string;
  readonly stagesJson: readonly unknown[];
  readonly jobsJson: readonly unknown[];
  readonly artifactsJson: readonly unknown[];
  readonly approvalsJson: readonly unknown[];
  readonly eventsJson: readonly unknown[];
  readonly environmentJson: Readonly<Record<string, unknown>>;
  readonly linksJson: Readonly<Record<string, unknown>>;
  readonly summaryJson: Readonly<Record<string, unknown>>;
  readonly metricsJson?: Readonly<Record<string, unknown>>;
  readonly logsJson: readonly unknown[];
  readonly variablesJson: readonly unknown[];
  readonly secretRefsJson: readonly unknown[];
  readonly triggerJson?: Readonly<Record<string, unknown>>;
  readonly sourceJson?: Readonly<Record<string, unknown>>;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly durationMs?: number;
  readonly correlationId?: string;
}

export interface PipelineImportHistoryRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly importId: string;
  readonly eventType: string;
  readonly occurredAt: string;
  readonly actorUserId?: string;
  readonly summary: string;
  readonly details: Readonly<Record<string, unknown>>;
  readonly adapterVersion?: string;
  readonly normalizationNotes?: string;
  readonly correlationId?: string;
}

/** Engineering intelligence snapshot (APZTCMS-021). */
export interface EngineeringSnapshotRecord extends PersistenceMeta {
  readonly scope: Readonly<Record<string, unknown>>;
  readonly qualityScoreJson: Readonly<Record<string, unknown>>;
  readonly healthJson: Readonly<Record<string, unknown>>;
  readonly riskJson: Readonly<Record<string, unknown>>;
  readonly indicatorsJson: readonly unknown[];
  readonly trendsJson: readonly unknown[];
  readonly computedAt: string;
  readonly label?: string;
}

/** Immutable historical engineering snapshot (APZTCMS-021). */
export interface EngineeringHistoricalSnapshotRecord extends PersistenceMeta {
  readonly scope: Readonly<Record<string, unknown>>;
  readonly periodJson: Readonly<Record<string, unknown>>;
  readonly qualityScore: number;
  readonly engineeringHealthScore: number;
  readonly indicatorsJson: readonly unknown[];
  readonly metricsJson: Readonly<Record<string, unknown>>;
  readonly sourceRefsJson: Readonly<Record<string, unknown>>;
  readonly computedAt: string;
  readonly immutable: true;
}

/** Engineering trend series (APZTCMS-021). */
export interface EngineeringTrendSeriesRecord extends PersistenceMeta {
  readonly kind: string;
  readonly scope: Readonly<Record<string, unknown>>;
  readonly periodKind: string;
  readonly pointsJson: readonly unknown[];
  readonly direction: string;
  readonly delta: number;
  readonly computedAt: string;
}

/** Engineering benchmark comparison (APZTCMS-021). */
export interface EngineeringBenchmarkRecord extends PersistenceMeta {
  readonly scope: Readonly<Record<string, unknown>>;
  readonly metricKey: string;
  readonly comparisonJson: Readonly<Record<string, unknown>>;
  readonly computedAt: string;
  readonly label?: string;
}

/** Engineering baseline value (APZTCMS-021). */
export interface EngineeringBaselineRecord extends PersistenceMeta {
  readonly scope: Readonly<Record<string, unknown>>;
  readonly kind: string;
  readonly metricKey: string;
  readonly value: number;
  readonly sourceSnapshotId?: string;
  readonly periodJson?: Readonly<Record<string, unknown>>;
  readonly computedAt: string;
  readonly label?: string;
}

/** Engineering quality summary (APZTCMS-021). */
export interface EngineeringQualitySummaryRecord extends PersistenceMeta {
  readonly scope: Readonly<Record<string, unknown>>;
  readonly qualityScoreJson: Readonly<Record<string, unknown>>;
  readonly indicatorsJson: readonly unknown[];
  readonly computedAt: string;
}

/** Report template definition (APZTCMS-024). */
export interface ReportTemplateRecord extends PersistenceMeta {
  readonly reportType: string;
  readonly name: string;
  readonly description?: string;
  readonly version: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly header?: string;
  readonly footer?: string;
  readonly brandingJson: Readonly<Record<string, unknown>>;
  readonly metadataJson: Readonly<Record<string, unknown>>;
  readonly metricKeysJson: readonly unknown[];
  readonly sectionsJson: readonly unknown[];
  readonly builtin: boolean;
}

/** Immutable report generation metadata (APZTCMS-024). */
export interface ReportGenerationMetadataRecord extends PersistenceMeta {
  readonly requestId: string;
  readonly templateId: string;
  readonly reportType: string;
  readonly outputFormat: string;
  /** JSON string of generation parameters. */
  readonly parametersJson: string;
  readonly generatedAt: string;
  readonly generatedBy: string;
  readonly version: string;
  readonly checksumSha256: string;
  readonly byteLength: number;
  readonly preview: boolean;
}
