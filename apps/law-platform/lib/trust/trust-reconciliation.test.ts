import { beforeEach, describe, expect, it } from "vitest";

import { InMemoryTrustAllocationRepository } from "./in-memory-trust-allocation-repository";
import { InMemoryTrustLedgerRepository } from "./in-memory-trust-ledger-repository";
import { InMemoryTrustReconciliationRepository } from "./in-memory-trust-reconciliation-repository";
import {
  getTrustReconciliationDiagnostics,
  resetTrustReconciliationDiagnostics,
} from "./trust-reconciliation-diagnostics";
import { InMemoryTrustReconciliationEventBus } from "./trust-reconciliation-events";
import { TrustAllocationService } from "./trust-allocation-service";
import { TrustLedgerService } from "./trust-ledger-service";
import { TrustReconciliationService } from "./trust-reconciliation-service";
import { createTrustId, resetTrustIdCounter } from "./trust-id";
import { resetTrustAllocationDiagnostics } from "./trust-allocation-diagnostics";
import { resetTrustLedgerDiagnostics } from "./trust-ledger-diagnostics";

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";
const CLIENT = "client-001";
const MATTER_1 = "matter-001";
const ACTOR = "user-001";

describe("TrustReconciliationService", () => {
  let ledgerRepository: InMemoryTrustLedgerRepository;
  let ledgerService: TrustLedgerService;
  let allocationRepository: InMemoryTrustAllocationRepository;
  let allocationService: TrustAllocationService;
  let reconciliationRepository: InMemoryTrustReconciliationRepository;
  let eventBus: InMemoryTrustReconciliationEventBus;
  let reconciliationService: TrustReconciliationService;
  let accountId: string;

  beforeEach(() => {
    resetTrustIdCounter();
    resetTrustLedgerDiagnostics();
    resetTrustAllocationDiagnostics();
    resetTrustReconciliationDiagnostics();

    ledgerRepository = new InMemoryTrustLedgerRepository();
    ledgerService = new TrustLedgerService({ repository: ledgerRepository });
    allocationRepository = new InMemoryTrustAllocationRepository();
    allocationService = new TrustAllocationService({
      allocationRepository,
      ledgerRepository,
    });
    reconciliationRepository = new InMemoryTrustReconciliationRepository();
    eventBus = new InMemoryTrustReconciliationEventBus();
    reconciliationService = new TrustReconciliationService({
      ledgerRepository,
      allocationRepository,
      reconciliationRepository,
      eventBus,
    });

    accountId = ledgerService.openAccount({
      tenantId: TENANT_A,
      name: "Trust",
      currency: "ZAR",
      institutionName: "FNB",
      accountNumberMasked: "****4321",
      actorUserId: ACTOR,
    }).data!.trustAccountId;
  });

  function postDeposit(amount: number, matterId?: string) {
    const result = ledgerService.postTransaction({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      trustTransactionType: "deposit",
      amount,
      currency: "ZAR",
      transactionDate: "2026-07-01",
      postingDate: "2026-07-01",
      clientId: CLIENT,
      matterId,
      narrative: "Deposit",
      actorUserId: ACTOR,
    });
    expect(result.ok).toBe(true);
    return result.data!;
  }

  it("reports balanced reconciliation when ledger and allocations match", () => {
    const tx = postDeposit(1000, MATTER_1);
    allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      actorUserId: ACTOR,
    });

    const result = reconciliationService.runReconciliation({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      actorUserId: ACTOR,
    });

    expect(result.ok).toBe(true);
    expect(result.result?.run.status).toBe("completed");
    expect(result.result?.run.errorCount).toBe(0);
    expect(result.result?.run.variances.some((v) => v.category === "balanced")).toBe(
      true,
    );
    expect(
      eventBus
        .listEvents()
        .some((e) => e.eventId === "legal.trust.reconciliation.completed"),
    ).toBe(true);
  });

  it("detects missing allocation as warning", () => {
    postDeposit(500, MATTER_1);

    const result = reconciliationService.runReconciliation({
      tenantId: TENANT_A,
      trustAccountId: accountId,
    });

    expect(result.ok).toBe(true);
    expect(result.result?.run.warningCount).toBeGreaterThan(0);
    expect(
      result.result?.run.variances.some((v) => v.varianceType === "missing_allocation"),
    ).toBe(true);
  });

  it("detects under allocation", () => {
    const tx = postDeposit(1000, MATTER_1);
    allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      lines: [
        { clientId: CLIENT, matterId: MATTER_1, amount: 600, allocationType: "matter" },
      ],
      allowPartial: true,
      actorUserId: ACTOR,
    });

    const result = reconciliationService.runReconciliation({
      tenantId: TENANT_A,
      trustAccountId: accountId,
    });

    expect(
      result.result?.run.variances.some((v) => v.varianceType === "under_allocation"),
    ).toBe(true);
  });

  it("detects over allocation", () => {
    const tx = postDeposit(500, MATTER_1);
    allocationRepository.append({
      trustAllocationId: createTrustId("tal"),
      tenantId: TENANT_A,
      trustAccountId: accountId,
      trustTransactionId: tx.trustTransactionId,
      clientId: CLIENT,
      matterId: MATTER_1,
      amount: 300,
      effect: "increase",
      currency: "ZAR",
      allocationType: "matter",
      allocationDate: "2026-07-01",
      createdByUserId: ACTOR,
      createdAt: "2026-07-01T00:00:00.000Z",
    });
    allocationRepository.append({
      trustAllocationId: createTrustId("tal"),
      tenantId: TENANT_A,
      trustAccountId: accountId,
      trustTransactionId: tx.trustTransactionId,
      clientId: CLIENT,
      matterId: MATTER_1,
      amount: 300,
      effect: "increase",
      currency: "ZAR",
      allocationType: "matter",
      allocationDate: "2026-07-01",
      createdByUserId: ACTOR,
      createdAt: "2026-07-01T00:00:01.000Z",
    });

    const result = reconciliationService.runReconciliation({
      tenantId: TENANT_A,
      trustAccountId: accountId,
    });

    expect(result.ok).toBe(false);
    expect(result.result?.run.status).toBe("failed");
    expect(
      result.result?.run.variances.some((v) => v.varianceType === "over_allocation"),
    ).toBe(true);
    expect(
      eventBus
        .listEvents()
        .some((e) => e.eventId === "legal.trust.reconciliation.failed"),
    ).toBe(true);
  });

  it("detects orphan allocation", () => {
    allocationRepository.append({
      trustAllocationId: createTrustId("tal"),
      tenantId: TENANT_A,
      trustAccountId: accountId,
      trustTransactionId: "missing-transaction",
      clientId: CLIENT,
      amount: 100,
      effect: "increase",
      currency: "ZAR",
      allocationType: "client",
      allocationDate: "2026-07-01",
      createdByUserId: ACTOR,
      createdAt: "2026-07-01T00:00:00.000Z",
    });

    const result = reconciliationService.runReconciliation({
      tenantId: TENANT_A,
      trustAccountId: accountId,
    });

    expect(result.ok).toBe(false);
    expect(
      result.result?.run.variances.some((v) => v.varianceType === "orphan_allocation"),
    ).toBe(true);
  });

  it("detects duplicate transaction references", () => {
    const first = postDeposit(100);
    const duplicate = {
      ...first,
      trustTransactionId: createTrustId("trx"),
    };
    ledgerRepository.appendTransaction(duplicate);

    const result = reconciliationService.runReconciliation({
      tenantId: TENANT_A,
      trustAccountId: accountId,
    });

    expect(result.ok).toBe(false);
    expect(
      result.result?.run.variances.some(
        (v) => v.varianceType === "duplicate_transaction",
      ),
    ).toBe(true);
  });

  it("validates reversal integrity", () => {
    const tx = postDeposit(800, MATTER_1);
    allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      actorUserId: ACTOR,
    });

    const reversal = ledgerService.reverseTransaction({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      trustTransactionId: tx.trustTransactionId,
      postingDate: "2026-07-02",
      narrative: "Reverse",
      actorUserId: ACTOR,
    });
    expect(reversal.ok).toBe(true);

    const result = reconciliationService.runReconciliation({
      tenantId: TENANT_A,
      trustAccountId: accountId,
    });

    expect(
      result.result?.run.variances.some((v) => v.varianceType === "reversal_mismatch"),
    ).toBe(true);
  });

  it("produces deterministic results on repeat runs", () => {
    const tx = postDeposit(400, MATTER_1);
    allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      actorUserId: ACTOR,
    });

    const first = reconciliationService.runReconciliation({
      tenantId: TENANT_A,
      trustAccountId: accountId,
    });
    const second = reconciliationService.runReconciliation({
      tenantId: TENANT_A,
      trustAccountId: accountId,
    });

    expect(first.result?.run.errorCount).toBe(second.result?.run.errorCount);
    expect(first.result?.run.warningCount).toBe(second.result?.run.warningCount);
    expect(first.result?.run.variances.map((v) => v.varianceType)).toEqual(
      second.result?.run.variances.map((v) => v.varianceType),
    );
  });

  it("stores immutable reconciliation runs", () => {
    const tx = postDeposit(200, MATTER_1);
    allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      actorUserId: ACTOR,
    });

    const result = reconciliationService.runReconciliation({
      tenantId: TENANT_A,
      trustAccountId: accountId,
    });

    const run = reconciliationService.getRun(
      TENANT_A,
      result.result!.run.reconciliationId,
    )!;
    expect(Object.isFrozen(run)).toBe(true);

    const runs = reconciliationService.listRuns({
      tenantId: TENANT_A,
      trustAccountId: accountId,
    });
    expect(runs).toHaveLength(1);
  });

  it("enforces tenant isolation", () => {
    postDeposit(300, MATTER_1);

    const result = reconciliationService.runReconciliation({
      tenantId: TENANT_B,
      trustAccountId: accountId,
    });

    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("TRUST_RECONCILIATION_ACCOUNT_NOT_FOUND");

    const runs = reconciliationService.listRuns({ tenantId: TENANT_B });
    expect(runs).toHaveLength(0);
  });

  it("exposes diagnostics and account summaries", () => {
    const tx = postDeposit(150, MATTER_1);
    allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      actorUserId: ACTOR,
    });

    reconciliationService.runReconciliation({
      tenantId: TENANT_A,
      trustAccountId: accountId,
    });

    const summaries = reconciliationService.getAccountSummaries(TENANT_A);
    expect(summaries).toHaveLength(1);
    expect(summaries[0]?.runCount).toBe(1);
    expect(summaries[0]?.lastRunStatus).toBe("completed");

    expect(getTrustReconciliationDiagnostics().listRuns().length).toBeGreaterThan(0);
    expect(reconciliationService.getDiagnosticsSummary().reconciliationCount).toBe(1);
  });

  it("does not mutate ledger or allocation data", () => {
    const tx = postDeposit(600, MATTER_1);
    allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      actorUserId: ACTOR,
    });

    const txBefore = ledgerRepository.listTransactions(TENANT_A, accountId).length;
    const allocBefore = allocationRepository.list({ tenantId: TENANT_A }).length;
    const journalBefore = ledgerRepository.getJournalEntries(
      TENANT_A,
      accountId,
    ).length;

    reconciliationService.runReconciliation({
      tenantId: TENANT_A,
      trustAccountId: accountId,
    });

    expect(ledgerRepository.listTransactions(TENANT_A, accountId).length).toBe(
      txBefore,
    );
    expect(allocationRepository.list({ tenantId: TENANT_A }).length).toBe(allocBefore);
    expect(ledgerRepository.getJournalEntries(TENANT_A, accountId).length).toBe(
      journalBefore,
    );
  });
});
