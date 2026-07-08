import type {
  TrustAllocation,
  TrustAllocatedBalanceProjection,
  TrustAllocationSummary,
} from "./trust-allocation-types";

export function signedAllocationAmount(allocation: TrustAllocation): number {
  return allocation.effect === "increase" ? allocation.amount : -allocation.amount;
}

export function sumAllocatedForTransaction(
  allocations: readonly TrustAllocation[],
  effect: "increase" | "decrease",
): number {
  return allocations
    .filter((item) => item.effect === effect)
    .reduce((sum, item) => sum + item.amount, 0);
}

export function buildTransactionAllocationSummary(
  transaction: {
    readonly trustTransactionId: string;
    readonly tenantId: string;
    readonly trustAccountId: string;
    readonly amount: number;
    readonly currency: string;
  },
  allocations: readonly TrustAllocation[],
  effect: "increase" | "decrease",
): TrustAllocationSummary {
  const totalAllocated = sumAllocatedForTransaction(allocations, effect);
  const remainingUnallocated =
    effect === "increase" ? Math.max(0, transaction.amount - totalAllocated) : 0;

  return {
    trustTransactionId: transaction.trustTransactionId,
    tenantId: transaction.tenantId,
    trustAccountId: transaction.trustAccountId,
    transactionAmount: transaction.amount,
    currency: transaction.currency,
    totalAllocated,
    remainingUnallocated,
    allocations,
  };
}

export function computeClientAllocatedBalance(
  allocations: readonly TrustAllocation[],
  tenantId: string,
  trustAccountId: string,
  clientId: string,
  currency: string,
): TrustAllocatedBalanceProjection {
  const balanceAmount = allocations
    .filter(
      (item) =>
        item.tenantId === tenantId &&
        item.trustAccountId === trustAccountId &&
        item.clientId === clientId,
    )
    .reduce((sum, item) => sum + signedAllocationAmount(item), 0);

  return {
    tenantId,
    trustAccountId,
    clientId,
    scope: "client",
    balanceAmount,
    currency,
    asOfDate: new Date().toISOString(),
  };
}

export function computeMatterAllocatedBalance(
  allocations: readonly TrustAllocation[],
  tenantId: string,
  trustAccountId: string,
  clientId: string,
  matterId: string,
  currency: string,
): TrustAllocatedBalanceProjection {
  const balanceAmount = allocations
    .filter(
      (item) =>
        item.tenantId === tenantId &&
        item.trustAccountId === trustAccountId &&
        item.clientId === clientId &&
        item.matterId === matterId,
    )
    .reduce((sum, item) => sum + signedAllocationAmount(item), 0);

  return {
    tenantId,
    trustAccountId,
    clientId,
    matterId,
    scope: "matter",
    balanceAmount,
    currency,
    asOfDate: new Date().toISOString(),
  };
}

export function computeUnallocatedBalance(
  allocations: readonly TrustAllocation[],
  tenantId: string,
  trustAccountId: string,
  currency: string,
  clientId?: string,
): TrustAllocatedBalanceProjection {
  const balanceAmount = allocations
    .filter((item) => {
      if (item.tenantId !== tenantId || item.trustAccountId !== trustAccountId) {
        return false;
      }
      if (item.allocationType !== "unallocated") {
        return false;
      }
      if (clientId && item.clientId !== clientId) {
        return false;
      }
      return true;
    })
    .reduce((sum, item) => sum + signedAllocationAmount(item), 0);

  return {
    tenantId,
    trustAccountId,
    clientId,
    scope: "unallocated",
    balanceAmount,
    currency,
    asOfDate: new Date().toISOString(),
  };
}
