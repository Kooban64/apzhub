export {
  TRUST_LEDGER_TRANSACTION_TYPES,
  TRUST_CHART_ACCOUNT_CODES,
  TRUST_TRANSACTION_STATUSES,
  TRUST_BALANCE_SCOPES,
  TRUST_LEDGER_DOMAIN_EVENTS,
} from "./trust-ledger-types";

export type {
  TrustLedgerTransactionType,
  TrustChartAccountCode,
  TrustTransactionStatus,
  TrustBalanceScope,
  TrustAdjustmentDirection,
  TrustAccount,
  TrustLedger,
  TrustJournal,
  TrustJournalEntry,
  TrustPosting,
  TrustTransaction,
  TrustBalance,
  OpenTrustAccountInput,
  PostTrustTransactionInput,
  ReverseTrustTransactionInput,
  TrustLedgerDomainEvent,
  TrustLedgerDomainEventId,
} from "./trust-ledger-types";

export {
  TRUST_LEDGER_ERROR_CODES,
  TrustLedgerError,
  isTrustLedgerError,
} from "./trust-ledger-errors";

export {
  buildPostingsForTransaction,
  invertPostings,
  sumDebits,
  sumCredits,
  isBalanced,
} from "./trust-ledger-posting-builder";

export {
  computeBalanceFromJournal,
  computeAllBalances,
  getAvailableBalance,
  assertSufficientBalance,
  balanceKey,
} from "./trust-ledger-balance";

export { InMemoryTrustLedgerRepository } from "./in-memory-trust-ledger-repository";

export {
  TrustLedgerService,
  verifyJournalIntegrity,
  recomputeBalancesFromJournal,
  type TrustLedgerServiceOptions,
  type TrustLedgerServiceResult,
} from "./trust-ledger-service";

export {
  TrustLedgerDiagnostics,
  getTrustLedgerDiagnostics,
  resetTrustLedgerDiagnostics,
  buildTrustLedgerDiagnosticsSnapshot,
  type TrustLedgerOperation,
  type TrustLedgerRunRecord,
} from "./trust-ledger-diagnostics";

export {
  InMemoryTrustLedgerEventBus,
  type TrustLedgerEventHandler,
} from "./trust-ledger-events";

export { createTrustId, resetTrustIdCounter } from "./trust-id";

export {
  TRUST_DRAFT_STATUSES,
  TRUST_AUDIT_ACTIONS,
  TRUST_WORKFLOW_DOMAIN_EVENTS,
} from "./trust-transaction-workflow-types";

export type {
  TrustDraftStatus,
  TrustTransactionDraft,
  TrustTransactionAuditRecord,
  TrustAuditAction,
  TrustAuditTrailCriteria,
  CreateTrustTransactionDraftInput,
  UpdateTrustTransactionDraftInput,
  PostTrustTransactionDraftInput,
  RequestTrustReversalInput,
  PostTrustReversalInput,
  TrustTransactionWorkflowResult,
  TrustWorkflowDomainEvent,
  TrustWorkflowDomainEventId,
  IdempotencyRecord,
} from "./trust-transaction-workflow-types";

export {
  TRUST_WORKFLOW_ERROR_CODES,
  TrustWorkflowError,
  isTrustWorkflowError,
} from "./trust-transaction-workflow-errors";

export { TrustTransactionValidator } from "./trust-transaction-validator";
export type {
  TrustDraftValidationInput,
  TrustDraftValidationResult,
} from "./trust-transaction-validator";

export type { TrustTransactionDraftRepository } from "./trust-transaction-draft-repository";
export { InMemoryTrustTransactionDraftRepository } from "./in-memory-trust-transaction-draft-repository";

export type { TrustTransactionAuditRepository } from "./trust-transaction-audit-repository";
export { InMemoryTrustTransactionAuditRepository } from "./in-memory-trust-transaction-audit-repository";

export {
  InMemoryTrustTransactionWorkflowEventBus,
  InMemoryTrustIdempotencyStore,
  type TrustWorkflowEventHandler,
} from "./trust-transaction-workflow-events";

export {
  TrustTransactionWorkflowService,
  createTrustTransactionWorkflowFixture,
  type TrustTransactionWorkflowServiceOptions,
} from "./trust-transaction-workflow-service";

