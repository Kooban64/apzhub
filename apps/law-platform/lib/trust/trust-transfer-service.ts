import type { InMemoryTrustAllocationRepository } from "./in-memory-trust-allocation-repository";
import { InMemoryTrustAllocationRepository as InMemoryTrustAllocationRepositoryClass } from "./in-memory-trust-allocation-repository";
import type { InMemoryTrustLedgerRepository } from "./in-memory-trust-ledger-repository";
import { InMemoryTrustLedgerRepository as InMemoryTrustLedgerRepositoryClass } from "./in-memory-trust-ledger-repository";
import type { InMemoryTrustTransferRepository } from "./in-memory-trust-transfer-repository";
import { InMemoryTrustTransferRepository as InMemoryTrustTransferRepositoryClass } from "./in-memory-trust-transfer-repository";
import { TrustAllocationService } from "./trust-allocation-service";
import { createTrustId } from "./trust-id";
import { finalizeTransferRun, recordTransferStage } from "./trust-transfer-diagnostics";
import { InMemoryTrustTransferEventBus } from "./trust-transfer-events";
import {
  TRUST_TRANSFER_ERROR_CODES,
  TrustTransferError,
  isTrustTransferError,
} from "./trust-transfer-errors";
import type {
  ApproveTrustTransferInput,
  CancelTrustTransferDraftInput,
  CreateTrustTransferDraftInput,
  PostTrustTransferInput,
  ReverseTrustTransferInput,
  TrustTransfer,
  TrustTransferDomainEvent,
  TrustTransferHistoryCriteria,
  TrustTransferPostResult,
  TrustTransferServiceResult,
  TrustTransferStageRecord,
  TrustTransferValidationResult,
} from "./trust-transfer-types";
import { TrustTransferValidator, inferTransferType } from "./trust-transfer-validator";
import type { TrustApprovalService } from "./trust-approval-service";
import {
  assertTrustApprovalForDomainApprove,
  assertTrustApprovalForPost,
  markTrustApprovalPosted,
} from "./trust-approval-gate";
import { TrustLedgerService } from "./trust-ledger-service";

export interface TrustTransferServiceOptions {
  readonly ledgerRepository: InMemoryTrustLedgerRepository;
  readonly allocationRepository: InMemoryTrustAllocationRepository;
  readonly transferRepository: InMemoryTrustTransferRepository;
  readonly ledgerService: TrustLedgerService;
  readonly allocationService: TrustAllocationService;
  readonly validator?: TrustTransferValidator;
  readonly eventBus?: InMemoryTrustTransferEventBus;
  readonly approvalService?: TrustApprovalService;
}

/** Trust Transfer Engine — controlled fund movement via journal postings (LAW-015-07). */
export class TrustTransferService {
  private readonly ledgerRepository: InMemoryTrustLedgerRepository;
  private readonly allocationRepository: InMemoryTrustAllocationRepository;
  private readonly transferRepository: InMemoryTrustTransferRepository;
  private readonly ledgerService: TrustLedgerService;
  private readonly allocationService: TrustAllocationService;
  private readonly validator: TrustTransferValidator;
  private readonly eventBus: InMemoryTrustTransferEventBus;
  private readonly approvalService: TrustApprovalService | undefined;

  constructor(options: TrustTransferServiceOptions) {
    this.ledgerRepository = options.ledgerRepository;
    this.allocationRepository = options.allocationRepository;
    this.transferRepository = options.transferRepository;
    this.ledgerService = options.ledgerService;
    this.allocationService = options.allocationService;
    this.validator = options.validator ?? new TrustTransferValidator();
    this.eventBus = options.eventBus ?? new InMemoryTrustTransferEventBus();
    this.approvalService = options.approvalService;
  }

  getEventBus(): InMemoryTrustTransferEventBus {
    return this.eventBus;
  }

