import { signedAllocationAmount } from "./trust-allocation-balance";
import type { TrustAllocation } from "./trust-allocation-types";
import type {
  TrustBalance,
  TrustJournalEntry,
  TrustTransaction,
} from "./trust-ledger-types";
import type { TrustInterestPosting } from "./trust-interest-types";
import type { TrustReconciliationRun } from "./trust-reconciliation-types";
import type { TrustTransfer } from "./trust-transfer-types";
import { sumCredits, sumDebits } from "./trust-ledger-posting-builder";
import type {
  GenerateTrustReportInput,
  TrustAllocationSummaryLine,
  TrustInterestSummaryLine,
  TrustJournalReportLine,
  TrustReconciliationSummaryLine,
  TrustReportPayload,
  TrustReportSourceCounts,
  TrustReportTotals,
  TrustReportingPeriod,
  TrustStatementLine,
  TrustTransactionReportLine,
  TrustTransferSummaryLine,
  TrustTrialBalanceLine,
} from "./trust-reporting-types";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface TrustReportingSourceData {
  readonly input: GenerateTrustReportInput;
  readonly currency: string;
  readonly ledgerMeta?: {
    readonly openedAt: string;
    readonly entryCount: number;
    readonly transactionCount: number;
  };
  readonly balances?: readonly TrustBalance[];
  readonly journalEntries?: readonly TrustJournalEntry[];
  readonly transactions?: readonly TrustTransaction[];
  readonly allocations?: readonly TrustAllocation[];
  readonly interestPostings?: readonly TrustInterestPosting[];
  readonly transfers?: readonly TrustTransfer[];
  readonly reconciliationRuns?: readonly TrustReconciliationRun[];
  readonly auditRecordCount?: number;
}

export function validateReportingPeriod(period?: TrustReportingPeriod): boolean {
  if (!period) {
    return true;
  }
  if (period.start && !ISO_DATE_PATTERN.test(period.start)) {
    return false;
  }
  if (period.end && !ISO_DATE_PATTERN.test(period.end)) {
    return false;
  }
  if (period.start && period.end && period.end < period.start) {
    return false;
  }
  return true;
}

export function isWithinReportingPeriod(
  isoDate: string,
  period?: TrustReportingPeriod,
): boolean {
  if (!period?.start && !period?.end) {
    return true;
  }
  if (period.start && isoDate < period.start) {
    return false;
  }
  if (period.end && isoDate > period.end) {
    return false;
  }
  return true;
}

export function buildTrustReportPayload(data: TrustReportingSourceData): {
  readonly payload: TrustReportPayload;
  readonly sourceCounts: TrustReportSourceCounts;
  readonly totals: TrustReportTotals;
  readonly warnings: readonly string[];
} {
  switch (data.input.reportType) {
    case "trial_balance":
      return buildTrialBalance(data);
    case "ledger":
      return buildLedger(data);
    case "journal":
      return buildJournal(data);
    case "transactions":
      return buildTransactions(data);
    case "client_statement":
      return buildClientStatement(data);
    case "matter_statement":
      return buildMatterStatement(data);
    case "allocation_summary":
      return buildAllocationSummary(data);
    case "interest_summary":
      return buildInterestSummary(data);
    case "transfer_summary":
      return buildTransferSummary(data);
    case "reconciliation_summary":
      return buildReconciliationSummary(data);
    default:
      return {
        payload: {
          kind: "ledger",
          ledger: { openedAt: "", entryCount: 0, transactionCount: 0 },
        },
        sourceCounts: {},
        totals: {},
        warnings: ["Unknown report type"],
      };
  }
}

function buildTrialBalance(data: TrustReportingSourceData) {
  const balances = [...(data.balances ?? [])].sort((a, b) =>
    balanceSortKey(a).localeCompare(balanceSortKey(b)),
  );
  const lines: TrustTrialBalanceLine[] = balances.map((balance) => ({
    scope: balance.scope,
    clientId: balance.clientId,
    matterId: balance.matterId,
    balanceAmount: balance.balanceAmount,
    currency: balance.currency,
  }));

  return {
    payload: { kind: "trial_balance" as const, lines },
    sourceCounts: { accounts: 1 },
    totals: {
      transactionAmountTotal: lines.reduce((sum, line) => sum + line.balanceAmount, 0),
    },
    warnings: lines.length === 0 ? ["No balance projections available"] : [],
  };
}

