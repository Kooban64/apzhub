import type {
  ServiceRequestContext,
  TestingApprovalService,
  TestingAutomationService,
  TestingCaseService,
  TestingCertificationService,
  TestingCoverageService,
  TestingDashboardService,
  TestingDefectService,
  TestingEvidenceService,
  TestingExecutionService,
  TestingPlanService,
  TestingQualityService,
  TestingReleaseReadinessService,
  TestingRequirementService,
  TestingSuiteService,
  TestingTraceabilityService,
  TestingPipelineArtifactService,
  TestingPipelineJobService,
  TestingPipelineRepositoryService,
  TestingPipelineRunLiveService,
  TestingPipelineStepService,
  TestingPipelineSummaryService,
  TestingPipelineWorkflowService,
} from "@apzhub/platform-service-contracts";
import type {
  CertificationStatus,
  CoverageMetric,
  DefectStatus,
  Evidence,
  ManualExecution,
  QualitySnapshot,
  TestResultStatus,
} from "@apzhub/testing-contracts";
import type { TestingDomainServices } from "@apzhub/testing-services";

import type { ProviderResolver } from "../../providers/registry/provider-resolver";
import { assertTestingContext } from "./assert-testing-context";
import { withTestingErrorMapping } from "./map-testing-error";
import { TestingReleaseGovernanceServiceImpl } from "./testing-release-governance-service-impl";
import { TestingEngineeringIntelligenceServiceImpl } from "./testing-engineering-intelligence-service-impl";
import { TestingReportingServiceImpl } from "./testing-reporting-service-impl";
import { TestingPipelinesServiceImpl } from "./testing-pipelines-service-impl";
import {
  PipelineArtifactServiceImpl,
  PipelineJobServiceImpl,
  PipelineRepositoryServiceImpl,
  PipelineRunLiveServiceImpl,
  PipelineStepServiceImpl,
  PipelineSummaryServiceImpl,
  PipelineWorkflowServiceImpl,
} from "./testing-pipeline-live-service-impls";
import { createUnavailablePipelineLiveServices } from "./unavailable-pipeline-live-services";

async function runTestingOperation<T>(
  ctx: ServiceRequestContext,
  fn: () => Promise<T>,
): Promise<T> {
  assertTestingContext(ctx);
  return withTestingErrorMapping(fn, ctx.correlationId);
}

function toCount(label: string, count: number): { readonly label: string; readonly count: number } {
  return { label, count };
}

function countBy<T>(
  items: readonly T[],
  labelOf: (item: T) => string | undefined,
): readonly { readonly label: string; readonly count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const label = labelOf(item);
    if (label) {
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }
  return [...counts.entries()].map(([label, count]) => toCount(label, count));
}

export class TestingPlanServiceImpl implements TestingPlanService {
  constructor(private readonly domain: TestingDomainServices) {}

  list(ctx: ServiceRequestContext): Promise<ReturnType<TestingPlanService["list"]> extends Promise<infer T> ? T : never> {
    return runTestingOperation(ctx, () => this.domain.testPlans.list(ctx));
  }

  get(ctx: ServiceRequestContext, id: Parameters<TestingPlanService["get"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.testPlans.get(ctx, id));
  }

  create(ctx: ServiceRequestContext, input: Parameters<TestingPlanService["create"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.testPlans.create(ctx, input));
  }

  update(
    ctx: ServiceRequestContext,
    id: Parameters<TestingPlanService["update"]>[1],
    input: Parameters<TestingPlanService["update"]>[2],
  ) {
    return runTestingOperation(ctx, () => this.domain.testPlans.update(ctx, id, input));
  }

  clone(
    ctx: ServiceRequestContext,
    id: Parameters<TestingPlanService["clone"]>[1],
    options?: Parameters<TestingPlanService["clone"]>[2],
  ) {
    return runTestingOperation(ctx, () => this.domain.testPlans.clone(ctx, id, options));
  }

  archive(ctx: ServiceRequestContext, id: Parameters<TestingPlanService["archive"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.testPlans.archive(ctx, id));
  }
}

export class TestingSuiteServiceImpl implements TestingSuiteService {
  constructor(private readonly domain: TestingDomainServices) {}

