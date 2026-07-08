import { computeAllBalances } from "./trust-ledger-balance";
import { isBalanced } from "./trust-ledger-posting-builder";
import { verifyJournalIntegrity } from "./trust-ledger-service";
import {
  signedAllocationAmount,
  sumAllocatedForTransaction,
} from "./trust-allocation-balance";
import { transactionAllocationEffect } from "./trust-allocation-validator";
import { createTrustId } from "./trust-id";
import type { TrustAllocation } from "./trust-allocation-types";
import type { TrustJournalEntry, TrustTransaction } from "./trust-ledger-types";
import type {
  TrustReconciliationBalanceSummary,
  TrustReconciliationVariance,
  TrustReconciliationVarianceCategory,
  TrustReconciliationVarianceType,
} from "./trust-reconciliation-types";

export interface TrustReconciliationEngineInput {
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly currency: string;
  readonly journalEntries: readonly TrustJournalEntry[];
  readonly transactions: readonly TrustTransaction[];
  readonly allocations: readonly TrustAllocation[];
}

export interface TrustReconciliationEngineOutput {
  readonly balanceSummary: TrustReconciliationBalanceSummary;
  readonly variances: readonly TrustReconciliationVariance[];
  readonly warningCount: number;
  readonly errorCount: number;
}

function createVariance(
  category: TrustReconciliationVarianceCategory,
  varianceType: TrustReconciliationVarianceType,
  message: string,
  extras: Partial<
    Omit<
      TrustReconciliationVariance,
      "varianceId" | "category" | "varianceType" | "message"
    >
  > = {},
): TrustReconciliationVariance {
  return {
    varianceId: createTrustId("trv"),
    category,
    varianceType,
    message,
    ...extras,
  };
}

function sortById<
  T extends {
    readonly trustTransactionId?: string;
    readonly trustAllocationId?: string;
  },
>(items: readonly T[], idKey: keyof T): T[] {
  return [...items].sort((a, b) =>
    String(a[idKey] ?? "").localeCompare(String(b[idKey] ?? "")),
  );
}

