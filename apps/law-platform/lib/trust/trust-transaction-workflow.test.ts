import { beforeEach, describe, expect, it } from "vitest";

import { InMemoryTrustLedgerRepository } from "./in-memory-trust-ledger-repository";
import { InMemoryTrustTransactionAuditRepository } from "./in-memory-trust-transaction-audit-repository";
import { InMemoryTrustTransactionDraftRepository } from "./in-memory-trust-transaction-draft-repository";
import {
  InMemoryTrustIdempotencyStore,
  InMemoryTrustTransactionWorkflowEventBus,
} from "./trust-transaction-workflow-events";
import {
  getTrustTransactionWorkflowDiagnostics,
  resetTrustTransactionWorkflowDiagnostics,
} from "./trust-transaction-workflow-diagnostics";
import { TrustTransactionWorkflowService } from "./trust-transaction-workflow-service";
import { TrustLedgerService } from "./trust-ledger-service";
import { resetTrustIdCounter } from "./trust-id";
import { resetTrustLedgerDiagnostics } from "./trust-ledger-diagnostics";

const TENANT = "tenant-a";
const CLIENT = "client-001";
const ACTOR = "user-001";

describe("TrustTransactionWorkflowService", () => {
  let ledgerRepository: InMemoryTrustLedgerRepository;
  let ledgerService: TrustLedgerService;
  let draftRepository: InMemoryTrustTransactionDraftRepository;
  let auditRepository: InMemoryTrustTransactionAuditRepository;
  let eventBus: InMemoryTrustTransactionWorkflowEventBus;
  let idempotencyStore: InMemoryTrustIdempotencyStore;
  let workflow: TrustTransactionWorkflowService;
  let accountId: string;

  beforeEach(() => {
    resetTrustIdCounter();
    resetTrustLedgerDiagnostics();
    resetTrustTransactionWorkflowDiagnostics();

    ledgerRepository = new InMemoryTrustLedgerRepository();
    ledgerService = new TrustLedgerService({ repository: ledgerRepository });
    draftRepository = new InMemoryTrustTransactionDraftRepository();
    auditRepository = new InMemoryTrustTransactionAuditRepository();
    eventBus = new InMemoryTrustTransactionWorkflowEventBus();
    idempotencyStore = new InMemoryTrustIdempotencyStore();

    workflow = new TrustTransactionWorkflowService({
      ledgerService,
      ledgerRepository,
      draftRepository,
      auditRepository,
      eventBus,
      idempotencyStore,
    });

    accountId = ledgerService.openAccount({
      tenantId: TENANT,
      name: "Trust",
      currency: "ZAR",
      institutionName: "FNB",
      accountNumberMasked: "****4321",
      actorUserId: ACTOR,
    }).data!.trustAccountId;
  });

  function createDepositDraft(amount = 500) {
    return workflow.createDraft({
      tenantId: TENANT,
      trustAccountId: accountId,
      trustTransactionType: "deposit",
      amount,
      currency: "ZAR",
      transactionDate: "2026-07-01",
      postingDate: "2026-07-01",
      clientId: CLIENT,
      narrative: "Deposit draft",
      actorUserId: ACTOR,
    });
  }

  it("creates a draft in draft status", () => {
    const result = createDepositDraft();
    expect(result.ok).toBe(true);
    expect(result.draft?.status).toBe("draft");

    const events = eventBus.listEvents();
    expect(events.some((event) => event.eventId === "legal.trust.draft.created")).toBe(
      true,
    );
  });

  it("updates an editable draft", () => {
    const created = createDepositDraft().draft!;
    const updated = workflow.updateDraft(TENANT, created.draftId, {
      amount: 750,
      narrative: "Updated deposit",
      actorUserId: ACTOR,
    });

    expect(updated.ok).toBe(true);
    expect(updated.draft?.amount).toBe(750);
    expect(updated.draft?.narrative).toBe("Updated deposit");
    expect(updated.draft?.status).toBe("draft");
  });

  it("validates a draft successfully", () => {
    const draft = createDepositDraft().draft!;
    const validated = workflow.validateDraft(TENANT, draft.draftId, ACTOR);

    expect(validated.ok).toBe(true);
    expect(validated.draft?.status).toBe("validated");
    expect(
      eventBus.listEvents().some((e) => e.eventId === "legal.trust.draft.validated"),
    ).toBe(true);
  });

  it("rejects invalid draft on validation", () => {
    const draft = workflow.createDraft({
      tenantId: TENANT,
      trustAccountId: accountId,
      trustTransactionType: "withdrawal",
      amount: 1000,
      currency: "ZAR",
      transactionDate: "2026-07-01",
      postingDate: "2026-07-01",
      clientId: CLIENT,
      narrative: "Withdrawal without funds",
      actorUserId: ACTOR,
    }).draft!;

    const validated = workflow.validateDraft(TENANT, draft.draftId, ACTOR);
    expect(validated.ok).toBe(false);
    expect(validated.draft?.status).toBe("rejected");
    expect(validated.validationErrors?.amount).toBeDefined();

    const audit = workflow.lookupAuditTrail({
      tenantId: TENANT,
      draftId: draft.draftId,
      action: "validation.failed",
    });
    expect(audit.length).toBe(1);
  });

  it("posts a validated draft through TrustLedgerService", () => {
    const draft = createDepositDraft().draft!;
    workflow.validateDraft(TENANT, draft.draftId, ACTOR);

    const posted = workflow.postDraft({
      tenantId: TENANT,
      draftId: draft.draftId,
      actorUserId: ACTOR,
    });

    expect(posted.ok).toBe(true);
    expect(posted.draft?.status).toBe("posted");
    expect(posted.transaction?.amount).toBe(500);
    expect(posted.transaction?.trustTransactionType).toBe("deposit");

    const journal = ledgerService.getJournal(TENANT, accountId);
    expect(journal.entries).toHaveLength(1);
    expect(
      eventBus.listEvents().some((e) => e.eventId === "legal.trust.draft.posted"),
    ).toBe(true);
  });

  it("rejects post when draft is not validated", () => {
    const draft = createDepositDraft().draft!;
    const posted = workflow.postDraft({
      tenantId: TENANT,
      draftId: draft.draftId,
      actorUserId: ACTOR,
    });

    expect(posted.ok).toBe(false);
    expect(posted.error?.code).toBe("TRUST_DRAFT_NOT_VALIDATED");
  });

  it("supports idempotent posting", () => {
    const draft = createDepositDraft().draft!;
    workflow.validateDraft(TENANT, draft.draftId, ACTOR);

    const first = workflow.postDraft({
      tenantId: TENANT,
      draftId: draft.draftId,
      actorUserId: ACTOR,
      idempotencyKey: "idem-001",
    });
    const second = workflow.postDraft({
      tenantId: TENANT,
      draftId: draft.draftId,
      actorUserId: ACTOR,
      idempotencyKey: "idem-001",
    });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(second.idempotentReplay).toBe(true);
    expect(second.transaction?.trustTransactionId).toBe(
      first.transaction?.trustTransactionId,
    );

    const journal = ledgerService.getJournal(TENANT, accountId);
    expect(journal.entries).toHaveLength(1);

    const diagnostics = getTrustTransactionWorkflowDiagnostics().getSummary();
    expect(diagnostics.idempotentReplays).toBe(1);
  });

  it("cancels a draft", () => {
    const draft = createDepositDraft().draft!;
    const cancelled = workflow.cancelDraft(TENANT, draft.draftId, ACTOR);

    expect(cancelled.ok).toBe(true);
    expect(cancelled.draft?.status).toBe("cancelled");
    expect(
      eventBus.listEvents().some((e) => e.eventId === "legal.trust.draft.cancelled"),
    ).toBe(true);
  });

  it("requests and posts a reversal", () => {
    const draft = createDepositDraft(600).draft!;
    workflow.validateDraft(TENANT, draft.draftId, ACTOR);
    const posted = workflow.postDraft({
      tenantId: TENANT,
      draftId: draft.draftId,
      actorUserId: ACTOR,
    }).transaction!;

    const reversalRequest = workflow.requestReversal({
      tenantId: TENANT,
      trustAccountId: accountId,
      trustTransactionId: posted.trustTransactionId,
      postingDate: "2026-07-02",
      narrative: "Reverse deposit",
      actorUserId: ACTOR,
    });

    expect(reversalRequest.ok).toBe(true);
    expect(reversalRequest.draft?.trustTransactionType).toBe("reversal");
    expect(reversalRequest.draft?.status).toBe("validated");
    expect(
      eventBus.listEvents().some((e) => e.eventId === "legal.trust.reversal.requested"),
    ).toBe(true);

    const reversalPosted = workflow.postReversal({
      tenantId: TENANT,
      draftId: reversalRequest.draft!.draftId,
      actorUserId: ACTOR,
    });

    expect(reversalPosted.ok).toBe(true);
    expect(reversalPosted.transaction?.trustTransactionType).toBe("reversal");
    expect(
      eventBus.listEvents().some((e) => e.eventId === "legal.trust.reversal.posted"),
    ).toBe(true);

    const originalDraft = draftRepository.findByPostedTransactionId(
      TENANT,
      posted.trustTransactionId,
    );
    expect(originalDraft?.status).toBe("reversed");
  });

  it("records append-only audit trail for workflow actions", () => {
    const draft = createDepositDraft().draft!;
    workflow.validateDraft(TENANT, draft.draftId, ACTOR);
    workflow.postDraft({
      tenantId: TENANT,
      draftId: draft.draftId,
      actorUserId: ACTOR,
    });

    const trail = workflow.lookupAuditTrail({
      tenantId: TENANT,
      trustAccountId: accountId,
    });
    const actions = trail.map((record) => record.action);

    expect(actions).toContain("draft.created");
    expect(actions).toContain("draft.validated");
    expect(actions).toContain("draft.posted");
  });

  it("reports workflow diagnostics", () => {
    const draft = createDepositDraft().draft!;
    workflow.validateDraft(TENANT, draft.draftId, ACTOR);
    workflow.postDraft({
      tenantId: TENANT,
      draftId: draft.draftId,
      actorUserId: ACTOR,
    });

    const summary = getTrustTransactionWorkflowDiagnostics().getSummary();
    expect(summary.draftsCreated).toBe(1);
    expect(summary.draftsPosted).toBe(1);
    expect(summary.successfulRuns).toBeGreaterThan(0);
  });
});