  list(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () => this.domain.testSuites.list(ctx));
  }

  get(ctx: ServiceRequestContext, id: Parameters<TestingSuiteService["get"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.testSuites.get(ctx, id));
  }

  create(ctx: ServiceRequestContext, input: Parameters<TestingSuiteService["create"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.testSuites.create(ctx, input));
  }

  update(
    ctx: ServiceRequestContext,
    id: Parameters<TestingSuiteService["update"]>[1],
    input: Parameters<TestingSuiteService["update"]>[2],
  ) {
    return runTestingOperation(ctx, () => this.domain.testSuites.update(ctx, id, input));
  }

  clone(
    ctx: ServiceRequestContext,
    id: Parameters<TestingSuiteService["clone"]>[1],
    options?: Parameters<TestingSuiteService["clone"]>[2],
  ) {
    return runTestingOperation(ctx, () => this.domain.testSuites.clone(ctx, id, options));
  }

  archive(ctx: ServiceRequestContext, id: Parameters<TestingSuiteService["archive"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.testSuites.archive(ctx, id));
  }
}

export class TestingCaseServiceImpl implements TestingCaseService {
  constructor(private readonly domain: TestingDomainServices) {}

  list(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () => this.domain.testCases.list(ctx));
  }

  get(ctx: ServiceRequestContext, id: Parameters<TestingCaseService["get"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.testCases.get(ctx, id));
  }

  create(ctx: ServiceRequestContext, input: Parameters<TestingCaseService["create"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.testCases.create(ctx, input));
  }

  update(
    ctx: ServiceRequestContext,
    id: Parameters<TestingCaseService["update"]>[1],
    input: Parameters<TestingCaseService["update"]>[2],
  ) {
    return runTestingOperation(ctx, () => this.domain.testCases.update(ctx, id, input));
  }

  clone(
    ctx: ServiceRequestContext,
    id: Parameters<TestingCaseService["clone"]>[1],
    options?: Parameters<TestingCaseService["clone"]>[2],
  ) {
    return runTestingOperation(ctx, () => this.domain.testCases.clone(ctx, id, options));
  }

  archive(ctx: ServiceRequestContext, id: Parameters<TestingCaseService["archive"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.testCases.archive(ctx, id));
  }

  transitionStatus(
    ctx: ServiceRequestContext,
    id: Parameters<TestingCaseService["transitionStatus"]>[1],
    status: Parameters<TestingCaseService["transitionStatus"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.testCases.transitionStatus(ctx, id, status),
    );
  }
}

export class TestingRequirementServiceImpl implements TestingRequirementService {
  constructor(private readonly domain: TestingDomainServices) {}

  list(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () => this.domain.requirements.list(ctx));
  }

  get(ctx: ServiceRequestContext, id: Parameters<TestingRequirementService["get"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.requirements.get(ctx, id));
  }

  create(ctx: ServiceRequestContext, input: Parameters<TestingRequirementService["create"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.requirements.create(ctx, input));
  }

  update(
    ctx: ServiceRequestContext,
    id: Parameters<TestingRequirementService["update"]>[1],
    input: Parameters<TestingRequirementService["update"]>[2],
  ) {
    return runTestingOperation(ctx, () => this.domain.requirements.update(ctx, id, input));
  }

  archive(ctx: ServiceRequestContext, id: Parameters<TestingRequirementService["archive"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.requirements.archive(ctx, id));
  }
}

export class TestingExecutionServiceImpl implements TestingExecutionService {
  constructor(private readonly domain: TestingDomainServices) {}

