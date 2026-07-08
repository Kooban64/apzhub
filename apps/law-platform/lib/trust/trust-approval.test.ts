import { beforeEach, describe, expect, it } from "vitest";

import { InMemoryTrustApprovalRepository } from "./in-memory-trust-approval-repository";
import { InMemoryTrustLedgerRepository } from "./in-memory-trust-ledger-repository";
import { InMemoryTrustAllocationRepository } from "./in-memory-trust-allocation-repository";
import { InMemoryTrustTransferRepository } from "./in-memory-trust-transfer-repository";
import { TrustAllocationService } from "./trust-allocation-service";
import {
  getTrustApprovalDiagnostics,
  resetTrustApprovalDiagnostics,
} from "./trust-approval-diagnostics";
import { InMemoryTrustApprovalEventBus } from "./trust-approval-events";
import { TRUST_APPROVAL_ERROR_CODES } from "./trust-approval-errors";
import { TrustApprovalService } from "./trust-approval-service";
import { TrustLedgerService } from "./trust-ledger-service";
import { TrustTransferService } from "./trust-transfer-service";
import { resetTrustIdCounter } from "./trust-id";
import { resetTrustTransferDiagnostics } from "./trust-transfer-diagnostics";
import { resetTrustLedgerDiagnostics } from "./trust-ledger-diagnostics";
import { resetTrustAllocationDiagnostics } from "./trust-allocation-diagnostics";
import { resetTrustInterestDiagnostics } from "./trust-interest-diagnostics";
import { resetTrustTransactionWorkflowDiagnostics } from "./trust-transaction-workflow-diagnostics";

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";
const ACTOR_SUBMIT = "user-submit";
const ACTOR_APPROVER_1 = "user-approver-1";
const ACTOR_APPROVER_2 = "user-approver-2";
const CLIENT = "client-001";
const MATTER = "matter-001";

