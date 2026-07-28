/** QEP Test Specification service contracts (APZQEP-ENG-050B, ARCH-011). */

export const QEP_TEST_SPECIFICATION_PERMISSIONS = [
  "qep.specification.create",
  "qep.specification.read",
  "qep.specification.update",
  "qep.specification.review",
  "qep.specification.approve",
  "qep.specification.reject",
  "qep.specification.withdraw",
  "qep.specification.retire",
  "qep.specification.cancel",
  "qep.specification.search",
  "qep.specification.history.view",
] as const;

export type QepTestSpecificationPermission =
  (typeof QEP_TEST_SPECIFICATION_PERMISSIONS)[number];

export type QepTestSpecificationRelationshipDto = {
  readonly id: string;
  readonly specificationId: string;
  readonly kind: string;
  readonly artefactId: string;
  readonly owningDomain?: string;
  readonly label?: string;
  readonly createdAt: string;
  readonly createdBy: string;
};

export type QepTestSpecificationHistorySummaryDto = {
  readonly at: string;
  readonly by: string;
  readonly kind: string;
  readonly summary: string;
};

export const QEP_TEST_SPECIFICATION_ACTIONS = [
  "updateDraft",
  "submitForReview",
  "approve",
  "reject",
  "withdraw",
  "supersede",
  "retire",
  "cancel",
  "addRelationship",
  "removeRelationship",
] as const;

export type QepTestSpecificationAction = (typeof QEP_TEST_SPECIFICATION_ACTIONS)[number];

export type QepTestSpecificationDto = {
  readonly id: string;
  readonly tenantId: string;
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly objective: string;
  readonly scope: string;
  readonly status: string;
  readonly version: { readonly major: number; readonly minor: number; readonly label: string };
  readonly type: string;
  readonly priority: string;
  readonly complexity: string;
  readonly classification: string;
  readonly owner: string;
  readonly author: string;
  readonly reviewer?: string;
  readonly preconditions: readonly string[];
  readonly postconditions: readonly string[];
  readonly acceptanceCriteria: readonly string[];
  readonly risks: readonly {
    readonly id: string;
    readonly summary: string;
    readonly severity?: string;
  }[];
  readonly dependencies: readonly {
    readonly id: string;
    readonly summary: string;
    readonly referenceKind?: string;
    readonly referenceId?: string;
  }[];
  readonly tags: readonly string[];
  readonly isAuthoritative: boolean;
  readonly predecessorSpecificationId?: string;
  readonly successorSpecificationId?: string;
  readonly comparisonNotes?: string;
  readonly approval?: {
    readonly decision: string;
    readonly decidedAt: string;
    readonly decidedBy: string;
    readonly reviewComment?: string;
    readonly approvalComment?: string;
  };
  readonly metadata: Readonly<Record<string, string>>;
  readonly relationships: readonly QepTestSpecificationRelationshipDto[];
  readonly revision: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly correlationId: string;
  readonly versionLineage: readonly string[];
  readonly reviewStartedAt?: string;
  readonly reviewStartedBy?: string;
  readonly withdrawnAt?: string;
  readonly cancelledAt?: string;
  readonly retiredAt?: string;
  readonly supersededAt?: string;
  readonly historySummaries: readonly QepTestSpecificationHistorySummaryDto[];
  readonly availableActions: readonly QepTestSpecificationAction[];
};

/**
 * Computes Test Specification commands a caller may perform for the given
 * lifecycle status. Server-side handlers remain authoritative.
 */