  list(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () => this.domain.manualExecutions.list(ctx));
  }

  get(ctx: ServiceRequestContext, id: Parameters<TestingExecutionService["get"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.manualExecutions.get(ctx, id));
  }

  create(ctx: ServiceRequestContext, input: Parameters<TestingExecutionService["create"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.manualExecutions.create(ctx, input));
  }

  assign(
    ctx: ServiceRequestContext,
    id: Parameters<TestingExecutionService["assign"]>[1],
    assigneeId: string,
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.manualExecutions.assign(ctx, id, assigneeId),
    );
  }

  start(ctx: ServiceRequestContext, id: Parameters<TestingExecutionService["start"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.manualExecutions.start(ctx, id));
  }

  pause(ctx: ServiceRequestContext, id: Parameters<TestingExecutionService["pause"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.manualExecutions.pause(ctx, id));
  }

  resume(ctx: ServiceRequestContext, id: Parameters<TestingExecutionService["resume"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.manualExecutions.resume(ctx, id));
  }

  block(
    ctx: ServiceRequestContext,
    id: Parameters<TestingExecutionService["block"]>[1],
    reason?: string,
  ) {
    return runTestingOperation(ctx, () => this.domain.manualExecutions.block(ctx, id, reason));
  }

  unblock(ctx: ServiceRequestContext, id: Parameters<TestingExecutionService["unblock"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.manualExecutions.unblock(ctx, id));
  }

  complete(
    ctx: ServiceRequestContext,
    id: Parameters<TestingExecutionService["complete"]>[1],
    overallResult?: TestResultStatus,
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.manualExecutions.complete(ctx, id, overallResult),
    );
  }

  submitForReview(
    ctx: ServiceRequestContext,
    id: Parameters<TestingExecutionService["submitForReview"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.manualExecutions.submitForReview(ctx, id),
    );
  }

  approve(
    ctx: ServiceRequestContext,
    id: Parameters<TestingExecutionService["approve"]>[1],
    comments?: string,
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.manualExecutions.approve(ctx, id, comments),
    );
  }

  reject(
    ctx: ServiceRequestContext,
    id: Parameters<TestingExecutionService["reject"]>[1],
    comments: string,
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.manualExecutions.reject(ctx, id, comments),
    );
  }

  reopen(ctx: ServiceRequestContext, id: Parameters<TestingExecutionService["reopen"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.manualExecutions.reopen(ctx, id));
  }

  cancel(
    ctx: ServiceRequestContext,
    id: Parameters<TestingExecutionService["cancel"]>[1],
    reason?: string,
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.manualExecutions.cancel(ctx, id, reason),
    );
  }

  archive(ctx: ServiceRequestContext, id: Parameters<TestingExecutionService["archive"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.manualExecutions.archive(ctx, id));
  }

  restore(ctx: ServiceRequestContext, id: Parameters<TestingExecutionService["restore"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.manualExecutions.restore(ctx, id));
  }

  recordStepActual(
    ctx: ServiceRequestContext,
    id: Parameters<TestingExecutionService["recordStepActual"]>[1],
    stepId: Parameters<TestingExecutionService["recordStepActual"]>[2],
    actual: Parameters<TestingExecutionService["recordStepActual"]>[3],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.manualExecutions.recordStepActual(ctx, id, stepId, actual),
    );
  }

  setStepStatus(
    ctx: ServiceRequestContext,
    id: Parameters<TestingExecutionService["setStepStatus"]>[1],
    stepId: Parameters<TestingExecutionService["setStepStatus"]>[2],
    status: TestResultStatus,
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.manualExecutions.setStepStatus(ctx, id, stepId, status),
    );
  }
}

export class TestingEvidenceServiceImpl implements TestingEvidenceService {
  constructor(private readonly domain: TestingDomainServices) {}

  listEvidence(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () => this.domain.evidence.listEvidence(ctx));
  }

  getEvidence(ctx: ServiceRequestContext, id: Parameters<TestingEvidenceService["getEvidence"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.evidence.getEvidence(ctx, id));
  }

  registerEvidence(
    ctx: ServiceRequestContext,
    input: Parameters<TestingEvidenceService["registerEvidence"]>[1],
  ) {
    return runTestingOperation(ctx, () => this.domain.evidence.registerEvidence(ctx, input));
  }

  submitEvidence(
    ctx: ServiceRequestContext,
    id: Parameters<TestingEvidenceService["submitEvidence"]>[1],
  ) {
    return runTestingOperation(ctx, () => this.domain.evidence.submitEvidence(ctx, id));
  }

  verifyEvidence(
    ctx: ServiceRequestContext,
    id: Parameters<TestingEvidenceService["verifyEvidence"]>[1],
    verificationState?: string,
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.evidence.verifyEvidence(ctx, id, verificationState),
    );
  }

  approveEvidence(
    ctx: ServiceRequestContext,
    id: Parameters<TestingEvidenceService["approveEvidence"]>[1],
  ) {
    return runTestingOperation(ctx, () => this.domain.evidence.approveEvidence(ctx, id));
  }

  rejectEvidence(
    ctx: ServiceRequestContext,
    id: Parameters<TestingEvidenceService["rejectEvidence"]>[1],
    reason?: string,
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.evidence.rejectEvidence(ctx, id, reason),
    );
  }

  archiveEvidence(
    ctx: ServiceRequestContext,
    id: Parameters<TestingEvidenceService["archiveEvidence"]>[1],
  ) {
    return runTestingOperation(ctx, () => this.domain.evidence.archiveEvidence(ctx, id));
  }
}