export {
  TrustTransactionWorkflowDiagnostics,
  getTrustTransactionWorkflowDiagnostics,
  resetTrustTransactionWorkflowDiagnostics,
  type TrustTransactionWorkflowOperation,
  type TrustTransactionWorkflowRunRecord,
} from "./trust-transaction-workflow-diagnostics";

export {
  TRUST_ALLOCATION_TYPES,
  TRUST_ALLOCATION_EFFECTS,
  TRUST_ALLOCATION_DOMAIN_EVENTS,
} from "./trust-allocation-types";

export type {
  TrustAllocationType,
  TrustAllocationEffect,
  TrustAllocation,
  TrustAllocationLineInput,
  AllocateTrustTransactionInput,
  AdjustTrustAllocationsInput,
  ReverseTrustAllocationsInput,
  TrustAllocationHistoryCriteria,
  TrustAllocationSummary,
  TrustAllocatedBalanceProjection,
  TrustAllocationDomainEvent,
  TrustAllocationDomainEventId,
  TrustAllocationServiceResult,
  TrustAllocationOperation,
  TrustAllocationRunRecord,
} from "./trust-allocation-types";

export {
  TRUST_ALLOCATION_ERROR_CODES,
  TrustAllocationError,
  isTrustAllocationError,
} from "./trust-allocation-errors";

export {
  TrustAllocationValidator,
  findTrustTransaction,
  resolveLineAllocationType,
  transactionAllocationEffect,
} from "./trust-allocation-validator";

export type {
  TrustAllocationValidationInput,
  TrustAllocationValidationResult,
} from "./trust-allocation-validator";

export type { TrustAllocationRepository } from "./trust-allocation-repository";
export { InMemoryTrustAllocationRepository } from "./in-memory-trust-allocation-repository";

export {
  signedAllocationAmount,
  sumAllocatedForTransaction,
  buildTransactionAllocationSummary,
  computeClientAllocatedBalance,
  computeMatterAllocatedBalance,
  computeUnallocatedBalance,
} from "./trust-allocation-balance";

export {
  InMemoryTrustAllocationEventBus,
  type TrustAllocationEventHandler,
} from "./trust-allocation-events";

export {
  TrustAllocationDiagnostics,
  getTrustAllocationDiagnostics,
  resetTrustAllocationDiagnostics,
  buildTrustAllocationDiagnosticsSnapshot,
} from "./trust-allocation-diagnostics";

export {
  TrustAllocationService,
  createTrustAllocationFixture,
  type TrustAllocationServiceOptions,
} from "./trust-allocation-service";

export {
  TRUST_RECONCILIATION_VARIANCE_CATEGORIES,
  TRUST_RECONCILIATION_VARIANCE_TYPES,
  TRUST_RECONCILIATION_RUN_STATUSES,
  TRUST_RECONCILIATION_DOMAIN_EVENTS,
} from "./trust-reconciliation-types";

export type {
  TrustReconciliationVarianceCategory,
  TrustReconciliationVarianceType,
  TrustReconciliationRunStatus,
  TrustReconciliationVariance,
  TrustReconciliationBalanceSummary,
  TrustReconciliationRun,
  TrustReconciliationResult,
  RunTrustReconciliationInput,
  TrustReconciliationHistoryCriteria,
  TrustReconciliationDomainEvent,
  TrustReconciliationDomainEventId,
  TrustReconciliationServiceResult,
  TrustReconciliationAccountSummary,
  TrustReconciliationRunRecord,
} from "./trust-reconciliation-types";

export {
  TRUST_RECONCILIATION_ERROR_CODES,
  TrustReconciliationError,
  isTrustReconciliationError,
} from "./trust-reconciliation-errors";

export type { TrustReconciliationRepository } from "./trust-reconciliation-repository";
export { InMemoryTrustReconciliationRepository } from "./in-memory-trust-reconciliation-repository";

export { runTrustReconciliationChecks } from "./trust-reconciliation-engine";
export type {
  TrustReconciliationEngineInput,
  TrustReconciliationEngineOutput,
} from "./trust-reconciliation-engine";

export {
  InMemoryTrustReconciliationEventBus,
  type TrustReconciliationEventHandler,
} from "./trust-reconciliation-events";

export {
  TrustReconciliationDiagnostics,
  getTrustReconciliationDiagnostics,
  resetTrustReconciliationDiagnostics,
  buildReconciliationDiagnosticsSnapshot,
} from "./trust-reconciliation-diagnostics";

