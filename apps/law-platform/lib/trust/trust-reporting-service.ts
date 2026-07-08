import type { InMemoryTrustReportRepository } from "./in-memory-trust-report-repository";
import { InMemoryTrustReportRepository as InMemoryTrustReportRepositoryClass } from "./in-memory-trust-report-repository";
import { InMemoryTrustTransactionAuditRepository } from "./in-memory-trust-transaction-audit-repository";
import { InMemoryTrustTransactionDraftRepository } from "./in-memory-trust-transaction-draft-repository";
import type { TrustAllocationService } from "./trust-allocation-service";
import { InMemoryTrustInterestPostingRepository } from "./in-memory-trust-interest-posting-repository";
import { InMemoryTrustInterestRuleRepository } from "./in-memory-trust-interest-rule-repository";
import { InMemoryTrustTransferRepository } from "./in-memory-trust-transfer-repository";
import { TrustInterestService } from "./trust-interest-service";
import type { TrustLedgerService } from "./trust-ledger-service";
import type { TrustReconciliationService } from "./trust-reconciliation-service";
import { createTrustReconciliationFixture } from "./trust-reconciliation-service";
import type { TrustTransactionWorkflowService } from "./trust-transaction-workflow-service";
import { TrustTransactionWorkflowService as TrustTransactionWorkflowServiceClass } from "./trust-transaction-workflow-service";
import { TrustTransferService } from "./trust-transfer-service";
import { createTrustId } from "./trust-id";
import { finalizeReportingRun } from "./trust-reporting-diagnostics";
import { InMemoryTrustReportingEventBus } from "./trust-reporting-events";
import {
  TRUST_REPORTING_ERROR_CODES,
  TrustReportingError,
  isTrustReportingError,
} from "./trust-reporting-errors";
import {
  buildTrustReportPayload,
  validateReportingPeriod,
  type TrustReportingSourceData,
} from "./trust-reporting-engine";
import type {
  GenerateTrustReportInput,
  TrustReport,
  TrustReportHistoryCriteria,
  TrustReportType,
  TrustReportingDomainEvent,
  TrustReportingServiceResult,
} from "./trust-reporting-types";
import { TRUST_REPORT_TYPES } from "./trust-reporting-types";

export interface TrustReportingServiceOptions {
  readonly ledgerService: TrustLedgerService;
  readonly workflowService: TrustTransactionWorkflowService;
  readonly allocationService: TrustAllocationService;
  readonly reconciliationService: TrustReconciliationService;
  readonly interestService: TrustInterestService;
  readonly transferService: TrustTransferService;
  readonly reportRepository: InMemoryTrustReportRepository;
  readonly eventBus?: InMemoryTrustReportingEventBus;
}

/** Trust Reporting Engine — read-only projections from accounting services (LAW-015-08). */
export class TrustReportingService {
  private readonly ledgerService: TrustLedgerService;
  private readonly workflowService: TrustTransactionWorkflowService;
  private readonly allocationService: TrustAllocationService;
  private readonly reconciliationService: TrustReconciliationService;
  private readonly interestService: TrustInterestService;
  private readonly transferService: TrustTransferService;
  private readonly reportRepository: InMemoryTrustReportRepository;
  private readonly eventBus: InMemoryTrustReportingEventBus;

  constructor(options: TrustReportingServiceOptions) {
    this.ledgerService = options.ledgerService;
    this.workflowService = options.workflowService;
    this.allocationService = options.allocationService;
    this.reconciliationService = options.reconciliationService;
    this.interestService = options.interestService;
    this.transferService = options.transferService;
    this.reportRepository = options.reportRepository;
    this.eventBus = options.eventBus ?? new InMemoryTrustReportingEventBus();
  }

  getEventBus(): InMemoryTrustReportingEventBus {
    return this.eventBus;
  }

