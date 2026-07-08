import type {
  TrustAllocation,
  TrustAllocationHistoryCriteria,
} from "./trust-allocation-types";

/** Allocation repository contract — append-only (LAW-015-04). */
export interface TrustAllocationRepository {
  append(allocation: TrustAllocation): TrustAllocation;
  appendMany(allocations: readonly TrustAllocation[]): readonly TrustAllocation[];
  getById(tenantId: string, trustAllocationId: string): TrustAllocation | undefined;
  listByTransaction(
    tenantId: string,
    trustTransactionId: string,
  ): readonly TrustAllocation[];
  list(criteria: TrustAllocationHistoryCriteria): readonly TrustAllocation[];
}
