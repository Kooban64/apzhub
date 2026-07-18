/** Branded platform global identifiers for APZ TCMS domain entities. */

declare const brand: unique symbol;

type Brand<T, TBrand extends string> = T & { readonly [brand]: TBrand };

export type RequirementId = Brand<string, "RequirementId">;
export type FeatureRefId = Brand<string, "FeatureRefId">;
export type EpicRefId = Brand<string, "EpicRefId">;
export type StoryRefId = Brand<string, "StoryRefId">;
export type TaskRefId = Brand<string, "TaskRefId">;
export type TestPlanId = Brand<string, "TestPlanId">;
export type TestSuiteId = Brand<string, "TestSuiteId">;
export type TestCaseId = Brand<string, "TestCaseId">;
export type TestCaseVersionId = Brand<string, "TestCaseVersionId">;
export type TestStepId = Brand<string, "TestStepId">;
export type ManualExecutionId = Brand<string, "ManualExecutionId">;
export type AutomatedExecutionId = Brand<string, "AutomatedExecutionId">;
export type TestRunId = Brand<string, "TestRunId">;
export type TestResultId = Brand<string, "TestResultId">;
export type EvidenceId = Brand<string, "EvidenceId">;
export type AttachmentId = Brand<string, "AttachmentId">;
export type DefectLinkId = Brand<string, "DefectLinkId">;
export type RegressionSuiteId = Brand<string, "RegressionSuiteId">;
export type CertificationRecordId = Brand<string, "CertificationRecordId">;
export type CertificationGateDefinitionId = Brand<
  string,
  "CertificationGateDefinitionId"
>;
export type CertificationGateEvaluationId = Brand<
  string,
  "CertificationGateEvaluationId"
>;
export type CertificationRuleId = Brand<string, "CertificationRuleId">;
export type CertificationRecommendationId = Brand<
  string,
  "CertificationRecommendationId"
>;
export type CertificationAuditEntryId = Brand<string, "CertificationAuditEntryId">;
export type CertificationHistoryEntryId = Brand<string, "CertificationHistoryEntryId">;
export type QualityGateId = Brand<string, "QualityGateId">;
export type ApprovalId = Brand<string, "ApprovalId">;
export type SignatureId = Brand<string, "SignatureId">;
export type WitnessId = Brand<string, "WitnessId">;
export type AuditEventId = Brand<string, "AuditEventId">;
export type CoverageMetricId = Brand<string, "CoverageMetricId">;
export type TraceabilityLinkId = Brand<string, "TraceabilityLinkId">;
export type AutomationJobId = Brand<string, "AutomationJobId">;
export type AutomationImportId = Brand<string, "AutomationImportId">;
export type AutomationRunId = Brand<string, "AutomationRunId">;
export type AutomationResultItemId = Brand<string, "AutomationResultItemId">;
export type AutomationImportHistoryId = Brand<string, "AutomationImportHistoryId">;
export type AutomationCoverageSnapshotId = Brand<
  string,
  "AutomationCoverageSnapshotId"
>;
export type ExecutionSessionId = Brand<string, "ExecutionSessionId">;
export type ReleaseReadinessId = Brand<string, "ReleaseReadinessId">;
export type RiskId = Brand<string, "RiskId">;
export type AISuggestionId = Brand<string, "AISuggestionId">;
export type DashboardSnapshotId = Brand<string, "DashboardSnapshotId">;
export type QualitySnapshotId = Brand<string, "QualitySnapshotId">;
export type RegressionAnalysisId = Brand<string, "RegressionAnalysisId">;
export type ProductRegistryId = Brand<string, "ProductRegistryId">;
export type GovernedProductId = Brand<string, "GovernedProductId">;
export type ProductDependencyId = Brand<string, "ProductDependencyId">;
export type PlatformReleaseId = Brand<string, "PlatformReleaseId">;
export type PlatformReleasePackageId = Brand<string, "PlatformReleasePackageId">;
export type PlatformReleaseCandidateId = Brand<string, "PlatformReleaseCandidateId">;
export type PlatformReleaseApprovalId = Brand<string, "PlatformReleaseApprovalId">;
export type PlatformReleaseDecisionId = Brand<string, "PlatformReleaseDecisionId">;
export type PlatformCrossProductLinkId = Brand<string, "PlatformCrossProductLinkId">;

