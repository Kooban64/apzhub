/** Trust Reporting domain types (LAW-015-08). In-memory read-only projections. */

export const TRUST_REPORT_TYPES = [
  "trial_balance",
  "ledger",
  "journal",
  "transactions",
  "client_statement",
  "matter_statement",
  "allocation_summary",
  "interest_summary",
  "transfer_summary",
  "reconciliation_summary",
] as const;

export type TrustReportType = (typeof TRUST_REPORT_TYPES)[number];

export interface TrustReportingPeriod {
  readonly start?: string;
  readonly end?: string;
}

export interface TrustReportSourceCounts {
  readonly accounts?: number;
  readonly journalEntries?: number;
  readonly transactions?: number;
  readonly allocations?: number;
  readonly interestPostings?: number;
  readonly transfers?: number;
  readonly reconciliationRuns?: number;
  readonly auditRecords?: number;
}

export interface TrustReportTotals {
  readonly debitTotal?: number;
  readonly creditTotal?: number;
  readonly transactionAmountTotal?: number;
  readonly allocationAmountTotal?: number;
  readonly interestAmountTotal?: number;
  readonly transferAmountTotal?: number;
  readonly varianceCount?: number;
}

export interface TrustReportDiagnosticsSnapshot {
  readonly generationDurationMs: number;
  readonly warnings: readonly string[];
}

export interface TrustTrialBalanceLine {
  readonly scope: string;
  readonly clientId?: string;
  readonly matterId?: string;
  readonly balanceAmount: number;
  readonly currency: string;
}

export interface TrustJournalReportLine {
  readonly journalEntryId: string;
  readonly journalReference: string;
  readonly entryDate: string;
  readonly trustTransactionId: string;
  readonly debitTotal: number;
  readonly creditTotal: number;
  readonly lineCount: number;
}

export interface TrustTransactionReportLine {
  readonly trustTransactionId: string;
  readonly transactionReference: string;
  readonly trustTransactionType: string;
  readonly amount: number;
  readonly currency: string;
  readonly transactionDate: string;
  readonly postingDate: string;
  readonly clientId: string;
  readonly matterId?: string;
  readonly status: string;
  readonly narrative: string;
}

export interface TrustStatementLine {
  readonly lineDate: string;
  readonly lineType: "transaction" | "allocation";
  readonly reference: string;
  readonly description: string;
  readonly amount: number;
  readonly effect?: string;
}

export interface TrustAllocationSummaryLine {
  readonly trustAllocationId: string;
  readonly trustTransactionId: string;
  readonly clientId: string;
  readonly matterId?: string;
  readonly amount: number;
  readonly effect: string;
  readonly allocationType: string;
  readonly allocationDate: string;
}

export interface TrustInterestSummaryLine {
  readonly trustInterestPostingId: string;
  readonly status: string;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly totalInterestAmount: number;
  readonly lineCount: number;
}

export interface TrustTransferSummaryLine {
  readonly trustTransferId: string;
  readonly transferType: string;
  readonly status: string;
  readonly amount: number;
  readonly sourceClientId: string;
  readonly destinationClientId: string;
  readonly createdAt: string;
}

export interface TrustReconciliationSummaryLine {
  readonly reconciliationId: string;
  readonly status: string;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly warningCount: number;
  readonly errorCount: number;
  readonly totalTransactions: number;
}

export type TrustReportPayload =
  | { readonly kind: "trial_balance"; readonly lines: readonly TrustTrialBalanceLine[] }
  | {
      readonly kind: "ledger";
      readonly ledger: {
        readonly openedAt: string;
        readonly entryCount: number;
        readonly transactionCount: number;
      };
    }
  | { readonly kind: "journal"; readonly lines: readonly TrustJournalReportLine[] }
  | {
      readonly kind: "transactions";
      readonly lines: readonly TrustTransactionReportLine[];
    }
  | {
      readonly kind: "client_statement";
      readonly clientId: string;
      readonly openingBalance: number;
      readonly closingBalance: number;
      readonly lines: readonly TrustStatementLine[];
    }
  | {
      readonly kind: "matter_statement";
      readonly clientId: string;
      readonly matterId: string;
      readonly openingBalance: number;
      readonly closingBalance: number;
      readonly lines: readonly TrustStatementLine[];
    }
  | {
      readonly kind: "allocation_summary";
      readonly lines: readonly TrustAllocationSummaryLine[];
    }
  | {
      readonly kind: "interest_summary";
      readonly lines: readonly TrustInterestSummaryLine[];
    }
  | {
      readonly kind: "transfer_summary";
      readonly lines: readonly TrustTransferSummaryLine[];
    }
  | {
      readonly kind: "reconciliation_summary";
      readonly lines: readonly TrustReconciliationSummaryLine[];
    };

/** Immutable generated trust report read model. */
export interface TrustReport {
  readonly reportId: string;
  readonly reportType: TrustReportType;
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly generatedAt: string;
  readonly generatedByUserId: string;
  readonly reportingPeriod: TrustReportingPeriod;
  readonly sourceCounts: TrustReportSourceCounts;
  readonly totals: TrustReportTotals;
  readonly diagnostics: TrustReportDiagnosticsSnapshot;
  readonly payload: TrustReportPayload;
}

export interface GenerateTrustReportInput {
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly reportType: TrustReportType;
  readonly reportingPeriod?: TrustReportingPeriod;
  readonly clientId?: string;
  readonly matterId?: string;
  readonly generatedByUserId: string;
}

export interface TrustReportHistoryCriteria {
  readonly tenantId: string;
  readonly trustAccountId?: string;
  readonly reportType?: TrustReportType;
}

export const TRUST_REPORTING_DOMAIN_EVENTS = ["legal.trust.report.generated"] as const;

export type TrustReportingDomainEventId =
  (typeof TRUST_REPORTING_DOMAIN_EVENTS)[number];

export interface TrustReportingDomainEvent {
  readonly eventId: TrustReportingDomainEventId;
  readonly occurredAt: string;
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly payload: Readonly<Record<string, unknown>>;
}

export type TrustReportingOperation = "generateReport";

export interface TrustReportingRunRecord {
  readonly operation: TrustReportingOperation;
  readonly startedAt: string;
  readonly durationMs: number;
  readonly ok: boolean;
  readonly reportType: TrustReportType;
  readonly reportId?: string;
  readonly errorCode?: string;
  readonly errorMessage?: string;
}

export interface TrustReportingServiceResult<T = TrustReport> {
  readonly ok: boolean;
  readonly data?: T;
  readonly error?: { readonly code: string; readonly message: string };
  readonly run: TrustReportingRunRecord;
}