describe("TrustApprovalService", () => {
  let repository: InMemoryTrustApprovalRepository;
  let eventBus: InMemoryTrustApprovalEventBus;
  let approvalService: TrustApprovalService;

  beforeEach(() => {
    resetTrustIdCounter();
    resetTrustApprovalDiagnostics();
    repository = new InMemoryTrustApprovalRepository();
    eventBus = new InMemoryTrustApprovalEventBus();
    approvalService = new TrustApprovalService({ repository, eventBus });
  });

  function createSingleApproverRule() {
    return approvalService.createRule({
      tenantId: TENANT_A,
      approvalType: "trust_transfer",
      mode: "single_approver",
      allowedRoles: ["trust_approver"],
      actorUserId: ACTOR_SUBMIT,
    }).data!;
  }

  function createDualApprovalRule() {
    return approvalService.createRule({
      tenantId: TENANT_A,
      approvalType: "trust_transfer",
      mode: "dual_approval",
      allowedRoles: ["trust_approver", "trust_manager"],
      actorUserId: ACTOR_SUBMIT,
    }).data!;
  }

  function submitTransfer(amount = 5000) {
    return approvalService.submitForApproval({
      tenantId: TENANT_A,
      approvalType: "trust_transfer",
      subjectId: "ttr-subject-001",
      trustAccountId: "acct-001",
      amount,
      currency: "ZAR",
      actorUserId: ACTOR_SUBMIT,
      reason: "Matter transfer",
    });
  }

  it("auto-approves when no approval rule is configured", () => {
    const result = submitTransfer();
    expect(result.ok).toBe(true);
    expect(result.data?.status).toBe("approved");
    expect(result.data?.requiredApprovalCount).toBe(0);
    expect(
      eventBus
        .listEvents()
        .some((event) => event.eventId === "legal.trust.approval.approved"),
    ).toBe(true);
  });

  it("supports single approval workflow", () => {
    createSingleApproverRule();
    const submitted = submitTransfer();
    expect(submitted.data?.status).toBe("submitted");
    expect(
      eventBus
        .listEvents()
        .some((event) => event.eventId === "legal.trust.approval.submitted"),
    ).toBe(true);

    const approved = approvalService.approve({
      tenantId: TENANT_A,
      trustApprovalRequestId: submitted.data!.trustApprovalRequestId,
      actorUserId: ACTOR_APPROVER_1,
      actorRoles: ["trust_approver"],
    });

    expect(approved.ok).toBe(true);
    expect(approved.data?.status).toBe("approved");
    expect(approved.data?.decisions).toHaveLength(1);
  });

  it("supports dual approval workflow", () => {
    createDualApprovalRule();
    const submitted = submitTransfer();

    const first = approvalService.approve({
      tenantId: TENANT_A,
      trustApprovalRequestId: submitted.data!.trustApprovalRequestId,
      actorUserId: ACTOR_APPROVER_1,
      actorRoles: ["trust_approver"],
    });
    expect(first.data?.status).toBe("submitted");
    expect(first.data?.decisions).toHaveLength(1);

    const second = approvalService.approve({
      tenantId: TENANT_A,
      trustApprovalRequestId: submitted.data!.trustApprovalRequestId,
      actorUserId: ACTOR_APPROVER_2,
      actorRoles: ["trust_manager"],
    });
    expect(second.data?.status).toBe("approved");
    expect(second.data?.decisions).toHaveLength(2);
  });

  it("rejects approval requests with reason", () => {
    createSingleApproverRule();
    const submitted = submitTransfer();

    const rejected = approvalService.reject({
      tenantId: TENANT_A,
      trustApprovalRequestId: submitted.data!.trustApprovalRequestId,
      actorUserId: ACTOR_APPROVER_1,
      actorRoles: ["trust_approver"],
      reason: "Insufficient documentation",
    });

    expect(rejected.ok).toBe(true);
    expect(rejected.data?.status).toBe("rejected");
    expect(
      eventBus
        .listEvents()
        .some((event) => event.eventId === "legal.trust.approval.rejected"),
    ).toBe(true);
  });

  it("cancels submitted requests by submitter", () => {
    createSingleApproverRule();
    const submitted = submitTransfer();

    const cancelled = approvalService.cancel({
      tenantId: TENANT_A,
      trustApprovalRequestId: submitted.data!.trustApprovalRequestId,
      actorUserId: ACTOR_SUBMIT,
      reason: "Withdrawn",
    });

    expect(cancelled.ok).toBe(true);
    expect(cancelled.data?.status).toBe("cancelled");
    expect(
      eventBus
        .listEvents()
        .some((event) => event.eventId === "legal.trust.approval.cancelled"),
    ).toBe(true);
  });

  it("applies threshold-based rules below threshold without approval", () => {
    approvalService.createRule({
      tenantId: TENANT_A,
      approvalType: "trust_transaction",
      mode: "threshold_based",
      amountThreshold: 10000,
      requiredApprovalCount: 2,
      actorUserId: ACTOR_SUBMIT,
    });

    const below = approvalService.submitForApproval({
      tenantId: TENANT_A,
      approvalType: "trust_transaction",
      subjectId: "tdr-small",
      trustAccountId: "acct-001",
      amount: 500,
      currency: "ZAR",
      actorUserId: ACTOR_SUBMIT,
    });
    expect(below.data?.status).toBe("approved");
    expect(below.data?.requiredApprovalCount).toBe(0);
  });

  it("applies threshold-based rules above threshold with dual approval", () => {
    approvalService.createRule({
      tenantId: TENANT_A,
      approvalType: "trust_transaction",
      mode: "threshold_based",
      amountThreshold: 1000,
      requiredApprovalCount: 2,
      actorUserId: ACTOR_SUBMIT,
    });

    const above = approvalService.submitForApproval({
      tenantId: TENANT_A,
      approvalType: "trust_transaction",
      subjectId: "tdr-large",
      trustAccountId: "acct-001",
      amount: 5000,
      currency: "ZAR",
      actorUserId: ACTOR_SUBMIT,
    });
    expect(above.data?.status).toBe("submitted");
    expect(above.data?.requiredApprovalCount).toBe(2);
  });

  it("prevents self-approval", () => {
    createSingleApproverRule();
    const submitted = submitTransfer();

    const selfApprove = approvalService.approve({
      tenantId: TENANT_A,
      trustApprovalRequestId: submitted.data!.trustApprovalRequestId,
      actorUserId: ACTOR_SUBMIT,
      actorRoles: ["trust_approver"],
    });

    expect(selfApprove.ok).toBe(false);
    expect(selfApprove.validation?.errors.actorUserId).toContain(
      "Self-approval is not permitted",
    );
  });

  it("prevents duplicate approvals from the same actor", () => {
    createDualApprovalRule();
    const submitted = submitTransfer();

    approvalService.approve({
      tenantId: TENANT_A,
      trustApprovalRequestId: submitted.data!.trustApprovalRequestId,
      actorUserId: ACTOR_APPROVER_1,
      actorRoles: ["trust_approver"],
    });

    const duplicate = approvalService.approve({
      tenantId: TENANT_A,
      trustApprovalRequestId: submitted.data!.trustApprovalRequestId,
      actorUserId: ACTOR_APPROVER_1,
      actorRoles: ["trust_approver"],
    });

    expect(duplicate.ok).toBe(false);
    expect(duplicate.validation?.errors.actorUserId).toMatch(/Duplicate approval/);
  });

  it("validates role requirements for role-based rules", () => {
    approvalService.createRule({
      tenantId: TENANT_A,
      approvalType: "interest_posting",
      mode: "role_based",
      allowedRoles: ["trust_partner"],
      actorUserId: ACTOR_SUBMIT,
    });

    const submitted = approvalService.submitForApproval({
      tenantId: TENANT_A,
      approvalType: "interest_posting",
      subjectId: "tip-001",
      trustAccountId: "acct-001",
      amount: 100,
      currency: "ZAR",
      actorUserId: ACTOR_SUBMIT,
    });

    const invalidRole = approvalService.approve({
      tenantId: TENANT_A,
      trustApprovalRequestId: submitted.data!.trustApprovalRequestId,
      actorUserId: ACTOR_APPROVER_1,
      actorRoles: ["trust_clerk"],
    });

    expect(invalidRole.ok).toBe(false);
    expect(invalidRole.validation?.errors.actorRoles).toBeDefined();
  });

  it("maintains append-only audit history", () => {
    createSingleApproverRule();
    const submitted = submitTransfer();
    approvalService.approve({
      tenantId: TENANT_A,
      trustApprovalRequestId: submitted.data!.trustApprovalRequestId,
      actorUserId: ACTOR_APPROVER_1,
      actorRoles: ["trust_approver"],
    });

    const history = approvalService.getHistory(
      TENANT_A,
      submitted.data!.trustApprovalRequestId,
    );

    expect(history.length).toBeGreaterThanOrEqual(2);
    expect(history[0]?.action).toBe("submit");
    expect(history.some((record) => record.action === "approve")).toBe(true);
    expect(history.every((record, index, records) => record === records[index])).toBe(
      true,
    );
  });

  it("tracks diagnostics snapshot", () => {
    createSingleApproverRule();
    const submitted = submitTransfer();
    approvalService.approve({
      tenantId: TENANT_A,
      trustApprovalRequestId: submitted.data!.trustApprovalRequestId,
      actorUserId: ACTOR_APPROVER_1,
      actorRoles: ["trust_approver"],
    });

    const snapshot = approvalService.buildDiagnosticsSnapshot(TENANT_A);
    expect(snapshot.approvedCount).toBeGreaterThanOrEqual(1);
    expect(snapshot.operationsExecuted).toBeGreaterThan(0);
    expect(getTrustApprovalDiagnostics().listRuns().length).toBeGreaterThan(0);
  });

  it("enforces tenant isolation", () => {
    createSingleApproverRule();
    const submitted = submitTransfer();

    const crossTenant = approvalService.approve({
      tenantId: TENANT_B,
      trustApprovalRequestId: submitted.data!.trustApprovalRequestId,
      actorUserId: ACTOR_APPROVER_1,
      actorRoles: ["trust_approver"],
    });

    expect(crossTenant.ok).toBe(false);
    expect(crossTenant.error?.code).toBe(
      TRUST_APPROVAL_ERROR_CODES.TRUST_APPROVAL_NOT_FOUND,
    );
  });

  it("blocks posting when approval is required but not granted", () => {
    approvalService.createRule({
      tenantId: TENANT_A,
      approvalType: "trust_transfer",
      mode: "single_approver",
      actorUserId: ACTOR_SUBMIT,
    });

    submitTransfer();

    const blocked = approvalService.assertCanPost(
      TENANT_A,
      "trust_transfer",
      "ttr-subject-001",
      5000,
    );
    expect(blocked.ok).toBe(false);
    expect(blocked.error?.code).toBe(
      TRUST_APPROVAL_ERROR_CODES.TRUST_APPROVAL_REQUIRED,
    );
  });
});

