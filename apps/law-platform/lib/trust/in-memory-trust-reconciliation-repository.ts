import type { TrustReconciliationRepository } from "./trust-reconciliation-repository";
import type {
  TrustReconciliationHistoryCriteria,
  TrustReconciliationRun,
} from "./trust-reconciliation-types";

/** In-memory append-only reconciliation run store (LAW-015-05). */
export class InMemoryTrustReconciliationRepository implements TrustReconciliationRepository {
  private readonly runs = new Map<string, TrustReconciliationRun>();

  clear(): void {
    this.runs.clear();
  }

  append(run: TrustReconciliationRun): TrustReconciliationRun {
    const frozen = Object.freeze(structuredClone(run));
    this.runs.set(this.key(run.tenantId, run.reconciliationId), frozen);
    return frozen;
  }

  getById(
    tenantId: string,
    reconciliationId: string,
  ): TrustReconciliationRun | undefined {
    return this.runs.get(this.key(tenantId, reconciliationId));
  }

  list(
    criteria: TrustReconciliationHistoryCriteria,
  ): readonly TrustReconciliationRun[] {
    return [...this.runs.values()]
      .filter((run) => {
        if (run.tenantId !== criteria.tenantId) {
          return false;
        }
        if (criteria.trustAccountId && run.trustAccountId !== criteria.trustAccountId) {
          return false;
        }
        if (
          criteria.reconciliationId &&
          run.reconciliationId !== criteria.reconciliationId
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  }

  private key(tenantId: string, reconciliationId: string): string {
    return `${tenantId}::${reconciliationId}`;
  }
}