export function computeQepTestSpecificationAvailableActions(
  status: string,
  permissions?: readonly string[],
): readonly QepTestSpecificationAction[] {
  const granted = permissions;
  const has = (permission: QepTestSpecificationPermission): boolean =>
    !granted ||
    granted.length === 0 ||
    granted.includes("qep.specification.*") ||
    granted.includes(permission);

  const actions: QepTestSpecificationAction[] = [];

  if (status === "draft") {
    if (has("qep.specification.update")) {
      actions.push("updateDraft", "addRelationship", "removeRelationship");
    }
    if (has("qep.specification.review")) actions.push("submitForReview");
    if (has("qep.specification.cancel")) actions.push("cancel");
    if (has("qep.specification.withdraw")) actions.push("withdraw");
  }
  if (status === "under_review") {
    if (has("qep.specification.approve")) actions.push("approve");
    if (has("qep.specification.reject")) actions.push("reject");
    if (has("qep.specification.withdraw")) actions.push("withdraw");
    if (has("qep.specification.cancel")) actions.push("cancel");
  }
  if (status === "approved") {
    if (has("qep.specification.update")) actions.push("supersede");
    if (has("qep.specification.retire")) actions.push("retire");
    if (has("qep.specification.withdraw")) actions.push("withdraw");
  }
  if (status === "rejected") {
    if (has("qep.specification.withdraw")) actions.push("withdraw");
    if (has("qep.specification.cancel")) actions.push("cancel");
  }

  return actions;
}

export type CreateQepTestSpecificationInput = {
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly objective: string;
  readonly scope: string;
  readonly type: string;
  readonly classification: string;
  readonly owner: string;
  readonly author: string;
  readonly priority?: string;
  readonly complexity?: string;
  readonly reviewer?: string;
  readonly preconditions?: readonly string[];
  readonly postconditions?: readonly string[];
  readonly acceptanceCriteria?: readonly string[];
  readonly risks?: readonly {
    readonly id: string;
    readonly summary: string;
    readonly severity?: string;
  }[];
  readonly dependencies?: readonly {
    readonly id: string;
    readonly summary: string;
    readonly referenceKind?: string;
    readonly referenceId?: string;
  }[];
  readonly tags?: readonly string[];
  readonly metadata?: Readonly<Record<string, string>>;
};

export type UpdateQepTestSpecificationDraftInput = {
  readonly content?: {
    readonly title?: string;
    readonly description?: string;
    readonly objective?: string;
    readonly scope?: string;
    readonly type?: string;
    readonly priority?: string;
    readonly complexity?: string;
    readonly classification?: string;
    readonly preconditions?: readonly string[];
    readonly postconditions?: readonly string[];
    readonly acceptanceCriteria?: readonly string[];
    readonly risks?: readonly {
      readonly id: string;
      readonly summary: string;
      readonly severity?: string;
    }[];
    readonly dependencies?: readonly {
      readonly id: string;
      readonly summary: string;
      readonly referenceKind?: string;
      readonly referenceId?: string;
    }[];
    readonly tags?: readonly string[];
  };
  readonly metadata?: Readonly<Record<string, string>>;
};

export type SubmitQepTestSpecificationReviewInput = {
  readonly reviewerId: string;
};

export type ApproveQepTestSpecificationInput = {
  readonly approvalComment?: string;
};

export type RejectQepTestSpecificationInput = {
  readonly reviewComment: string;
};

export type SupersedeQepTestSpecificationInput = {
  readonly successorSpecificationId?: string;
  readonly createSuccessor?: {
    readonly id?: string;
    readonly bump: "major" | "minor";
    readonly title?: string;
    readonly description?: string;
    readonly objective?: string;
    readonly comparisonNotes?: string;
  };
};

export type AddQepTestSpecificationRelationshipInput = {
  readonly id: string;
  readonly kind: string;
  readonly artefactId: string;
  readonly owningDomain?: string;
  readonly label?: string;
};

export type ListQepTestSpecificationsQuery = {
  readonly status?: string;
  readonly type?: string;
  readonly owner?: string;
  readonly classification?: string;
  readonly priority?: string;
  readonly number?: string;
  readonly isAuthoritative?: boolean;
  readonly query?: string;
  readonly limit?: number;
  readonly offset?: number;
};

export type QepTestSpecificationListResult = {
  readonly items: readonly QepTestSpecificationDto[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
};