export class TestingAutomationServiceImpl implements TestingAutomationService {
  constructor(private readonly domain: TestingDomainServices) {}

  validateImport(ctx: ServiceRequestContext, result: Parameters<TestingAutomationService["validateImport"]>[1]) {
    return runTestingOperation(ctx, async () => {
      this.domain.automation.validation.validateCanonical(result);
    });
  }

  importResult(ctx: ServiceRequestContext, input: Parameters<TestingAutomationService["importResult"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.automation.imports.importResult(ctx, input));
  }

  listImports(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () => this.domain.automation.results.listImports(ctx));
  }

  getImport(ctx: ServiceRequestContext, id: Parameters<TestingAutomationService["getImport"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.automation.results.getImport(ctx, id));
  }

  listImportHistory(
    ctx: ServiceRequestContext,
    importId: Parameters<TestingAutomationService["listImportHistory"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.automation.history.listByImport(ctx, importId),
    );
  }

  getHistory(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () => this.domain.automation.history.list(ctx));
  }

  listRuns(ctx: ServiceRequestContext, executionId: Parameters<TestingAutomationService["listRuns"]>[1]) {
    return runTestingOperation(ctx, () =>
      this.domain.automation.results.listRuns(ctx, executionId),
    );
  }

  getRun(ctx: ServiceRequestContext, id: Parameters<TestingAutomationService["getRun"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.automation.results.getRun(ctx, id));
  }

  listResultItems(
    ctx: ServiceRequestContext,
    runId: Parameters<TestingAutomationService["listResultItems"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.automation.results.listResultItems(ctx, runId),
    );
  }

  listCoverageSnapshots(
    ctx: ServiceRequestContext,
    importId: Parameters<TestingAutomationService["listCoverageSnapshots"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.automation.coverage.listByImport(ctx, importId),
    );
  }

  aggregateCoverage(
    ctx: ServiceRequestContext,
    executionId: Parameters<TestingAutomationService["aggregateCoverage"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.automation.coverage.aggregate(ctx, executionId),
    );
  }
}

export class TestingCoverageServiceImpl implements TestingCoverageService {
  constructor(private readonly domain: TestingDomainServices) {}

  recompute(ctx: ServiceRequestContext, scope: Parameters<TestingCoverageService["recompute"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.quality.coverage.recompute(ctx, scope));
  }

  recomputeAll(ctx: ServiceRequestContext, scope?: Parameters<TestingCoverageService["recomputeAll"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.quality.coverage.recomputeAll(ctx, scope));
  }

  requestRecompute(
    ctx: ServiceRequestContext,
    planId?: Parameters<TestingCoverageService["requestRecompute"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.quality.coverage.requestRecompute(ctx, planId),
    );
  }

  listMetrics(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () => this.domain.quality.coverage.listMetrics(ctx));
  }

  getMetric(ctx: ServiceRequestContext, id: Parameters<TestingCoverageService["getMetric"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.quality.coverage.getMetric(ctx, id));
  }

  listMetricsByKind(
    ctx: ServiceRequestContext,
    kind: Parameters<TestingCoverageService["listMetricsByKind"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.quality.coverage.listMetricsByKind(ctx, kind),
    );
  }

  listMetricsForPlan(
    ctx: ServiceRequestContext,
    planId: Parameters<TestingCoverageService["listMetricsForPlan"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.quality.coverage.listMetricsForPlan(ctx, planId),
    );
  }

  listMetricsForSubject(ctx: ServiceRequestContext, subjectId: string) {
    return runTestingOperation(ctx, () =>
      this.domain.quality.coverage.listMetricsForSubject(ctx, subjectId),
    );
  }
}

export class TestingDefectServiceImpl implements TestingDefectService {
  constructor(private readonly domain: TestingDomainServices) {}