  createTransferDraft(
    input: CreateTrustTransferDraftInput,
  ): TrustTransferServiceResult<TrustTransfer> {
    const startedAt = performance.now();
    const stages: TrustTransferStageRecord[] = [];

    try {
      const validationStarted = performance.now();
      const validation = this.validator.validateDraft(
        input,
        this.ledgerRepository,
        this.allocationRepository,
      );

      if (!validation.ok) {
        recordTransferStage(
          stages,
          "createDraft",
          "validation",
          validationStarted,
          false,
        );
        return this.validationFailure("createDraft", startedAt, stages, validation);
      }
      recordTransferStage(stages, "createDraft", "validation", validationStarted, true);

      const persistStarted = performance.now();
      const createdAt = new Date().toISOString();
      const transfer: TrustTransfer = {
        trustTransferId: createTrustId("ttr"),
        tenantId: input.tenantId,
        transferType: input.transferType ?? inferTransferType(input),
        status: "draft",
        sourceTrustAccountId: input.sourceTrustAccountId,
        destinationTrustAccountId:
          input.destinationTrustAccountId ?? input.sourceTrustAccountId,
        sourceClientId: input.sourceClientId,
        destinationClientId: input.destinationClientId,
        sourceMatterId: input.sourceMatterId,
        destinationMatterId: input.destinationMatterId,
        amount: input.amount,
        currency: input.currency.trim().toUpperCase(),
        reason: input.reason.trim(),
        reversesTransferId: input.reversesTransferId,
        createdAt,
        createdByUserId: input.actorUserId,
        sourceBalanceBefore: validation.sourceBalance,
        destinationBalanceBefore: validation.destinationBalance,
      };

      this.transferRepository.save(transfer);
      recordTransferStage(stages, "createDraft", "persist", persistStarted, true);

      this.publishEvent({
        eventId: "legal.trust.transfer.created",
        occurredAt: createdAt,
        tenantId: input.tenantId,
        trustAccountId: input.sourceTrustAccountId,
        payload: {
          trustTransferId: transfer.trustTransferId,
          transferType: transfer.transferType,
          amount: transfer.amount,
          actorUserId: input.actorUserId,
        },
      });

      return {
        ok: true,
        data: transfer,
        validation,
        run: finalizeTransferRun("createDraft", startedAt, stages, true, {
          trustTransferId: transfer.trustTransferId,
        }),
      };
    } catch (error) {
      return this.fail("createDraft", startedAt, stages, error);
    }
  }

  validateTransfer(
    tenantId: string,
    trustTransferId: string,
  ): TrustTransferServiceResult<TrustTransferValidationResult> {
    const startedAt = performance.now();
    const stages: TrustTransferStageRecord[] = [];

    try {
      const transfer = this.requireTransfer(tenantId, trustTransferId);
      const validationStarted = performance.now();

      const draftInput: CreateTrustTransferDraftInput = {
        tenantId: transfer.tenantId,
        transferType: transfer.transferType,
        sourceTrustAccountId: transfer.sourceTrustAccountId,
        destinationTrustAccountId: transfer.destinationTrustAccountId,
        sourceClientId: transfer.sourceClientId,
        destinationClientId: transfer.destinationClientId,
        sourceMatterId: transfer.sourceMatterId,
        destinationMatterId: transfer.destinationMatterId,
        amount: transfer.amount,
        currency: transfer.currency,
        reason: transfer.reason,
        reversesTransferId: transfer.reversesTransferId,
        actorUserId: transfer.createdByUserId,
      };

      const validation = this.validator.validateDraft(
        draftInput,
        this.ledgerRepository,
        this.allocationRepository,
        transfer,
      );

      recordTransferStage(
        stages,
        "validate",
        "validation",
        validationStarted,
        validation.ok,
      );

      return {
        ok: validation.ok,
        data: validation,
        validation,
        error: validation.ok
          ? undefined
          : {
              code: TRUST_TRANSFER_ERROR_CODES.TRUST_TRANSFER_VALIDATION_FAILED,
              message: "Transfer validation failed",
            },
        run: finalizeTransferRun("validate", startedAt, stages, validation.ok, {
          trustTransferId,
          validationErrors: validation.errors,
        }),
      };
    } catch (error) {
      return this.fail("validate", startedAt, stages, error);
    }
  }

