import type {
  TrustApprovalHistoryRecord,
  TrustApprovalListCriteria,
  TrustApprovalRequest,
  TrustApprovalRule,
  TrustApprovalType,
} from "./trust-approval-types";

/** Trust approval request and rule persistence contract (LAW-015-10). */
export interface TrustApprovalRepository {
  saveRule(rule: TrustApprovalRule): TrustApprovalRule;
  getRule(tenantId: string, trustApprovalRuleId: string): TrustApprovalRule | undefined;
  listRules(
    tenantId: string,
    approvalType?: TrustApprovalType,
  ): readonly TrustApprovalRule[];
  saveRequest(request: TrustApprovalRequest): TrustApprovalRequest;
  getRequest(
    tenantId: string,
    trustApprovalRequestId: string,
  ): TrustApprovalRequest | undefined;
  findActiveRequest(
    tenantId: string,
    approvalType: TrustApprovalType,
    subjectId: string,
  ): TrustApprovalRequest | undefined;
  listRequests(criteria: TrustApprovalListCriteria): readonly TrustApprovalRequest[];
  appendHistory(record: TrustApprovalHistoryRecord): TrustApprovalHistoryRecord;
  listHistory(
    tenantId: string,
    trustApprovalRequestId: string,
  ): readonly TrustApprovalHistoryRecord[];
}
