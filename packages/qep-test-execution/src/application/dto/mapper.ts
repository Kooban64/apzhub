import type { TestExecution } from "../../domain/test-execution/test-execution";
import { computeAvailableActions } from "../available-actions";
import type { DomainPolicyConfig } from "../../domain/test-execution/policies";
import type { TestExecutionDto } from "./execution-dto";

export type MapExecutionOptions = {
  readonly permissions?: readonly string[];
  readonly actorId?: string;
  readonly policy?: DomainPolicyConfig;
};

export function toExecutionDto(
  execution: TestExecution,
  options: MapExecutionOptions = {},
): TestExecutionDto {
  return {
    id: execution.id,
    executionNumber: execution.executionNumber,
    tenantId: execution.tenantId,
    projectId: execution.projectId,
    workspaceId: execution.workspaceId,
    status: execution.status,
    mode: execution.mode,
    outcome: execution.outcome,
    revision: execution.revision,
    ...(execution.sourceRefs.planRef
      ? {
          planRef: {
            capability: execution.sourceRefs.planRef.capability,
            id: execution.sourceRefs.planRef.id,
            ...(execution.sourceRefs.planRef.versionLabel
              ? { versionLabel: execution.sourceRefs.planRef.versionLabel }
              : {}),
          },
        }
      : {}),
    ...(execution.sourceRefs.specRef
      ? {
          specRef: {
            capability: execution.sourceRefs.specRef.capability,
            id: execution.sourceRefs.specRef.id,
            ...(execution.sourceRefs.specRef.versionLabel
              ? { versionLabel: execution.sourceRefs.specRef.versionLabel }
              : {}),
          },
        }
      : {}),
    assignment: {
      ownerId: execution.assignment.ownerId,
      ...(execution.assignment.executorId
        ? { executorId: execution.assignment.executorId }
        : {}),
      ...(execution.assignment.reviewerId
        ? { reviewerId: execution.assignment.reviewerId }
        : {}),
      ...(execution.assignment.agentIdentity
        ? { agentIdentity: execution.assignment.agentIdentity }
        : {}),
    },
    manifest: execution.manifest
      ? {
          contentHash: execution.manifest.contentHash,
          sealedAt: execution.manifest.sealedAt,
          sealedBy: execution.manifest.sealedBy,
          stepCount: execution.manifest.steps.length,
        }
      : null,
    steps: execution.steps.map((step) => ({
      order: step.order,
      instruction: step.instruction,
      expectedResult: step.expectedResult,
      ...(step.outcome ? { outcome: step.outcome } : {}),
      ...(step.actualResult ? { actualResult: step.actualResult } : {}),
      evidenceIds: step.evidenceIds,
      attemptCount: step.attemptCount,
    })),
    observations: execution.observations.map((observation) => ({
      id: observation.id,
      body: observation.body,
      actorId: observation.actorId,
      recordedAt: observation.recordedAt,
      ...(observation.severityHint ? { severityHint: observation.severityHint } : {}),
    })),
    evidenceReferences: execution.evidenceReferences.map((evidence) => ({
      id: evidence.id,
      uri: evidence.uri,
      ...(evidence.integrityHash ? { integrityHash: evidence.integrityHash } : {}),
      associatedAt: evidence.associatedAt,
      associatedBy: evidence.associatedBy,
      ...(evidence.stepOrder !== undefined ? { stepOrder: evidence.stepOrder } : {}),
    })),
    review: execution.review
      ? {
          reviewerId: execution.review.reviewerId,
          decision: execution.review.decision,
          decidedAt: execution.review.decidedAt,
          ...(execution.review.reason ? { reason: execution.review.reason } : {}),
          preReviewDerivedOutcome: execution.review.preReviewDerivedOutcome,
          ...(execution.review.outcomeOverride
            ? { outcomeOverride: execution.review.outcomeOverride }
            : {}),
        }
      : null,
    ...(execution.blockReason ? { blockReason: execution.blockReason } : {}),
    ...(execution.cancelReason ? { cancelReason: execution.cancelReason } : {}),
    ...(execution.supersedesId ? { supersedesId: execution.supersedesId } : {}),
    ...(execution.supersededById ? { supersededById: execution.supersededById } : {}),
    createdAt: execution.createdAt,
    createdBy: execution.createdBy,
    updatedAt: execution.updatedAt,
    updatedBy: execution.updatedBy,
    availableActions: computeAvailableActions({
      execution,
      permissions: options.permissions,
      actorId: options.actorId,
      policy: options.policy,
    }),
  };
}
