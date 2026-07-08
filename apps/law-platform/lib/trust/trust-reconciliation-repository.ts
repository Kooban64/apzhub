import type {
  TrustReconciliationHistoryCriteria,
  TrustReconciliationRun,
} from "./trust-reconciliation-types";

/** Reconciliation run repository — append-only, immutable runs (LAW-015-05). */
export interface TrustReconciliationRepository {
  append(run: TrustReconciliationRun): TrustReconciliationRun;
  getById(
    tenantId: string,
    reconciliationId: string,
  ): TrustReconciliationRun | undefined;
  list(criteria: TrustReconciliationHistoryCriteria): readonly TrustReconciliationRun[];
}