  generateReport(input: GenerateTrustReportInput): TrustReportingServiceResult {
    const startedAt = performance.now();

    try {
      this.validateInput(input);
      const account = this.ledgerService.getAccount(
        input.tenantId,
        input.trustAccountId,
      );
      if (!account) {
        throw new TrustReportingError(
          TRUST_REPORTING_ERROR_CODES.TRUST_REPORTING_ACCOUNT_NOT_FOUND,
          "Trust account not found",
        );
      }
      if (account.tenantId !== input.tenantId) {
        throw new TrustReportingError(
          TRUST_REPORTING_ERROR_CODES.TRUST_REPORTING_TENANT_MISMATCH,
          "Tenant scope mismatch",
        );
      }

      const sourceData = this.collectSourceData(input, account.currency);
      const built = buildTrustReportPayload(sourceData);
      const generatedAt = new Date().toISOString();
      const report: TrustReport = Object.freeze({
        reportId: createTrustId("rpt"),
        reportType: input.reportType,
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        generatedAt,
        generatedByUserId: input.generatedByUserId,
        reportingPeriod: input.reportingPeriod ?? {},
        sourceCounts: built.sourceCounts,
        totals: built.totals,
        diagnostics: {
          generationDurationMs: performance.now() - startedAt,
          warnings: built.warnings,
        },
        payload: built.payload,
      });

      this.reportRepository.save(report);

      this.publishEvent({
        eventId: "legal.trust.report.generated",
        occurredAt: generatedAt,
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        payload: {
          reportId: report.reportId,
          reportType: report.reportType,
          generatedByUserId: input.generatedByUserId,
        },
      });

      return {
        ok: true,
        data: report,
        run: finalizeReportingRun("generateReport", startedAt, true, input.reportType, {
          reportId: report.reportId,
        }),
      };
    } catch (error) {
      const mapped = mapReportingError(error);
      return {
        ok: false,
        error: mapped,
        run: finalizeReportingRun(
          "generateReport",
          startedAt,
          false,
          input.reportType,
          {
            errorCode: mapped.code,
            errorMessage: mapped.message,
          },
        ),
      };
    }
  }

  getReport(tenantId: string, reportId: string): TrustReport | undefined {
    return this.reportRepository.getById(tenantId, reportId);
  }

  listReports(criteria: TrustReportHistoryCriteria): readonly TrustReport[] {
    return this.reportRepository.list(criteria);
  }

  private validateInput(input: GenerateTrustReportInput): void {
    if (!TRUST_REPORT_TYPES.includes(input.reportType)) {
      throw new TrustReportingError(
        TRUST_REPORTING_ERROR_CODES.TRUST_REPORTING_INVALID_TYPE,
        `Unsupported report type: ${input.reportType}`,
      );
    }

    if (!validateReportingPeriod(input.reportingPeriod)) {
      throw new TrustReportingError(
        TRUST_REPORTING_ERROR_CODES.TRUST_REPORTING_INVALID_PERIOD,
        "Invalid reporting period",
      );
    }

    if (input.reportType === "client_statement" && !input.clientId?.trim()) {
      throw new TrustReportingError(
        TRUST_REPORTING_ERROR_CODES.TRUST_REPORTING_CLIENT_REQUIRED,
        "Client id is required for client statement",
      );
    }

    if (input.reportType === "matter_statement") {
      if (!input.clientId?.trim()) {
        throw new TrustReportingError(
          TRUST_REPORTING_ERROR_CODES.TRUST_REPORTING_CLIENT_REQUIRED,
          "Client id is required for matter statement",
        );
      }
      if (!input.matterId?.trim()) {
        throw new TrustReportingError(
          TRUST_REPORTING_ERROR_CODES.TRUST_REPORTING_MATTER_REQUIRED,
          "Matter id is required for matter statement",
        );
      }
    }
  }