  approveTransfer(
    input: ApproveTrustTransferInput,
  ): TrustTransferServiceResult<TrustTransfer> {
    const startedAt = performance.now();
    const stages: TrustTransferStageRecord[] = [];

    try {
      const transfer = this.requireTransfer(input.tenantId, input.trustTransferId);
      const validationStarted = performance.now();

      if (transfer.status !== "draft") {
        throw new TrustTransferError(
          TRUST_TRANSFER_ERROR_CODES.TRUST_TRANSFER_INVALID_STATUS,
          "Only draft transfers can be approved",
        );
      }

      assertTrustApprovalForDomainApprove(
        this.approvalService,
        input.tenantId,
        "trust_transfer",
        input.trustTransferId,
      );

      const validation = this.validateTransfer(input.tenantId, input.trustTransferId);
      if (!validation.ok || !validation.data?.ok) {
        recordTransferStage(stages, "approve", "validation", validationStarted, false);
        return this.validationFailure("approve", startedAt, stages, validation.data!);
      }
      recordTransferStage(stages, "approve", "validation", validationStarted, true);

      const approveStarted = performance.now();
      const approvedAt = new Date().toISOString();
      const approved: TrustTransfer = {
        ...transfer,
        status: "approved",
        approvedAt,
        approvedByUserId: input.actorUserId,
      };
      this.transferRepository.save(approved);
      recordTransferStage(stages, "approve", "approve", approveStarted, true);

      this.publishEvent({
        eventId: "legal.trust.transfer.approved",
        occurredAt: approvedAt,
        tenantId: input.tenantId,
        trustAccountId: approved.sourceTrustAccountId,
        payload: {
          trustTransferId: approved.trustTransferId,
          approvedByUserId: input.actorUserId,
        },
      });

      return {
        ok: true,
        data: approved,
        run: finalizeTransferRun("approve", startedAt, stages, true, {
          trustTransferId: approved.trustTransferId,
        }),
      };
    } catch (error) {
      return this.fail("approve", startedAt, stages, error);
    }
  }

