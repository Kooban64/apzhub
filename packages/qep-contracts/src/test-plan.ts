/** QEP Test Plan service contracts (APZQEP-ENG-060B, OES-ENG-060B). */

export const QEP_TEST_PLAN_PERMISSIONS = [
  "qep.plan.read",
  "qep.plan.create",
  "qep.plan.update",
  "qep.plan.submit",
  "qep.plan.approve",
  "qep.plan.reject",
  "qep.plan.ready",
  "qep.plan.execute",
  "qep.plan.complete",
  "qep.plan.archive",
  "qep.plan.cancel",
  "qep.plan.clone",
  "qep.plan.supersede",
  "qep.plan.assign",
  "qep.plan.schedule",
  "qep.plan.search",
  "qep.plan.history.view",
] as const;

export type QepTestPlanPermission = (typeof QEP_TEST_PLAN_PERMISSIONS)[number];

export type QepTestPlanItemDto = {
  readonly id: string;
  readonly specificationId: string;
  readonly specificationVersionPin?: string;
  readonly sequence: number;
  readonly itemStatus: string;
  readonly notes?: string;
  readonly requirementRefs?: readonly string[];
};

export type QepTestPlanScheduleDto = {
  readonly plannedStart?: string;
  readonly plannedEnd?: string;
  readonly milestoneRef?: string;
  readonly timezone?: string;
};

export type QepTestPlanAssignmentDto = {
  readonly leadId?: string;
  readonly assigneeIds: readonly string[];
  readonly updatedAt: string;
  readonly updatedBy: string;
};

export type QepTestPlanApprovalDto = {
  readonly id: string;
  readonly decision: "approved" | "rejected";
  readonly decidedBy: string;
  readonly decidedAt: string;
  readonly comment?: string;
  readonly fromStatus: string;
  readonly toStatus: string;
};

export type QepTestPlanRevisionDto = {
  readonly versionLabel: string;
  readonly sealedAt: string;
  readonly sealedBy: string;
  readonly statusAtSeal: string;
  readonly itemFingerprint: string;
  readonly predecessorVersionLabel?: string;
};

export type QepTestPlanHistorySummaryDto = {
  readonly sequence: number;
  readonly at: string;
  readonly actorId: string;
  readonly action: string;
  readonly summary: string;
  readonly fromStatus?: string;
  readonly toStatus?: string;
  readonly correlationId?: string;
};

export type QepTestPlanMetricsDto = {
  readonly totalItems: number;
  readonly includedCount: number;
  readonly optionalCount: number;
  readonly deferredCount: number;
  readonly pinnedIncludedCount: number;
};

export const QEP_TEST_PLAN_ACTIONS = [
  "updateContent",
  "updateMetadata",
  "transferOwnership",
  "updateAssignment",
  "updateSchedule",
  "addItem",
  "updateItem",
  "removeItem",
  "reorderItems",
  "submitForReview",
  "approve",
  "reject",
  "returnToDraft",
  "markReady",
  "startExecution",
  "complete",
  "archive",
  "cancel",
  "supersede",
  "clone",
] as const;

export type QepTestPlanAction = (typeof QEP_TEST_PLAN_ACTIONS)[number];

export type QepTestPlanDto = {
  readonly id: string;
  readonly tenantId: string;
  readonly number: string;
  readonly revision: number;
  readonly title: string;
  readonly description?: string;
  readonly objective: string;
  readonly scope: {
    readonly class: string;
    readonly label?: string;
    readonly externalRef?: string;
  };
  readonly status: string;
  readonly priority: string;
  readonly planType: string;
  readonly ownerId: string;
  readonly versionLabel: string;
  readonly predecessorPlanId?: string;
  readonly predecessorSealedVersionLabel?: string;
  readonly successorPlanId?: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly items: readonly QepTestPlanItemDto[];
  readonly schedule: QepTestPlanScheduleDto;
  readonly assignment: QepTestPlanAssignmentDto;
  readonly approvals: readonly QepTestPlanApprovalDto[];
  readonly revisions: readonly QepTestPlanRevisionDto[];
  readonly externalReferences?: readonly string[];
  readonly metadata?: Readonly<Record<string, string>>;
  readonly metrics: QepTestPlanMetricsDto;
  readonly historySummaries: readonly QepTestPlanHistorySummaryDto[];
  readonly availableActions: readonly QepTestPlanAction[];
};

/**
 * Computes Test Plan commands a caller may perform for the given lifecycle
 * status. Mirrors Domain lifecycle/policy legality exactly — Infrastructure
 * MUST NOT invent transitions the Domain forbids (OES-ENG-060B Part 3 §6).
 * Server-side handlers remain authoritative.
 */
