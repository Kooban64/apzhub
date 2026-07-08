import type { TrustTransactionAuditRepository } from "./trust-transaction-audit-repository";
import type {
  TrustAuditTrailCriteria,
  TrustTransactionAuditRecord,
} from "./trust-transaction-workflow-types";

/** Append-only in-memory audit store (LAW-015-03). */
export class InMemoryTrustTransactionAuditRepository implements TrustTransactionAuditRepository {
  private readonly records: TrustTransactionAuditRecord[] = [];

  clear(): void {
    this.records.length = 0;
  }

  append(record: TrustTransactionAuditRecord): TrustTransactionAuditRecord {
    this.records.push(record);
    return record;
  }

  list(criteria: TrustAuditTrailCriteria): readonly TrustTransactionAuditRecord[] {
    return this.records.filter((record) => {
      if (record.tenantId !== criteria.tenantId) {
        return false;
      }
      if (
        criteria.trustAccountId &&
        record.trustAccountId !== criteria.trustAccountId
      ) {
        return false;
      }
      if (criteria.draftId && record.draftId !== criteria.draftId) {
        return false;
      }
      if (
        criteria.trustTransactionId &&
        record.trustTransactionId !== criteria.trustTransactionId
      ) {
        return false;
      }
      if (criteria.action && record.action !== criteria.action) {
        return false;
      }
      return true;
    });
  }
}
