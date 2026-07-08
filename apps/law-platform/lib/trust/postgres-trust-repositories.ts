import { PostgresTrustStore, type PostgresTrustStoreOptions } from "@apzhub/config";

import type { TrustAllocationRepository } from "./trust-allocation-repository";
import type {
  TrustAllocation,
  TrustAllocationHistoryCriteria,
} from "./trust-allocation-types";
import type { TrustApprovalRepository } from "./trust-approval-repository";
import type {
  TrustApprovalHistoryRecord,
  TrustApprovalListCriteria,
  TrustApprovalRequest,
  TrustApprovalRule,
  TrustApprovalType,
} from "./trust-approval-types";
import type { TrustInterestPostingRepository } from "./trust-interest-posting-repository";
import type { TrustInterestRuleRepository } from "./trust-interest-rule-repository";
import type {
  TrustInterestPosting,
  TrustInterestPostingHistoryCriteria,
  TrustInterestRule,
} from "./trust-interest-types";
import type { TrustReconciliationRepository } from "./trust-reconciliation-repository";
import type {
  TrustReconciliationHistoryCriteria,
  TrustReconciliationRun,
} from "./trust-reconciliation-types";
import type { TrustReportRepository } from "./trust-report-repository";
import type { TrustReport, TrustReportHistoryCriteria } from "./trust-reporting-types";
import type { TrustTransactionAuditRepository } from "./trust-transaction-audit-repository";
import type {
  TrustAuditTrailCriteria,
  TrustTransactionAuditRecord,
} from "./trust-transaction-workflow-types";
import type { TrustTransactionDraftRepository } from "./trust-transaction-draft-repository";
import type { TrustTransactionDraft } from "./trust-transaction-workflow-types";
import type { TrustTransferRepository } from "./trust-transfer-repository";
import type {
  TrustTransfer,
  TrustTransferHistoryCriteria,
} from "./trust-transfer-types";

