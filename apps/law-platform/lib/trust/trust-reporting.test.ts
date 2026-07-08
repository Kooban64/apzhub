import { beforeEach, describe, expect, it } from "vitest";

import {
  getTrustReportingDiagnostics,
  resetTrustReportingDiagnostics,
} from "./trust-reporting-diagnostics";
import { TRUST_REPORT_TYPES } from "./trust-reporting-types";
import {
  TrustReportingService,
  createTrustReportingFixture,
} from "./trust-reporting-service";
import { resetTrustIdCounter } from "./trust-id";
import { resetTrustAllocationDiagnostics } from "./trust-allocation-diagnostics";
import { resetTrustLedgerDiagnostics } from "./trust-ledger-diagnostics";
import { resetTrustReconciliationDiagnostics } from "./trust-reconciliation-diagnostics";
import { resetTrustInterestDiagnostics } from "./trust-interest-diagnostics";
import { resetTrustTransferDiagnostics } from "./trust-transfer-diagnostics";

const TENANT_A = "tenant-test";
const TENANT_B = "tenant-other";
const CLIENT = "client-001";
const MATTER_1 = "matter-001";
const MATTER_2 = "matter-002";
const ACTOR = "user-001";

describe("TrustReportingService", () => {
  let reportingService: TrustReportingService;
  let accountId: string;
  let ledgerService: ReturnType<typeof createTrustReportingFixture>["ledgerService"];
  let allocationService: ReturnType<
    typeof createTrustReportingFixture
  >["allocationService"];
  let reconciliationService: ReturnType<
    typeof createTrustReportingFixture
  >["reconciliationService"];
  let interestService: ReturnType<
    typeof createTrustReportingFixture
  >["interestService"];
  let transferService: ReturnType<
    typeof createTrustReportingFixture
  >["transferService"];
  let eventBus: ReturnType<typeof createTrustReportingFixture>["eventBus"];

  beforeEach(() => {
    resetTrustIdCounter();
    resetTrustLedgerDiagnostics();
    resetTrustAllocationDiagnostics();
    resetTrustReconciliationDiagnostics();
    resetTrustInterestDiagnostics();
    resetTrustTransferDiagnostics();
    resetTrustReportingDiagnostics();

    const fixture = createTrustReportingFixture();
    reportingService = fixture.reportingService;
    ledgerService = fixture.ledgerService;
    allocationService = fixture.allocationService;
    reconciliationService = fixture.reconciliationService;
    interestService = fixture.interestService;
    transferService = fixture.transferService;
    eventBus = fixture.eventBus;
    accountId = fixture.accountId;

    seedData();
  });

  function seedData() {
    const deposit = ledgerService.postTransaction({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      trustTransactionType: "deposit",
      amount: 1000,
      currency: "ZAR",
      transactionDate: "2026-07-01",
      postingDate: "2026-07-01",
      clientId: CLIENT,
      matterId: MATTER_1,
      narrative: "Opening deposit",
      actorUserId: ACTOR,
    }).data!;
    allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: deposit.trustTransactionId,
      actorUserId: ACTOR,
    });

    const deposit2 = ledgerService.postTransaction({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      trustTransactionType: "deposit",
      amount: 500,
      currency: "ZAR",
      transactionDate: "2026-07-15",
      postingDate: "2026-07-15",
      clientId: CLIENT,
      matterId: MATTER_2,
      narrative: "Second deposit",
      actorUserId: ACTOR,
    }).data!;
    allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: deposit2.trustTransactionId,
      actorUserId: ACTOR,
    });

    reconciliationService.runReconciliation({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      actorUserId: ACTOR,
    });

    const ruleId = interestService.createRule({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      complianceProfileId: "ZA-LPC",
      accrualMethod: "simple_daily",
      annualRatePercent: 10,
      postingFrequency: "monthly",
      minimumBalance: 100,
      effectiveFrom: "2026-07-01",
      actorUserId: ACTOR,
    }).data!.trustInterestRuleId;

    interestService.runAccrual({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      trustInterestRuleId: ruleId,
      periodStart: "2026-07-01",
      periodEnd: "2026-07-31",
      actorUserId: ACTOR,
    });

    const draft = transferService.createTransferDraft({
      tenantId: TENANT_A,
      transferType: "matter_to_matter",
      sourceTrustAccountId: accountId,
      sourceClientId: CLIENT,
      destinationClientId: CLIENT,
      sourceMatterId: MATTER_1,
      destinationMatterId: MATTER_2,
      amount: 100,
      currency: "ZAR",
      reason: "Reallocate",
      actorUserId: ACTOR,
    }).data!;
    transferService.approveTransfer({
      tenantId: TENANT_A,
      trustTransferId: draft.trustTransferId,
      actorUserId: ACTOR,
    });
    transferService.postTransfer({
      tenantId: TENANT_A,
      trustTransferId: draft.trustTransferId,
      postingDate: "2026-07-20",
      actorUserId: ACTOR,
    });
  }

  function generate(
    type: (typeof TRUST_REPORT_TYPES)[number],
    extras: Record<string, unknown> = {},
  ) {
    return reportingService.generateReport({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      reportType: type,
      generatedByUserId: ACTOR,
      ...extras,
    });
  }

  it.each(TRUST_REPORT_TYPES)("generates %s report", (reportType) => {
    const extras =
      reportType === "client_statement"
        ? {
            clientId: CLIENT,
            reportingPeriod: { start: "2026-07-01", end: "2026-07-31" },
          }
        : reportType === "matter_statement"
          ? {
              clientId: CLIENT,
              matterId: MATTER_1,
              reportingPeriod: { start: "2026-07-01", end: "2026-07-31" },
            }
          : reportType === "journal" || reportType === "transactions"
            ? { reportingPeriod: { start: "2026-07-01", end: "2026-07-31" } }
            : {};

    const result = generate(reportType, extras);
    expect(result.ok).toBe(true);
    expect(result.data?.reportType).toBe(reportType);
    expect(result.data?.payload.kind).toBe(reportType);
    expect(result.data?.reportId).toBeTruthy();
    expect(result.data?.generatedByUserId).toBe(ACTOR);
  });

  it("produces deterministic output for repeated generation", () => {
    const first = generate("transactions", {
      reportingPeriod: { start: "2026-07-01", end: "2026-07-31" },
    }).data!;
    const second = generate("transactions", {
      reportingPeriod: { start: "2026-07-01", end: "2026-07-31" },
    }).data!;

    expect(first.payload).toEqual(second.payload);
    expect(first.sourceCounts).toEqual(second.sourceCounts);
    expect(first.totals).toEqual(second.totals);
  });

  it("filters transactions by reporting period", () => {
    const full = generate("transactions").data!;
    const filtered = generate("transactions", {
      reportingPeriod: { start: "2026-07-01", end: "2026-07-10" },
    }).data!;

    expect(filtered.payload.kind).toBe("transactions");
    if (
      filtered.payload.kind === "transactions" &&
      full.payload.kind === "transactions"
    ) {
      expect(filtered.payload.lines.length).toBeLessThan(full.payload.lines.length);
    }
  });

  it("includes reconciliation summary data", () => {
    const report = generate("reconciliation_summary").data!;
    expect(report?.payload.kind).toBe("reconciliation_summary");
    if (report?.payload.kind === "reconciliation_summary") {
      expect(report.payload.lines.length).toBeGreaterThan(0);
      expect(report.totals.varianceCount).toBeDefined();
    }
  });

  it("includes interest and transfer summaries", () => {
    const interest = generate("interest_summary").data!;
    const transfers = generate("transfer_summary").data!;

    if (interest?.payload.kind === "interest_summary") {
      expect(interest.payload.lines.length).toBe(1);
      expect(interest.totals.interestAmountTotal).toBeGreaterThan(0);
    }
    if (transfers?.payload.kind === "transfer_summary") {
      expect(transfers.payload.lines.length).toBe(1);
      expect(transfers.totals.transferAmountTotal).toBe(100);
    }
  });

  it("includes report metadata and diagnostics", () => {
    const report = generate("trial_balance").data!;
    expect(report?.sourceCounts.accounts).toBe(1);
    expect(report?.diagnostics.generationDurationMs).toBeGreaterThanOrEqual(0);
    expect(report?.generatedAt).toBeTruthy();
  });

  it("emits legal.trust.report.generated event", () => {
    generate("ledger");
    expect(
      eventBus
        .listEvents()
        .some((event) => event.eventId === "legal.trust.report.generated"),
    ).toBe(true);
  });

  it("records diagnostics for generated reports", () => {
    generate("ledger");
    generate("journal");
    const summary = getTrustReportingDiagnostics().getSummary();
    expect(summary.reportsGenerated).toBeGreaterThanOrEqual(2);
    expect(summary.reportTypeCounts.ledger).toBeGreaterThanOrEqual(1);
  });

  it("enforces tenant isolation", () => {
    const result = reportingService.generateReport({
      tenantId: TENANT_B,
      trustAccountId: accountId,
      reportType: "ledger",
      generatedByUserId: ACTOR,
    });

    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("TRUST_REPORTING_ACCOUNT_NOT_FOUND");
  });

  it("rejects invalid reporting period", () => {
    const result = generate("transactions", {
      reportingPeriod: { start: "2026-07-31", end: "2026-07-01" },
    });
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("TRUST_REPORTING_INVALID_PERIOD");
  });

  it("stores immutable reports in repository", () => {
    const generated = generate("allocation_summary").data!;
    const stored = reportingService.getReport(TENANT_A, generated!.reportId);
    expect(stored).toEqual(generated);
    expect(Object.isFrozen(stored)).toBe(true);
  });
});