  list(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () => this.domain.quality.defects.list(ctx));
  }

  get(ctx: ServiceRequestContext, id: Parameters<TestingDefectService["get"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.quality.defects.get(ctx, id));
  }

  create(ctx: ServiceRequestContext, input: Parameters<TestingDefectService["create"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.quality.defects.create(ctx, input));
  }

  link(
    ctx: ServiceRequestContext,
    id: Parameters<TestingDefectService["link"]>[1],
    entityKind: Parameters<TestingDefectService["link"]>[2],
    entityId: string,
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.quality.defects.linkTo(ctx, id, entityKind, entityId),
    );
  }

  update(
    ctx: ServiceRequestContext,
    id: Parameters<TestingDefectService["update"]>[1],
    input: Parameters<TestingDefectService["update"]>[2],
  ) {
    return runTestingOperation(ctx, () => this.domain.quality.defects.update(ctx, id, input));
  }

  archive(ctx: ServiceRequestContext, id: Parameters<TestingDefectService["archive"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.quality.defects.archive(ctx, id));
  }
}

export class TestingQualityServiceImpl implements TestingQualityService {
  constructor(private readonly domain: TestingDomainServices) {}

  summarize(ctx: ServiceRequestContext, scope?: Parameters<TestingQualityService["summarize"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.quality.summary.summarize(ctx, scope));
  }

  getSnapshot(ctx: ServiceRequestContext, id: string) {
    return runTestingOperation(ctx, () => this.domain.quality.intelligence.getSnapshot(ctx, id));
  }

  listSnapshots(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () => this.domain.quality.intelligence.listSnapshots(ctx));
  }

  computeSnapshot(
    ctx: ServiceRequestContext,
    scope?: Parameters<TestingQualityService["computeSnapshot"]>[1],
    label?: string,
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.quality.intelligence.computeSnapshot(ctx, scope, label),
    );
  }

  compareSnapshots(ctx: ServiceRequestContext, baselineSnapshotId: string, currentSnapshotId: string) {
    return runTestingOperation(ctx, () =>
      this.domain.quality.trends.compareSnapshots(ctx, baselineSnapshotId, currentSnapshotId),
    );
  }

  compareWindows(
    ctx: ServiceRequestContext,
    baseline: Parameters<TestingQualityService["compareWindows"]>[1],
    current: Parameters<TestingQualityService["compareWindows"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.quality.trends.compareWindows(ctx, baseline, current),
    );
  }
}

export class TestingCertificationServiceImpl implements TestingCertificationService {
  constructor(private readonly domain: TestingDomainServices) {}

  create(ctx: ServiceRequestContext, input: Parameters<TestingCertificationService["create"]>[1]) {
    return runTestingOperation(ctx, () =>
      this.domain.certification.records.createCertificationRecord(ctx, input),
    );
  }

  get(ctx: ServiceRequestContext, id: Parameters<TestingCertificationService["get"]>[1]) {
    return runTestingOperation(ctx, () =>
      this.domain.certification.records.getCertificationRecord(ctx, id),
    );
  }

