/**
 * Synchronous publication hooks for Testing lifecycle events (APZSEARCH-013).
 * No listeners, webhooks, polling, Event Bus, or OCR — call sites invoke explicitly.
 */

import type {
  Approval,
  AutomationCoverageSnapshot,
  AutomationImport,
  AutomationRun,
  Benchmark,
  CertificationRecord,
  DefectLink,
  EngineeringSnapshot,
  Evidence,
  HistoricalSnapshot,
  ManualExecution,
  QualityGate,
  Release,
  ReleaseApproval,
  ReleaseCandidate,
  ReleaseDecision,
  ReleasePackage,
  ReleaseScope,
  ReleaseSummary,
  ReportGenerationMetadata,
  ReportTemplate,
  Requirement,
  TestCase,
  TestPlan,
  TestRun,
  TestSuite,
  TrendSeries,
} from "@apzhub/testing-contracts";
import type { SearchPublicationResult } from "@apzhub/search-integration";

import type { TestingSearchPublicationContext } from "../context/testing-search-publication-context";
import type {
  AutomationSuiteSearchInput,
  CertificationDecisionSearchInput,
  CertificationEvidenceSearchInput,
  TestingSearchMappingExtras,
} from "../mapper/testing-search-entity-mapper";
import type { TestingSearchPublisher } from "../publisher/testing-search-publisher";

