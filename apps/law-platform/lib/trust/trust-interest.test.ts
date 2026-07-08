import { beforeEach, describe, expect, it } from "vitest";

import { InMemoryTrustAllocationRepository } from "./in-memory-trust-allocation-repository";
import { InMemoryTrustInterestPostingRepository } from "./in-memory-trust-interest-posting-repository";
import { InMemoryTrustInterestRuleRepository } from "./in-memory-trust-interest-rule-repository";
import { InMemoryTrustLedgerRepository } from "./in-memory-trust-ledger-repository";
import { TrustAllocationService } from "./trust-allocation-service";
import {
  getTrustInterestDiagnostics,
  resetTrustInterestDiagnostics,
} from "./trust-interest-diagnostics";
import { InMemoryTrustInterestEventBus } from "./trust-interest-events";
import {
  calculateInterestAmount,
  collectInterestBalanceProjections,
  countDaysInclusive,
  runTrustInterestAccrual,
  validateInterestPeriod,
} from "./trust-interest-engine";
import { TrustInterestService } from "./trust-interest-service";
import { TrustLedgerService } from "./trust-ledger-service";
import { resetTrustIdCounter } from "./trust-id";
import { resetTrustAllocationDiagnostics } from "./trust-allocation-diagnostics";
import { resetTrustLedgerDiagnostics } from "./trust-ledger-diagnostics";

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";
const CLIENT = "client-001";
const MATTER_1 = "matter-001";
const ACTOR = "user-001";

describe("trust-interest-engine", () => {
  it("calculates simple daily interest", () => {
    const amount = calculateInterestAmount({
      principalBalance: 3650,
      annualRatePercent: 10,
      accrualMethod: "simple_daily",
      periodStart: "2026-01-01",
      periodEnd: "2026-01-31",
    });
    expect(countDaysInclusive("2026-01-01", "2026-01-31")).toBe(31);
    expect(amount).toBe(31);
  });

  it("validates interest periods", () => {
    expect(validateInterestPeriod("2026-01-01", "2026-01-31")).toBe(true);
    expect(validateInterestPeriod("2026-02-01", "2026-01-31")).toBe(false);
  });
});

