/**
 * Domain <-> persistence row mapping — APZQEP-ENG-100D.
 * Pure functions only; no I/O. Row shapes mirror
 * `packages/config/src/db/qep-test-execution-schema.ts`.
 */
import type {
  qepTestExecution,
  qepTestExecutionEvidenceReference,
  qepTestExecutionExternalSubmission,
  qepTestExecutionHistory,
  qepTestExecutionManifest,
  qepTestExecutionObservation,
  qepTestExecutionReview,
  qepTestExecutionStep,
} from "@apzhub/config";

import type {
  ExecutionManifest,
  ManifestStepSnapshot,
} from "../../domain/test-execution/manifest";
import type { ExecutionHistoryEntry } from "../../domain/test-execution/history";
import type { ExecutionObservation } from "../../domain/test-execution/observation";
import type { ExternalExecutionSubmission } from "../../domain/test-execution/external-submission";
import type { ExecutionReview } from "../../domain/test-execution/review";
import type { ExecutionStep } from "../../domain/test-execution/step";
import type { TestExecution } from "../../domain/test-execution/test-execution";
import type {
  ExecutionAssignment,
  ExecutionSourceRefs,
  EvidenceReference,
} from "../../domain/test-execution/value-objects";
import type { StoredTestExecution } from "../../application/ports";

export type ExecutionRow = typeof qepTestExecution.$inferSelect;
export type ManifestRow = typeof qepTestExecutionManifest.$inferSelect;
export type StepRow = typeof qepTestExecutionStep.$inferSelect;
export type ObservationRow = typeof qepTestExecutionObservation.$inferSelect;
export type EvidenceRow = typeof qepTestExecutionEvidenceReference.$inferSelect;
export type ReviewRow = typeof qepTestExecutionReview.$inferSelect;
export type SubmissionRow = typeof qepTestExecutionExternalSubmission.$inferSelect;
export type HistoryRow = typeof qepTestExecutionHistory.$inferSelect;

export function toStoredTestExecution(execution: TestExecution): StoredTestExecution {
  const { uncommittedEvents: _events, ...rest } = execution;
  return { ...rest, uncommittedEvents: [] };
}

export function rowToSourceRefs(row: ExecutionRow): ExecutionSourceRefs {
  return {
    ...(row.planRefId
      ? {
          planRef: {
            capability: row.planRefCapability ?? "plan",
            id: row.planRefId,
            versionLabel: row.planRefVersionLabel ?? "",
          },
        }
      : {}),
    ...(row.specRefId
      ? {
          specRef: {
            capability: row.specRefCapability ?? "specification",
            id: row.specRefId,
            versionLabel: row.specRefVersionLabel ?? "",
          },
        }
      : {}),
    ...(row.planItemId ? { planItemId: row.planItemId } : {}),
  };
}

export function rowToAssignment(row: ExecutionRow): ExecutionAssignment {
  return {
    ownerId: row.ownerId,
    ...(row.executorId ? { executorId: row.executorId } : {}),
    ...(row.reviewerId ? { reviewerId: row.reviewerId } : {}),
    ...(row.agentIdentity ? { agentIdentity: row.agentIdentity } : {}),
    updatedAt: row.assignmentUpdatedAt.toISOString(),
    updatedBy: row.assignmentUpdatedBy,
  };
}

export function mapManifestRow(row: ManifestRow | null): ExecutionManifest | null {
  if (!row) {
    return null;
  }
  return {
    sourceRefs: {},
    steps: row.stepsJson as readonly ManifestStepSnapshot[],
    preconditions: row.preconditionsJson,
    sealedAt: row.sealedAt.toISOString(),
    sealedBy: row.sealedBy,
    contentHash: row.contentHash,
  };
}

