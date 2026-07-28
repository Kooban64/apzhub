/**
 * QEP Test Plan → Platform DTO adapter (APZQEP-ENG-060B).
 */
import {
  computeQepTestPlanAvailableActions,
  type QepTestPlanApprovalDto,
  type QepTestPlanAssignmentDto,
  type QepTestPlanDto,
  type QepTestPlanHistorySummaryDto,
  type QepTestPlanItemDto,
  type QepTestPlanRevisionDto,
  type QepTestPlanScheduleDto,
} from "@apzhub/qep-contracts";

import type { TestPlanApproval } from "../../domain/test-plan/plan-approval";
import type { TestPlanAssignment } from "../../domain/test-plan/plan-assignment";
import type { TestPlanHistoryEntry } from "../../domain/test-plan/plan-history";
import type { TestPlanItem } from "../../domain/test-plan/plan-item";
import type { TestPlanRevision } from "../../domain/test-plan/plan-revision";
import type { TestPlanSchedule } from "../../domain/test-plan/plan-schedule";
import type { StoredTestPlan } from "../../domain/test-plan/plan-repository";

function toItemDto(item: TestPlanItem): QepTestPlanItemDto {
  return {
    id: item.id,
    specificationId: item.specificationId,
    specificationVersionPin: item.specificationVersionPin,
    sequence: item.sequence,
    itemStatus: item.itemStatus,
    notes: item.notes,
    requirementRefs: item.requirementRefs,
  };
}

function toScheduleDto(schedule: TestPlanSchedule): QepTestPlanScheduleDto {
  return {
    plannedStart: schedule.plannedStart,
    plannedEnd: schedule.plannedEnd,
    milestoneRef: schedule.milestoneRef,
    timezone: schedule.timezone,
  };
}

function toAssignmentDto(assignment: TestPlanAssignment): QepTestPlanAssignmentDto {
  return {
    leadId: assignment.leadId,
    assigneeIds: [...assignment.assigneeIds],
    updatedAt: assignment.updatedAt,
    updatedBy: assignment.updatedBy,
  };
}

function toApprovalDto(approval: TestPlanApproval): QepTestPlanApprovalDto {
  return {
    id: approval.id,
    decision: approval.decision,
    decidedBy: approval.decidedBy,
    decidedAt: approval.decidedAt,
    comment: approval.comment,
    fromStatus: approval.fromStatus,
    toStatus: approval.toStatus,
  };
}

function toRevisionDto(revision: TestPlanRevision): QepTestPlanRevisionDto {
  return {
    versionLabel: revision.versionLabel,
    sealedAt: revision.sealedAt,
    sealedBy: revision.sealedBy,
    statusAtSeal: revision.statusAtSeal,
    itemFingerprint: revision.itemFingerprint,
    predecessorVersionLabel: revision.predecessorVersionLabel,
  };
}

function toHistorySummaryDto(entry: TestPlanHistoryEntry): QepTestPlanHistorySummaryDto {
  return {
    sequence: entry.sequence,
    at: entry.at,
    actorId: entry.actorId,
    action: entry.action,
    summary: entry.summary,
    fromStatus: entry.fromStatus,
    toStatus: entry.toStatus,
    correlationId: entry.correlationId,
  };
}

export function toPlanDto(
  stored: StoredTestPlan,
  permissions?: readonly string[],
): QepTestPlanDto {
  return {
    id: stored.id,
    tenantId: stored.tenantId,
    number: stored.number,
    revision: stored.revision,
    title: stored.title,
    description: stored.description,
    objective: stored.objective,
    scope: {
      class: stored.scope.class,
      label: stored.scope.label,
      externalRef: stored.scope.externalRef,
    },
    status: stored.status,
    priority: stored.priority,
    planType: stored.planType,
    ownerId: stored.ownerId,
    versionLabel: stored.versionLabel,
    predecessorPlanId: stored.predecessorPlanId,
    predecessorSealedVersionLabel: stored.predecessorSealedVersionLabel,
    successorPlanId: stored.successorPlanId,
    createdAt: stored.createdAt,
    createdBy: stored.createdBy,
    updatedAt: stored.updatedAt,
    updatedBy: stored.updatedBy,
    items: stored.items.map(toItemDto),
    schedule: toScheduleDto(stored.schedule),
    assignment: toAssignmentDto(stored.assignment),
    approvals: stored.approvals.map(toApprovalDto),
    revisions: stored.revisions.map(toRevisionDto),
    externalReferences: stored.externalReferences,
    metadata: stored.metadata,
    metrics: { ...stored.metrics },
    historySummaries: stored.history.entries.map(toHistorySummaryDto),
    availableActions: computeQepTestPlanAvailableActions(stored.status, permissions),
  };
}

export type { QepTestPlanDto };