  postTransfer(
    input: PostTrustTransferInput,
  ): TrustTransferServiceResult<TrustTransferPostResult> {
    const startedAt = performance.now();
    const stages: TrustTransferStageRecord[] = [];

    try {
      const transfer = this.requireTransfer(input.tenantId, input.trustTransferId);
      const validationStarted = performance.now();

      assertTrustApprovalForPost(
        this.approvalService,
        input.tenantId,
        "trust_transfer",
        input.trustTransferId,
        transfer.amount,
      );

      const postValidation = this.validator.validateForPost(transfer);

      if (!postValidation.ok) {
        recordTransferStage(stages, "post", "validation", validationStarted, false);
        return this.validationFailure("post", startedAt, stages, postValidation);
      }
      recordTransferStage(stages, "post", "validation", validationStarted, true);

      const postStarted = performance.now();
      const narrative = `Trust transfer ${transfer.transferType}: ${transfer.reason}`;

      const outResult = this.ledgerService.postTransaction({
        tenantId: transfer.tenantId,
        trustAccountId: transfer.sourceTrustAccountId,
        trustTransactionType: "transfer_out",
        amount: transfer.amount,
        currency: transfer.currency,
        transactionDate: input.postingDate,
        postingDate: input.postingDate,
        clientId: transfer.sourceClientId,
        matterId: transfer.sourceMatterId,
        narrative,
        actorUserId: input.actorUserId,
      });

      if (!outResult.ok || !outResult.data) {
        throw new TrustTransferError(
          TRUST_TRANSFER_ERROR_CODES.TRUST_TRANSFER_POST_FAILED,
          outResult.error?.message ?? "Transfer out posting failed",
        );
      }

      const inResult = this.ledgerService.postTransaction({
        tenantId: transfer.tenantId,
        trustAccountId: transfer.destinationTrustAccountId,
        trustTransactionType: "transfer_in",
        amount: transfer.amount,
        currency: transfer.currency,
        transactionDate: input.postingDate,
        postingDate: input.postingDate,
        clientId: transfer.destinationClientId,
        matterId: transfer.destinationMatterId,
        narrative,
        actorUserId: input.actorUserId,
        pairedTransactionId: outResult.data.trustTransactionId,
      });

      if (!inResult.ok || !inResult.data) {
        throw new TrustTransferError(
          TRUST_TRANSFER_ERROR_CODES.TRUST_TRANSFER_POST_FAILED,
          inResult.error?.message ?? "Transfer in posting failed",
        );
      }

      recordTransferStage(stages, "post", "post", postStarted, true);

      const allocateStarted = performance.now();
      const outAllocation = this.allocationService.allocate({
        tenantId: transfer.tenantId,
        trustTransactionId: outResult.data.trustTransactionId,
        actorUserId: input.actorUserId,
      });
      if (!outAllocation.ok) {
        throw new TrustTransferError(
          TRUST_TRANSFER_ERROR_CODES.TRUST_TRANSFER_POST_FAILED,
          outAllocation.error?.message ?? "Transfer out allocation failed",
        );
      }

      const inAllocation = this.allocationService.allocate({
        tenantId: transfer.tenantId,
        trustTransactionId: inResult.data.trustTransactionId,
        actorUserId: input.actorUserId,
      });
      if (!inAllocation.ok) {
        throw new TrustTransferError(
          TRUST_TRANSFER_ERROR_CODES.TRUST_TRANSFER_POST_FAILED,
          inAllocation.error?.message ?? "Transfer in allocation failed",
        );
      }
      recordTransferStage(stages, "post", "allocate", allocateStarted, true);

      const persistStarted = performance.now();
      const postedAt = new Date().toISOString();
      const posted: TrustTransfer = {
        ...transfer,
        status: "posted",
        transferOutTransactionId: outResult.data.trustTransactionId,
        transferInTransactionId: inResult.data.trustTransactionId,
        postedAt,
        postedByUserId: input.actorUserId,
      };
      this.transferRepository.save(posted);
      recordTransferStage(stages, "post", "persist", persistStarted, true);

      this.publishEvent({
        eventId: "legal.trust.transfer.posted",
        occurredAt: postedAt,
        tenantId: input.tenantId,
        trustAccountId: posted.sourceTrustAccountId,
        payload: {
          trustTransferId: posted.trustTransferId,
          transferOutTransactionId: outResult.data.trustTransactionId,
          transferInTransactionId: inResult.data.trustTransactionId,
          amount: posted.amount,
          postedByUserId: input.actorUserId,
        },
      });

      markTrustApprovalPosted(this.approvalService, {
        tenantId: input.tenantId,
        approvalType: "trust_transfer",
        subjectId: posted.trustTransferId,
        actorUserId: input.actorUserId,
      });

      return {
        ok: true,
        data: {
          transfer: posted,
          transferOutTransactionId: outResult.data.trustTransactionId,
          transferInTransactionId: inResult.data.trustTransactionId,
        },
        run: finalizeTransferRun("post", startedAt, stages, true, {
          trustTransferId: posted.trustTransferId,
        }),
      };
    } catch (error) {
      return this.fail("post", startedAt, stages, error);
    }
  }

