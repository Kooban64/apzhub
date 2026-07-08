import type { TrustTransferRepository } from "./trust-transfer-repository";
import type {
  TrustTransfer,
  TrustTransferHistoryCriteria,
} from "./trust-transfer-types";

/** In-memory append-only trust transfer store (LAW-015-07). */
export class InMemoryTrustTransferRepository implements TrustTransferRepository {
  private readonly transfers = new Map<string, TrustTransfer>();

  clear(): void {
    this.transfers.clear();
  }

  save(transfer: TrustTransfer): TrustTransfer {
    const frozen = Object.freeze(structuredClone(transfer));
    this.transfers.set(this.key(transfer.tenantId, transfer.trustTransferId), frozen);
    return frozen;
  }

  getById(tenantId: string, trustTransferId: string): TrustTransfer | undefined {
    return this.transfers.get(this.key(tenantId, trustTransferId));
  }

  list(criteria: TrustTransferHistoryCriteria): readonly TrustTransfer[] {
    return [...this.transfers.values()]
      .filter((transfer) => {
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
      })
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  private key(tenantId: string, trustTransferId: string): string {
    return `${tenantId}::${trustTransferId}`;
  }
}
