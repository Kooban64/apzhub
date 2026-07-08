import { getTrustAllocationDiagnostics } from "./trust-allocation-diagnostics";
import { getTrustInterestDiagnostics } from "./trust-interest-diagnostics";
import { getTrustLedgerDiagnostics } from "./trust-ledger-diagnostics";
import { getTrustReconciliationDiagnostics } from "./trust-reconciliation-diagnostics";
import { getTrustReportingDiagnostics } from "./trust-reporting-diagnostics";
import { getTrustTransferDiagnostics } from "./trust-transfer-diagnostics";
import { getTrustTransactionWorkflowDiagnostics } from "./trust-transaction-workflow-diagnostics";
import type { TrustWorkbenchBundle } from "./shared-trust-workbench";
import { formatTrustAmount, formatTrustDate } from "./trust-format";
import {
  trustAccountsRoute,
  trustAllocationsRoute,
  trustInterestRoute,
  trustReconciliationRoute,
  trustReportsRoute,
  trustTransactionsRoute,
  trustTransfersRoute,
} from "./trust-routes";
import type { TrustReportType } from "./trust-reporting-types";

export interface TrustDashboardLinkItem {
  readonly title: string;
  readonly subtitle: string;
  readonly route: string;
}

export interface TrustDashboardSnapshot {
  readonly refreshedAt: string;
  readonly currency: string;
  readonly totalTrustBalance: number;
  readonly matterBalances: readonly {
    readonly matterId: string;
    readonly amount: number;
  }[];
  readonly clientBalances: readonly {
    readonly clientId: string;
    readonly amount: number;
  }[];
  readonly recentTransactions: readonly TrustDashboardLinkItem[];
  readonly pendingDraftCount: number;
  readonly reconciliationStatus: string;
  readonly lastReconciliationAt?: string;
  readonly interestPendingCount: number;
  readonly transferCount: number;
  readonly transferTotal: number;
  readonly reportShortcuts: readonly {
    readonly reportType: TrustReportType;
    readonly label: string;
    readonly route: string;
  }[];
  readonly quickActions: readonly TrustDashboardLinkItem[];
  readonly complianceAlertPlaceholder: string;
}

const REPORT_SHORTCUTS: readonly {
  readonly reportType: TrustReportType;
  readonly label: string;
}[] = [
  { reportType: "trial_balance", label: "Trial balance" },
  { reportType: "transactions", label: "Transactions" },
  { reportType: "reconciliation_summary", label: "Reconciliation summary" },
];

/** Trust dashboard snapshot from in-memory trust services (LAW-015-09). */
export function composeTrustDashboardSnapshot(
  bundle: TrustWorkbenchBundle,
): TrustDashboardSnapshot {
  const {
    tenantId,
    accountId,
    ledgerService,
    draftRepository,
    reconciliationService,
    interestService,
    transferService,
  } = bundle;

  const account = ledgerService.getAccount(tenantId, accountId)!;
  const balances = ledgerService.getBalances(tenantId, accountId);
  const accountBalance =
    balances.find((item) => item.scope === "account")?.balanceAmount ?? 0;
  const matterBalances = balances
    .filter((item) => item.scope === "matter" && item.matterId)
    .map((item) => ({ matterId: item.matterId!, amount: item.balanceAmount }));
  const clientBalances = balances
    .filter((item) => item.scope === "client" && item.clientId)
    .map((item) => ({ clientId: item.clientId!, amount: item.balanceAmount }));

  const transactions = ledgerService
    .listTransactions(tenantId, accountId)
    .slice()
    .sort((left, right) => right.postingDate.localeCompare(left.postingDate))
    .slice(0, 5);

  const pendingDrafts = draftRepository
    .listByAccount(tenantId, accountId)
    .filter((draft) => draft.status === "draft" || draft.status === "validated");

  const reconciliationRuns = reconciliationService.listRuns({
    tenantId,
    trustAccountId: accountId,
  });
  const latestReconciliation = reconciliationRuns[reconciliationRuns.length - 1];
  const interestPostings = interestService.listPostings({
    tenantId,
    trustAccountId: accountId,
  });
  const pendingInterest = interestPostings.filter(
    (posting) => posting.status === "draft" || posting.status === "approved",
  );
  const transfers = transferService.listTransfers({
    tenantId,
    trustAccountId: accountId,
  });
  const postedTransfers = transfers.filter((transfer) => transfer.status === "posted");

  return {
    refreshedAt: new Date().toISOString(),
    currency: account.currency,
    totalTrustBalance: accountBalance,
    matterBalances,
    clientBalances,
    recentTransactions: transactions.map((transaction) => ({
      title: transaction.transactionReference,
      subtitle: `${transaction.trustTransactionType} · ${formatTrustAmount(transaction.amount, transaction.currency)} · ${formatTrustDate(transaction.postingDate)}`,
      route: `${trustTransactionsRoute()}?q=${encodeURIComponent(transaction.transactionReference)}`,
    })),
    pendingDraftCount: pendingDrafts.length,
    reconciliationStatus: latestReconciliation?.status ?? "not_run",
    lastReconciliationAt:
      latestReconciliation?.completedAt ?? latestReconciliation?.startedAt,
    interestPendingCount: pendingInterest.length,
    transferCount: postedTransfers.length,
    transferTotal: postedTransfers.reduce((sum, transfer) => sum + transfer.amount, 0),
    reportShortcuts: REPORT_SHORTCUTS.map((item) => ({
      ...item,
      route: trustReportsRoute(),
    })),
    quickActions: [
      {
        title: "Trust accounts",
        subtitle: "View regulated trust bank accounts",
        route: trustAccountsRoute(),
      },
      {
        title: "Allocations",
        subtitle: "Client and matter sub-ledger",
        route: trustAllocationsRoute(),
      },
      {
        title: "Reconciliation",
        subtitle: "Ledger vs allocation control",
        route: trustReconciliationRoute(),
      },
      {
        title: "Interest",
        subtitle: "Accrual and posting workflow",
        route: trustInterestRoute(),
      },
      {
        title: "Transfers",
        subtitle: "Controlled fund movement",
        route: trustTransfersRoute(),
      },
    ],
    complianceAlertPlaceholder:
      "Compliance profile ZA-LPC — examiner alerts deferred to LAW-015-10.",
  };
}

export interface TrustDiagnosticsSnapshot {
  readonly ledgerRuns: number;
  readonly workflowRuns: number;
  readonly allocationRuns: number;
  readonly reconciliationRuns: number;
  readonly interestRuns: number;
  readonly transferRuns: number;
  readonly reportingRuns: number;
}

export function composeTrustDiagnosticsSnapshot(): TrustDiagnosticsSnapshot {
  return {
    ledgerRuns: getTrustLedgerDiagnostics().listRuns().length,
    workflowRuns: getTrustTransactionWorkflowDiagnostics().listRuns().length,
    allocationRuns: getTrustAllocationDiagnostics().listRuns().length,
    reconciliationRuns: getTrustReconciliationDiagnostics().listRuns().length,
    interestRuns: getTrustInterestDiagnostics().listRuns().length,
    transferRuns: getTrustTransferDiagnostics().listRuns().length,
    reportingRuns: getTrustReportingDiagnostics().listRuns().length,
  };
}