export function computeQepTestPlanAvailableActions(
  status: string,
  permissions?: readonly string[],
): readonly QepTestPlanAction[] {
  const granted = permissions;
  const has = (permission: QepTestPlanPermission): boolean =>
    !granted ||
    granted.length === 0 ||
    granted.includes("qep.plan.*") ||
    granted.includes(permission);

  const CONTENT_EDITABLE = status === "draft" || status === "rejected";
  const ASSIGNMENT_SCHEDULE_EDITABLE =
    status === "draft" ||
    status === "rejected" ||
    status === "approved" ||
    status === "ready";
  const CANCELLABLE =
    status === "draft" ||
    status === "review" ||
    status === "approved" ||
    status === "ready";
  const SUPERSEDE_ELIGIBLE =
    status === "approved" || status === "ready" || status === "completed";

  const actions: QepTestPlanAction[] = [];

  if (CONTENT_EDITABLE) {
    if (has("qep.plan.update")) {
      actions.push(
        "updateContent",
        "updateMetadata",
        "transferOwnership",
        "addItem",
        "updateItem",
        "removeItem",
        "reorderItems",
      );
    }
  }
  if (ASSIGNMENT_SCHEDULE_EDITABLE) {
    if (has("qep.plan.assign")) actions.push("updateAssignment");
    if (has("qep.plan.schedule")) actions.push("updateSchedule");
  }
  if (status === "draft" && has("qep.plan.submit")) {
    actions.push("submitForReview");
  }
  if (status === "review") {
    if (has("qep.plan.approve")) actions.push("approve");
    if (has("qep.plan.reject")) actions.push("reject");
  }
  if (status === "rejected" && has("qep.plan.update")) {
    actions.push("returnToDraft");
  }
  if (status === "approved" && has("qep.plan.ready")) {
    actions.push("markReady");
  }
  if (status === "ready" && has("qep.plan.execute")) {
    actions.push("startExecution");
  }
  if (status === "in_execution" && has("qep.plan.complete")) {
    actions.push("complete");
  }
  if (status === "completed" && has("qep.plan.archive")) {
    actions.push("archive");
  }
  if (CANCELLABLE && has("qep.plan.cancel")) {
    actions.push("cancel");
  }
  if (SUPERSEDE_ELIGIBLE && has("qep.plan.supersede")) {
    actions.push("supersede");
  }
  if (has("qep.plan.clone")) {
    actions.push("clone");
  }

  return actions;
}

export type CreateQepTestPlanInput = {
  readonly title: string;
  readonly objective?: string;
  readonly description?: string;
  readonly scope: {
    readonly class: string;
    readonly label?: string;
    readonly externalRef?: string;
  };
  readonly priority?: string;
  readonly ownerId?: string;
  readonly externalReferences?: readonly string[];
};

export type UpdateQepTestPlanContentInput = {
  readonly title?: string;
  readonly description?: string | null;
  readonly objective?: string;
  readonly scope?: {
    readonly class: string;
    readonly label?: string;
    readonly externalRef?: string;
  };
  readonly priority?: string;
  readonly expectedRevision: number;
};

export type UpdateQepTestPlanMetadataInput = {
  readonly metadata: Readonly<Record<string, string>>;
  readonly expectedRevision: number;
};

export type TransferQepTestPlanOwnershipInput = {
  readonly ownerId: string;
  readonly expectedRevision: number;
};

export type UpdateQepTestPlanAssignmentInput = {
  readonly leadId?: string | null;
  readonly assigneeIds?: readonly string[];
  readonly expectedRevision: number;
};

export type UpdateQepTestPlanScheduleInput = {
  readonly plannedStart?: string | null;
  readonly plannedEnd?: string | null;
  readonly milestoneRef?: string | null;
  readonly timezone?: string | null;
  readonly expectedRevision: number;
};

export type AddQepTestPlanItemInput = {
  readonly id?: string;
  readonly specificationId: string;
  readonly specificationVersionPin?: string;
  readonly sequence?: number;
  readonly itemStatus?: string;
  readonly notes?: string;
  readonly requirementRefs?: readonly string[];
  readonly expectedRevision: number;
};

export type UpdateQepTestPlanItemInput = {
  readonly specificationVersionPin?: string | null;
  readonly sequence?: number;
  readonly itemStatus?: string;
  readonly notes?: string | null;
  readonly requirementRefs?: readonly string[] | null;
  readonly expectedRevision: number;
};

export type ReorderQepTestPlanItemsInput = {
  readonly orderedItemIds: readonly string[];
  readonly expectedRevision: number;
};

export type SubmitQepTestPlanReviewInput = {
  readonly expectedRevision: number;
};

export type ApproveQepTestPlanInput = {
  readonly comment?: string;
  readonly allowSelfApproval?: boolean;
  readonly expectedRevision: number;
};

export type RejectQepTestPlanInput = {
  readonly comment: string;
  readonly expectedRevision: number;
};

export type SupersedeQepTestPlanInput = {
  readonly successorId?: string;
  readonly successorNumber?: string;
  readonly expectedRevision: number;
};

export type CloneQepTestPlanInput = {
  readonly id?: string;
  readonly number?: string;
  readonly title?: string;
};

export type ListQepTestPlansQuery = {
  readonly status?: string;
  readonly ownerId?: string;
  readonly leadId?: string;
  readonly priority?: string;
  readonly planType?: string;
  readonly number?: string;
  readonly scheduledFrom?: string;
  readonly scheduledTo?: string;
  readonly includeArchived?: boolean;
  readonly query?: string;
  readonly limit?: number;
  readonly offset?: number;
};

export type QepTestPlanListResult = {
  readonly items: readonly QepTestPlanDto[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
};