  reverseTransfer(
    input: ReverseTrustTransferInput,
  ): TrustTransferServiceResult<TrustTransfer> {
    const startedAt = performance.now();
    const stages: TrustTransferStageRecord[] = [];

    try {
      const transfer = this.requireTransfer(input.tenantId, input.trustTransferId);
      const validationStarted = performance.now();

      if (transfer.status !== "posted") {
        throw new TrustTransferError(
          TRUST_TRANSFER_ERROR_CODES.TRUST_TRANSFER_INVALID_STATUS,
          "Only posted transfers can be reversed",
        );
      }
      if (!transfer.transferOutTransactionId || !transfer.transferInTransactionId) {
        throw new TrustTransferError(
          TRUST_TRANSFER_ERROR_CODES.TRUST_TRANSFER_REVERSAL_INVALID,
          "Posted transfer missing ledger transaction references",
        );
      }
      recordTransferStage(stages, "reverse", "validation", validationStarted, true);

      const reverseStarted = performance.now();
      const inReversal = this.ledgerService.reverseTransaction({
        tenantId: transfer.tenantId,
        trustAccountId: transfer.destinationTrustAccountId,
        trustTransactionId: transfer.transferInTransactionId,
        postingDate: input.postingDate,
        narrative: input.reason.trim(),
        actorUserId: input.actorUserId,
      });
      if (!inReversal.ok || !inReversal.data) {
        throw new TrustTransferError(
          TRUST_TRANSFER_ERROR_CODES.TRUST_TRANSFER_POST_FAILED,
          inReversal.error?.message ?? "Transfer in reversal failed",
        );
      }

      const outReversal = this.ledgerService.reverseTransaction({
        tenantId: transfer.tenantId,
        trustAccountId: transfer.sourceTrustAccountId,
        trustTransactionId: transfer.transferOutTransactionId,
        postingDate: input.postingDate,
        narrative: input.reason.trim(),
        actorUserId: input.actorUserId,
      });
      if (!outReversal.ok || !outReversal.data) {
        throw new TrustTransferError(
          TRUST_TRANSFER_ERROR_CODES.TRUST_TRANSFER_POST_FAILED,
          outReversal.error?.message ?? "Transfer out reversal failed",
        );
      }

      this.allocationService.reverse({
        tenantId: transfer.tenantId,
        reversalTransactionId: inReversal.data.trustTransactionId,
        actorUserId: input.actorUserId,
      });
      this.allocationService.reverse({
        tenantId: transfer.tenantId,
        reversalTransactionId: outReversal.data.trustTransactionId,
        actorUserId: input.actorUserId,
      });
      recordTransferStage(stages, "reverse", "reverse", reverseStarted, true);

      const persistStarted = performance.now();
      const reversedAt = new Date().toISOString();
      const reversed: TrustTransfer = {
        ...transfer,
        status: "reversed",
        reversalInTransactionId: inReversal.data.trustTransactionId,
        reversalOutTransactionId: outReversal.data.trustTransactionId,
        reversedAt,
        reversedByUserId: input.actorUserId,
      };
      this.transferRepository.save(reversed);
      recordTransferStage(stages, "reverse", "persist", persistStarted, true);

      this.publishEvent({
        eventId: "legal.trust.transfer.reversed",
        occurredAt: reversedAt,
        tenantId: input.tenantId,
        trustAccountId: reversed.sourceTrustAccountId,
        payload: {
          trustTransferId: reversed.trustTransferId,
          reversalOutTransactionId: outReversal.data.trustTransactionId,
          reversalInTransactionId: inReversal.data.trustTransactionId,
          reversedByUserId: input.actorUserId,
        },
      });

      return {
        ok: true,
        data: reversed,
        run: finalizeTransferRun("reverse", startedAt, stages, true, {
          trustTransferId: reversed.trustTransferId,
        }),
      };
    } catch (error) {
      return this.fail("reverse", startedAt, stages, error);
    }
  }

  cancelDraft(
    input: CancelTrustTransferDraftInput,
  ): TrustTransferServiceResult<TrustTransfer> {
    const startedAt = performance.now();
    const stages: TrustTransferStageRecord[] = [];

    try {
      const transfer = this.requireTransfer(input.tenantId, input.trustTransferId);
      const validationStarted = performance.now();

      if (transfer.status !== "draft") {
        throw new TrustTransferError(
          TRUST_TRANSFER_ERROR_CODES.TRUST_TRANSFER_INVALID_STATUS,
          "Only draft transfers can be cancelled",
        );
      }
      recordTransferStage(stages, "cancel", "validation", validationStarted, true);

      const persistStarted = performance.now();
      const cancelled: TrustTransfer = {
        ...transfer,
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        cancelledByUserId: input.actorUserId,
      };
      this.transferRepository.save(cancelled);
      recordTransferStage(stages, "cancel", "persist", persistStarted, true);

      return {
        ok: true,
        data: cancelled,
        run: finalizeTransferRun("cancel", startedAt, stages, true, {
          trustTransferId: cancelled.trustTransferId,
        }),
      };
    } catch (error) {
      return this.fail("cancel", startedAt, stages, error);
    }
  }