export {
  TrustReconciliationService,
  createTrustReconciliationFixture,
  type TrustReconciliationServiceOptions,
} from "./trust-reconciliation-service";

export {
  TRUST_INTEREST_ACCRUAL_METHODS,
  TRUST_INTEREST_POSTING_FREQUENCIES,
  TRUST_INTEREST_POSTING_STATUSES,
  TRUST_INTEREST_DOMAIN_EVENTS,
} from "./trust-interest-types";

export type {
  TrustInterestAccrualMethod,
  TrustInterestPostingFrequency,
  TrustInterestPostingStatus,
  TrustInterestRule,
  TrustInterestAccrualLine,
  TrustInterestPosting,
  TrustInterestBalanceProjection,
  CreateTrustInterestRuleInput,
  RunTrustInterestAccrualInput,
  ApproveTrustInterestPostingInput,
  PostTrustInterestPostingInput,
  TrustInterestPostingHistoryCriteria,
  TrustInterestDomainEvent,
  TrustInterestDomainEventId,
  TrustInterestOperation,
  TrustInterestRunRecord,
  TrustInterestServiceResult,
  TrustInterestAccrualResult,
  TrustInterestPostResult,
} from "./trust-interest-types";

export {
  TRUST_INTEREST_ERROR_CODES,
  TrustInterestError,
  isTrustInterestError,
} from "./trust-interest-errors";

export {
  calculateInterestAmount,
  collectInterestBalanceProjections,
  countDaysInclusive,
  countMonthsInclusive,
  runTrustInterestAccrual,
  validateInterestPeriod,
} from "./trust-interest-engine";

export type {
  TrustInterestEngineInput,
  TrustInterestEngineOutput,
} from "./trust-interest-engine";

export type { TrustInterestRuleRepository } from "./trust-interest-rule-repository";
export { InMemoryTrustInterestRuleRepository } from "./in-memory-trust-interest-rule-repository";

export type { TrustInterestPostingRepository } from "./trust-interest-posting-repository";
export { InMemoryTrustInterestPostingRepository } from "./in-memory-trust-interest-posting-repository";

export {
  InMemoryTrustInterestEventBus,
  type TrustInterestEventHandler,
} from "./trust-interest-events";

export {
  TrustInterestDiagnostics,
  getTrustInterestDiagnostics,
  resetTrustInterestDiagnostics,
  buildTrustInterestDiagnosticsSnapshot,
} from "./trust-interest-diagnostics";

export {
  TrustInterestService,
  createTrustInterestFixture,
  type TrustInterestServiceOptions,
} from "./trust-interest-service";

export {
  TRUST_TRANSFER_TYPES,
  TRUST_TRANSFER_STATUSES,
  TRUST_TRANSFER_DOMAIN_EVENTS,
} from "./trust-transfer-types";

export type {
  TrustTransferType,
  TrustTransferStatus,
  TrustTransfer,
  CreateTrustTransferDraftInput,
  ApproveTrustTransferInput,
  PostTrustTransferInput,
  ReverseTrustTransferInput,
  CancelTrustTransferDraftInput,
  TrustTransferHistoryCriteria,
  TrustTransferValidationResult,
  TrustTransferDomainEvent,
  TrustTransferDomainEventId,
  TrustTransferOperation,
  TrustTransferRunRecord,
  TrustTransferServiceResult,
  TrustTransferPostResult,
} from "./trust-transfer-types";

export {
  TRUST_TRANSFER_ERROR_CODES,
  TrustTransferError,
  isTrustTransferError,
} from "./trust-transfer-errors";

export { TrustTransferValidator, inferTransferType } from "./trust-transfer-validator";

export type { TrustTransferRepository } from "./trust-transfer-repository";
export { InMemoryTrustTransferRepository } from "./in-memory-trust-transfer-repository";

export {
  InMemoryTrustTransferEventBus,
  type TrustTransferEventHandler,
} from "./trust-transfer-events";

export {
  TrustTransferDiagnostics,
  getTrustTransferDiagnostics,
  resetTrustTransferDiagnostics,
  buildTrustTransferDiagnosticsSnapshot,
} from "./trust-transfer-diagnostics";

export {
  TrustTransferService,
  createTrustTransferFixture,
  type TrustTransferServiceOptions,
} from "./trust-transfer-service";

export {
  TRUST_REPORT_TYPES,
  TRUST_REPORTING_DOMAIN_EVENTS,
} from "./trust-reporting-types";

