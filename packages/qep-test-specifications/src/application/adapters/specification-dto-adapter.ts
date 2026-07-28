/**
 * QEP Test Specification → Platform DTO adapter (APZQEP-ENG-050B).
 */
import {
  computeQepTestSpecificationAvailableActions,
  type QepTestSpecificationDto,
  type QepTestSpecificationHistorySummaryDto,
  type QepTestSpecificationRelationshipDto,
} from "@apzhub/qep-contracts";

import type { SpecificationHistoryEntry } from "../../domain/test-specification/specification-history";
import type { SpecificationRelationship } from "../../domain/test-specification/specification-relationship";
import type { StoredTestSpecification } from "../../domain/test-specification/specification-repository";

function toRelationshipDto(
  relationship: SpecificationRelationship,
): QepTestSpecificationRelationshipDto {
  return {
    id: relationship.id,
    specificationId: relationship.specificationId,
    kind: relationship.reference.kind,
    artefactId: relationship.reference.artefactId,
    owningDomain: relationship.reference.owningDomain,
    label: relationship.reference.label,
    createdAt: relationship.createdAt,
    createdBy: relationship.createdBy,
  };
}

function toHistorySummaryDto(
  entry: SpecificationHistoryEntry,
): QepTestSpecificationHistorySummaryDto {
  return {
    at: entry.at,
    by: entry.by,
    kind: entry.kind,
    summary: entry.summary,
  };
}

export function toSpecificationDto(
  stored: StoredTestSpecification,
  permissions?: readonly string[],
): QepTestSpecificationDto {
  const { record } = stored;
  return {
    id: record.id,
    tenantId: stored.tenantId,
    number: record.number,
    title: record.title,
    description: record.description,
    objective: record.objective,
    scope: record.scope,
    status: record.status,
    version: {
      major: record.version.major,
      minor: record.version.minor,
      label: record.version.label,
    },
    type: record.type,
    priority: record.priority,
    complexity: record.complexity,
    classification: record.classification,
    owner: record.owner,
    author: record.author,
    reviewer: record.reviewer,
    preconditions: [...record.preconditions.items],
    postconditions: [...record.postconditions.items],
    acceptanceCriteria: [...record.acceptanceCriteria.items],
    risks: record.risks.map((risk) => ({
      id: risk.id,
      summary: risk.summary,
      severity: risk.severity,
    })),
    dependencies: record.dependencies.map((dependency) => ({
      id: dependency.id,
      summary: dependency.summary,
      referenceKind: dependency.referenceKind,
      referenceId: dependency.referenceId,
    })),
    tags: record.tags.map((tag) => String(tag)),
    isAuthoritative: record.isAuthoritative,
    predecessorSpecificationId: record.predecessorSpecificationId,
    successorSpecificationId: record.successorSpecificationId,
    comparisonNotes: record.comparisonNotes,
    approval: stored.approval
      ? {
          decision: stored.approval.decision,
          decidedAt: stored.approval.decidedAt,
          decidedBy: stored.approval.decidedBy,
          reviewComment: stored.approval.reviewComment,
          approvalComment: stored.approval.approvalComment,
        }
      : undefined,
    metadata: stored.metadata.entries,
    relationships: stored.relationships.map(toRelationshipDto),
    revision: stored.revision,
    createdAt: stored.createdAt,
    createdBy: stored.createdBy,
    updatedAt: stored.updatedAt,
    updatedBy: stored.updatedBy,
    correlationId: stored.correlationId,
    versionLineage: [...stored.versionLineage],
    reviewStartedAt: stored.reviewStartedAt,
    reviewStartedBy: stored.reviewStartedBy,
    withdrawnAt: stored.withdrawnAt,
    cancelledAt: stored.cancelledAt,
    retiredAt: stored.retiredAt,
    supersededAt: stored.supersededAt,
    historySummaries: stored.history.entries.map(toHistorySummaryDto),
    availableActions: computeQepTestSpecificationAvailableActions(
      record.status,
      permissions,
    ),
  };
}

export type { QepTestSpecificationDto };
