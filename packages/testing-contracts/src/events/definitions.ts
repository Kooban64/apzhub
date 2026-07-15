import type { CertificationStatus, TestResultStatus, TestRunStatus } from "../enums";
import type {
  CertificationRecordId,
  EvidenceId,
  ManualExecutionId,
  TestCaseId,
  TestPlanId,
  TestResultId,
  TestRunId,
  TestSuiteId,
} from "../identifiers";

/** Domain event type names — past-tense, Event SDK style (029). No bus. */
export const TESTING_EVENT_TYPES = [
  "test_case.created",
  "test_case.updated",
  "test_case.cloned",
  "test_case.versioned",
  "test_case.status_changed",
  "test_plan.created",
  "test_plan.updated",
  "test_plan.cloned",
  "test_plan.versioned",
  "test_plan.archived",
  "test_suite.created",
  "test_suite.updated",
  "test_suite.cloned",
  "test_suite.versioned",
  "requirement.created",
  "requirement.updated",
  "risk.created",
  "risk.updated",
  "manual_execution.started",
  "manual_execution.paused",
  "manual_execution.resumed",
  "manual_execution.completed",
  "manual_execution.aborted",
  "manual_execution.cancelled",
  "manual_execution.restarted",
  "manual_execution.assigned",
  "manual_execution.created",
  "manual_execution.blocked",
  "manual_execution.unblocked",
  "manual_execution.submitted_for_review",
  "manual_execution.approved",
  "manual_execution.rejected",
  "manual_execution.reopened",
  "manual_execution.archived",
  "manual_execution.restored",
  "manual_execution.step_recorded",
  "test_run.started",
  "test_run.completed",
  "test_result.recorded",
  "evidence.attached",
  "evidence.registered",
  "evidence.captured",
  "evidence.submitted",
  "evidence.verified",
  "evidence.rejected",
  "evidence.approved",
  "evidence.archived",
  "defect_link.created",
  "defect_link.updated",
  "defect_link.archived",
  "defect_link.linked",
  "defect_link.unlinked",
  "quality_gate.evaluated",
  "quality.snapshot_computed",
  "quality.trend_compared",
  "quality.summary_computed",
  "regression.analyzed",
  "release_readiness.computed",
  "certification_readiness.computed",
  "risk.aggregated",
  "certification.state_changed",
  "certification.created",
  "certification.transitioned",
  "certification.gate_evaluated",
  "certification.recommended",
  "certification.approved",
  "certification.conditionally_approved",
  "certification.rejected",
  "certification.expired",
  "certification.archived",
  "certification.restored",
  "certification.evidence_linked",
  "certification.rule_configured",
  "certification.changes_requested",
  "certification.review_started",
  "certification.submitted_for_approval",
  "approval.requested",
  "approval.decided",
  "approval.signed",
  "approval.rework_requested",
  "approval.stage_decided",
  "approval.submitted_for_review",
  "traceability.link_created",
  "traceability.link_removed",
  "regression_set.created",
  "regression_set.updated",
  "automation_job.queued",
  "automation_job.completed",
  "automation.import_started",
  "automation.import_completed",
  "automation.import_failed",
  "automation.import_duplicate",
  "automation.import_corrected",
  "automation.result_normalized",
  "automation.evidence_registered",
  "automation.coverage_ingested",
  "automation.traceability_linked",
  "automation.certification_preparation_computed",
  "coverage.recomputed",
  "certification_preparation.computed",
  "release_readiness_inputs.computed",
  "engineering.snapshot_computed",
  "engineering.historical_captured",
  "engineering.health_assessed",
  "engineering.risk_aggregated",
  "quality.score_computed",
  "trend.series_computed",
  "benchmark.compared",
  "baseline.recorded",
] as const;

export type TestingEventType = (typeof TESTING_EVENT_TYPES)[number];

export interface TestingEventEnvelope<
  TType extends TestingEventType = TestingEventType,
  TPayload = unknown,
> {
  readonly eventType: TType;
  readonly occurredAt: string;
  readonly tenantId: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly actorUserId?: string;
  readonly payload: TPayload;
}

export interface TestCaseCreatedPayload {
  readonly testCaseId: TestCaseId;
  readonly key: string;
  readonly title: string;
}

export interface TestPlanClonedPayload {
  readonly sourcePlanId: TestPlanId;
  readonly planId: TestPlanId;
}

export interface TestSuiteClonedPayload {
  readonly sourceSuiteId: TestSuiteId;
  readonly suiteId: TestSuiteId;
}

export interface ManualExecutionLifecyclePayload {
  readonly manualExecutionId: ManualExecutionId;
  readonly caseId?: TestCaseId;
  readonly status?: string;
}

export interface TestRunCompletedPayload {
  readonly testRunId: TestRunId;
  readonly status: TestRunStatus;
  readonly resultCount: number;
}

export interface TestResultRecordedPayload {
  readonly testResultId: TestResultId;
  readonly testRunId: TestRunId;
  readonly status: TestResultStatus;
}

export interface EvidenceAttachedPayload {
  readonly evidenceId: EvidenceId;
  readonly testRunId?: TestRunId;
  readonly testResultId?: TestResultId;
}

export interface CertificationStateChangedPayload {
  readonly certificationRecordId: CertificationRecordId;
  readonly previousStatus: CertificationStatus;
  readonly nextStatus: CertificationStatus;
  readonly reason?: string;
}

export type TestCaseCreatedEvent = TestingEventEnvelope<
  "test_case.created",
  TestCaseCreatedPayload
>;
export type TestRunCompletedEvent = TestingEventEnvelope<
  "test_run.completed",
  TestRunCompletedPayload
>;
export type TestResultRecordedEvent = TestingEventEnvelope<
  "test_result.recorded",
  TestResultRecordedPayload
>;
export type EvidenceAttachedEvent = TestingEventEnvelope<
  "evidence.attached",
  EvidenceAttachedPayload
>;
export type CertificationStateChangedEvent = TestingEventEnvelope<
  "certification.state_changed",
  CertificationStateChangedPayload
>;

export function isTestingEventType(value: string): value is TestingEventType {
  return (TESTING_EVENT_TYPES as readonly string[]).includes(value);
}

export function createTestingEventEnvelope<
  TType extends TestingEventType,
  TPayload,
>(input: {
  readonly eventType: TType;
  readonly tenantId: string;
  readonly correlationId: string;
  readonly payload: TPayload;
  readonly occurredAt?: string;
  readonly causationId?: string;
  readonly actorUserId?: string;
}): TestingEventEnvelope<TType, TPayload> {
  return {
    eventType: input.eventType,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    tenantId: input.tenantId,
    correlationId: input.correlationId,
    causationId: input.causationId,
    actorUserId: input.actorUserId,
    payload: input.payload,
  };
}