/** TCMS-only release governance identifiers (APZTCMS-014). */
export type ReleaseId = Brand<string, "ReleaseId">;
export type ReleaseCandidateId = Brand<string, "ReleaseCandidateId">;
export type ReleasePackageId = Brand<string, "ReleasePackageId">;
export type ReleaseScopeId = Brand<string, "ReleaseScopeId">;
export type ReleaseApprovalId = Brand<string, "ReleaseApprovalId">;
export type ReleaseDecisionId = Brand<string, "ReleaseDecisionId">;
export type ReleaseEvidenceId = Brand<string, "ReleaseEvidenceId">;
export type ReleaseDependencyId = Brand<string, "ReleaseDependencyId">;
export type ReleaseNoteId = Brand<string, "ReleaseNoteId">;
export type ReleaseRiskAssessmentId = Brand<string, "ReleaseRiskAssessmentId">;
export type ReleaseReadinessSnapshotId = Brand<string, "ReleaseReadinessSnapshotId">;
export type ReleaseAuditEntryId = Brand<string, "ReleaseAuditEntryId">;
export type ReleaseSummarySnapshotId = Brand<string, "ReleaseSummarySnapshotId">;

/** External CI/CD pipeline identifiers (APZTCMS-015). */
export type PipelineId = Brand<string, "PipelineId">;
export type PipelineRunId = Brand<string, "PipelineRunId">;
export type PipelineImportId = Brand<string, "PipelineImportId">;
export type PipelineImportHistoryId = Brand<string, "PipelineImportHistoryId">;
export type ArtifactReferenceId = Brand<string, "ArtifactReferenceId">;

/** Engineering intelligence identifiers (APZTCMS-021). */
export type QualityScoreId = Brand<string, "QualityScoreId">;
export type EngineeringSnapshotId = Brand<string, "EngineeringSnapshotId">;
export type EngineeringHistoricalSnapshotId = Brand<
  string,
  "EngineeringHistoricalSnapshotId"
>;
export type TrendSeriesId = Brand<string, "TrendSeriesId">;
export type BenchmarkId = Brand<string, "BenchmarkId">;
export type BaselineId = Brand<string, "BaselineId">;

const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{1,127}$/;

/** Returns true when the value matches the platform ID shape. */
export function isPlatformIdShape(value: string): boolean {
  return ID_PATTERN.test(value);
}

function brandId<T extends string>(value: string): T {
  if (!isPlatformIdShape(value)) {
    throw new Error(`Invalid platform identifier shape: ${value}`);
  }
  return value as T;
}

export function asRequirementId(value: string): RequirementId {
  return brandId(value);
}

export function asTestPlanId(value: string): TestPlanId {
  return brandId(value);
}

export function asTestSuiteId(value: string): TestSuiteId {
  return brandId(value);
}

export function asTestCaseId(value: string): TestCaseId {
  return brandId(value);
}

export function asTestCaseVersionId(value: string): TestCaseVersionId {
  return brandId(value);
}

export function asTestStepId(value: string): TestStepId {
  return brandId(value);
}

export function asTestRunId(value: string): TestRunId {
  return brandId(value);
}

export function asTestResultId(value: string): TestResultId {
  return brandId(value);
}

export function asEvidenceId(value: string): EvidenceId {
  return brandId(value);
}

export function asAttachmentId(value: string): AttachmentId {
  return brandId(value);
}

export function asCertificationRecordId(value: string): CertificationRecordId {
  return brandId(value);
}

export function asCertificationGateDefinitionId(
  value: string,
): CertificationGateDefinitionId {
  return brandId(value);
}

export function asCertificationGateEvaluationId(
  value: string,
): CertificationGateEvaluationId {
  return brandId(value);
}

export function asCertificationRuleId(value: string): CertificationRuleId {
  return brandId(value);
}

export function asCertificationRecommendationId(
  value: string,
): CertificationRecommendationId {
  return brandId(value);
}

export function asCertificationAuditEntryId(value: string): CertificationAuditEntryId {
  return brandId(value);
}

export function asCertificationHistoryEntryId(
  value: string,
): CertificationHistoryEntryId {
  return brandId(value);
}

export function asQualityGateId(value: string): QualityGateId {
  return brandId(value);
}

export function asApprovalId(value: string): ApprovalId {
  return brandId(value);
}

export function asRiskId(value: string): RiskId {
  return brandId(value);
}

export function asTraceabilityLinkId(value: string): TraceabilityLinkId {
  return brandId(value);
}

export function asAutomationJobId(value: string): AutomationJobId {
  return brandId(value);
}

export function asAutomationImportId(value: string): AutomationImportId {
  return brandId(value);
}

export function asAutomationRunId(value: string): AutomationRunId {
  return brandId(value);
}

export function asAutomationResultItemId(value: string): AutomationResultItemId {
  return brandId(value);
}

export function asAutomationImportHistoryId(value: string): AutomationImportHistoryId {
  return brandId(value);
}

export function asAutomationCoverageSnapshotId(
  value: string,
): AutomationCoverageSnapshotId {
  return brandId(value);
}