/** Pure read-only reconciliation checks (LAW-015-05). */
export function runTrustReconciliationChecks(
  input: TrustReconciliationEngineInput,
): TrustReconciliationEngineOutput {
  const variances: TrustReconciliationVariance[] = [];
  const { tenantId, trustAccountId, currency } = input;

  const journalEntries = [...input.journalEntries].sort((a, b) =>
    a.journalEntryId.localeCompare(b.journalEntryId),
  );
  const transactions = sortById(input.transactions, "trustTransactionId");
  const allocations = sortById(input.allocations, "trustAllocationId");

  const postedTransactions = transactions.filter((tx) => tx.status === "posted");
  const transactionById = new Map(
    transactions.map((tx) => [tx.trustTransactionId, tx]),
  );

  if (!verifyJournalIntegrity(journalEntries)) {
    variances.push(
      createVariance(
        "error",
        "imbalance",
        "Journal entries failed integrity verification",
      ),
    );
  }

  for (const entry of journalEntries) {
    if (!isBalanced(entry.lines)) {
      variances.push(
        createVariance(
          "error",
          "imbalance",
          "Journal entry is not debit/credit balanced",
          {
            trustTransactionId: entry.trustTransactionId,
            details: { journalEntryId: entry.journalEntryId },
          },
        ),
      );
    }
  }

  const referenceCounts = new Map<string, number>();
  for (const tx of transactions) {
    referenceCounts.set(
      tx.transactionReference,
      (referenceCounts.get(tx.transactionReference) ?? 0) + 1,
    );
  }
  for (const [reference, count] of referenceCounts) {
    if (count > 1) {
      variances.push(
        createVariance(
          "error",
          "duplicate_transaction",
          "Duplicate transaction reference detected",
          {
            details: { transactionReference: reference, count },
          },
        ),
      );
    }
  }

  const transactionIdCounts = new Map<string, number>();
  for (const tx of transactions) {
    transactionIdCounts.set(
      tx.trustTransactionId,
      (transactionIdCounts.get(tx.trustTransactionId) ?? 0) + 1,
    );
  }
  for (const [id, count] of transactionIdCounts) {
    if (count > 1) {
      variances.push(
        createVariance(
          "error",
          "duplicate_transaction",
          "Duplicate trust transaction id detected",
          {
            trustTransactionId: id,
            details: { count },
          },
        ),
      );
    }
  }

  if (
    journalEntries.length !==
    postedTransactions.length +
      transactions.filter((tx) => tx.status === "reversed").length
  ) {
    const reversedWithEntries = transactions.filter(
      (tx) => tx.status === "reversed",
    ).length;
    const expectedEntries = postedTransactions.length + reversedWithEntries;
    if (
      journalEntries.length !== expectedEntries &&
      journalEntries.length !== transactions.length
    ) {
      variances.push(
        createVariance(
          "warning",
          "unknown",
          "Transaction count differs from journal entry count",
          {
            expectedAmount: transactions.length,
            actualAmount: journalEntries.length,
          },
        ),
      );
    }
  }

  for (const tx of transactions) {
    if (tx.tenantId !== tenantId) {
      variances.push(
        createVariance("error", "unknown", "Transaction tenant scope mismatch", {
          trustTransactionId: tx.trustTransactionId,
          details: { expectedTenantId: tenantId, actualTenantId: tx.tenantId },
        }),
      );
    }
    if (tx.trustAccountId !== trustAccountId) {
      variances.push(
        createVariance("error", "unknown", "Transaction trust account mismatch", {
          trustTransactionId: tx.trustTransactionId,
        }),
      );
    }
  }

  for (const allocation of allocations) {
    if (
      allocation.tenantId !== tenantId ||
      allocation.trustAccountId !== trustAccountId
    ) {
      variances.push(
        createVariance(
          "error",
          "orphan_allocation",
          "Allocation tenant or account scope mismatch",
          {
            trustAllocationId: allocation.trustAllocationId,
            trustTransactionId: allocation.trustTransactionId,
          },
        ),
      );
      continue;
    }

    const tx = transactionById.get(allocation.trustTransactionId);
    if (!tx) {
      variances.push(
        createVariance(
          "error",
          "orphan_allocation",
          "Allocation references missing transaction",
          {
            trustAllocationId: allocation.trustAllocationId,
            trustTransactionId: allocation.trustTransactionId,
          },
        ),
      );
      continue;
    }

    if (tx.status !== "posted") {
      variances.push(
        createVariance(
          "error",
          "orphan_allocation",
          "Allocation references non-posted transaction",
          {
            trustAllocationId: allocation.trustAllocationId,
            trustTransactionId: allocation.trustTransactionId,
          },
        ),
      );
    }
  }

  const allocationsByTransaction = new Map<string, TrustAllocation[]>();
  for (const allocation of allocations) {
    const list = allocationsByTransaction.get(allocation.trustTransactionId) ?? [];
    list.push(allocation);
    allocationsByTransaction.set(allocation.trustTransactionId, list);
  }

  for (const tx of postedTransactions) {
    const txAllocations = allocationsByTransaction.get(tx.trustTransactionId) ?? [];
    const effect = transactionAllocationEffect(tx);
    const allocatedTotal = sumAllocatedForTransaction(txAllocations, effect);

    if (txAllocations.length === 0 && tx.trustTransactionType !== "reversal") {
      variances.push(
        createVariance(
          "warning",
          "missing_allocation",
          "Posted transaction has no allocations",
          {
            trustTransactionId: tx.trustTransactionId,
            expectedAmount: tx.amount,
            actualAmount: 0,
          },
        ),
      );
      continue;
    }

    if (allocatedTotal > tx.amount) {
      variances.push(
        createVariance(
          "error",
          "over_allocation",
          "Allocation total exceeds transaction amount",
          {
            trustTransactionId: tx.trustTransactionId,
            expectedAmount: tx.amount,
            actualAmount: allocatedTotal,
          },
        ),
      );
    } else if (allocatedTotal < tx.amount && effect === "increase") {
      variances.push(
        createVariance(
          "warning",
          "under_allocation",
          "Allocation total is less than transaction amount",
          {
            trustTransactionId: tx.trustTransactionId,
            expectedAmount: tx.amount,
            actualAmount: allocatedTotal,
          },
        ),
      );
    } else if (allocatedTotal !== tx.amount && effect === "decrease") {
      variances.push(
        createVariance(
          "error",
          "over_allocation",
          "Withdrawal allocation must equal transaction amount",
          {
            trustTransactionId: tx.trustTransactionId,
            expectedAmount: tx.amount,
            actualAmount: allocatedTotal,
          },
        ),
      );
    }
  }

  for (const tx of transactions) {
    if (tx.trustTransactionType !== "reversal") {
      continue;
    }

    if (!tx.reversesTransactionId) {
      variances.push(
        createVariance(
          "error",
          "reversal_mismatch",
          "Reversal transaction missing original reference",
          {
            trustTransactionId: tx.trustTransactionId,
          },
        ),
      );
      continue;
    }

    const original = transactionById.get(tx.reversesTransactionId);
    if (!original) {
      variances.push(
        createVariance(
          "error",
          "reversal_mismatch",
          "Reversal references missing original transaction",
          {
            trustTransactionId: tx.trustTransactionId,
            details: { reversesTransactionId: tx.reversesTransactionId },
          },
        ),
      );
      continue;
    }

    if (original.status !== "reversed") {
      variances.push(
        createVariance(
          "error",
          "reversal_mismatch",
          "Original transaction is not marked reversed",
          {
            trustTransactionId: tx.trustTransactionId,
            details: { originalTransactionId: original.trustTransactionId },
          },
        ),
      );
    }

    const originalAllocations =
      allocationsByTransaction.get(original.trustTransactionId) ?? [];
    const reversalAllocations =
      allocationsByTransaction.get(tx.trustTransactionId) ?? [];

    if (originalAllocations.length > 0 && reversalAllocations.length === 0) {
      variances.push(
        createVariance(
          "warning",
          "reversal_mismatch",
          "Original had allocations but reversal has none",
          {
            trustTransactionId: tx.trustTransactionId,
            details: { originalTransactionId: original.trustTransactionId },
          },
        ),
      );
    }

    if (reversalAllocations.length > 0) {
      for (const reversalAllocation of reversalAllocations) {
        if (reversalAllocation.allocationType !== "reversal") {
          variances.push(
            createVariance(
              "warning",
              "reversal_mismatch",
              "Reversal allocation is not typed as reversal",
              {
                trustAllocationId: reversalAllocation.trustAllocationId,
                trustTransactionId: tx.trustTransactionId,
              },
            ),
          );
        }
      }
    }
  }

  const ledgerBalances = computeAllBalances(journalEntries, {
    tenantId,
    trustAccountId,
    currency,
  });

  const accountBalance =
    ledgerBalances.find((balance) => balance.scope === "account")?.balanceAmount ?? 0;
  const ledgerClientTotal = ledgerBalances
    .filter((balance) => balance.scope === "client")
    .reduce((sum, balance) => sum + balance.balanceAmount, 0);
  const ledgerMatterTotal = ledgerBalances
    .filter((balance) => balance.scope === "matter")
    .reduce((sum, balance) => sum + balance.balanceAmount, 0);

  const allocationClientTotal = sumClientAllocationTotals(
    allocations,
    tenantId,
    trustAccountId,
  );
  const allocationMatterTotal = sumMatterAllocationTotals(
    allocations,
    tenantId,
    trustAccountId,
  );
  const unallocatedBalance = allocations
    .filter(
      (item) =>
        item.tenantId === tenantId &&
        item.trustAccountId === trustAccountId &&
        item.allocationType === "unallocated",
    )
    .reduce((sum, item) => sum + signedAllocationAmount(item), 0);

  const ledgerClientFundsTotal = ledgerClientTotal + ledgerMatterTotal;
  if (Math.abs(ledgerClientFundsTotal - allocationClientTotal) > 0.001) {
    variances.push(
      createVariance(
        "warning",
        "under_allocation",
        "Ledger client funds differ from allocation client total",
        {
          expectedAmount: ledgerClientFundsTotal,
          actualAmount: allocationClientTotal,
        },
      ),
    );
  }

  for (const ledgerBalance of ledgerBalances.filter(
    (balance) => balance.scope === "matter",
  )) {
    const matterAllocationTotal = allocations
      .filter(
        (item) =>
          item.tenantId === tenantId &&
          item.trustAccountId === trustAccountId &&
          item.matterId === ledgerBalance.matterId &&
          item.clientId === ledgerBalance.clientId,
      )
      .reduce((sum, item) => sum + signedAllocationAmount(item), 0);

    if (Math.abs(ledgerBalance.balanceAmount - matterAllocationTotal) > 0.001) {
      variances.push(
        createVariance(
          "warning",
          "under_allocation",
          "Ledger matter liability differs from allocation matter total",
          {
            clientId: ledgerBalance.clientId,
            matterId: ledgerBalance.matterId,
            expectedAmount: ledgerBalance.balanceAmount,
            actualAmount: matterAllocationTotal,
          },
        ),
      );
    }
  }

  const sortedVariances = [...variances].sort((a, b) =>
    a.varianceId.localeCompare(b.varianceId),
  );
  const warningCount = sortedVariances.filter(
    (item) => item.category === "warning",
  ).length;
  const errorCount = sortedVariances.filter((item) => item.category === "error").length;

  if (sortedVariances.length === 0) {
    sortedVariances.push(
      createVariance(
        "balanced",
        "unknown",
        "Trust ledger and allocations are reconciled",
      ),
    );
  }

  return {
    balanceSummary: {
      ledgerAccountBalance: accountBalance,
      ledgerClientBalanceTotal: ledgerClientTotal,
      ledgerMatterBalanceTotal: ledgerMatterTotal,
      allocationClientBalanceTotal: allocationClientTotal,
      allocationMatterBalanceTotal: allocationMatterTotal,
      unallocatedBalance,
      currency,
    },
    variances: sortedVariances,
    warningCount,
    errorCount,
  };
}

function sumClientAllocationTotals(
  allocations: readonly TrustAllocation[],
  tenantId: string,
  trustAccountId: string,
): number {
  const clients = new Set(
    allocations
      .filter(
        (item) => item.tenantId === tenantId && item.trustAccountId === trustAccountId,
      )
      .map((item) => item.clientId),
  );

  let total = 0;
  for (const clientId of [...clients].sort()) {
    total += allocations
      .filter(
        (item) =>
          item.tenantId === tenantId &&
          item.trustAccountId === trustAccountId &&
          item.clientId === clientId,
      )
      .reduce((sum, item) => sum + signedAllocationAmount(item), 0);
  }
  return total;
}

function sumMatterAllocationTotals(
  allocations: readonly TrustAllocation[],
  tenantId: string,
  trustAccountId: string,
): number {
  return allocations
    .filter(
      (item) =>
        item.tenantId === tenantId &&
        item.trustAccountId === trustAccountId &&
        item.matterId,
    )
    .reduce((sum, item) => sum + signedAllocationAmount(item), 0);
}