export function mapStepRow(row: StepRow): ExecutionStep {
  return {
    order: row.order,
    instruction: row.instruction,
    expectedResult: row.expectedResult,
    preconditions: row.preconditionsJson,
    requireActualResult: row.requireActualResult,
    allowUnordered: row.allowUnordered,
    ...(row.actualResult ? { actualResult: row.actualResult } : {}),
    ...(row.outcome ? { outcome: row.outcome as ExecutionStep["outcome"] } : {}),
    evidenceIds: row.evidenceIdsJson,
    ...(row.skipReason ? { skipReason: row.skipReason } : {}),
    ...(row.blockReason ? { blockReason: row.blockReason } : {}),
    ...(row.notApplicableReason
      ? { notApplicableReason: row.notApplicableReason }
      : {}),
    ...(row.comment ? { comment: row.comment } : {}),
    attemptCount: row.attemptCount,
    ...(row.startedAt ? { startedAt: row.startedAt.toISOString() } : {}),
    ...(row.completedAt ? { completedAt: row.completedAt.toISOString() } : {}),
  };
}

export function mapObservationRow(row: ObservationRow): ExecutionObservation {
  return {
    id: row.id,
    body: row.body,
    actorId: row.actorUserId,
    recordedAt: row.recordedAt.toISOString(),
    ...(row.severityHint
      ? { severityHint: row.severityHint as ExecutionObservation["severityHint"] }
      : {}),
    ...(row.structuredJson ? { structured: row.structuredJson } : {}),
  };
}

export function mapEvidenceRow(row: EvidenceRow): EvidenceReference {
  return {
    id: row.id,
    uri: row.uri,
    ...(row.integrityHash ? { integrityHash: row.integrityHash } : {}),
    associatedAt: row.associatedAt.toISOString(),
    associatedBy: row.associatedBy,
    ...(row.stepOrder !== null && row.stepOrder !== undefined
      ? { stepOrder: row.stepOrder }
      : {}),
  };
}

export function mapReviewRow(row: ReviewRow): ExecutionReview {
  return {
    reviewerId: row.reviewerId,
    decision: row.decision as ExecutionReview["decision"],
    ...(row.reason ? { reason: row.reason } : {}),
    decidedAt: row.decidedAt.toISOString(),
    preReviewDerivedOutcome:
      row.preReviewDerivedOutcome as ExecutionReview["preReviewDerivedOutcome"],
    ...(row.outcomeOverride
      ? { outcomeOverride: row.outcomeOverride as ExecutionReview["outcomeOverride"] }
      : {}),
  };
}

export function mapSubmissionRow(row: SubmissionRow): ExternalExecutionSubmission {
  return {
    id: row.id,
    sourceSystemId: row.sourceSystemId,
    agentIdentity: row.agentIdentity,
    idempotencyKey: row.idempotencyKey,
    payloadHash: row.payloadHash,
    ...(row.signatureMetadata ? { signatureMetadata: row.signatureMetadata } : {}),
    isComplete: row.isComplete,
    ...(row.correlationId ? { correlationId: row.correlationId } : {}),
    receivedAt: row.receivedAt.toISOString(),
    receivedBy: row.receivedBy,
    ...(row.quarantineReason ? { quarantineReason: row.quarantineReason } : {}),
  };
}

export function mapHistoryRow(row: HistoryRow): ExecutionHistoryEntry {
  return {
    sequence: row.sequence,
    at: row.occurredAt.toISOString(),
    actorId: row.actorUserId,
    action: row.action,
    summary: row.summary,
    ...(row.fromStatus
      ? { fromStatus: row.fromStatus as ExecutionHistoryEntry["fromStatus"] }
      : {}),
    ...(row.toStatus
      ? { toStatus: row.toStatus as ExecutionHistoryEntry["toStatus"] }
      : {}),
    ...(row.correlationId ? { correlationId: row.correlationId } : {}),
  };
}

