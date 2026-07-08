import type { TrustApprovalService } from "./trust-approval-service";
import type { TrustApprovalType } from "./trust-approval-types";

/** Bridges domain services to TrustApprovalService without duplicating workflow logic (LAW-015-10). */
export function assertTrustApprovalForPost(
  approvalService: TrustApprovalService | undefined,
  tenantId: string,
  approvalType: TrustApprovalType,
  subjectId: string,
  amount: number,
): void {
  if (!approvalService) {
    return;
  }

  const result = approvalService.assertCanPost(
    tenantId,
    approvalType,
    subjectId,
    amount,
  );
  if (!result.ok) {
    throw new Error(result.error?.message ?? "Operational approval required");
  }
}

export function assertTrustApprovalForDomainApprove(
  approvalService: TrustApprovalService | undefined,
  tenantId: string,
  approvalType: TrustApprovalType,
  subjectId: string,
): void {
  if (!approvalService) {
    return;
  }

  const request = approvalService.findRequestForSubject(
    tenantId,
    approvalType,
    subjectId,
  );
  if (!request) {
    return;
  }

  if (request.status !== "approved" && request.status !== "posted") {
    throw new Error("Operational approval must be completed before domain approval");
  }
}

export function markTrustApprovalPosted(
  approvalService: TrustApprovalService | undefined,
  input: {
    readonly tenantId: string;
    readonly approvalType: TrustApprovalType;
    readonly subjectId: string;
    readonly actorUserId: string;
  },
): void {
  if (!approvalService) {
    return;
  }

  approvalService.markPosted(input);
}

export const TRUST_APPROVAL_TYPE_BY_DOMAIN = {
  transactionDraft: "trust_transaction",
  transfer: "trust_transfer",
  interestPosting: "interest_posting",
  allocationAdjustment: "allocation_adjustment",
} as const satisfies Record<string, TrustApprovalType>;