function buildLedger(data: TrustReportingSourceData) {
  const ledger = data.ledgerMeta ?? {
    openedAt: "",
    entryCount: 0,
    transactionCount: 0,
  };
  return {
    payload: { kind: "ledger" as const, ledger },
    sourceCounts: { accounts: 1 },
    totals: {},
    warnings: [],
  };
}

function buildJournal(data: TrustReportingSourceData) {
  const period = data.input.reportingPeriod;
  const entries = filterJournalEntries(data.journalEntries ?? [], period);
  const lines: TrustJournalReportLine[] = entries.map((entry) => ({
    journalEntryId: entry.journalEntryId,
    journalReference: entry.journalReference,
    entryDate: entry.entryDate,
    trustTransactionId: entry.trustTransactionId,
    debitTotal: sumDebits(entry.lines),
    creditTotal: sumCredits(entry.lines),
    lineCount: entry.lines.length,
  }));

  return {
    payload: { kind: "journal" as const, lines },
    sourceCounts: { journalEntries: lines.length },
    totals: {
      debitTotal: lines.reduce((sum, line) => sum + line.debitTotal, 0),
      creditTotal: lines.reduce((sum, line) => sum + line.creditTotal, 0),
    },
    warnings: [],
  };
}

function buildTransactions(data: TrustReportingSourceData) {
  const period = data.input.reportingPeriod;
  const transactions = filterTransactions(data.transactions ?? [], period);
  const lines: TrustTransactionReportLine[] = transactions.map((tx) => ({
    trustTransactionId: tx.trustTransactionId,
    transactionReference: tx.transactionReference,
    trustTransactionType: tx.trustTransactionType,
    amount: tx.amount,
    currency: tx.currency,
    transactionDate: tx.transactionDate,
    postingDate: tx.postingDate,
    clientId: tx.clientId,
    matterId: tx.matterId,
    status: tx.status,
    narrative: tx.narrative,
  }));

  return {
    payload: { kind: "transactions" as const, lines },
    sourceCounts: {
      transactions: lines.length,
      auditRecords: data.auditRecordCount ?? 0,
    },
    totals: {
      transactionAmountTotal: lines.reduce((sum, line) => sum + line.amount, 0),
    },
    warnings: [],
  };
}

function buildClientStatement(data: TrustReportingSourceData) {
  const clientId = data.input.clientId!;
  const period = data.input.reportingPeriod;
  const allocations = (data.allocations ?? []).filter(
    (item) => item.clientId === clientId,
  );
  const transactions = (data.transactions ?? []).filter(
    (item) => item.clientId === clientId,
  );

  const openingBalance = computeOpeningBalance(allocations, period);
  const periodAllocations = filterAllocations(allocations, period);
  const periodTransactions = filterTransactions(transactions, period);

  const lines: TrustStatementLine[] = [
    ...periodTransactions.map((tx) => ({
      lineDate: tx.transactionDate,
      lineType: "transaction" as const,
      reference: tx.transactionReference,
      description: tx.narrative,
      amount: tx.amount,
    })),
    ...periodAllocations.map((allocation) => ({
      lineDate: allocation.allocationDate,
      lineType: "allocation" as const,
      reference: allocation.trustAllocationId,
      description: `${allocation.allocationType} allocation`,
      amount: allocation.amount,
      effect: allocation.effect,
    })),
  ].sort(
    (a, b) =>
      a.lineDate.localeCompare(b.lineDate) || a.reference.localeCompare(b.reference),
  );

  const periodDelta = periodAllocations.reduce(
    (sum, item) => sum + signedAllocationAmount(item),
    0,
  );
  const closingBalance = openingBalance + periodDelta;

  return {
    payload: {
      kind: "client_statement" as const,
      clientId,
      openingBalance,
      closingBalance,
      lines,
    },
    sourceCounts: {
      transactions: periodTransactions.length,
      allocations: periodAllocations.length,
    },
    totals: { transactionAmountTotal: closingBalance },
    warnings: [],
  };
}