export function asExecutionSessionId(value: string): ExecutionSessionId {
  return brandId(value);
}

export function asManualExecutionId(value: string): ManualExecutionId {
  return brandId(value);
}

export function asAutomatedExecutionId(value: string): AutomatedExecutionId {
  return brandId(value);
}

export function asDefectLinkId(value: string): DefectLinkId {
  return brandId(value);
}

export function asRegressionSuiteId(value: string): RegressionSuiteId {
  return brandId(value);
}

export function asCoverageMetricId(value: string): CoverageMetricId {
  return brandId(value);
}

export function asAuditEventId(value: string): AuditEventId {
  return brandId(value);
}

export function asAISuggestionId(value: string): AISuggestionId {
  return brandId(value);
}

export function asReleaseReadinessId(value: string): ReleaseReadinessId {
  return brandId(value);
}

export function asSignatureId(value: string): SignatureId {
  return brandId(value);
}

export function asWitnessId(value: string): WitnessId {
  return brandId(value);
}

export function asDashboardSnapshotId(value: string): DashboardSnapshotId {
  return brandId(value);
}

export function asQualitySnapshotId(value: string): QualitySnapshotId {
  return brandId(value);
}

export function asRegressionAnalysisId(value: string): RegressionAnalysisId {
  return brandId(value);
}

export function asProductRegistryId(value: string): ProductRegistryId {
  return brandId(value);
}
export function asGovernedProductId(value: string): GovernedProductId {
  return brandId(value);
}
export function asProductDependencyId(value: string): ProductDependencyId {
  return brandId(value);
}
export function asPlatformReleaseId(value: string): PlatformReleaseId {
  return brandId(value);
}
export function asPlatformReleasePackageId(value: string): PlatformReleasePackageId {
  return brandId(value);
}
export function asPlatformReleaseCandidateId(
  value: string,
): PlatformReleaseCandidateId {
  return brandId(value);
}
export function asPlatformReleaseApprovalId(value: string): PlatformReleaseApprovalId {
  return brandId(value);
}
export function asPlatformReleaseDecisionId(value: string): PlatformReleaseDecisionId {
  return brandId(value);
}
export function asPlatformCrossProductLinkId(
  value: string,
): PlatformCrossProductLinkId {
  return brandId(value);
}

export function asReleaseId(value: string): ReleaseId {
  return brandId(value);
}
export function asReleaseCandidateId(value: string): ReleaseCandidateId {
  return brandId(value);
}
export function asReleasePackageId(value: string): ReleasePackageId {
  return brandId(value);
}
export function asReleaseScopeId(value: string): ReleaseScopeId {
  return brandId(value);
}
export function asReleaseApprovalId(value: string): ReleaseApprovalId {
  return brandId(value);
}
export function asReleaseDecisionId(value: string): ReleaseDecisionId {
  return brandId(value);
}
export function asReleaseEvidenceId(value: string): ReleaseEvidenceId {
  return brandId(value);
}
export function asReleaseDependencyId(value: string): ReleaseDependencyId {
  return brandId(value);
}
export function asReleaseNoteId(value: string): ReleaseNoteId {
  return brandId(value);
}
export function asReleaseRiskAssessmentId(value: string): ReleaseRiskAssessmentId {
  return brandId(value);
}
export function asReleaseReadinessSnapshotId(
  value: string,
): ReleaseReadinessSnapshotId {
  return brandId(value);
}
export function asReleaseAuditEntryId(value: string): ReleaseAuditEntryId {
  return brandId(value);
}
export function asReleaseSummarySnapshotId(value: string): ReleaseSummarySnapshotId {
  return brandId(value);
}

export function asPipelineId(value: string): PipelineId {
  return brandId(value);
}
export function asPipelineRunId(value: string): PipelineRunId {
  return brandId(value);
}
export function asPipelineImportId(value: string): PipelineImportId {
  return brandId(value);
}
export function asPipelineImportHistoryId(value: string): PipelineImportHistoryId {
  return brandId(value);
}
export function asArtifactReferenceId(value: string): ArtifactReferenceId {
  return brandId(value);
}

export function asQualityScoreId(value: string): QualityScoreId {
  return brandId(value);
}
export function asEngineeringSnapshotId(value: string): EngineeringSnapshotId {
  return brandId(value);
}
export function asEngineeringHistoricalSnapshotId(
  value: string,
): EngineeringHistoricalSnapshotId {
  return brandId(value);
}
export function asTrendSeriesId(value: string): TrendSeriesId {
  return brandId(value);
}
export function asBenchmarkId(value: string): BenchmarkId {
  return brandId(value);
}
export function asBaselineId(value: string): BaselineId {
  return brandId(value);
}
