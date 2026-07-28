/** QEP Verification service contracts (APZQEP-ENG-040B Part 2, ARCH-009). */

import type { QepRequestContext } from "./requirements";

export const QEP_VERIFICATION_PERMISSIONS = [
  "qep.verification.view",
  "qep.verification.create",
  "qep.verification.request",
  "qep.verification.assign",
  "qep.verification.start",
  "qep.verification.complete",
  "qep.verification.reject",
  "qep.verification.expire",
  "qep.verification.withdraw",
  "qep.verification.supersede",
  "qep.verification.cancel",
  "qep.verification.retire",
  "qep.verification.modify",
  "qep.verification.history.view",
  "qep.verification.search",
] as const;

export type QepVerificationPermission = (typeof QEP_VERIFICATION_PERMISSIONS)[number];

export type { QepRequestContext };

export type QepVerificationSubjectDto = {
  readonly kind: string;
  readonly artefactId: string;
  readonly contentVersionId?: string;
  readonly baselineId?: string;
  readonly externalUri?: string;
  readonly owningDomain: string;
};

export type QepVerificationSubjectInput = {
  readonly kind: string;
  readonly artefactId: string;
  readonly contentVersionId?: string;
  readonly baselineId?: string;
  readonly externalUri?: string;
};

export type QepVerificationHistorySummaryDto = {
  readonly at: string;
  readonly by: string;
  readonly kind: string;
  readonly summary: string;
};

/** Verification commands surfaced to callers for the caller's permissions + current state. */
export const QEP_VERIFICATION_ACTIONS = [
  "request",
  "assign",
  "start",
  "complete",
  "reject",
  "expire",
  "withdraw",
  "supersede",
  "cancel",
  "retire",
  "updateMetadata",
  "updateRationale",
  "updatePriority",
] as const;
export type QepVerificationAction = (typeof QEP_VERIFICATION_ACTIONS)[number];

export type QepVerificationDto = {
  readonly id: string;
  readonly tenantId: string;
  readonly status: string;
  readonly outcome?: string;
  readonly subject: QepVerificationSubjectDto;
  readonly authority: { readonly kind: string; readonly actorId: string };
  readonly context: {
    readonly baselineId?: string;
    readonly contentVersionId?: string;
    readonly immutable: boolean;
  };
  readonly scope: { readonly kind: string; readonly referenceId?: string };
  readonly priority: string;
  readonly origin: string;
  readonly rationale?: string;
  readonly reason?: string;
  readonly comment?: string;
  readonly resultSummary?: string;
  readonly decision?: {
    readonly outcome: string;
    readonly decidedAt: string;
    readonly decidedBy: string;
    readonly rationale?: string;
    readonly comment?: string;
  };
  readonly metadata: Readonly<Record<string, string>>;
  readonly revision: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly correlationId: string;
  readonly assignedTo?: string;
  readonly assignedAt?: string;
  readonly startedAt?: string;
  readonly startedBy?: string;
  readonly completedAt?: string;
  readonly completedBy?: string;
  readonly expiredAt?: string;
  readonly withdrawnAt?: string;
  readonly cancelledAt?: string;
  readonly retiredAt?: string;
  readonly supersededAt?: string;
  readonly supersededBy?: string;
  readonly successorVerificationId?: string;
  readonly historySummaries: readonly QepVerificationHistorySummaryDto[];
  readonly availableActions: readonly QepVerificationAction[];
};

/**
 * Computes the Verification commands a caller may perform for the given
 * lifecycle status, mirroring the permission + state-machine rules enforced
 * server-side. The server is authoritative; this is a rendering convenience
 * and must not be relied on as an authorization boundary.
 */
export function computeQepVerificationAvailableActions(
  status: string,
  permissions?: readonly string[],
): readonly QepVerificationAction[] {
  const granted = permissions;
  const has = (permission: QepVerificationPermission): boolean =>
    !granted ||
    granted.length === 0 ||
    granted.includes("qep.verification.*") ||
    granted.includes(permission);

  const actions: QepVerificationAction[] = [];

  if (status === "draft" && has("qep.verification.request")) {
    actions.push("request");
  }
  if (status === "requested") {
    if (has("qep.verification.assign")) actions.push("assign");
    if (has("qep.verification.start")) actions.push("start");
  }
  if (status === "assigned" && has("qep.verification.start")) {
    actions.push("start");
  }
  if (status === "in_progress") {
    if (has("qep.verification.complete")) actions.push("complete");
    if (has("qep.verification.reject")) actions.push("reject");
  }
  if (status === "verified") {
    if (has("qep.verification.expire")) actions.push("expire");
    if (has("qep.verification.supersede")) actions.push("supersede");
    if (has("qep.verification.retire")) actions.push("retire");
    if (has("qep.verification.withdraw")) actions.push("withdraw");
  }
  if (status === "rejected") {
    if (has("qep.verification.supersede")) actions.push("supersede");
    if (has("qep.verification.retire")) actions.push("retire");
    if (has("qep.verification.request")) actions.push("request");
  }
  if (status === "expired") {
    if (has("qep.verification.supersede")) actions.push("supersede");
    if (has("qep.verification.retire")) actions.push("retire");
    if (has("qep.verification.request")) actions.push("request");
  }
  if (
    (status === "draft" ||
      status === "requested" ||
      status === "assigned" ||
      status === "in_progress") &&
    has("qep.verification.modify")
  ) {
    actions.push("updateMetadata", "updateRationale", "updatePriority");
  }
  if (
    (status === "requested" || status === "assigned" || status === "in_progress") &&
    has("qep.verification.cancel")
  ) {
    actions.push("cancel");
  }
  if (
    (status === "requested" || status === "assigned" || status === "in_progress") &&
    has("qep.verification.withdraw") &&
    !actions.includes("withdraw")
  ) {
    actions.push("withdraw");
  }

  return actions;
}

export type CreateQepVerificationInput = {
  readonly subject: QepVerificationSubjectInput;
  readonly authority: { readonly kind: string; readonly actorId: string };
  readonly context?: {
    readonly baselineId?: string;
    readonly contentVersionId?: string;
    readonly immutable?: boolean;
  };
  readonly scope?: { readonly kind: string; readonly referenceId?: string };
  readonly priority?: string;
  readonly origin?: string;
  readonly rationale?: string;
  readonly reason?: string;
  readonly comment?: string;
  readonly metadata?: Readonly<Record<string, string>>;
};

export type AssignQepVerificationInput = {
  readonly assigneeId: string;
};

export type CompleteQepVerificationInput = {
  readonly outcome: string;
  readonly rationale?: string;
  readonly comment?: string;
};

export type RejectQepVerificationInput = CompleteQepVerificationInput;

export type SupersedeQepVerificationInput = {
  readonly successorVerificationId: string;
};

export type ListQepVerificationsQuery = {
  readonly status?: string;
  readonly outcome?: string;
  readonly subjectKind?: string;
  readonly subjectArtefactId?: string;
  readonly authorityActorId?: string;
  readonly limit?: number;
  readonly offset?: number;
};

export type QepVerificationListResult = {
  readonly items: readonly QepVerificationDto[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
};