  list(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () =>
      this.domain.certification.records.listCertificationRecords(ctx),
    );
  }

  prepareForPlan(ctx: ServiceRequestContext, planId: Parameters<TestingCertificationService["prepareForPlan"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.certificationPreparation.prepareForPlan(ctx, planId));
  }

  prepareForCertification(
    ctx: ServiceRequestContext,
    certificationRecordId: Parameters<TestingCertificationService["prepareForCertification"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.certificationPreparation.prepareForCertification(ctx, certificationRecordId),
    );
  }

  private transition(ctx: ServiceRequestContext, id: Parameters<TestingCertificationService["get"]>[1], nextStatus: CertificationStatus, reason?: string) {
    return runTestingOperation(ctx, () =>
      this.domain.certification.workflow.transition(ctx, id, nextStatus, reason),
    );
  }

  startReview(ctx: ServiceRequestContext, id: Parameters<TestingCertificationService["startReview"]>[1], reason?: string) {
    return runTestingOperation(ctx, () => this.domain.certification.workflow.startReview(ctx, id, reason));
  }

  requestChanges(ctx: ServiceRequestContext, id: Parameters<TestingCertificationService["requestChanges"]>[1], reason: string) {
    return runTestingOperation(ctx, () => this.domain.certification.workflow.requestChanges(ctx, id, reason));
  }

  submitForApproval(ctx: ServiceRequestContext, id: Parameters<TestingCertificationService["submitForApproval"]>[1], reason?: string) {
    return runTestingOperation(ctx, () => this.domain.certification.workflow.submitForApproval(ctx, id, reason));
  }

  approve(ctx: ServiceRequestContext, id: Parameters<TestingCertificationService["approve"]>[1], reason?: string) {
    return runTestingOperation(ctx, () => this.domain.certification.workflow.approve(ctx, id, reason));
  }

  conditionallyApprove(ctx: ServiceRequestContext, id: Parameters<TestingCertificationService["conditionallyApprove"]>[1], conditions: string) {
    return runTestingOperation(ctx, () => this.domain.certification.workflow.conditionallyApprove(ctx, id, conditions));
  }

  reject(ctx: ServiceRequestContext, id: Parameters<TestingCertificationService["reject"]>[1], reason: string) {
    return runTestingOperation(ctx, () => this.domain.certification.workflow.reject(ctx, id, reason));
  }

  expire(ctx: ServiceRequestContext, id: Parameters<TestingCertificationService["expire"]>[1], reason?: string) {
    return this.transition(ctx, id, "expired", reason);
  }

  archive(ctx: ServiceRequestContext, id: Parameters<TestingCertificationService["archive"]>[1], reason?: string) {
    return runTestingOperation(ctx, () => this.domain.certification.workflow.archive(ctx, id, reason));
  }

  evaluateGate(
    ctx: ServiceRequestContext,
    certificationRecordId: Parameters<TestingCertificationService["evaluateGate"]>[1],
    gateKey: string,
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.certification.gates.evaluateGate(ctx, certificationRecordId, gateKey),
    );
  }

  evaluateGates(
    ctx: ServiceRequestContext,
    certificationRecordId: Parameters<TestingCertificationService["evaluateGates"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.certification.gates.evaluateAll(ctx, certificationRecordId),
    );
  }

  getRecommendation(
    ctx: ServiceRequestContext,
    certificationRecordId: Parameters<TestingCertificationService["getRecommendation"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.certification.recommendations.getLatest(ctx, certificationRecordId),
    );
  }

  getAuditHistory(
    ctx: ServiceRequestContext,
    certificationRecordId: Parameters<TestingCertificationService["getAuditHistory"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.certification.audit.list(ctx, certificationRecordId),
    );
  }

  listAudit(
    ctx: ServiceRequestContext,
    certificationRecordId: Parameters<TestingCertificationService["listAudit"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.certification.audit.list(ctx, certificationRecordId),
    );
  }
}

export class TestingReleaseReadinessServiceImpl implements TestingReleaseReadinessService {
  constructor(private readonly domain: TestingDomainServices) {}

  calculateForPlan(ctx: ServiceRequestContext, planId: Parameters<TestingReleaseReadinessService["calculateForPlan"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.releaseReadiness.calculateForPlan(ctx, planId));
  }

  calculateForCertification(
    ctx: ServiceRequestContext,
    certificationRecordId: Parameters<TestingReleaseReadinessService["calculateForCertification"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.releaseReadiness.calculateForCertification(ctx, certificationRecordId),
    );
  }

  assessForPlan(ctx: ServiceRequestContext, planId: Parameters<NonNullable<TestingReleaseReadinessService["assessForPlan"]>>[1]) {
    return runTestingOperation(ctx, async () => {
      const assess = this.domain.quality.releaseReadiness.assessForPlan;
      if (!assess) {
        throw new Error("Testing release readiness assessment is unavailable");
      }
      return assess(ctx, planId);
    });
  }

  assessForCertification(
    ctx: ServiceRequestContext,
    certificationRecordId: Parameters<NonNullable<TestingReleaseReadinessService["assessForCertification"]>>[1],
  ) {
    return runTestingOperation(ctx, async () => {
      const assess = this.domain.quality.releaseReadiness.assessForCertification;
      if (!assess) {
        throw new Error("Testing certification readiness assessment is unavailable");
      }
      return assess(ctx, certificationRecordId);
    });
  }
}

export class TestingTraceabilityServiceImpl implements TestingTraceabilityService {
  constructor(private readonly domain: TestingDomainServices) {}