export function mapExecutionAggregate(input: {
  readonly row: ExecutionRow;
  readonly manifest: ManifestRow | null;
  readonly steps: readonly StepRow[];
  readonly observations: readonly ObservationRow[];
  readonly evidence: readonly EvidenceRow[];
  readonly reviews: readonly ReviewRow[];
  readonly submissions: readonly SubmissionRow[];
  readonly history: readonly HistoryRow[];
}): StoredTestExecution {
  const { row } = input;
  const latestReview = [...input.reviews].sort(
    (a, b) => a.decidedAt.getTime() - b.decidedAt.getTime(),
  )[input.reviews.length - 1];
  return {
    id: row.id,
    executionNumber: row.executionNumber,
    tenantId: row.tenantId,
    projectId: row.projectId,
    workspaceId: row.workspaceId,
    status: row.status as TestExecution["status"],
    mode: row.mode as TestExecution["mode"],
    sourceRefs: rowToSourceRefs(row),
    manifest: mapManifestRow(input.manifest),
    context: { descriptors: row.contextJson },
    assignment: rowToAssignment(row),
    steps: [...input.steps].sort((a, b) => a.order - b.order).map(mapStepRow),
    outcome: (row.outcome as TestExecution["outcome"]) ?? null,
    preReviewDerivedOutcome:
      (row.preReviewDerivedOutcome as TestExecution["preReviewDerivedOutcome"]) ?? null,
    ...(row.blockReason ? { blockReason: row.blockReason } : {}),
    ...(row.cancelReason ? { cancelReason: row.cancelReason } : {}),
    observations: input.observations.map(mapObservationRow),
    evidenceReferences: input.evidence.map(mapEvidenceRow),
    review: latestReview ? mapReviewRow(latestReview) : null,
    externalSubmissions: input.submissions.map(mapSubmissionRow),
    revision: row.revision,
    history: {
      entries: [...input.history]
        .sort((a, b) => a.sequence - b.sequence)
        .map(mapHistoryRow),
    },
    ...(row.supersedesId ? { supersedesId: row.supersedesId } : {}),
    ...(row.supersededById ? { supersededById: row.supersededById } : {}),
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
    updatedAt: row.updatedAt.toISOString(),
    updatedBy: row.updatedBy,
    uncommittedEvents: [],
  };
}

export function toExecutionRowValues(execution: TestExecution) {
  return {
    id: execution.id,
    tenantId: execution.tenantId,
    executionNumber: execution.executionNumber,
    projectId: execution.projectId,
    workspaceId: execution.workspaceId,
    status: execution.status,
    mode: execution.mode,
    outcome: execution.outcome ?? null,
    preReviewDerivedOutcome: execution.preReviewDerivedOutcome ?? null,
    planRefCapability: execution.sourceRefs.planRef?.capability ?? null,
    planRefId: execution.sourceRefs.planRef?.id ?? null,
    planRefVersionLabel: execution.sourceRefs.planRef?.versionLabel ?? null,
    specRefCapability: execution.sourceRefs.specRef?.capability ?? null,
    specRefId: execution.sourceRefs.specRef?.id ?? null,
    specRefVersionLabel: execution.sourceRefs.specRef?.versionLabel ?? null,
    planItemId: execution.sourceRefs.planItemId ?? null,
    contextJson: { ...execution.context.descriptors },
    ownerId: execution.assignment.ownerId,
    executorId: execution.assignment.executorId ?? null,
    reviewerId: execution.assignment.reviewerId ?? null,
    agentIdentity: execution.assignment.agentIdentity ?? null,
    assignmentUpdatedAt: new Date(execution.assignment.updatedAt),
    assignmentUpdatedBy: execution.assignment.updatedBy,
    blockReason: execution.blockReason ?? null,
    cancelReason: execution.cancelReason ?? null,
    supersedesId: execution.supersedesId ?? null,
    supersededById: execution.supersededById ?? null,
    revision: execution.revision,
    createdAt: new Date(execution.createdAt),
    createdBy: execution.createdBy,
    updatedAt: new Date(execution.updatedAt),
    updatedBy: execution.updatedBy,
    correlationId: null,
  };
}