export type {
  TrustReportType,
  TrustReport,
  TrustReportingPeriod,
  TrustReportSourceCounts,
  TrustReportTotals,
  TrustReportPayload,
  GenerateTrustReportInput,
  TrustReportHistoryCriteria,
  TrustReportingDomainEvent,
  TrustReportingDomainEventId,
  TrustReportingRunRecord,
  TrustReportingServiceResult,
} from "./trust-reporting-types";

export {
  TRUST_REPORTING_ERROR_CODES,
  TrustReportingError,
  isTrustReportingError,
} from "./trust-reporting-errors";

export {
  buildTrustReportPayload,
  validateReportingPeriod,
  isWithinReportingPeriod,
} from "./trust-reporting-engine";

export type { TrustReportingSourceData } from "./trust-reporting-engine";

export type { TrustReportRepository } from "./trust-report-repository";
export { InMemoryTrustReportRepository } from "./in-memory-trust-report-repository";

export {
  InMemoryTrustReportingEventBus,
  type TrustReportingEventHandler,
} from "./trust-reporting-events";

export {
  TrustReportingDiagnostics,
  getTrustReportingDiagnostics,
  resetTrustReportingDiagnostics,
} from "./trust-reporting-diagnostics";

export {
  TrustReportingService,
  createTrustReportingFixture,
  type TrustReportingServiceOptions,
} from "./trust-reporting-service";

export {
  TRUST_REPORT_EXPORT_FORMATS,
  TRUST_REPORT_EXPORT_PLACEHOLDER_FORMATS,
  buildTrustReportExportFilename,
  downloadTrustReportCsv,
  exportTrustReport,
  exportTrustReportToCsv,
  exportTrustReportToHtml,
  isTrustReportExportPlaceholderFormat,
  normalizeTrustReportExportFormat,
  openTrustReportPrintView,
  type TrustReportExportArtifact,
  type TrustReportExportFormat,
  type TrustReportExportPlaceholderFormat,
  type TrustReportExportRequestFormat,
} from "./trust-report-export";

export {
  TRUST_APPROVAL_TYPES,
  TRUST_APPROVAL_STATUSES,
  TRUST_APPROVAL_RULE_MODES,
  TRUST_APPROVAL_HISTORY_ACTIONS,
  TRUST_APPROVAL_DOMAIN_EVENTS,
} from "./trust-approval-types";

export type {
  TrustApprovalType,
  TrustApprovalStatus,
  TrustApprovalRuleMode,
  TrustApprovalHistoryAction,
  TrustApprovalRule,
  TrustApprovalDecision,
  TrustApprovalRequest,
  TrustApprovalHistoryRecord,
  CreateTrustApprovalRuleInput,
  SubmitTrustApprovalInput,
  ApproveTrustApprovalInput,
  RejectTrustApprovalInput,
  CancelTrustApprovalInput,
  MarkTrustApprovalPostedInput,
  TrustApprovalListCriteria,
  TrustApprovalValidationResult,
  TrustApprovalDomainEvent,
  TrustApprovalDomainEventId,
  TrustApprovalOperation,
  TrustApprovalRunRecord,
  TrustApprovalServiceResult,
  TrustApprovalDiagnosticsSnapshot,
} from "./trust-approval-types";

export {
  TRUST_APPROVAL_ERROR_CODES,
  TrustApprovalError,
  isTrustApprovalError,
} from "./trust-approval-errors";

export type { TrustApprovalRepository } from "./trust-approval-repository";
export { InMemoryTrustApprovalRepository } from "./in-memory-trust-approval-repository";

export { TrustApprovalValidator } from "./trust-approval-validator";

export {
  InMemoryTrustApprovalEventBus,
  type TrustApprovalEventHandler,
} from "./trust-approval-events";

export {
  TrustApprovalDiagnostics,
  getTrustApprovalDiagnostics,
  resetTrustApprovalDiagnostics,
} from "./trust-approval-diagnostics";

export {
  TrustApprovalService,
  createTrustApprovalFixture,
  type TrustApprovalServiceOptions,
} from "./trust-approval-service";

export {
  assertTrustApprovalForPost,
  assertTrustApprovalForDomainApprove,
  markTrustApprovalPosted,
  TRUST_APPROVAL_TYPE_BY_DOMAIN,
} from "./trust-approval-gate";