function buildMatterStatement(data: TrustReportingSourceData) {
  const clientId = data.input.clientId!;
  const matterId = data.input.matterId!;
  const period = data.input.reportingPeriod;
  const allocations = (data.allocations ?? []).filter(
    (item) => item.clientId === clientId && item.matterId === matterId,
  );
  const transactions = (data.transactions ?? []).filter(
    (item) => item.clientId === clientId && item.matterId === matterId,
  );

  const openingBalance = computeOpeningBalance(allocations, period);
  const periodAllocations = filterAllocations(allocations, period);
  const periodTransactions = filterTransactions(transactions, period);

  const lines: TrustStatementLine[] = [
    ...periodTransactions.map((tx) => ({
      lineDate: tx.transactionDate,
      lineType: "transaction" as const,
      reference: tx.transactionReference,
      description: tx.narrative,
      amount: tx.amount,
    })),
    ...periodAllocations.map((allocation) => ({
      lineDate: allocation.allocationDate,
      lineType: "allocation" as const,
      reference: allocation.trustAllocationId,
      description: `${allocation.allocationType} allocation`,
      amount: allocation.amount,
      effect: allocation.effect,
    })),
  ].sort(
    (a, b) =>
      a.lineDate.localeCompare(b.lineDate) || a.reference.localeCompare(b.reference),
  );

  const periodDelta = periodAllocations.reduce(
    (sum, item) => sum + signedAllocationAmount(item),
    0,
  );
  const closingBalance = openingBalance + periodDelta;

  return {
    payload: {
      kind: "matter_statement" as const,
      clientId,
      matterId,
      openingBalance,
      closingBalance,
      lines,
    },
    sourceCounts: {
      transactions: periodTransactions.length,
      allocations: periodAllocations.length,
    },
    totals: { transactionAmountTotal: closingBalance },
    warnings: [],
  };
}

function buildAllocationSummary(data: TrustReportingSourceData) {
  const period = data.input.reportingPeriod;
  const allocations = filterAllocations(data.allocations ?? [], period);
  const lines: TrustAllocationSummaryLine[] = allocations.map((allocation) => ({
    trustAllocationId: allocation.trustAllocationId,
    trustTransactionId: allocation.trustTransactionId,
    clientId: allocation.clientId,
    matterId: allocation.matterId,
    amount: allocation.amount,
    effect: allocation.effect,
    allocationType: allocation.allocationType,
    allocationDate: allocation.allocationDate,
  }));

  return {
    payload: { kind: "allocation_summary" as const, lines },
    sourceCounts: { allocations: lines.length },
    totals: {
      allocationAmountTotal: lines.reduce((sum, line) => sum + line.amount, 0),
    },
    warnings: [],
  };
}

function buildInterestSummary(data: TrustReportingSourceData) {
  const period = data.input.reportingPeriod;
  const postings = filterInterestPostings(data.interestPostings ?? [], period);
  const lines: TrustInterestSummaryLine[] = postings.map((posting) => ({
    trustInterestPostingId: posting.trustInterestPostingId,
    status: posting.status,
    periodStart: posting.periodStart,
    periodEnd: posting.periodEnd,
    totalInterestAmount: posting.totalInterestAmount,
    lineCount: posting.lineItems.length,
  }));

  return {
    payload: { kind: "interest_summary" as const, lines },
    sourceCounts: { interestPostings: lines.length },
    totals: {
      interestAmountTotal: lines.reduce(
        (sum, line) => sum + line.totalInterestAmount,
        0,
      ),
    },
    warnings: [],
  };
}

function buildTransferSummary(data: TrustReportingSourceData) {
  const period = data.input.reportingPeriod;
  const transfers = filterTransfers(data.transfers ?? [], period);
  const lines: TrustTransferSummaryLine[] = transfers.map((transfer) => ({
    trustTransferId: transfer.trustTransferId,
    transferType: transfer.transferType,
    status: transfer.status,
    amount: transfer.amount,
    sourceClientId: transfer.sourceClientId,
    destinationClientId: transfer.destinationClientId,
    createdAt: transfer.createdAt,
  }));

  return {
    payload: { kind: "transfer_summary" as const, lines },
    sourceCounts: { transfers: lines.length },
    totals: {
      transferAmountTotal: lines.reduce((sum, line) => sum + line.amount, 0),
    },
    warnings: [],
  };
}