  listLinks(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () => this.domain.traceability.listLinks(ctx));
  }

  getLink(ctx: ServiceRequestContext, id: Parameters<TestingTraceabilityService["getLink"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.traceability.getLink(ctx, id));
  }

  createLink(ctx: ServiceRequestContext, input: Parameters<TestingTraceabilityService["createLink"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.traceability.createLink(ctx, input));
  }

  removeLink(ctx: ServiceRequestContext, id: Parameters<TestingTraceabilityService["removeLink"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.traceability.removeLink(ctx, id));
  }

  createRelationship(
    ctx: ServiceRequestContext,
    input: Parameters<TestingTraceabilityService["createRelationship"]>[1],
  ) {
    return runTestingOperation(ctx, () => this.domain.traceability.linkEntities(ctx, input));
  }

  removeRelationship(
    ctx: ServiceRequestContext,
    id: Parameters<TestingTraceabilityService["removeRelationship"]>[1],
  ) {
    return runTestingOperation(ctx, () => this.domain.traceability.removeLink(ctx, id));
  }

  getMatrixForRequirement(
    ctx: ServiceRequestContext,
    requirementId: Parameters<TestingTraceabilityService["getMatrixForRequirement"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.traceability.getMatrixForRequirement(ctx, requirementId),
    );
  }

  listMatrix(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () => this.domain.traceability.listMatrix(ctx));
  }
}

export class TestingApprovalServiceImpl implements TestingApprovalService {
  constructor(private readonly domain: TestingDomainServices) {}

  list(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () => this.domain.approvals.listApprovals(ctx));
  }

  get(ctx: ServiceRequestContext, id: Parameters<TestingApprovalService["get"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.approvals.getApproval(ctx, id));
  }

  request(ctx: ServiceRequestContext, input: Parameters<TestingApprovalService["request"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.approvals.requestApproval(ctx, input));
  }

  submitForReview(
    ctx: ServiceRequestContext,
    input: Parameters<TestingApprovalService["submitForReview"]>[1],
  ) {
    return runTestingOperation(ctx, () => this.domain.approvals.submitForReview(ctx, input));
  }

  decide(
    ctx: ServiceRequestContext,
    id: Parameters<TestingApprovalService["decide"]>[1],
    decision: Parameters<TestingApprovalService["decide"]>[2],
  ) {
    return runTestingOperation(ctx, () => this.domain.approvals.decideApproval(ctx, id, decision));
  }

  listHistory(ctx: ServiceRequestContext, id: Parameters<TestingApprovalService["listHistory"]>[1]) {
    return runTestingOperation(ctx, () => this.domain.approvals.listApprovalHistory(ctx, id));
  }
}

export class TestingDashboardServiceImpl implements TestingDashboardService {
  constructor(private readonly domain: TestingDomainServices) {}

  getDashboardSummary(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, async () => {
      const [
        plans,
        suites,
        cases,
        requirements,
        executions,
        evidence,
        certifications,
        defects,
        coverageMetrics,
        snapshots,
      ] = await Promise.all([
        this.domain.testPlans.list(ctx),
        this.domain.testSuites.list(ctx),
        this.domain.testCases.list(ctx),
        this.domain.requirements.list(ctx),
        this.domain.manualExecutions.list(ctx),
        this.domain.evidence.listEvidence(ctx),
        this.domain.certification.records.listCertificationRecords(ctx),
        this.domain.quality.defects.list(ctx),
        this.domain.quality.coverage.listMetrics(ctx),
        this.domain.quality.intelligence.listSnapshots(ctx),
      ]);

      return {
        capturedAt: new Date().toISOString(),
        totals: {
          plans: plans.length,
          suites: suites.length,
          cases: cases.length,
          requirements: requirements.length,
          executions: executions.length,
          evidence: evidence.length,
          certifications: certifications.length,
          defects: defects.length,
        },
        executionCounts: countBy(executions, (item: ManualExecution) => item.status),
        evidenceCounts: countBy(evidence, (item: Evidence) => item.lifecycleStatus),
        certificationCounts: countBy(certifications, (item) => item.status),
        defectCounts: countBy(defects, (item) => (item.status as DefectStatus | undefined)),
        coveragePercentages: (coverageMetrics as readonly CoverageMetric[]).map((metric) => ({
          label: metric.kind,
          percentage: metric.percentage,
        })),
        qualityCounts: countBy(snapshots as readonly QualitySnapshot[], (item) => item.label),
      };
    });
  }
}

