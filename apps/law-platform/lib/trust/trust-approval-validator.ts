import type {
  ApproveTrustApprovalInput,
  CancelTrustApprovalInput,
  RejectTrustApprovalInput,
  SubmitTrustApprovalInput,
  TrustApprovalRequest,
  TrustApprovalRule,
  TrustApprovalRuleMode,
  TrustApprovalStatus,
  TrustApprovalValidationResult,
} from "./trust-approval-types";

const SUBMITTABLE_STATUSES: readonly TrustApprovalStatus[] = ["draft", "submitted"];
const APPROVABLE_STATUSES: readonly TrustApprovalStatus[] = ["submitted"];
const REJECTABLE_STATUSES: readonly TrustApprovalStatus[] = ["submitted"];
const CANCELLABLE_STATUSES: readonly TrustApprovalStatus[] = ["draft", "submitted"];

/** Validates trust approval rules, transitions, and governance constraints (LAW-015-10). */
export class TrustApprovalValidator {
  validateSubmitInput(input: SubmitTrustApprovalInput): TrustApprovalValidationResult {
    const errors: Record<string, string> = {};

    if (!input.tenantId.trim()) {
      errors.tenantId = "Tenant is required";
    }
    if (!input.subjectId.trim()) {
      errors.subjectId = "Subject id is required";
    }
    if (!input.trustAccountId.trim()) {
      errors.trustAccountId = "Trust account is required";
    }
    if (!Number.isFinite(input.amount) || input.amount < 0) {
      errors.amount = "Amount must be a non-negative number";
    }
    if (!input.currency.trim()) {
      errors.currency = "Currency is required";
    }
    if (!input.actorUserId.trim()) {
      errors.actorUserId = "Actor is required";
    }

    return { ok: Object.keys(errors).length === 0, errors };
  }

  validateStatusTransition(
    currentStatus: TrustApprovalStatus,
    nextStatus: TrustApprovalStatus,
  ): TrustApprovalValidationResult {
    const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(nextStatus)) {
      return {
        ok: false,
        errors: {
          status: `Invalid transition from ${currentStatus} to ${nextStatus}`,
        },
      };
    }
    return { ok: true, errors: {} };
  }

  validateApprove(
    request: TrustApprovalRequest,
    input: ApproveTrustApprovalInput,
    rule: TrustApprovalRule | undefined,
  ): TrustApprovalValidationResult {
    const errors: Record<string, string> = {};

    if (request.tenantId !== input.tenantId) {
      errors.tenantId = "Tenant scope mismatch";
    }
    if (!APPROVABLE_STATUSES.includes(request.status)) {
      errors.status = `Request cannot be approved from status ${request.status}`;
    }
    if (
      request.decisions.some((decision) => decision.actorUserId === input.actorUserId)
    ) {
      errors.actorUserId = "Duplicate approval from the same actor";
    }
    if (
      rule?.preventSelfApproval !== false &&
      request.requestedByUserId === input.actorUserId
    ) {
      errors.actorUserId = "Self-approval is not permitted";
    }

    const roleError = this.validateActorRoles(input.actorRoles, rule);
    if (roleError) {
      errors.actorRoles = roleError;
    }

    return { ok: Object.keys(errors).length === 0, errors };
  }

  validateReject(
    request: TrustApprovalRequest,
    input: RejectTrustApprovalInput,
    rule: TrustApprovalRule | undefined,
  ): TrustApprovalValidationResult {
    const errors: Record<string, string> = {};

    if (request.tenantId !== input.tenantId) {
      errors.tenantId = "Tenant scope mismatch";
    }
    if (!REJECTABLE_STATUSES.includes(request.status)) {
      errors.status = `Request cannot be rejected from status ${request.status}`;
    }
    if (!input.reason.trim()) {
      errors.reason = "Rejection reason is required";
    }

    const roleError = this.validateActorRoles(input.actorRoles, rule);
    if (roleError) {
      errors.actorRoles = roleError;
    }

    return { ok: Object.keys(errors).length === 0, errors };
  }

  validateCancel(
    request: TrustApprovalRequest,
    input: CancelTrustApprovalInput,
  ): TrustApprovalValidationResult {
    const errors: Record<string, string> = {};

    if (request.tenantId !== input.tenantId) {
      errors.tenantId = "Tenant scope mismatch";
    }
    if (!CANCELLABLE_STATUSES.includes(request.status)) {
      errors.status = `Request cannot be cancelled from status ${request.status}`;
    }
    if (
      request.status === "submitted" &&
      request.requestedByUserId !== input.actorUserId
    ) {
      errors.actorUserId = "Only the submitter can cancel a submitted request";
    }

    return { ok: Object.keys(errors).length === 0, errors };
  }

  resolveRequiredApprovalCount(
    rule: TrustApprovalRule,
    amount: number,
  ): { readonly mode: TrustApprovalRuleMode; readonly count: number } {
    switch (rule.mode) {
      case "no_approval_required":
        return { mode: rule.mode, count: 0 };
      case "single_approver":
        return { mode: rule.mode, count: 1 };
      case "dual_approval":
        return { mode: rule.mode, count: 2 };
      case "threshold_based": {
        const threshold = rule.amountThreshold ?? 0;
        if (amount >= threshold) {
          return { mode: rule.mode, count: rule.requiredApprovalCount || 2 };
        }
        return { mode: rule.mode, count: 0 };
      }
      case "role_based":
        return { mode: rule.mode, count: rule.requiredApprovalCount || 1 };
      default:
        return { mode: rule.mode, count: 1 };
    }
  }

  isPostingAllowed(
    request: TrustApprovalRequest | undefined,
    rule: TrustApprovalRule | undefined,
    amount: number,
  ): boolean {
    if (!rule || rule.mode === "no_approval_required") {
      return true;
    }

    const resolved = this.resolveRequiredApprovalCount(rule, amount);
    if (resolved.count === 0) {
      return true;
    }

    return request?.status === "approved" || request?.status === "posted";
  }

  private validateActorRoles(
    actorRoles: readonly string[],
    rule: TrustApprovalRule | undefined,
  ): string | undefined {
    if (!rule || rule.allowedRoles.length === 0) {
      return undefined;
    }
    if (
      rule.mode !== "role_based" &&
      rule.mode !== "dual_approval" &&
      rule.mode !== "single_approver"
    ) {
      return undefined;
    }

    const hasRole = actorRoles.some((role) => rule.allowedRoles.includes(role));
    if (!hasRole) {
      return `Actor must hold one of: ${rule.allowedRoles.join(", ")}`;
    }
    return undefined;
  }
}

const ALLOWED_TRANSITIONS: Readonly<
  Record<TrustApprovalStatus, readonly TrustApprovalStatus[]>
> = {
  draft: ["submitted", "cancelled"],
  submitted: ["approved", "rejected", "cancelled"],
  approved: ["posted"],
  posted: [],
  rejected: [],
  cancelled: [],
};

export function isSubmittableStatus(status: TrustApprovalStatus): boolean {
  return SUBMITTABLE_STATUSES.includes(status);
}
