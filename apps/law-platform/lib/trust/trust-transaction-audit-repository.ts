import type {
  TrustAuditTrailCriteria,
  TrustTransactionAuditRecord,
} from "./trust-transaction-workflow-types";

/** Audit repository contract (LAW-015-03). */
export interface TrustTransactionAuditRepository {
  append(record: TrustTransactionAuditRecord): TrustTransactionAuditRecord;
  list(criteria: TrustAuditTrailCriteria): readonly TrustTransactionAuditRecord[];
}
