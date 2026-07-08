import { InMemoryTrustLedgerRepository } from "./in-memory-trust-ledger-repository";
import { InMemoryTrustTransactionAuditRepository } from "./in-memory-trust-transaction-audit-repository";
import { InMemoryTrustTransactionDraftRepository } from "./in-memory-trust-transaction-draft-repository";
import { createTrustId } from "./trust-id";
import type { TrustLedgerService } from "./trust-ledger-service";
import { TrustLedgerService as TrustLedgerServiceClass } from "./trust-ledger-service";
import { isTrustLedgerError } from "./trust-ledger-errors";
import { TrustTransactionValidator } from "./trust-transaction-validator";
import {
  InMemoryTrustIdempotencyStore,
  InMemoryTrustTransactionWorkflowEventBus,
} from "./trust-transaction-workflow-events";
import {
  TRUST_WORKFLOW_ERROR_CODES,
  TrustWorkflowError,
  isTrustWorkflowError,
} from "./trust-transaction-workflow-errors";
import {
  getTrustTransactionWorkflowDiagnostics,
  type TrustTransactionWorkflowOperation,
  type TrustTransactionWorkflowRunRecord,
  type TrustTransactionWorkflowStageRecord,
} from "./trust-transaction-workflow-diagnostics";
import type { TrustApprovalService } from "./trust-approval-service";
import {
  assertTrustApprovalForPost,
  markTrustApprovalPosted,
} from "./trust-approval-gate";
import type {
  CreateTrustTransactionDraftInput,
  PostTrustReversalInput,
  PostTrustTransactionDraftInput,
  RequestTrustReversalInput,
  TrustAuditAction,
  TrustAuditTrailCriteria,
  TrustDraftStatus,
  TrustTransactionAuditRecord,
  TrustTransactionDraft,
  TrustTransactionWorkflowResult,
  TrustWorkflowDomainEvent,
  UpdateTrustTransactionDraftInput,
} from "./trust-transaction-workflow-types";

export interface TrustTransactionWorkflowServiceOptions {
  readonly ledgerService: TrustLedgerService;
  readonly ledgerRepository: InMemoryTrustLedgerRepository;
  readonly draftRepository?: InMemoryTrustTransactionDraftRepository;
  readonly auditRepository?: InMemoryTrustTransactionAuditRepository;
  readonly eventBus?: InMemoryTrustTransactionWorkflowEventBus;
  readonly idempotencyStore?: InMemoryTrustIdempotencyStore;
  readonly approvalService?: TrustApprovalService;
}

const EDITABLE_STATUSES: readonly TrustDraftStatus[] = ["draft", "rejected"];

function recordStage(
  stages: TrustTransactionWorkflowStageRecord[],
  operation: TrustTransactionWorkflowOperation,
  stage: TrustTransactionWorkflowStageRecord["stage"],
  startedAt: number,
  ok: boolean,
  detail?: string,
): void {
  stages.push({
    operation,
    stage,
    ok,
    durationMs: performance.now() - startedAt,
    detail,
  });
}

function finalizeWorkflowRun(
  operation: TrustTransactionWorkflowOperation,
  startedAt: number,
  stages: TrustTransactionWorkflowStageRecord[],
  ok: boolean,
  extras: Partial<TrustTransactionWorkflowRunRecord> = {},
): TrustTransactionWorkflowRunRecord {
  const run: TrustTransactionWorkflowRunRecord = {
    operation,
    startedAt: new Date(startedAt).toISOString(),
    durationMs: performance.now() - startedAt,
    ok,
    stages,
    ...extras,
  };
  getTrustTransactionWorkflowDiagnostics().record(run);
  return run;
}

/** Trust transaction workflow layer — drafts, validation, posting via TrustLedgerService (LAW-015-03). */
export class TrustTransactionWorkflowService {
  private readonly ledgerService: TrustLedgerService;
  private readonly ledgerRepository: InMemoryTrustLedgerRepository;
  private readonly draftRepository: InMemoryTrustTransactionDraftRepository;
  private readonly auditRepository: InMemoryTrustTransactionAuditRepository;
  private readonly eventBus: InMemoryTrustTransactionWorkflowEventBus;
  private readonly idempotencyStore: InMemoryTrustIdempotencyStore;
  private readonly validator: TrustTransactionValidator;
  private readonly approvalService: TrustApprovalService | undefined;

