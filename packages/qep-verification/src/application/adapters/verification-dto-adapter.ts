/**
 * QEP Verification → Platform DTO adapter (APZQEP-ENG-040B Part 2).
 * Maps persisted domain aggregates to the wire-facing contracts in
 * `@apzhub/qep-contracts`, keeping domain value objects out of the Platform
 * Service / REST boundary (ARCH-007 / ARCH-009).
 */
import {
  computeQepVerificationAvailableActions,
  type QepVerificationDto,
  type QepVerificationHistorySummaryDto,
  type QepVerificationSubjectDto,
} from "@apzhub/qep-contracts";

import type { VerificationHistoryEntry } from "../../domain/verification/verification-history";
import type { StoredVerification } from "../../domain/verification/verification-repository";
import type { VerificationSubjectReference } from "../../domain/verification/verification-subject";

function toVerificationSubjectDto(
  subject: VerificationSubjectReference,
): QepVerificationSubjectDto {
  return {
    kind: subject.kind,
    artefactId: subject.artefactId,
    contentVersionId: subject.contentVersionId,
    baselineId: subject.baselineId,
    externalUri: subject.externalUri,
    owningDomain: subject.owningDomain,
  };
}

function toVerificationHistorySummaryDto(
  entry: VerificationHistoryEntry,
): QepVerificationHistorySummaryDto {
  return {
    at: entry.at,
    by: entry.by,
    kind: entry.kind,
    summary: entry.summary,
  };
}

/**
 * Maps a persisted Verification aggregate to its Platform-facing DTO.
 * `availableActions` are computed from the canonical `@apzhub/qep-contracts`
 * rules so callers and the REST layer never diverge from the server-side
 * command handlers, which remain the authorization boundary.
 */
export function toVerificationDto(
  stored: StoredVerification,
  permissions?: readonly string[],
): QepVerificationDto {
  return {
    id: stored.id,
    tenantId: stored.tenantId,
    status: stored.status,
    outcome: stored.outcome,
    subject: toVerificationSubjectDto(stored.subject),
    authority: { kind: stored.authority.kind, actorId: stored.authority.actorId },
    context: {
      baselineId: stored.context.baselineId,
      contentVersionId: stored.context.contentVersionId,
      immutable: stored.context.immutable,
    },
    scope: { kind: stored.scope.kind, referenceId: stored.scope.referenceId },
    priority: stored.priority,
    origin: stored.origin,
    rationale: stored.rationale,
    reason: stored.reason,
    comment: stored.comment,
    resultSummary: stored.resultSummary,
    decision: stored.decision
      ? {
          outcome: stored.decision.outcome,
          decidedAt: stored.decision.decidedAt,
          decidedBy: stored.decision.decidedBy,
          rationale: stored.decision.rationale,
          comment: stored.decision.comment,
        }
      : undefined,
    metadata: stored.metadata.entries,
    revision: stored.revision,
    createdAt: stored.createdAt,
    createdBy: stored.createdBy,
    updatedAt: stored.updatedAt,
    updatedBy: stored.updatedBy,
    correlationId: stored.correlationId,
    assignedTo: stored.assignedTo,
    assignedAt: stored.assignedAt,
    startedAt: stored.startedAt,
    startedBy: stored.startedBy,
    completedAt: stored.completedAt,
    completedBy: stored.completedBy,
    expiredAt: stored.expiredAt,
    withdrawnAt: stored.withdrawnAt,
    cancelledAt: stored.cancelledAt,
    retiredAt: stored.retiredAt,
    supersededAt: stored.supersededAt,
    supersededBy: stored.supersededBy,
    successorVerificationId: stored.successorVerificationId,
    historySummaries: stored.history.entries.map(toVerificationHistorySummaryDto),
    availableActions: computeQepVerificationAvailableActions(stored.status, permissions),
  };
}