function buildReconciliationSummary(data: TrustReportingSourceData) {
  const period = data.input.reportingPeriod;
  const runs = filterReconciliationRuns(data.reconciliationRuns ?? [], period);
  const lines: TrustReconciliationSummaryLine[] = runs.map((run) => ({
    reconciliationId: run.reconciliationId,
    status: run.status,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    warningCount: run.warningCount,
    errorCount: run.errorCount,
    totalTransactions: run.totalTransactions,
  }));

  return {
    payload: { kind: "reconciliation_summary" as const, lines },
    sourceCounts: { reconciliationRuns: lines.length },
    totals: {
      varianceCount: lines.reduce(
        (sum, line) => sum + line.warningCount + line.errorCount,
        0,
      ),
    },
    warnings: lines.some((line) => line.errorCount > 0)
      ? ["One or more reconciliation runs contain errors"]
      : [],
  };
}

function filterJournalEntries(
  entries: readonly TrustJournalEntry[],
  period?: TrustReportingPeriod,
): readonly TrustJournalEntry[] {
  return [...entries]
    .filter((entry) => isWithinReportingPeriod(entry.entryDate, period))
    .sort(
      (a, b) =>
        a.entryDate.localeCompare(b.entryDate) ||
        a.journalEntryId.localeCompare(b.journalEntryId),
    );
}

function filterTransactions(
  transactions: readonly TrustTransaction[],
  period?: TrustReportingPeriod,
): readonly TrustTransaction[] {
  return [...transactions]
    .filter((tx) => isWithinReportingPeriod(tx.postingDate, period))
    .sort(
      (a, b) =>
        a.postingDate.localeCompare(b.postingDate) ||
        a.trustTransactionId.localeCompare(b.trustTransactionId),
    );
}

function filterAllocations(
  allocations: readonly TrustAllocation[],
  period?: TrustReportingPeriod,
): readonly TrustAllocation[] {
  return [...allocations]
    .filter((item) => isWithinReportingPeriod(item.allocationDate, period))
    .sort(
      (a, b) =>
        a.allocationDate.localeCompare(b.allocationDate) ||
        a.trustAllocationId.localeCompare(b.trustAllocationId),
    );
}

function filterInterestPostings(
  postings: readonly TrustInterestPosting[],
  period?: TrustReportingPeriod,
): readonly TrustInterestPosting[] {
  return [...postings]
    .filter((posting) => {
      if (!period?.start && !period?.end) {
        return true;
      }
      const start = period.start ?? posting.periodStart;
      const end = period.end ?? posting.periodEnd;
      return posting.periodStart <= end && posting.periodEnd >= start;
    })
    .sort(
      (a, b) =>
        a.periodStart.localeCompare(b.periodStart) ||
        a.trustInterestPostingId.localeCompare(b.trustInterestPostingId),
    );
}

function filterTransfers(
  transfers: readonly TrustTransfer[],
  period?: TrustReportingPeriod,
): readonly TrustTransfer[] {
  return [...transfers]
    .filter((transfer) =>
      isWithinReportingPeriod(transfer.createdAt.slice(0, 10), period),
    )
    .sort(
      (a, b) =>
        a.createdAt.localeCompare(b.createdAt) ||
        a.trustTransferId.localeCompare(b.trustTransferId),
    );
}

function filterReconciliationRuns(
  runs: readonly TrustReconciliationRun[],
  period?: TrustReportingPeriod,
): readonly TrustReconciliationRun[] {
  return [...runs]
    .filter((run) => isWithinReportingPeriod(run.startedAt.slice(0, 10), period))
    .sort(
      (a, b) =>
        a.startedAt.localeCompare(b.startedAt) ||
        a.reconciliationId.localeCompare(b.reconciliationId),
    );
}

function computeOpeningBalance(
  allocations: readonly TrustAllocation[],
  period?: TrustReportingPeriod,
): number {
  if (!period?.start) {
    return allocations.reduce((sum, item) => sum + signedAllocationAmount(item), 0);
  }
  return allocations
    .filter((item) => item.allocationDate < period.start!)
    .reduce((sum, item) => sum + signedAllocationAmount(item), 0);
}

function balanceSortKey(balance: TrustBalance): string {
  return [balance.scope, balance.clientId ?? "", balance.matterId ?? ""].join("|");
}