  constructor(options: TrustTransactionWorkflowServiceOptions) {
    this.ledgerService = options.ledgerService;
    this.ledgerRepository = options.ledgerRepository;
    this.draftRepository =
      options.draftRepository ?? new InMemoryTrustTransactionDraftRepository();
    this.auditRepository =
      options.auditRepository ?? new InMemoryTrustTransactionAuditRepository();
    this.eventBus = options.eventBus ?? new InMemoryTrustTransactionWorkflowEventBus();
    this.idempotencyStore =
      options.idempotencyStore ?? new InMemoryTrustIdempotencyStore();
    this.validator = new TrustTransactionValidator(this.ledgerRepository);
    this.approvalService = options.approvalService;
  }

  getWorkflowEventBus(): InMemoryTrustTransactionWorkflowEventBus {
    return this.eventBus;
  }

  createDraft(input: CreateTrustTransactionDraftInput): TrustTransactionWorkflowResult {
    const startedAt = performance.now();
    const stages: TrustTransactionWorkflowStageRecord[] = [];

    try {
      if (input.trustTransactionType === "reversal") {
        throw new TrustWorkflowError(
          TRUST_WORKFLOW_ERROR_CODES.TRUST_REVERSAL_REQUEST_INVALID,
          "Use requestReversal for reversal drafts",
        );
      }

      const validationStarted = performance.now();
      this.assertCreateDraftInput(input);
      recordStage(stages, "createDraft", "validation", validationStarted, true);

      const now = new Date().toISOString();
      const draft: TrustTransactionDraft = {
        draftId: createTrustId("tdr"),
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        status: "draft",
        trustTransactionType: input.trustTransactionType,
        amount: input.amount,
        currency: input.currency.trim().toUpperCase(),
        transactionDate: input.transactionDate,
        postingDate: input.postingDate,
        clientId: input.clientId,
        matterId: input.matterId,
        narrative: input.narrative.trim(),
        adjustmentDirection: input.adjustmentDirection,
        createdByUserId: input.actorUserId,
        updatedByUserId: input.actorUserId,
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      this.draftRepository.save(draft);

      const auditRecord = this.appendAudit({
        tenantId: draft.tenantId,
        trustAccountId: draft.trustAccountId,
        draftId: draft.draftId,
        action: "draft.created",
        actorUserId: input.actorUserId,
        summary: `Draft ${draft.draftId} created`,
        details: {
          trustTransactionType: draft.trustTransactionType,
          amount: draft.amount,
        },
      });

      this.publishWorkflowEvent({
        eventId: "legal.trust.draft.created",
        occurredAt: now,
        tenantId: draft.tenantId,
        trustAccountId: draft.trustAccountId,
        payload: {
          draftId: draft.draftId,
          trustTransactionType: draft.trustTransactionType,
          amount: draft.amount,
          actorUserId: input.actorUserId,
        },
      });

      recordStage(stages, "createDraft", "draft", startedAt, true);
      finalizeWorkflowRun("createDraft", startedAt, stages, true, {
        tenantId: draft.tenantId,
        trustAccountId: draft.trustAccountId,
        draftId: draft.draftId,
      });

      return { ok: true, draft, auditRecordId: auditRecord.auditRecordId };
    } catch (error) {
      return this.failResult("createDraft", startedAt, stages, error, {
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
      });
    }
  }

  updateDraft(
    tenantId: string,
    draftId: string,
    input: UpdateTrustTransactionDraftInput,
  ): TrustTransactionWorkflowResult {
    const startedAt = performance.now();
    const stages: TrustTransactionWorkflowStageRecord[] = [];

    try {
      const draft = this.requireDraft(tenantId, draftId);
      this.assertEditable(draft);

      const updated: TrustTransactionDraft = {
        ...draft,
        amount: input.amount ?? draft.amount,
        currency: (input.currency ?? draft.currency).trim().toUpperCase(),
        transactionDate: input.transactionDate ?? draft.transactionDate,
        postingDate: input.postingDate ?? draft.postingDate,
        clientId: input.clientId ?? draft.clientId,
        matterId: input.matterId !== undefined ? input.matterId : draft.matterId,
        narrative: (input.narrative ?? draft.narrative).trim(),
        adjustmentDirection: input.adjustmentDirection ?? draft.adjustmentDirection,
        status: "draft",
        validationErrors: undefined,
        updatedByUserId: input.actorUserId,
        updatedAt: new Date().toISOString(),
        version: draft.version + 1,
      };

      this.draftRepository.save(updated);

      const auditRecord = this.appendAudit({
        tenantId: updated.tenantId,
        trustAccountId: updated.trustAccountId,
        draftId: updated.draftId,
        action: "draft.updated",
        actorUserId: input.actorUserId,
        summary: `Draft ${updated.draftId} updated`,
        details: { version: updated.version },
      });

      recordStage(stages, "updateDraft", "draft", startedAt, true);
      finalizeWorkflowRun("updateDraft", startedAt, stages, true, {
        tenantId,
        draftId,
        trustAccountId: updated.trustAccountId,
      });

      return { ok: true, draft: updated, auditRecordId: auditRecord.auditRecordId };
    } catch (error) {
      return this.failResult("updateDraft", startedAt, stages, error, {
        tenantId,
        draftId,
      });
    }
  }

  validateDraft(
    tenantId: string,
    draftId: string,
    actorUserId: string,
  ): TrustTransactionWorkflowResult {
    const startedAt = performance.now();
    const stages: TrustTransactionWorkflowStageRecord[] = [];

    try {
      const draft = this.requireDraft(tenantId, draftId);

      if (draft.status !== "draft" && draft.status !== "rejected") {
        throw new TrustWorkflowError(
          TRUST_WORKFLOW_ERROR_CODES.TRUST_DRAFT_INVALID_STATE,
          `Cannot validate draft in status ${draft.status}`,
        );
      }

      const validationStarted = performance.now();
      const validation = this.validator.validate(this.toValidationInput(draft), {
        forPost: true,
      });

      if (!validation.ok) {
        const rejected: TrustTransactionDraft = {
          ...draft,
          status: "rejected",
          validationErrors: validation.errors,
          updatedByUserId: actorUserId,
          updatedAt: new Date().toISOString(),
          version: draft.version + 1,
        };
        this.draftRepository.save(rejected);

        this.appendAudit({
          tenantId,
          trustAccountId: draft.trustAccountId,
          draftId,
          action: "validation.failed",
          actorUserId,
          summary: `Draft ${draftId} validation failed`,
          details: { errors: validation.errors },
        });

        recordStage(stages, "validateDraft", "validation", validationStarted, false);
        finalizeWorkflowRun("validateDraft", startedAt, stages, false, {
          tenantId,
          draftId,
          trustAccountId: draft.trustAccountId,
          errorCode: TRUST_WORKFLOW_ERROR_CODES.TRUST_VALIDATION_FAILED,
        });

        return {
          ok: false,
          draft: rejected,
          validationErrors: validation.errors,
          error: {
            code: TRUST_WORKFLOW_ERROR_CODES.TRUST_VALIDATION_FAILED,
            message: "Draft validation failed",
          },
        };
      }

      const validated: TrustTransactionDraft = {
        ...draft,
        status: "validated",
        validationErrors: undefined,
        updatedByUserId: actorUserId,
        updatedAt: new Date().toISOString(),
        version: draft.version + 1,
      };
      this.draftRepository.save(validated);

      this.appendAudit({
        tenantId,
        trustAccountId: validated.trustAccountId,
        draftId,
        action: "draft.validated",
        actorUserId,
        summary: `Draft ${draftId} validated`,
      });

      this.publishWorkflowEvent({
        eventId: "legal.trust.draft.validated",
        occurredAt: validated.updatedAt,
        tenantId,
        trustAccountId: validated.trustAccountId,
        payload: { draftId, actorUserId },
      });

      recordStage(stages, "validateDraft", "validation", validationStarted, true);
      finalizeWorkflowRun("validateDraft", startedAt, stages, true, {
        tenantId,
        draftId,
        trustAccountId: validated.trustAccountId,
      });

      return { ok: true, draft: validated };
    } catch (error) {
      return this.failResult("validateDraft", startedAt, stages, error, {
        tenantId,
        draftId,
      });
    }
  }

  postDraft(input: PostTrustTransactionDraftInput): TrustTransactionWorkflowResult {
    return this.postDraftInternal(
      input,
      "postDraft",
      "legal.trust.draft.posted",
      "draft.posted",
    );
  }

  cancelDraft(
    tenantId: string,
    draftId: string,
    actorUserId: string,
  ): TrustTransactionWorkflowResult {
    const startedAt = performance.now();
    const stages: TrustTransactionWorkflowStageRecord[] = [];

    try {
      const draft = this.requireDraft(tenantId, draftId);

      if (!EDITABLE_STATUSES.includes(draft.status) && draft.status !== "validated") {
        throw new TrustWorkflowError(
          TRUST_WORKFLOW_ERROR_CODES.TRUST_DRAFT_INVALID_STATE,
          `Cannot cancel draft in status ${draft.status}`,
        );
      }

      const cancelled: TrustTransactionDraft = {
        ...draft,
        status: "cancelled",
        updatedByUserId: actorUserId,
        updatedAt: new Date().toISOString(),
        version: draft.version + 1,
      };
      this.draftRepository.save(cancelled);

      this.appendAudit({
        tenantId,
        trustAccountId: cancelled.trustAccountId,
        draftId,
        action: "draft.cancelled",
        actorUserId,
        summary: `Draft ${draftId} cancelled`,
      });

      this.publishWorkflowEvent({
        eventId: "legal.trust.draft.cancelled",
        occurredAt: cancelled.updatedAt,
        tenantId,
        trustAccountId: cancelled.trustAccountId,
        payload: { draftId, actorUserId },
      });

      finalizeWorkflowRun("cancelDraft", startedAt, stages, true, {
        tenantId,
        draftId,
        trustAccountId: cancelled.trustAccountId,
      });

      return { ok: true, draft: cancelled };
    } catch (error) {
      return this.failResult("cancelDraft", startedAt, stages, error, {
        tenantId,
        draftId,
      });
    }
  }

  requestReversal(input: RequestTrustReversalInput): TrustTransactionWorkflowResult {
    const startedAt = performance.now();
    const stages: TrustTransactionWorkflowStageRecord[] = [];

    try {
      const original = this.ledgerRepository.getTransaction(
        input.tenantId,
        input.trustAccountId,
        input.trustTransactionId,
      );

      if (!original) {
        throw new TrustWorkflowError(
          TRUST_WORKFLOW_ERROR_CODES.TRUST_REVERSAL_REQUEST_INVALID,
          "Original ledger transaction not found",
        );
      }

      if (original.status === "reversed") {
        throw new TrustWorkflowError(
          TRUST_WORKFLOW_ERROR_CODES.TRUST_REVERSAL_REQUEST_INVALID,
          "Transaction already reversed",
        );
      }

      const now = new Date().toISOString();
      const draft: TrustTransactionDraft = {
        draftId: createTrustId("tdr"),
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        status: "validated",
        trustTransactionType: "reversal",
        amount: original.amount,
        currency: original.currency,
        transactionDate: input.postingDate,
        postingDate: input.postingDate,
        clientId: original.clientId,
        matterId: original.matterId,
        narrative: input.narrative.trim(),
        reversesTrustTransactionId: original.trustTransactionId,
        createdByUserId: input.actorUserId,
        updatedByUserId: input.actorUserId,
        createdAt: now,
        updatedAt: now,
        version: 1,
      };

      this.draftRepository.save(draft);

      this.appendAudit({
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        draftId: draft.draftId,
        trustTransactionId: original.trustTransactionId,
        action: "reversal.requested",
        actorUserId: input.actorUserId,
        summary: `Reversal requested for ${original.trustTransactionId}`,
        details: { reversesTrustTransactionId: original.trustTransactionId },
      });

      this.publishWorkflowEvent({
        eventId: "legal.trust.reversal.requested",
        occurredAt: now,
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        payload: {
          draftId: draft.draftId,
          reversesTrustTransactionId: original.trustTransactionId,
          actorUserId: input.actorUserId,
        },
      });

      finalizeWorkflowRun("requestReversal", startedAt, stages, true, {
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
        draftId: draft.draftId,
      });

      return { ok: true, draft };
    } catch (error) {
      return this.failResult("requestReversal", startedAt, stages, error, {
        tenantId: input.tenantId,
        trustAccountId: input.trustAccountId,
      });
    }
  }

  postReversal(input: PostTrustReversalInput): TrustTransactionWorkflowResult {
    const result = this.postDraftInternal(
      input,
      "postReversal",
      "legal.trust.reversal.posted",
      "reversal.posted",
    );

    if (result.ok && result.draft?.reversesTrustTransactionId) {
      const originalDraft = this.draftRepository.findByPostedTransactionId(
        input.tenantId,
        result.draft.reversesTrustTransactionId,
      );
      if (originalDraft) {
        const reversedOriginal: TrustTransactionDraft = {
          ...originalDraft,
          status: "reversed",
          updatedAt: new Date().toISOString(),
          version: originalDraft.version + 1,
          updatedByUserId: input.actorUserId,
        };
        this.draftRepository.save(reversedOriginal);
      }
    }

    return result;
  }

  lookupAuditTrail(
    criteria: TrustAuditTrailCriteria,
  ): readonly TrustTransactionAuditRecord[] {
    const startedAt = performance.now();
    const records = this.auditRepository.list(criteria);
    finalizeWorkflowRun("auditLookup", startedAt, [], true, {
      tenantId: criteria.tenantId,
      trustAccountId: criteria.trustAccountId,
    });
    return records;
  }

  getDraft(tenantId: string, draftId: string): TrustTransactionDraft | undefined {
    return this.draftRepository.getById(tenantId, draftId);
  }

  private postDraftInternal(
    input: PostTrustTransactionDraftInput,
    operation: "postDraft" | "postReversal",
    eventId: "legal.trust.draft.posted" | "legal.trust.reversal.posted",
    auditAction: TrustAuditAction,
  ): TrustTransactionWorkflowResult {
    const startedAt = performance.now();
    const stages: TrustTransactionWorkflowStageRecord[] = [];

    try {
      const draft = this.requireDraft(input.tenantId, input.draftId);

      if (input.idempotencyKey?.trim()) {
        const idempotencyStarted = performance.now();
        const existing = this.idempotencyStore.get(
          input.tenantId,
          input.idempotencyKey.trim(),
        );
        if (existing) {
          const existingDraft = this.requireDraft(input.tenantId, existing.draftId);
          const transaction = this.ledgerRepository.getTransaction(
            input.tenantId,
            existingDraft.trustAccountId,
            existing.postedTrustTransactionId,
          );
          recordStage(
            stages,
            operation,
            "idempotency",
            idempotencyStarted,
            true,
            "replay",
          );
          finalizeWorkflowRun(operation, startedAt, stages, true, {
            tenantId: input.tenantId,
            draftId: existing.draftId,
            trustAccountId: existingDraft.trustAccountId,
            idempotentReplay: true,
          });
          return {
            ok: true,
            draft: existingDraft,
            transaction,
            idempotentReplay: true,
          };
        }
        recordStage(stages, operation, "idempotency", idempotencyStarted, true);
      }

      if (draft.status !== "validated") {
        throw new TrustWorkflowError(
          TRUST_WORKFLOW_ERROR_CODES.TRUST_DRAFT_NOT_VALIDATED,
          `Draft must be validated before post (current: ${draft.status})`,
        );
      }

      assertTrustApprovalForPost(
        this.approvalService,
        input.tenantId,
        "trust_transaction",
        input.draftId,
        draft.amount,
      );

      const prePostValidation = this.validator.validate(this.toValidationInput(draft), {
        forPost: true,
      });
      if (!prePostValidation.ok) {
        throw new TrustWorkflowError(
          TRUST_WORKFLOW_ERROR_CODES.TRUST_VALIDATION_FAILED,
          "Draft failed pre-post validation",
        );
      }

      const ledgerStarted = performance.now();
      const ledgerResult = this.ledgerService.postTransaction({
        tenantId: draft.tenantId,
        trustAccountId: draft.trustAccountId,
        trustTransactionType: draft.trustTransactionType,
        amount: draft.amount,
        currency: draft.currency,
        transactionDate: draft.transactionDate,
        postingDate: draft.postingDate,
        clientId: draft.clientId,
        matterId: draft.matterId,
        narrative: draft.narrative,
        actorUserId: input.actorUserId,
        adjustmentDirection: draft.adjustmentDirection,
        reversesTransactionId: draft.reversesTrustTransactionId,
      });

      if (!ledgerResult.ok || !ledgerResult.data) {
        recordStage(
          stages,
          operation,
          "ledger",
          ledgerStarted,
          false,
          ledgerResult.error?.code,
        );
        throw new TrustWorkflowError(
          TRUST_WORKFLOW_ERROR_CODES.TRUST_POST_FAILED,
          ledgerResult.error?.message ?? "Ledger post failed",
        );
      }
      recordStage(stages, operation, "ledger", ledgerStarted, true);

      const transaction = ledgerResult.data;
      const now = new Date().toISOString();
      const posted: TrustTransactionDraft = {
        ...draft,
        status: "posted",
        postedTrustTransactionId: transaction.trustTransactionId,
        idempotencyKey: input.idempotencyKey?.trim() || draft.idempotencyKey,
        updatedByUserId: input.actorUserId,
        updatedAt: now,
        version: draft.version + 1,
      };
      this.draftRepository.save(posted);

      if (input.idempotencyKey?.trim()) {
        this.idempotencyStore.save({
          tenantId: input.tenantId,
          idempotencyKey: input.idempotencyKey.trim(),
          draftId: posted.draftId,
          postedTrustTransactionId: transaction.trustTransactionId,
          recordedAt: now,
        });
      }

      const auditRecord = this.appendAudit({
        tenantId: posted.tenantId,
        trustAccountId: posted.trustAccountId,
        draftId: posted.draftId,
        trustTransactionId: transaction.trustTransactionId,
        action: auditAction,
        actorUserId: input.actorUserId,
        summary:
          auditAction === "reversal.posted"
            ? `Reversal posted for ${draft.reversesTrustTransactionId}`
            : `Draft ${posted.draftId} posted to ledger`,
        details: {
          transactionReference: transaction.transactionReference,
          journalEntryId: transaction.journalEntryId,
        },
      });

      this.publishWorkflowEvent({
        eventId,
        occurredAt: now,
        tenantId: posted.tenantId,
        trustAccountId: posted.trustAccountId,
        payload: {
          draftId: posted.draftId,
          trustTransactionId: transaction.trustTransactionId,
          actorUserId: input.actorUserId,
        },
      });

      if (eventId === "legal.trust.draft.posted") {
        markTrustApprovalPosted(this.approvalService, {
          tenantId: input.tenantId,
          approvalType: "trust_transaction",
          subjectId: posted.draftId,
          actorUserId: input.actorUserId,
        });
      }

      recordStage(stages, operation, "audit", startedAt, true);
      finalizeWorkflowRun(operation, startedAt, stages, true, {
        tenantId: input.tenantId,
        draftId: posted.draftId,
        trustAccountId: posted.trustAccountId,
      });

      return {
        ok: true,
        draft: posted,
        transaction,
        auditRecordId: auditRecord.auditRecordId,
      };
    } catch (error) {
      return this.failResult(operation, startedAt, stages, error, {
        tenantId: input.tenantId,
        draftId: input.draftId,
      });
    }
  }

  private requireDraft(tenantId: string, draftId: string): TrustTransactionDraft {
    const draft = this.draftRepository.getById(tenantId, draftId);
    if (!draft) {
      throw new TrustWorkflowError(
        TRUST_WORKFLOW_ERROR_CODES.TRUST_DRAFT_NOT_FOUND,
        "Trust transaction draft not found",
      );
    }
    if (draft.tenantId !== tenantId) {
      throw new TrustWorkflowError(
        TRUST_WORKFLOW_ERROR_CODES.TRUST_TENANT_MISMATCH,
        "Draft tenant mismatch",
      );
    }
    return draft;
  }

  private assertEditable(draft: TrustTransactionDraft): void {
    if (!EDITABLE_STATUSES.includes(draft.status)) {
      throw new TrustWorkflowError(
        TRUST_WORKFLOW_ERROR_CODES.TRUST_DRAFT_INVALID_STATE,
        `Draft is not editable in status ${draft.status}`,
      );
    }
  }

  private assertCreateDraftInput(input: CreateTrustTransactionDraftInput): void {
    if (!input.tenantId.trim()) {
      throw new TrustWorkflowError(
        TRUST_WORKFLOW_ERROR_CODES.TRUST_TENANT_MISMATCH,
        "Tenant is required",
      );
    }
    if (!input.trustAccountId.trim()) {
      throw new TrustWorkflowError(
        TRUST_WORKFLOW_ERROR_CODES.TRUST_DRAFT_NOT_FOUND,
        "Trust account is required",
      );
    }
    const account = this.ledgerRepository.getAccount(
      input.tenantId,
      input.trustAccountId,
    );
    if (!account) {
      throw new TrustWorkflowError(
        TRUST_WORKFLOW_ERROR_CODES.TRUST_POST_FAILED,
        "Trust account not found",
      );
    }
  }

  private toValidationInput(draft: TrustTransactionDraft) {
    return {
      tenantId: draft.tenantId,
      trustAccountId: draft.trustAccountId,
      trustTransactionType: draft.trustTransactionType,
      amount: draft.amount,
      currency: draft.currency,
      transactionDate: draft.transactionDate,
      postingDate: draft.postingDate,
      clientId: draft.clientId,
      matterId: draft.matterId,
      narrative: draft.narrative,
      adjustmentDirection: draft.adjustmentDirection,
      reversesTrustTransactionId: draft.reversesTrustTransactionId,
    };
  }

  private appendAudit(options: {
    readonly tenantId: string;
    readonly trustAccountId: string;
    readonly draftId?: string;
    readonly trustTransactionId?: string;
    readonly action: TrustAuditAction;
    readonly actorUserId: string;
    readonly summary: string;
    readonly details?: Readonly<Record<string, unknown>>;
  }): TrustTransactionAuditRecord {
    const record: TrustTransactionAuditRecord = {
      auditRecordId: createTrustId("tar"),
      tenantId: options.tenantId,
      trustAccountId: options.trustAccountId,
      draftId: options.draftId,
      trustTransactionId: options.trustTransactionId,
      action: options.action,
      actorUserId: options.actorUserId,
      occurredAt: new Date().toISOString(),
      correlationId: createTrustId("cor"),
      summary: options.summary,
      details: options.details,
    };
    return this.auditRepository.append(record);
  }

  private publishWorkflowEvent(event: TrustWorkflowDomainEvent): void {
    this.eventBus.publish(event);
  }

  private failResult(
    operation: TrustTransactionWorkflowOperation,
    startedAt: number,
    stages: TrustTransactionWorkflowStageRecord[],
    error: unknown,
    extras: Partial<TrustTransactionWorkflowRunRecord>,
  ): TrustTransactionWorkflowResult {
    const normalized = normalizeError(error);
    finalizeWorkflowRun(operation, startedAt, stages, false, {
      ...extras,
      errorCode: normalized.code,
    });
    return { ok: false, error: normalized };
  }
}

function normalizeError(error: unknown): { code: string; message: string } {
  if (isTrustWorkflowError(error)) {
    return { code: error.code, message: error.message };
  }
  if (isTrustLedgerError(error)) {
    return { code: error.code, message: error.message };
  }
  return {
    code: TRUST_WORKFLOW_ERROR_CODES.TRUST_POST_FAILED,
    message: error instanceof Error ? error.message : "Unknown workflow error",
  };
}

export function createTrustTransactionWorkflowFixture(): {
  readonly ledgerRepository: InMemoryTrustLedgerRepository;
  readonly ledgerService: TrustLedgerService;
  readonly workflowService: TrustTransactionWorkflowService;
  readonly draftRepository: InMemoryTrustTransactionDraftRepository;
  readonly auditRepository: InMemoryTrustTransactionAuditRepository;
  readonly eventBus: InMemoryTrustTransactionWorkflowEventBus;
  readonly accountId: string;
} {
  const ledgerRepository = new InMemoryTrustLedgerRepository();
  const ledgerService = new TrustLedgerServiceClass({ repository: ledgerRepository });
  const draftRepository = new InMemoryTrustTransactionDraftRepository();
  const auditRepository = new InMemoryTrustTransactionAuditRepository();
  const eventBus = new InMemoryTrustTransactionWorkflowEventBus();

  const account = ledgerService.openAccount({
    tenantId: "tenant-test",
    name: "Trust",
    currency: "ZAR",
    institutionName: "Bank",
    accountNumberMasked: "****9999",
    actorUserId: "user-test",
  }).data!;

  const workflowService = new TrustTransactionWorkflowService({
    ledgerService,
    ledgerRepository,
    draftRepository,
    auditRepository,
    eventBus,
  });

  return {
    ledgerRepository,
    ledgerService,
    workflowService,
    draftRepository,
    auditRepository,
    eventBus,
    accountId: account.trustAccountId,
  };
}
