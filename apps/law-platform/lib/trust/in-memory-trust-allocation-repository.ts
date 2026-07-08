import type { TrustAllocationRepository } from "./trust-allocation-repository";
import type {
  TrustAllocation,
  TrustAllocationHistoryCriteria,
} from "./trust-allocation-types";

/** In-memory append-only allocation store (LAW-015-04). */
export class InMemoryTrustAllocationRepository implements TrustAllocationRepository {
  private readonly allocations = new Map<string, TrustAllocation>();

  clear(): void {
    this.allocations.clear();
  }

  append(allocation: TrustAllocation): TrustAllocation {
    this.allocations.set(
      this.key(allocation.tenantId, allocation.trustAllocationId),
      allocation,
    );
    return allocation;
  }

  appendMany(allocations: readonly TrustAllocation[]): readonly TrustAllocation[] {
    return allocations.map((allocation) => this.append(allocation));
  }

  getById(tenantId: string, trustAllocationId: string): TrustAllocation | undefined {
    return this.allocations.get(this.key(tenantId, trustAllocationId));
  }

  listByTransaction(
    tenantId: string,
    trustTransactionId: string,
  ): readonly TrustAllocation[] {
    return [...this.allocations.values()].filter(
      (item) =>
        item.tenantId === tenantId && item.trustTransactionId === trustTransactionId,
    );
  }

  list(criteria: TrustAllocationHistoryCriteria): readonly TrustAllocation[] {
    return [...this.allocations.values()]
      .filter((item) => {
        if (item.tenantId !== criteria.tenantId) {
          return false;
        }
        if (
          criteria.trustAccountId &&
          item.trustAccountId !== criteria.trustAccountId
        ) {
          return false;
        }
        if (criteria.clientId && item.clientId !== criteria.clientId) {
          return false;
        }
        if (criteria.matterId && item.matterId !== criteria.matterId) {
          return false;
        }
        if (
          criteria.trustTransactionId &&
          item.trustTransactionId !== criteria.trustTransactionId
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  private key(tenantId: string, trustAllocationId: string): string {
    return `${tenantId}::${trustAllocationId}`;
  }
}