export { TestingReportingServiceImpl };

export interface TestingPlatformServiceImpls {
  readonly plans: TestingPlanServiceImpl;
  readonly suites: TestingSuiteServiceImpl;
  readonly cases: TestingCaseServiceImpl;
  readonly requirements: TestingRequirementServiceImpl;
  readonly executions: TestingExecutionServiceImpl;
  readonly evidence: TestingEvidenceServiceImpl;
  readonly automation: TestingAutomationServiceImpl;
  readonly coverage: TestingCoverageServiceImpl;
  readonly defects: TestingDefectServiceImpl;
  readonly quality: TestingQualityServiceImpl;
  readonly engineeringIntelligence: TestingEngineeringIntelligenceServiceImpl;
  readonly certification: TestingCertificationServiceImpl;
  readonly releaseReadiness: TestingReleaseReadinessServiceImpl;
  readonly releaseGovernance: TestingReleaseGovernanceServiceImpl;
  readonly pipelines: TestingPipelinesServiceImpl;
  readonly pipelineRepositories: TestingPipelineRepositoryService;
  readonly pipelineWorkflows: TestingPipelineWorkflowService;
  readonly pipelineRuns: TestingPipelineRunLiveService;
  readonly pipelineArtifacts: TestingPipelineArtifactService;
  readonly pipelineJobs: TestingPipelineJobService;
  readonly pipelineSteps: TestingPipelineStepService;
  readonly pipelineSummaries: TestingPipelineSummaryService;
  readonly traceability: TestingTraceabilityServiceImpl;
  readonly approvals: TestingApprovalServiceImpl;
  readonly dashboard: TestingDashboardServiceImpl;
  readonly reporting: TestingReportingServiceImpl;
}

export interface CreateTestingServiceImplsOptions {
  readonly providerResolver?: ProviderResolver;
}

export function createTestingServiceImpls(
  domain: TestingDomainServices,
  options: CreateTestingServiceImplsOptions = {},
): TestingPlatformServiceImpls {
  const live = options.providerResolver
    ? {
        pipelineRepositories: new PipelineRepositoryServiceImpl(
          options.providerResolver,
        ),
        pipelineWorkflows: new PipelineWorkflowServiceImpl(options.providerResolver),
        pipelineRuns: new PipelineRunLiveServiceImpl(options.providerResolver),
        pipelineArtifacts: new PipelineArtifactServiceImpl(options.providerResolver),
        pipelineJobs: new PipelineJobServiceImpl(options.providerResolver),
        pipelineSteps: new PipelineStepServiceImpl(options.providerResolver),
        pipelineSummaries: new PipelineSummaryServiceImpl(options.providerResolver),
      }
    : createUnavailablePipelineLiveServices();

  return {
    plans: new TestingPlanServiceImpl(domain),
    suites: new TestingSuiteServiceImpl(domain),
    cases: new TestingCaseServiceImpl(domain),
    requirements: new TestingRequirementServiceImpl(domain),
    executions: new TestingExecutionServiceImpl(domain),
    evidence: new TestingEvidenceServiceImpl(domain),
    automation: new TestingAutomationServiceImpl(domain),
    coverage: new TestingCoverageServiceImpl(domain),
    defects: new TestingDefectServiceImpl(domain),
    quality: new TestingQualityServiceImpl(domain),
    engineeringIntelligence: new TestingEngineeringIntelligenceServiceImpl(domain),
    certification: new TestingCertificationServiceImpl(domain),
    releaseReadiness: new TestingReleaseReadinessServiceImpl(domain),
    releaseGovernance: new TestingReleaseGovernanceServiceImpl(domain),
    pipelines: new TestingPipelinesServiceImpl(domain, {
      providerResolver: options.providerResolver,
    }),
    ...live,
    traceability: new TestingTraceabilityServiceImpl(domain),
    approvals: new TestingApprovalServiceImpl(domain),
    dashboard: new TestingDashboardServiceImpl(domain),
    reporting: new TestingReportingServiceImpl(domain),
  };
}