  listTransfers(criteria: TrustTransferHistoryCriteria): readonly TrustTransfer[] {
    return this.transferRepository.list(criteria);
  }

  getTransfer(tenantId: string, trustTransferId: string): TrustTransfer | undefined {
    return this.transferRepository.getById(tenantId, trustTransferId);
  }

  private requireTransfer(tenantId: string, trustTransferId: string): TrustTransfer {
    const transfer = this.transferRepository.getById(tenantId, trustTransferId);
    if (!transfer) {
      throw new TrustTransferError(
        TRUST_TRANSFER_ERROR_CODES.TRUST_TRANSFER_NOT_FOUND,
        "Trust transfer not found",
      );
    }
    if (transfer.tenantId !== tenantId) {
      throw new TrustTransferError(
        TRUST_TRANSFER_ERROR_CODES.TRUST_TRANSFER_TENANT_MISMATCH,
        "Tenant scope mismatch",
      );
    }
    return transfer;
  }

  private publishEvent(event: TrustTransferDomainEvent): void {
    this.eventBus.publish(event);
  }

  private validationFailure<T>(
    operation: TrustTransferStageRecord["operation"],
    startedAt: number,
    stages: TrustTransferStageRecord[],
    validation: TrustTransferValidationResult,
  ): TrustTransferServiceResult<T> {
    return {
      ok: false,
      validation,
      error: {
        code: TRUST_TRANSFER_ERROR_CODES.TRUST_TRANSFER_VALIDATION_FAILED,
        message: "Transfer validation failed",
      },
      run: finalizeTransferRun(operation, startedAt, stages, false, {
        validationErrors: validation.errors,
      }),
    };
  }

  private fail<T>(
    operation: TrustTransferStageRecord["operation"],
    startedAt: number,
    stages: TrustTransferStageRecord[],
    error: unknown,
  ): TrustTransferServiceResult<T> {
    const mapped = mapTransferError(error);
    return {
      ok: false,
      error: mapped,
      run: finalizeTransferRun(operation, startedAt, stages, false, {
        errorCode: mapped.code,
        errorMessage: mapped.message,
      }),
    };
  }
}

function mapTransferError(error: unknown): { code: string; message: string } {
  if (isTrustTransferError(error)) {
    return { code: error.code, message: error.message };
  }
  return {
    code: TRUST_TRANSFER_ERROR_CODES.TRUST_TRANSFER_FAILED,
    message: error instanceof Error ? error.message : "Unknown transfer error",
  };
}

export function createTrustTransferFixture(): {
  readonly ledgerRepository: InMemoryTrustLedgerRepository;
  readonly ledgerService: TrustLedgerService;
  readonly allocationRepository: InMemoryTrustAllocationRepository;
  readonly allocationService: TrustAllocationService;
  readonly transferRepository: InMemoryTrustTransferRepository;
  readonly transferService: TrustTransferService;
  readonly eventBus: InMemoryTrustTransferEventBus;
  readonly accountId: string;
} {
  const ledgerRepository = new InMemoryTrustLedgerRepositoryClass();
  const ledgerService = new TrustLedgerService({ repository: ledgerRepository });
  const allocationRepository = new InMemoryTrustAllocationRepositoryClass();
  const allocationService = new TrustAllocationService({
    allocationRepository,
    ledgerRepository,
  });
  const transferRepository = new InMemoryTrustTransferRepositoryClass();
  const eventBus = new InMemoryTrustTransferEventBus();
  const transferService = new TrustTransferService({
    ledgerRepository,
    allocationRepository,
    transferRepository,
    ledgerService,
    allocationService,
    eventBus,
  });

  const account = ledgerService.openAccount({
    tenantId: "tenant-test",
    name: "Trust",
    currency: "ZAR",
    institutionName: "Bank",
    accountNumberMasked: "****9999",
    actorUserId: "user-test",
  }).data!;

  return {
    ledgerRepository,
    ledgerService,
    allocationRepository,
    allocationService,
    transferRepository,
    transferService,
    eventBus,
    accountId: account.trustAccountId,
  };
}