export type TestingSearchLifecycleHooks = {
  onTestPlanUpserted(
    context: TestingSearchPublicationContext,
    plan: TestPlan,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onTestPlanRemoved(
    context: TestingSearchPublicationContext,
    planId: string,
  ): SearchPublicationResult;
  onTestSuiteUpserted(
    context: TestingSearchPublicationContext,
    suite: TestSuite,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onTestCaseUpserted(
    context: TestingSearchPublicationContext,
    testCase: TestCase,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onTestCaseRemoved(
    context: TestingSearchPublicationContext,
    caseId: string,
  ): SearchPublicationResult;
  onTestExecutionUpserted(
    context: TestingSearchPublicationContext,
    execution: ManualExecution,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onTestRunUpserted(
    context: TestingSearchPublicationContext,
    run: TestRun,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onEvidenceUpserted(
    context: TestingSearchPublicationContext,
    evidence: Evidence,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onRequirementUpserted(
    context: TestingSearchPublicationContext,
    requirement: Requirement,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onDefectUpserted(
    context: TestingSearchPublicationContext,
    defect: DefectLink,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onApprovalUpserted(
    context: TestingSearchPublicationContext,
    approval: Approval,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onAutomationRunUpserted(
    context: TestingSearchPublicationContext,
    run: AutomationRun,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onAutomationSuiteUpserted(
    context: TestingSearchPublicationContext,
    suite: AutomationSuiteSearchInput,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onImportedResultUpserted(
    context: TestingSearchPublicationContext,
    imported: AutomationImport,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onCoverageSummaryUpserted(
    context: TestingSearchPublicationContext,
    snapshot: AutomationCoverageSnapshot,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onCertificationUpserted(
    context: TestingSearchPublicationContext,
    record: CertificationRecord,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onCertificationGateUpserted(
    context: TestingSearchPublicationContext,
    gate: QualityGate,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onCertificationApprovalUpserted(
    context: TestingSearchPublicationContext,
    approval: Approval,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onCertificationEvidenceUpserted(
    context: TestingSearchPublicationContext,
    evidence: CertificationEvidenceSearchInput,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onCertificationDecisionUpserted(
    context: TestingSearchPublicationContext,
    decision: CertificationDecisionSearchInput | CertificationRecord,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onReleaseUpserted(
    context: TestingSearchPublicationContext,
    release: Release,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onReleaseCandidateUpserted(
    context: TestingSearchPublicationContext,
    candidate: ReleaseCandidate,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onReleasePackageUpserted(
    context: TestingSearchPublicationContext,
    pkg: ReleasePackage,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onReleaseScopeUpserted(
    context: TestingSearchPublicationContext,
    scope: ReleaseScope,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onReleaseApprovalUpserted(
    context: TestingSearchPublicationContext,
    approval: ReleaseApproval,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onReleaseDecisionUpserted(
    context: TestingSearchPublicationContext,
    decision: ReleaseDecision,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onReleaseSummaryUpserted(
    context: TestingSearchPublicationContext,
    summary: ReleaseSummary,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onEngineeringSnapshotUpserted(
    context: TestingSearchPublicationContext,
    snapshot: EngineeringSnapshot,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onEngineeringTrendUpserted(
    context: TestingSearchPublicationContext,
    series: TrendSeries,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onBenchmarkUpserted(
    context: TestingSearchPublicationContext,
    benchmark: Benchmark,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onHistoricalSnapshotUpserted(
    context: TestingSearchPublicationContext,
    snapshot: HistoricalSnapshot,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onReportMetadataUpserted(
    context: TestingSearchPublicationContext,
    meta: ReportGenerationMetadata,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onReportTemplateUpserted(
    context: TestingSearchPublicationContext,
    template: ReportTemplate,
    extras?: TestingSearchMappingExtras,
  ): SearchPublicationResult;
  onEntityRemoved(
    context: TestingSearchPublicationContext,
    entityType: Parameters<TestingSearchPublisher["remove"]>[1],
    entityId: string,
  ): SearchPublicationResult;
};

/**
 * Creates explicit hooks that call publish-or-update based on existence in the sink.
 * No background subscription.
 */
export function createTestingSearchLifecycleHooks(
  publisher: TestingSearchPublisher,
): TestingSearchLifecycleHooks {
  const upsert = (
    context: TestingSearchPublicationContext,
    input: Parameters<TestingSearchPublisher["publish"]>[1],
  ): SearchPublicationResult => {
    const entityId = (input.entity as { id: string }).id;
    const prior = publisher.getIntegrationPublisher().getSink().get(entityId);
    if (prior && prior.lifecycleState !== "removed") {
      return publisher.update(context, input);
    }
    return publisher.publish(context, input);
  };

  return {
    onTestPlanUpserted: (c, e, x) =>
      upsert(c, { entityType: "test_plan", entity: e, extras: x }),
    onTestPlanRemoved: (c, id) => publisher.remove(c, "test_plan", id),
    onTestSuiteUpserted: (c, e, x) =>
      upsert(c, { entityType: "test_suite", entity: e, extras: x }),
    onTestCaseUpserted: (c, e, x) =>
      upsert(c, { entityType: "test_case", entity: e, extras: x }),
    onTestCaseRemoved: (c, id) => publisher.remove(c, "test_case", id),
    onTestExecutionUpserted: (c, e, x) =>
      upsert(c, { entityType: "test_execution", entity: e, extras: x }),
    onTestRunUpserted: (c, e, x) =>
      upsert(c, { entityType: "test_run", entity: e, extras: x }),
    onEvidenceUpserted: (c, e, x) =>
      upsert(c, { entityType: "evidence", entity: e, extras: x }),
    onRequirementUpserted: (c, e, x) =>
      upsert(c, { entityType: "requirement", entity: e, extras: x }),
    onDefectUpserted: (c, e, x) =>
      upsert(c, { entityType: "defect", entity: e, extras: x }),
    onApprovalUpserted: (c, e, x) =>
      upsert(c, { entityType: "approval", entity: e, extras: x }),
    onAutomationRunUpserted: (c, e, x) =>
      upsert(c, { entityType: "automation_run", entity: e, extras: x }),
    onAutomationSuiteUpserted: (c, e, x) =>
      upsert(c, { entityType: "automation_suite", entity: e, extras: x }),
    onImportedResultUpserted: (c, e, x) =>
      upsert(c, { entityType: "imported_result", entity: e, extras: x }),
    onCoverageSummaryUpserted: (c, e, x) =>
      upsert(c, { entityType: "coverage_summary", entity: e, extras: x }),
    onCertificationUpserted: (c, e, x) =>
      upsert(c, { entityType: "certification", entity: e, extras: x }),
    onCertificationGateUpserted: (c, e, x) =>
      upsert(c, { entityType: "certification_gate", entity: e, extras: x }),
    onCertificationApprovalUpserted: (c, e, x) =>
      upsert(c, { entityType: "certification_approval", entity: e, extras: x }),
    onCertificationEvidenceUpserted: (c, e, x) =>
      upsert(c, { entityType: "certification_evidence", entity: e, extras: x }),
    onCertificationDecisionUpserted: (c, e, x) =>
      upsert(c, { entityType: "certification_decision", entity: e, extras: x }),
    onReleaseUpserted: (c, e, x) =>
      upsert(c, { entityType: "release", entity: e, extras: x }),
    onReleaseCandidateUpserted: (c, e, x) =>
      upsert(c, { entityType: "release_candidate", entity: e, extras: x }),
    onReleasePackageUpserted: (c, e, x) =>
      upsert(c, { entityType: "release_package", entity: e, extras: x }),
    onReleaseScopeUpserted: (c, e, x) =>
      upsert(c, { entityType: "release_scope", entity: e, extras: x }),
    onReleaseApprovalUpserted: (c, e, x) =>
      upsert(c, { entityType: "release_approval", entity: e, extras: x }),
    onReleaseDecisionUpserted: (c, e, x) =>
      upsert(c, { entityType: "release_decision", entity: e, extras: x }),
    onReleaseSummaryUpserted: (c, e, x) =>
      upsert(c, { entityType: "release_summary", entity: e, extras: x }),
    onEngineeringSnapshotUpserted: (c, e, x) =>
      upsert(c, { entityType: "engineering_snapshot", entity: e, extras: x }),
    onEngineeringTrendUpserted: (c, e, x) =>
      upsert(c, { entityType: "engineering_trend", entity: e, extras: x }),
    onBenchmarkUpserted: (c, e, x) =>
      upsert(c, { entityType: "benchmark", entity: e, extras: x }),
    onHistoricalSnapshotUpserted: (c, e, x) =>
      upsert(c, { entityType: "historical_snapshot", entity: e, extras: x }),
    onReportMetadataUpserted: (c, e, x) =>
      upsert(c, { entityType: "report_metadata", entity: e, extras: x }),
    onReportTemplateUpserted: (c, e, x) =>
      upsert(c, { entityType: "report_template", entity: e, extras: x }),
    onEntityRemoved: (c, t, id) => publisher.remove(c, t, id),
  };
}