describe("TrustApprovalService integration", () => {
  let ledgerRepository: InMemoryTrustLedgerRepository;
  let ledgerService: TrustLedgerService;
  let allocationRepository: InMemoryTrustAllocationRepository;
  let allocationService: TrustAllocationService;
  let approvalService: TrustApprovalService;
  let transferService: TrustTransferService;
  let accountId: string;

  beforeEach(() => {
    resetTrustIdCounter();
    resetTrustLedgerDiagnostics();
    resetTrustAllocationDiagnostics();
    resetTrustTransferDiagnostics();
    resetTrustApprovalDiagnostics();
    resetTrustInterestDiagnostics();
    resetTrustTransactionWorkflowDiagnostics();

    ledgerRepository = new InMemoryTrustLedgerRepository();
    ledgerService = new TrustLedgerService({ repository: ledgerRepository });
    allocationRepository = new InMemoryTrustAllocationRepository();
    allocationService = new TrustAllocationService({
      allocationRepository,
      ledgerRepository,
    });
    approvalService = new TrustApprovalService({
      repository: new InMemoryTrustApprovalRepository(),
    });

    transferService = new TrustTransferService({
      ledgerRepository,
      allocationRepository,
      transferRepository: new InMemoryTrustTransferRepository(),
      ledgerService,
      allocationService,
      approvalService,
    });

    accountId = ledgerService.openAccount({
      tenantId: TENANT_A,
      name: "Trust",
      currency: "ZAR",
      institutionName: "Bank",
      accountNumberMasked: "****1111",
      actorUserId: ACTOR_SUBMIT,
    }).data!.trustAccountId;

    const deposit = ledgerService.postTransaction({
      tenantId: TENANT_A,
      trustAccountId: accountId,
      trustTransactionType: "deposit",
      amount: 20000,
      currency: "ZAR",
      transactionDate: "2026-07-01",
      postingDate: "2026-07-01",
      clientId: CLIENT,
      matterId: MATTER,
      narrative: "Seed",
      actorUserId: ACTOR_SUBMIT,
    }).data!;
    allocationService.allocate({
      tenantId: TENANT_A,
      trustTransactionId: deposit!.trustTransactionId,
      actorUserId: ACTOR_SUBMIT,
    });
  });

  it("blocks transfer posting until operational approval is complete", () => {
    approvalService.createRule({
      tenantId: TENANT_A,
      approvalType: "trust_transfer",
      mode: "single_approver",
      allowedRoles: ["trust_approver"],
      actorUserId: ACTOR_SUBMIT,
    });

    const draft = transferService.createTransferDraft({
      tenantId: TENANT_A,
      sourceTrustAccountId: accountId,
      sourceClientId: CLIENT,
      destinationClientId: CLIENT,
      sourceMatterId: MATTER,
      destinationMatterId: "matter-002",
      amount: 1000,
      currency: "ZAR",
      reason: "Reallocation",
      actorUserId: ACTOR_SUBMIT,
    }).data!;

    approvalService.submitForApproval({
      tenantId: TENANT_A,
      approvalType: "trust_transfer",
      subjectId: draft.trustTransferId,
      trustAccountId: accountId,
      amount: draft.amount,
      currency: draft.currency,
      actorUserId: ACTOR_SUBMIT,
    });

    const blockedPost = transferService.postTransfer({
      tenantId: TENANT_A,
      trustTransferId: draft.trustTransferId,
      postingDate: "2026-07-02",
      actorUserId: ACTOR_SUBMIT,
    });
    expect(blockedPost.ok).toBe(false);

    const request = approvalService.findRequestForSubject(
      TENANT_A,
      "trust_transfer",
      draft.trustTransferId,
    )!;
    approvalService.approve({
      tenantId: TENANT_A,
      trustApprovalRequestId: request.trustApprovalRequestId,
      actorUserId: ACTOR_APPROVER_1,
      actorRoles: ["trust_approver"],
    });

    const approved = transferService.approveTransfer({
      tenantId: TENANT_A,
      trustTransferId: draft.trustTransferId,
      actorUserId: ACTOR_APPROVER_1,
    });
    expect(approved.ok).toBe(true);

    const posted = transferService.postTransfer({
      tenantId: TENANT_A,
      trustTransferId: draft.trustTransferId,
      postingDate: "2026-07-02",
      actorUserId: ACTOR_APPROVER_1,
    });
    expect(posted.ok).toBe(true);
    const postedRequest = approvalService.listRequests({
      tenantId: TENANT_A,
      approvalType: "trust_transfer",
      subjectId: draft.trustTransferId,
    })[0];
    expect(postedRequest?.status).toBe("posted");
  });
});