  private collectSourceData(
    input: GenerateTrustReportInput,
    currency: string,
  ): TrustReportingSourceData {
    const { tenantId, trustAccountId } = input;
    let source: TrustReportingSourceData = { input, currency };

    const needsLedger = needsReport(input.reportType, [
      "trial_balance",
      "ledger",
      "journal",
      "transactions",
      "client_statement",
      "matter_statement",
    ]);

    if (needsLedger) {
      const ledger = this.ledgerService.getLedger(tenantId, trustAccountId);
      source = {
        ...source,
        ledgerMeta: ledger
          ? {
              openedAt: ledger.openedAt,
              entryCount: ledger.entryCount,
              transactionCount: ledger.transactionCount,
            }
          : { openedAt: "", entryCount: 0, transactionCount: 0 },
      };
    }

    if (needsReport(input.reportType, ["trial_balance"])) {
      source = {
        ...source,
        balances: this.ledgerService.getBalances(tenantId, trustAccountId),
      };
    }

    if (needsReport(input.reportType, ["journal"])) {
      source = {
        ...source,
        journalEntries: this.ledgerService.getJournal(tenantId, trustAccountId).entries,
      };
    }

    if (
      needsReport(input.reportType, [
        "transactions",
        "client_statement",
        "matter_statement",
      ])
    ) {
      source = {
        ...source,
        transactions: this.ledgerService.listTransactions(tenantId, trustAccountId),
        auditRecordCount: this.workflowService.lookupAuditTrail({
          tenantId,
          trustAccountId,
        }).length,
      };
    }

    if (
      needsReport(input.reportType, [
        "allocation_summary",
        "client_statement",
        "matter_statement",
      ])
    ) {
      source = {
        ...source,
        allocations: this.allocationService.getAllocationHistory({
          tenantId,
          trustAccountId,
        }),
      };
    }

    if (needsReport(input.reportType, ["interest_summary"])) {
      source = {
        ...source,
        interestPostings: this.interestService.listPostings({
          tenantId,
          trustAccountId,
        }),
      };
    }

    if (needsReport(input.reportType, ["transfer_summary"])) {
      source = {
        ...source,
        transfers: this.transferService.listTransfers({ tenantId, trustAccountId }),
      };
    }

    if (needsReport(input.reportType, ["reconciliation_summary"])) {
      source = {
        ...source,
        reconciliationRuns: this.reconciliationService.listRuns({
          tenantId,
          trustAccountId,
        }),
      };
    }

    return source;
  }

  private publishEvent(event: TrustReportingDomainEvent): void {
    this.eventBus.publish(event);
  }
}

function needsReport(
  reportType: TrustReportType,
  allowed: readonly TrustReportType[],
): boolean {
  return allowed.includes(reportType);
}

function mapReportingError(error: unknown): { code: string; message: string } {
  if (isTrustReportingError(error)) {
    return { code: error.code, message: error.message };
  }
  return {
    code: TRUST_REPORTING_ERROR_CODES.TRUST_REPORTING_FAILED,
    message: error instanceof Error ? error.message : "Unknown reporting error",
  };
}

export function createTrustReportingFixture(): {
  readonly reportingService: TrustReportingService;
  readonly ledgerService: TrustLedgerService;
  readonly allocationService: TrustAllocationService;
  readonly reconciliationService: TrustReconciliationService;
  readonly interestService: TrustInterestService;
  readonly transferService: TrustTransferService;
  readonly eventBus: InMemoryTrustReportingEventBus;
  readonly accountId: string;
} {
  const recon = createTrustReconciliationFixture();

  const interestService = new TrustInterestService({
    ledgerRepository: recon.ledgerRepository,
    allocationRepository: recon.allocationRepository,
    ruleRepository: new InMemoryTrustInterestRuleRepository(),
    postingRepository: new InMemoryTrustInterestPostingRepository(),
    ledgerService: recon.ledgerService,
    allocationService: recon.allocationService,
  });

  const transferService = new TrustTransferService({
    ledgerRepository: recon.ledgerRepository,
    allocationRepository: recon.allocationRepository,
    transferRepository: new InMemoryTrustTransferRepository(),
    ledgerService: recon.ledgerService,
    allocationService: recon.allocationService,
  });

  const workflowService = new TrustTransactionWorkflowServiceClass({
    ledgerService: recon.ledgerService,
    ledgerRepository: recon.ledgerRepository,
    draftRepository: new InMemoryTrustTransactionDraftRepository(),
    auditRepository: new InMemoryTrustTransactionAuditRepository(),
  });

  const reportRepository = new InMemoryTrustReportRepositoryClass();
  const eventBus = new InMemoryTrustReportingEventBus();

  const reportingService = new TrustReportingService({
    ledgerService: recon.ledgerService,
    workflowService,
    allocationService: recon.allocationService,
    reconciliationService: recon.reconciliationService,
    interestService,
    transferService,
    reportRepository,
    eventBus,
  });

  return {
    reportingService,
    ledgerService: recon.ledgerService,
    allocationService: recon.allocationService,
    reconciliationService: recon.reconciliationService,
    interestService,
    transferService,
    eventBus,
    accountId: recon.accountId,
  };
}
