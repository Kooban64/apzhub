import type { TrustApprovalRepository } from "./trust-approval-repository";
import type {
  TrustApprovalHistoryRecord,
  TrustApprovalListCriteria,
  TrustApprovalRequest,
  TrustApprovalRule,
  TrustApprovalStatus,
  TrustApprovalType,
} from "./trust-approval-types";

const ACTIVE_STATUSES: readonly TrustApprovalStatus[] = [
  "draft",
  "submitted",
  "approved",
];

/** In-memory trust approval store with append-only history (LAW-015-10). */
export class InMemoryTrustApprovalRepository implements TrustApprovalRepository {
  private readonly rules = new Map<string, TrustApprovalRule>();
  private readonly requests = new Map<string, TrustApprovalRequest>();
  private readonly history = new Map<string, TrustApprovalHistoryRecord[]>();

  clear(): void {
    this.rules.clear();
    this.requests.clear();
    this.history.clear();
  }

  saveRule(rule: TrustApprovalRule): TrustApprovalRule {
    const frozen = Object.freeze(structuredClone(rule));
    this.rules.set(this.ruleKey(rule.tenantId, rule.trustApprovalRuleId), frozen);
    return frozen;
  }

  getRule(
    tenantId: string,
    trustApprovalRuleId: string,
  ): TrustApprovalRule | undefined {
    return this.rules.get(this.ruleKey(tenantId, trustApprovalRuleId));
  }

  listRules(
    tenantId: string,
    approvalType?: TrustApprovalType,
  ): readonly TrustApprovalRule[] {
    return [...this.rules.values()]
      .filter((rule) => {
        if (rule.tenantId !== tenantId) {
          return false;
        }
        if (approvalType && rule.approvalType !== approvalType) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  saveRequest(request: TrustApprovalRequest): TrustApprovalRequest {
    const frozen = Object.freeze(structuredClone(request));
    this.requests.set(
      this.requestKey(request.tenantId, request.trustApprovalRequestId),
      frozen,
    );
    return frozen;
  }

  getRequest(
    tenantId: string,
    trustApprovalRequestId: string,
  ): TrustApprovalRequest | undefined {
    return this.requests.get(this.requestKey(tenantId, trustApprovalRequestId));
  }

  findActiveRequest(
    tenantId: string,
    approvalType: TrustApprovalType,
    subjectId: string,
  ): TrustApprovalRequest | undefined {
    return [...this.requests.values()].find(
      (request) =>
        request.tenantId === tenantId &&
        request.approvalType === approvalType &&
        request.subjectId === subjectId &&
        ACTIVE_STATUSES.includes(request.status),
    );
  }

  listRequests(criteria: TrustApprovalListCriteria): readonly TrustApprovalRequest[] {
    return [...this.requests.values()]
      .filter((request) => {
        if (request.tenantId !== criteria.tenantId) {
          return false;
        }
        if (criteria.status && request.status !== criteria.status) {
          return false;
        }
        if (criteria.approvalType && request.approvalType !== criteria.approvalType) {
          return false;
        }
        if (criteria.subjectId && request.subjectId !== criteria.subjectId) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  appendHistory(record: TrustApprovalHistoryRecord): TrustApprovalHistoryRecord {
    const frozen = Object.freeze(structuredClone(record));
    const key = this.requestKey(record.tenantId, record.trustApprovalRequestId);
    const existing = this.history.get(key) ?? [];
    this.history.set(key, [...existing, frozen]);
    return frozen;
  }

  listHistory(
    tenantId: string,
    trustApprovalRequestId: string,
  ): readonly TrustApprovalHistoryRecord[] {
    return this.history.get(this.requestKey(tenantId, trustApprovalRequestId)) ?? [];
  }

  private ruleKey(tenantId: string, trustApprovalRuleId: string): string {
    return `${tenantId}::rule::${trustApprovalRuleId}`;
  }

  private requestKey(tenantId: string, trustApprovalRequestId: string): string {
    return `${tenantId}::request::${trustApprovalRequestId}`;
  }
}