function sortByCreatedAt<T extends { readonly createdAt: string }>(
  items: readonly T[],
): readonly T[] {
  return [...items].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function sortByDraftCreatedAt(
  items: readonly TrustInterestPosting[],
): readonly TrustInterestPosting[] {
  return [...items].sort((a, b) => a.draftCreatedAt.localeCompare(b.draftCreatedAt));
}

function sortByStartedAt(
  items: readonly TrustReconciliationRun[],
): readonly TrustReconciliationRun[] {
  return [...items].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
}

function sortByGeneratedAt(items: readonly TrustReport[]): readonly TrustReport[] {
  return [...items].sort((a, b) => a.generatedAt.localeCompare(b.generatedAt));
}

const ACTIVE_APPROVAL_STATUSES = new Set(["draft", "submitted", "approved"]);

function matchesTransferCriteria(
  transfer: TrustTransfer,
  criteria: TrustTransferHistoryCriteria,
): boolean {
  if (transfer.tenantId !== criteria.tenantId) {
    return false;
  }
  if (
    criteria.trustAccountId &&
    transfer.sourceTrustAccountId !== criteria.trustAccountId &&
    transfer.destinationTrustAccountId !== criteria.trustAccountId
  ) {
    return false;
  }
  if (criteria.status && transfer.status !== criteria.status) {
    return false;
  }
  return true;
}

export class PostgresTrustTransactionDraftRepository implements TrustTransactionDraftRepository {
  constructor(private readonly store: PostgresTrustStore) {}

  save(draft: TrustTransactionDraft): TrustTransactionDraft {
    const frozen = Object.freeze(structuredClone(draft));
    this.store.savePayloadEntity(
      "draft",
      "draftId",
      frozen as unknown as Record<string, unknown>,
      {
        trustAccountId: draft.trustAccountId,
      },
    );
    return frozen;
  }

  getById(tenantId: string, draftId: string): TrustTransactionDraft | undefined {
    const draft = this.store.getPayloadEntity<TrustTransactionDraft>(
      "draft",
      "draftId",
      draftId,
    );
    return draft?.tenantId === tenantId ? draft : undefined;
  }

  listByAccount(
    tenantId: string,
    trustAccountId: string,
  ): readonly TrustTransactionDraft[] {
    return this.store
      .listPayloadEntities<TrustTransactionDraft>("draft", (entity) => {
        return entity.tenantId === tenantId && entity.trustAccountId === trustAccountId;
      })
      .map((draft) => Object.freeze(structuredClone(draft)));
  }

  listByStatus(
    tenantId: string,
    status: TrustTransactionDraft["status"],
  ): readonly TrustTransactionDraft[] {
    return this.store
      .listPayloadEntities<TrustTransactionDraft>("draft", (entity) => {
        return entity.tenantId === tenantId && entity.status === status;
      })
      .map((draft) => Object.freeze(structuredClone(draft)));
  }

  findByPostedTransactionId(
    tenantId: string,
    postedTrustTransactionId: string,
  ): TrustTransactionDraft | undefined {
    return this.store
      .listPayloadEntities<TrustTransactionDraft>("draft")
      .find(
        (draft) =>
          draft.tenantId === tenantId &&
          draft.postedTrustTransactionId === postedTrustTransactionId,
      );
  }
}

export class PostgresTrustTransactionAuditRepository implements TrustTransactionAuditRepository {
  constructor(private readonly store: PostgresTrustStore) {}

  append(record: TrustTransactionAuditRecord): TrustTransactionAuditRecord {
    const frozen = Object.freeze(structuredClone(record));
    this.store.savePayloadEntity(
      "audit",
      "auditRecordId",
      frozen as unknown as Record<string, unknown>,
      { trustAccountId: record.trustAccountId },
    );
    return frozen;
  }

  list(criteria: TrustAuditTrailCriteria): readonly TrustTransactionAuditRecord[] {
    return this.store
      .listAuditRecords<TrustTransactionAuditRecord>(criteria.trustAccountId)
      .filter((record) => {
        if (record.tenantId !== criteria.tenantId) {
          return false;
        }
        if (criteria.draftId && record.draftId !== criteria.draftId) {
          return false;
        }
        return true;
      });
  }
}

export class PostgresTrustAllocationRepository implements TrustAllocationRepository {
  constructor(private readonly store: PostgresTrustStore) {}

  append(allocation: TrustAllocation): TrustAllocation {
    const frozen = Object.freeze(structuredClone(allocation));
    this.store.savePayloadEntity(
      "allocation",
      "trustAllocationId",
      frozen as unknown as Record<string, unknown>,
      { trustAccountId: allocation.trustAccountId },
    );
    return frozen;
  }

  appendMany(allocations: readonly TrustAllocation[]): readonly TrustAllocation[] {
    return allocations.map((allocation) => this.append(allocation));
  }

  getById(tenantId: string, trustAllocationId: string): TrustAllocation | undefined {
    const rows = this.store.listPayloadEntities<TrustAllocation>("allocation");
    return rows.find(
      (row) => row.tenantId === tenantId && row.trustAllocationId === trustAllocationId,
    );
  }

  listByTransaction(
    tenantId: string,
    trustTransactionId: string,
  ): readonly TrustAllocation[] {
    return sortByCreatedAt(
      this.store.listPayloadEntities<TrustAllocation>("allocation", (entity) => {
        return (
          entity.tenantId === tenantId &&
          entity.trustTransactionId === trustTransactionId
        );
      }),
    );
  }

  list(criteria: TrustAllocationHistoryCriteria): readonly TrustAllocation[] {
    return sortByCreatedAt(
      this.store.listPayloadEntities<TrustAllocation>("allocation", (entity) => {
        if (entity.tenantId !== criteria.tenantId) {
          return false;
        }
        if (
          criteria.trustAccountId &&
          entity.trustAccountId !== criteria.trustAccountId
        ) {
          return false;
        }
        if (criteria.clientId && entity.clientId !== criteria.clientId) {
          return false;
        }
        if (criteria.matterId && entity.matterId !== criteria.matterId) {
          return false;
        }
        if (
          criteria.trustTransactionId &&
          entity.trustTransactionId !== criteria.trustTransactionId
        ) {
          return false;
        }
        return true;
      }),
    );
  }
}

export class PostgresTrustTransferRepository implements TrustTransferRepository {
  constructor(private readonly store: PostgresTrustStore) {}

  save(transfer: TrustTransfer): TrustTransfer {
    const frozen = Object.freeze(structuredClone(transfer));
    this.store.savePayloadEntity(
      "transfer",
      "trustTransferId",
      frozen as unknown as Record<string, unknown>,
    );
    return frozen;
  }

  getById(tenantId: string, trustTransferId: string): TrustTransfer | undefined {
    const transfer = this.store.getPayloadEntity<TrustTransfer>(
      "transfer",
      "trustTransferId",
      trustTransferId,
    );
    return transfer?.tenantId === tenantId ? transfer : undefined;
  }

  list(criteria: TrustTransferHistoryCriteria): readonly TrustTransfer[] {
    return sortByCreatedAt(
      this.store
        .listPayloadEntities<TrustTransfer>("transfer")
        .filter((transfer) => matchesTransferCriteria(transfer, criteria)),
    );
  }
}

export class PostgresTrustApprovalRepository implements TrustApprovalRepository {
  constructor(private readonly store: PostgresTrustStore) {}

  saveRule(rule: TrustApprovalRule): TrustApprovalRule {
    const frozen = Object.freeze(structuredClone(rule));
    this.store.savePayloadEntity(
      "approval_rule",
      "trustApprovalRuleId",
      frozen as unknown as Record<string, unknown>,
    );
    return frozen;
  }

  getRule(
    tenantId: string,
    trustApprovalRuleId: string,
  ): TrustApprovalRule | undefined {
    const rules = this.store.listPayloadEntities<TrustApprovalRule>("approval_rule");
    return rules.find(
      (rule) =>
        rule.tenantId === tenantId && rule.trustApprovalRuleId === trustApprovalRuleId,
    );
  }

  listRules(
    tenantId: string,
    approvalType?: TrustApprovalType,
  ): readonly TrustApprovalRule[] {
    return sortByCreatedAt(
      this.store
        .listPayloadEntities<TrustApprovalRule>("approval_rule")
        .filter((rule) => {
          if (rule.tenantId !== tenantId) {
            return false;
          }
          if (approvalType && rule.approvalType !== approvalType) {
            return false;
          }
          return true;
        }),
    );
  }

  saveRequest(request: TrustApprovalRequest): TrustApprovalRequest {
    const frozen = Object.freeze(structuredClone(request));
    this.store.savePayloadEntity(
      "approval_request",
      "trustApprovalRequestId",
      frozen as unknown as Record<string, unknown>,
      {
        trustAccountId: request.trustAccountId,
        approvalType: request.approvalType,
        subjectId: request.subjectId,
        status: request.status,
      },
    );
    return frozen;
  }

  getRequest(
    tenantId: string,
    trustApprovalRequestId: string,
  ): TrustApprovalRequest | undefined {
    const request = this.store.getPayloadEntity<TrustApprovalRequest>(
      "approval_request",
      "trustApprovalRequestId",
      trustApprovalRequestId,
    );
    return request?.tenantId === tenantId ? request : undefined;
  }

  findActiveRequest(
    tenantId: string,
    approvalType: TrustApprovalType,
    subjectId: string,
  ): TrustApprovalRequest | undefined {
    return this.listRequests({ tenantId, approvalType, subjectId }).find((request) =>
      ACTIVE_APPROVAL_STATUSES.has(request.status),
    );
  }

  listRequests(criteria: TrustApprovalListCriteria): readonly TrustApprovalRequest[] {
    return sortByCreatedAt(
      this.store.listPayloadEntities<TrustApprovalRequest>(
        "approval_request",
        (entity) => {
          if (entity.tenantId !== criteria.tenantId) {
            return false;
          }
          if (criteria.status && entity.status !== criteria.status) {
            return false;
          }
          if (criteria.approvalType && entity.approvalType !== criteria.approvalType) {
            return false;
          }
          if (criteria.subjectId && entity.subjectId !== criteria.subjectId) {
            return false;
          }
          return true;
        },
      ),
    );
  }

  appendHistory(record: TrustApprovalHistoryRecord): TrustApprovalHistoryRecord {
    const frozen = Object.freeze(structuredClone(record));
    this.store.appendApprovalHistory(
      record.trustApprovalRequestId,
      record.trustApprovalHistoryId,
      frozen as unknown as Record<string, unknown>,
    );
    return frozen;
  }

  listHistory(
    tenantId: string,
    trustApprovalRequestId: string,
  ): readonly TrustApprovalHistoryRecord[] {
    return this.store
      .listApprovalHistory<TrustApprovalHistoryRecord>(trustApprovalRequestId)
      .filter((record) => record.tenantId === tenantId);
  }
}

export class PostgresTrustInterestRuleRepository implements TrustInterestRuleRepository {
  constructor(private readonly store: PostgresTrustStore) {}

  save(rule: TrustInterestRule): TrustInterestRule {
    const frozen = Object.freeze(structuredClone(rule));
    this.store.savePayloadEntity(
      "interest_rule",
      "trustInterestRuleId",
      frozen as unknown as Record<string, unknown>,
    );
    return frozen;
  }

  getById(
    tenantId: string,
    trustInterestRuleId: string,
  ): TrustInterestRule | undefined {
    const rules = this.store.listPayloadEntities<TrustInterestRule>("interest_rule");
    return rules.find(
      (rule) =>
        rule.tenantId === tenantId && rule.trustInterestRuleId === trustInterestRuleId,
    );
  }

  list(tenantId: string, trustAccountId?: string): readonly TrustInterestRule[] {
    return this.store
      .listPayloadEntities<TrustInterestRule>("interest_rule")
      .filter((rule) => {
        if (rule.tenantId !== tenantId) {
          return false;
        }
        if (
          trustAccountId &&
          rule.trustAccountId &&
          rule.trustAccountId !== trustAccountId
        ) {
          return false;
        }
        return true;
      });
  }

  findActiveRule(
    tenantId: string,
    trustAccountId: string,
  ): TrustInterestRule | undefined {
    return this.list(tenantId, trustAccountId)
      .filter((rule) => rule.isActive)
      .at(-1);
  }
}

export class PostgresTrustInterestPostingRepository implements TrustInterestPostingRepository {
  constructor(private readonly store: PostgresTrustStore) {}

  save(posting: TrustInterestPosting): TrustInterestPosting {
    const frozen = Object.freeze(structuredClone(posting));
    this.store.savePayloadEntity(
      "interest_posting",
      "trustInterestPostingId",
      frozen as unknown as Record<string, unknown>,
      { trustAccountId: posting.trustAccountId },
    );
    return frozen;
  }

  getById(
    tenantId: string,
    trustInterestPostingId: string,
  ): TrustInterestPosting | undefined {
    const posting = this.store.getPayloadEntity<TrustInterestPosting>(
      "interest_posting",
      "trustInterestPostingId",
      trustInterestPostingId,
    );
    return posting?.tenantId === tenantId ? posting : undefined;
  }

  list(criteria: TrustInterestPostingHistoryCriteria): readonly TrustInterestPosting[] {
    return sortByDraftCreatedAt(
      this.store.listPayloadEntities<TrustInterestPosting>(
        "interest_posting",
        (entity) => {
          if (entity.tenantId !== criteria.tenantId) {
            return false;
          }
          if (
            criteria.trustAccountId &&
            entity.trustAccountId !== criteria.trustAccountId
          ) {
            return false;
          }
          if (criteria.status && entity.status !== criteria.status) {
            return false;
          }
          return true;
        },
      ),
    );
  }
}

export class PostgresTrustReconciliationRepository implements TrustReconciliationRepository {
  constructor(private readonly store: PostgresTrustStore) {}

  append(run: TrustReconciliationRun): TrustReconciliationRun {
    const frozen = Object.freeze(structuredClone(run));
    this.store.savePayloadEntity(
      "reconciliation",
      "reconciliationId",
      frozen as unknown as Record<string, unknown>,
      { trustAccountId: run.trustAccountId },
    );
    return frozen;
  }

  getById(
    tenantId: string,
    reconciliationId: string,
  ): TrustReconciliationRun | undefined {
    const runs =
      this.store.listPayloadEntities<TrustReconciliationRun>("reconciliation");
    return runs.find(
      (run) => run.tenantId === tenantId && run.reconciliationId === reconciliationId,
    );
  }

  list(
    criteria: TrustReconciliationHistoryCriteria,
  ): readonly TrustReconciliationRun[] {
    return sortByStartedAt(
      this.store.listPayloadEntities<TrustReconciliationRun>(
        "reconciliation",
        (entity) => {
          if (entity.tenantId !== criteria.tenantId) {
            return false;
          }
          if (
            criteria.trustAccountId &&
            entity.trustAccountId !== criteria.trustAccountId
          ) {
            return false;
          }
          return true;
        },
      ),
    );
  }
}

export class PostgresTrustReportRepository implements TrustReportRepository {
  constructor(private readonly store: PostgresTrustStore) {}

  save(report: TrustReport): TrustReport {
    const frozen = Object.freeze(structuredClone(report));
    this.store.savePayloadEntity(
      "report",
      "reportId",
      frozen as unknown as Record<string, unknown>,
      {
        trustAccountId: report.trustAccountId,
        reportType: report.reportType,
      },
    );
    return frozen;
  }

  getById(tenantId: string, reportId: string): TrustReport | undefined {
    const report = this.store.getPayloadEntity<TrustReport>(
      "report",
      "reportId",
      reportId,
    );
    return report?.tenantId === tenantId ? report : undefined;
  }

  list(criteria: TrustReportHistoryCriteria): readonly TrustReport[] {
    return sortByGeneratedAt(
      this.store.listPayloadEntities<TrustReport>("report", (entity) => {
        if (entity.tenantId !== criteria.tenantId) {
          return false;
        }
        if (
          criteria.trustAccountId &&
          entity.trustAccountId !== criteria.trustAccountId
        ) {
          return false;
        }
        if (criteria.reportType && entity.reportType !== criteria.reportType) {
          return false;
        }
        return true;
      }),
    );
  }
}

export function createPostgresTrustRepositories(options: PostgresTrustStoreOptions) {
  const store = new PostgresTrustStore(options);
  return {
    store,
    draftRepository: new PostgresTrustTransactionDraftRepository(store),
    auditRepository: new PostgresTrustTransactionAuditRepository(store),
    allocationRepository: new PostgresTrustAllocationRepository(store),
    transferRepository: new PostgresTrustTransferRepository(store),
    approvalRepository: new PostgresTrustApprovalRepository(store),
    interestRuleRepository: new PostgresTrustInterestRuleRepository(store),
    interestPostingRepository: new PostgresTrustInterestPostingRepository(store),
    reconciliationRepository: new PostgresTrustReconciliationRepository(store),
    reportRepository: new PostgresTrustReportRepository(store),
  };
}