describe("TrustInterestService", () => {
  let ledgerRepository: InMemoryTrustLedgerRepository;
  let ledgerService: TrustLedgerService;
  let allocationRepository: InMemoryTrustAllocationRepository;
  let allocationService: TrustAllocationService;
  let ruleRepository: InMemoryTrustInterestRuleRepository;
  let postingRepository: InMemoryTrustInterestPostingRepository;
  let eventBus: InMemoryTrustInterestEventBus;
  let interestService: TrustInterestService;
  let accountId: string;
  let ruleId: string;

  beforeEach(() => {
    resetTrustIdCounter();
    resetTrustLedgerDiagnostics();
    resetTrustAllocationDiagnostics();
    resetTrustInterestDiagnostics();

    ledgerRepository = new InMemoryTrustLedgerRepository();
    ledgerService = new TrustLedgerService({ repository: ledgerRepository });
    allocationRepository = new InMemoryTrustAllocationRepository();
    allocationService = new TrustAllocationService({
      allocationRepository,
      ledgerRepository,
    });
    ruleRepository = new InMemoryTrustInterestRuleRepository();
    postingRepository = new InMemoryTrustInterestPostingRepository();
    eventBus = new InMemoryTrustInterestEventBus();
    interestService = new TrustInterestService({
      ledgerRepository,
      allocationRepository,
      ruleRepository,
      postingRepository,
      ledgerService,
      allocationService,
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

    ruleId = interestService.createRule({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      complianceProfileId: "ZA-LPC",
      accrualMethod: "simple_daily",
      annualRatePercent: 10,
      postingFrequency: "monthly",
      minimumBalance: 100,
      effectiveFrom: "2026-01-01",
      actorUserId: ACTOR,
    }).data!.trustInterestRuleId;
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
    const tx = result.data!;
    allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: tx.trustTransactionId,
      actorUserId: ACTOR,
    });
    return tx;
  }

  it("creates an interest calculation policy", () => {
    const rule = interestService.getRule(TENANT_A, ruleId);
    expect(rule?.annualRatePercent).toBe(10);
    expect(rule?.accrualMethod).toBe("simple_daily");
    expect(rule?.isActive).toBe(true);
  });

  it("runs accrual and produces draft posting with client/matter lines", () => {
    postDeposit(1000, MATTER_1);

    const result = interestService.runAccrual({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      trustInterestRuleId: ruleId,
      periodStart: "2026-07-01",
      periodEnd: "2026-07-31",
      actorUserId: ACTOR,
    });

    expect(result.ok).toBe(true);
    expect(result.data?.posting.status).toBe("draft");
    expect(result.data?.posting.lineItems.length).toBe(1);
    expect(result.data?.posting.lineItems[0]?.matterId).toBe(MATTER_1);
    expect(result.data?.posting.totalInterestAmount).toBeGreaterThan(0);
    expect(
      eventBus
        .listEvents()
        .some((event) => event.eventId === "legal.trust.interest.accrued"),
    ).toBe(true);
  });

  it("approves a draft interest posting", () => {
    postDeposit(1000, MATTER_1);
    const draft = interestService.runAccrual({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      trustInterestRuleId: ruleId,
      periodStart: "2026-07-01",
      periodEnd: "2026-07-31",
      actorUserId: ACTOR,
    }).data!.posting;

    const approved = interestService.approvePosting({
      tenantId: TENANT_A,
      trustInterestPostingId: draft.trustInterestPostingId,
      actorUserId: ACTOR,
    });

    expect(approved.ok).toBe(true);
    expect(approved.data?.status).toBe("approved");
    expect(
      eventBus
        .listEvents()
        .some((event) => event.eventId === "legal.trust.interest.approved"),
    ).toBe(true);
  });

  it("posts approved interest to ledger and allocates per line", () => {
    postDeposit(1000, MATTER_1);
    const draft = interestService.runAccrual({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      trustInterestRuleId: ruleId,
      periodStart: "2026-07-01",
      periodEnd: "2026-07-31",
      actorUserId: ACTOR,
    }).data!.posting;

    interestService.approvePosting({
      tenantId: TENANT_A,
      trustInterestPostingId: draft.trustInterestPostingId,
      actorUserId: ACTOR,
    });

    const posted = interestService.postInterest({
      tenantId: TENANT_A,
      trustInterestPostingId: draft.trustInterestPostingId,
      postingDate: "2026-07-31",
      actorUserId: ACTOR,
    });

    expect(posted.ok).toBe(true);
    expect(posted.data?.posting.status).toBe("posted");
    expect(posted.data?.transactionIds.length).toBe(1);

    const transactions = ledgerRepository.listTransactions(TENANT_A, accountId);
    const interestTx = transactions.find(
      (tx) => tx.trustTransactionType === "interest",
    );
    expect(interestTx).toBeDefined();

    const allocations = allocationRepository.listByTransaction(
      TENANT_A,
      interestTx!.trustTransactionId,
    );
    expect(allocations.length).toBeGreaterThan(0);
    expect(
      eventBus
        .listEvents()
        .some((event) => event.eventId === "legal.trust.interest.posted"),
    ).toBe(true);
  });

  it("rejects accrual when balances are below minimum", () => {
    postDeposit(50, MATTER_1);

    const result = interestService.runAccrual({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      trustInterestRuleId: ruleId,
      periodStart: "2026-07-01",
      periodEnd: "2026-07-31",
      actorUserId: ACTOR,
    });

    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("TRUST_INTEREST_NO_ACCRUAL_LINES");
  });

  it("rejects posting when status is not approved", () => {
    postDeposit(1000, MATTER_1);
    const draft = interestService.runAccrual({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      trustInterestRuleId: ruleId,
      periodStart: "2026-07-01",
      periodEnd: "2026-07-31",
      actorUserId: ACTOR,
    }).data!.posting;

    const result = interestService.postInterest({
      tenantId: TENANT_A,
      trustInterestPostingId: draft.trustInterestPostingId,
      postingDate: "2026-07-31",
      actorUserId: ACTOR,
    });

    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("TRUST_INTEREST_INVALID_STATUS");
  });

  it("enforces tenant isolation on posting lookup", () => {
    postDeposit(1000, MATTER_1);
    const draft = interestService.runAccrual({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      trustInterestRuleId: ruleId,
      periodStart: "2026-07-01",
      periodEnd: "2026-07-31",
      actorUserId: ACTOR,
    }).data!.posting;

    const result = interestService.approvePosting({
      tenantId: TENANT_B,
      trustInterestPostingId: draft.trustInterestPostingId,
      actorUserId: ACTOR,
    });

    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("TRUST_INTEREST_POSTING_NOT_FOUND");
  });

  it("records diagnostics for successful accrual workflow", () => {
    postDeposit(1000, MATTER_1);
    interestService.runAccrual({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      trustInterestRuleId: ruleId,
      periodStart: "2026-07-01",
      periodEnd: "2026-07-31",
      actorUserId: ACTOR,
    });

    const summary = getTrustInterestDiagnostics().getSummary();
    expect(summary.accrualsRun).toBe(1);
    expect(summary.successfulRuns).toBeGreaterThan(0);
  });

  it("collects matter balance projections for accrual input", () => {
    postDeposit(1000, MATTER_1);
    const allocations = allocationRepository.list({
      tenantId: TENANT_A,
      trustAccountId: accountId,
    });
    const projections = collectInterestBalanceProjections(
      allocations,
      TENANT_A,
      accountId,
      "ZAR",
    );
    expect(projections.length).toBe(1);
    expect(projections[0]?.principalBalance).toBe(1000);
  });

  it("runs pure accrual engine with deterministic output", () => {
    postDeposit(1000, MATTER_1);
    const allocations = allocationRepository.list({
      tenantId: TENANT_A,
      trustAccountId: accountId,
    });
    const rule = interestService.getRule(TENANT_A, ruleId)!;
    const first = runTrustInterestAccrual({
      rule,
      trustAccountId: accountId,
      currency: "ZAR",
      periodStart: "2026-07-01",
      periodEnd: "2026-07-07",
      allocations,
    });
    const second = runTrustInterestAccrual({
      rule,
      trustAccountId: accountId,
      currency: "ZAR",
      periodStart: "2026-07-01",
      periodEnd: "2026-07-07",
      allocations,
    });
    expect(first.totalInterestAmount).toBe(second.totalInterestAmount);
    expect(first.lineItems[0]?.interestAmount).toBeGreaterThan(0);
  });
});
