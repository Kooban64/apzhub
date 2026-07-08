import type { InMemoryTrustAllocationRepository } from "./in-memory-trust-allocation-repository";
import { InMemoryTrustAllocationRepository as InMemoryTrustAllocationRepositoryClass } from "./in-memory-trust-allocation-repository";
import type { InMemoryTrustLedgerRepository } from "./in-memory-trust-ledger-repository";
import { InMemoryTrustLedgerRepository as InMemoryTrustLedgerRepositoryClass } from "./in-memory-trust-ledger-repository";
import {
  buildTransactionAllocationSummary,
  computeClientAllocatedBalance,
  computeMatterAllocatedBalance,
  computeUnallocatedBalance,
  sumAllocatedForTransaction,
} from "./trust-allocation-balance";
import {
  finalizeAllocationRun,
  recordAllocationStage,
} from "./trust-allocation-diagnostics";
import { InMemoryTrustAllocationEventBus } from "./trust-allocation-events";
import {
  TRUST_ALLOCATION_ERROR_CODES,
  TrustAllocationError,
  isTrustAllocationError,
} from "./trust-allocation-errors";
import type {
  AdjustTrustAllocationsInput,
  AllocateTrustTransactionInput,
  ReverseTrustAllocationsInput,
  TrustAllocation,
  TrustAllocationDomainEvent,
  TrustAllocationHistoryCriteria,
  TrustAllocatedBalanceProjection,
  TrustAllocationLineInput,
  TrustAllocationRunRecord,
  TrustAllocationServiceResult,
  TrustAllocationStageRecord,
  TrustAllocationSummary,
} from "./trust-allocation-types";
import {
  TrustAllocationValidator,
  findTrustTransaction,
  resolveLineAllocationType,
  transactionAllocationEffect,
} from "./trust-allocation-validator";
import { createTrustId } from "./trust-id";
import type { TrustTransaction } from "./trust-ledger-types";
import { TrustLedgerService } from "./trust-ledger-service";

export interface TrustAllocationServiceOptions {
  readonly allocationRepository: InMemoryTrustAllocationRepository;
  readonly ledgerRepository: InMemoryTrustLedgerRepository;
  readonly validator?: TrustAllocationValidator;
  readonly eventBus?: InMemoryTrustAllocationEventBus;
}

/** Trust allocation layer above transaction workflow (LAW-015-04). */
export class TrustAllocationService {
  private readonly allocationRepository: InMemoryTrustAllocationRepository;
  private readonly ledgerRepository: InMemoryTrustLedgerRepository;
  private readonly validator: TrustAllocationValidator;
  private readonly eventBus: InMemoryTrustAllocationEventBus;

  constructor(options: TrustAllocationServiceOptions) {
    this.allocationRepository = options.allocationRepository;
    this.ledgerRepository = options.ledgerRepository;
    this.validator = options.validator ?? new TrustAllocationValidator();
    this.eventBus = options.eventBus ?? new InMemoryTrustAllocationEventBus();
  }

  getEventBus(): InMemoryTrustAllocationEventBus {
    return this.eventBus;
  }

  allocate(input: AllocateTrustTransactionInput): TrustAllocationServiceResult {
    const startedAt = performance.now();
    const stages: TrustAllocationStageRecord[] = [];

    try {
      const transaction = this.requireTransaction(
        input.tenantId,
        input.trustTransactionId,
      );
      const validationStarted = performance.now();

      const lines =
        input.lines && input.lines.length > 0
          ? input.lines
          : this.validator.validateAutoLines(transaction);

      const effect = transactionAllocationEffect(transaction, this.ledgerRepository);
      const existing = this.allocationRepository.listByTransaction(
        input.tenantId,
        input.trustTransactionId,
      );
      const existingAllocatedTotal = sumAllocatedForTransaction(existing, effect);

      const validation = this.validator.validate({
        tenantId: input.tenantId,
        transaction,
        lines,
        existingAllocatedTotal,
        allowPartial: input.allowPartial,
      });

      if (!validation.ok) {
        recordAllocationStage(
          stages,
          "allocate",
          "validation",
          validationStarted,
          false,
        );
        const run = finalizeAllocationRun("allocate", startedAt, stages, false, {
          tenantId: input.tenantId,
          trustAccountId: transaction.trustAccountId,
          trustTransactionId: input.trustTransactionId,
          errorCode: TRUST_ALLOCATION_ERROR_CODES.TRUST_ALLOCATION_INVALID,
        });
        return {
          ok: false,
          validationErrors: validation.errors,
          error: {
            code: TRUST_ALLOCATION_ERROR_CODES.TRUST_ALLOCATION_INVALID,
            message: "Allocation validation failed",
          },
          run,
        };
      }

      recordAllocationStage(stages, "allocate", "validation", validationStarted, true);

      const repoStarted = performance.now();
      const created = this.buildAllocations({
        transaction,
        lines,
        allocationType: "client",
        actorUserId: input.actorUserId,
      });
      this.allocationRepository.appendMany(created);
      recordAllocationStage(stages, "allocate", "repository", repoStarted, true);

      const eventStarted = performance.now();
      const eventId =
        existing.length === 0
          ? ("legal.trust.allocation.created" as const)
          : ("legal.trust.allocation.updated" as const);
      this.publishEvent({
        eventId,
        occurredAt: new Date().toISOString(),
        tenantId: transaction.tenantId,
        trustAccountId: transaction.trustAccountId,
        payload: {
          trustTransactionId: transaction.trustTransactionId,
          allocationIds: created.map((item) => item.trustAllocationId),
          actorUserId: input.actorUserId,
        },
      });
      recordAllocationStage(stages, "allocate", "event", eventStarted, true);

      const allAllocations = this.allocationRepository.listByTransaction(
        input.tenantId,
        input.trustTransactionId,
      );
      const summary = buildTransactionAllocationSummary(
        transaction,
        allAllocations,
        effect,
      );

      const run = finalizeAllocationRun("allocate", startedAt, stages, true, {
        tenantId: input.tenantId,
        trustAccountId: transaction.trustAccountId,
        trustTransactionId: input.trustTransactionId,
      });

      return { ok: true, allocations: created, summary, run };
    } catch (error) {
      return this.fail(
        "allocate",
        startedAt,
        stages,
        error,
        input.tenantId,
        input.trustTransactionId,
      );
    }
  }

  adjust(input: AdjustTrustAllocationsInput): TrustAllocationServiceResult {
    const startedAt = performance.now();
    const stages: TrustAllocationStageRecord[] = [];

    try {
      const transaction = this.requireTransaction(
        input.tenantId,
        input.trustTransactionId,
      );
      const validationStarted = performance.now();

      const existing = this.allocationRepository.listByTransaction(
        input.tenantId,
        input.trustTransactionId,
      );
      if (existing.length === 0) {
        throw new TrustAllocationError(
          TRUST_ALLOCATION_ERROR_CODES.TRUST_ALLOCATION_ADJUSTMENT_INVALID,
          "Cannot adjust allocations before initial allocation",
        );
      }

      const adjustmentLines = input.lines.map((line) => {
        if (!line.effect) {
          throw new TrustAllocationError(
            TRUST_ALLOCATION_ERROR_CODES.TRUST_ALLOCATION_ADJUSTMENT_INVALID,
            "Adjustment lines require explicit increase/decrease effect",
          );
        }
        return {
          ...line,
          allocationType: "adjustment" as const,
        };
      });

      const validation = this.validator.validate({
        tenantId: input.tenantId,
        transaction,
        lines: adjustmentLines,
        existingAllocatedTotal: 0,
        isAdjustment: true,
      });

      if (!validation.ok) {
        recordAllocationStage(stages, "adjust", "validation", validationStarted, false);
        const run = finalizeAllocationRun("adjust", startedAt, stages, false, {
          tenantId: input.tenantId,
          trustAccountId: transaction.trustAccountId,
          trustTransactionId: input.trustTransactionId,
          errorCode: TRUST_ALLOCATION_ERROR_CODES.TRUST_ALLOCATION_ADJUSTMENT_INVALID,
        });
        return {
          ok: false,
          validationErrors: validation.errors,
          error: {
            code: TRUST_ALLOCATION_ERROR_CODES.TRUST_ALLOCATION_ADJUSTMENT_INVALID,
            message: "Allocation adjustment validation failed",
          },
          run,
        };
      }

      recordAllocationStage(stages, "adjust", "validation", validationStarted, true);

      const repoStarted = performance.now();
      const created = this.buildAllocations({
        transaction,
        lines: adjustmentLines,
        allocationType: "adjustment",
        actorUserId: input.actorUserId,
      });
      this.allocationRepository.appendMany(created);
      recordAllocationStage(stages, "adjust", "repository", repoStarted, true);

      const eventStarted = performance.now();
      this.publishEvent({
        eventId: "legal.trust.allocation.updated",
        occurredAt: new Date().toISOString(),
        tenantId: transaction.tenantId,
        trustAccountId: transaction.trustAccountId,
        payload: {
          trustTransactionId: transaction.trustTransactionId,
          allocationIds: created.map((item) => item.trustAllocationId),
          reason: input.reason,
          actorUserId: input.actorUserId,
        },
      });
      recordAllocationStage(stages, "adjust", "event", eventStarted, true);

      const effect = transactionAllocationEffect(transaction, this.ledgerRepository);
      const allAllocations = this.allocationRepository.listByTransaction(
        input.tenantId,
        input.trustTransactionId,
      );
      const summary = buildTransactionAllocationSummary(
        transaction,
        allAllocations,
        effect,
      );

      const run = finalizeAllocationRun("adjust", startedAt, stages, true, {
        tenantId: input.tenantId,
        trustAccountId: transaction.trustAccountId,
        trustTransactionId: input.trustTransactionId,
      });

      return { ok: true, allocations: created, summary, run };
    } catch (error) {
      return this.fail(
        "adjust",
        startedAt,
        stages,
        error,
        input.tenantId,
        input.trustTransactionId,
      );
    }
  }

  reverse(input: ReverseTrustAllocationsInput): TrustAllocationServiceResult {
    const startedAt = performance.now();
    const stages: TrustAllocationStageRecord[] = [];

    try {
      const reversalTransaction = this.requireTransaction(
        input.tenantId,
        input.reversalTransactionId,
      );

      if (reversalTransaction.trustTransactionType !== "reversal") {
        throw new TrustAllocationError(
          TRUST_ALLOCATION_ERROR_CODES.TRUST_ALLOCATION_REVERSAL_INVALID,
          "Transaction is not a reversal",
        );
      }

      if (!reversalTransaction.reversesTransactionId) {
        throw new TrustAllocationError(
          TRUST_ALLOCATION_ERROR_CODES.TRUST_ALLOCATION_REVERSAL_INVALID,
          "Reversal transaction missing original reference",
        );
      }

      const validationStarted = performance.now();
      const existingReversalAllocations = this.allocationRepository.listByTransaction(
        input.tenantId,
        input.reversalTransactionId,
      );
      if (existingReversalAllocations.length > 0) {
        throw new TrustAllocationError(
          TRUST_ALLOCATION_ERROR_CODES.TRUST_ALLOCATION_ALREADY_REVERSED,
          "Allocations already reversed for this reversal transaction",
        );
      }

      const originalAllocations = this.allocationRepository.listByTransaction(
        input.tenantId,
        reversalTransaction.reversesTransactionId,
      );
      if (originalAllocations.length === 0) {
        throw new TrustAllocationError(
          TRUST_ALLOCATION_ERROR_CODES.TRUST_ALLOCATION_NOT_FOUND,
          "No allocations found for original transaction",
        );
      }

      recordAllocationStage(stages, "reverse", "validation", validationStarted, true);

      const repoStarted = performance.now();
      const createdAt = new Date().toISOString();
      const created = originalAllocations.map((original) => {
        const reversedEffect = original.effect === "increase" ? "decrease" : "increase";
        return {
          trustAllocationId: createTrustId("tal"),
          tenantId: original.tenantId,
          trustAccountId: original.trustAccountId,
          trustTransactionId: reversalTransaction.trustTransactionId,
          clientId: original.clientId,
          matterId: original.matterId,
          amount: original.amount,
          effect: reversedEffect,
          currency: original.currency,
          allocationType: "reversal" as const,
          allocationDate: reversalTransaction.transactionDate,
          reversesAllocationId: original.trustAllocationId,
          reversesTrustTransactionId: reversalTransaction.reversesTransactionId,
          createdByUserId: input.actorUserId,
          createdAt,
        } satisfies TrustAllocation;
      });

      this.allocationRepository.appendMany(created);
      recordAllocationStage(stages, "reverse", "repository", repoStarted, true);

      const eventStarted = performance.now();
      this.publishEvent({
        eventId: "legal.trust.allocation.reversed",
        occurredAt: createdAt,
        tenantId: reversalTransaction.tenantId,
        trustAccountId: reversalTransaction.trustAccountId,
        payload: {
          reversalTransactionId: reversalTransaction.trustTransactionId,
          reversesTransactionId: reversalTransaction.reversesTransactionId,
          allocationIds: created.map((item) => item.trustAllocationId),
          actorUserId: input.actorUserId,
        },
      });
      recordAllocationStage(stages, "reverse", "event", eventStarted, true);

      const effect = transactionAllocationEffect(
        reversalTransaction,
        this.ledgerRepository,
      );
      const allAllocations = this.allocationRepository.listByTransaction(
        input.tenantId,
        input.reversalTransactionId,
      );
      const summary = buildTransactionAllocationSummary(
        reversalTransaction,
        allAllocations,
        effect,
      );

      const run = finalizeAllocationRun("reverse", startedAt, stages, true, {
        tenantId: input.tenantId,
        trustAccountId: reversalTransaction.trustAccountId,
        trustTransactionId: input.reversalTransactionId,
      });

      return { ok: true, allocations: created, summary, run };
    } catch (error) {
      return this.fail(
        "reverse",
        startedAt,
        stages,
        error,
        input.tenantId,
        input.reversalTransactionId,
      );
    }
  }

  getTransactionSummary(
    tenantId: string,
    trustTransactionId: string,
  ): TrustAllocationSummary | undefined {
    const transaction = findTrustTransaction(
      this.ledgerRepository,
      tenantId,
      trustTransactionId,
    );
    if (!transaction) {
      return undefined;
    }

    const allocations = this.allocationRepository.listByTransaction(
      tenantId,
      trustTransactionId,
    );
    const effect = transactionAllocationEffect(transaction, this.ledgerRepository);
    return buildTransactionAllocationSummary(transaction, allocations, effect);
  }

  getAllocationHistory(
    criteria: TrustAllocationHistoryCriteria,
  ): readonly TrustAllocation[] {
    return this.allocationRepository.list(criteria);
  }

  getClientAllocatedBalance(
    tenantId: string,
    trustAccountId: string,
    clientId: string,
  ): TrustAllocatedBalanceProjection | undefined {
    const account = this.ledgerRepository.getAccount(tenantId, trustAccountId);
    if (!account) {
      return undefined;
    }

    const allocations = this.allocationRepository.list({
      tenantId,
      trustAccountId,
      clientId,
    });
    return computeClientAllocatedBalance(
      allocations,
      tenantId,
      trustAccountId,
      clientId,
      account.currency,
    );
  }

  getMatterAllocatedBalance(
    tenantId: string,
    trustAccountId: string,
    clientId: string,
    matterId: string,
  ): TrustAllocatedBalanceProjection | undefined {
    const account = this.ledgerRepository.getAccount(tenantId, trustAccountId);
    if (!account) {
      return undefined;
    }

    const allocations = this.allocationRepository.list({
      tenantId,
      trustAccountId,
      clientId,
      matterId,
    });
    return computeMatterAllocatedBalance(
      allocations,
      tenantId,
      trustAccountId,
      clientId,
      matterId,
      account.currency,
    );
  }

  getUnallocatedBalance(
    tenantId: string,
    trustAccountId: string,
    clientId?: string,
  ): TrustAllocatedBalanceProjection | undefined {
    const account = this.ledgerRepository.getAccount(tenantId, trustAccountId);
    if (!account) {
      return undefined;
    }

    const allocations = this.allocationRepository.list({
      tenantId,
      trustAccountId,
      clientId,
    });
    return computeUnallocatedBalance(
      allocations,
      tenantId,
      trustAccountId,
      account.currency,
      clientId,
    );
  }

  private buildAllocations(options: {
    readonly transaction: TrustTransaction;
    readonly lines: readonly TrustAllocationLineInput[];
    readonly allocationType: TrustAllocation["allocationType"];
    readonly actorUserId: string;
  }): TrustAllocation[] {
    const createdAt = new Date().toISOString();
    const defaultEffect = transactionAllocationEffect(
      options.transaction,
      this.ledgerRepository,
    );

    return options.lines.map((line) => {
      const allocationType =
        options.allocationType === "adjustment" || options.allocationType === "reversal"
          ? options.allocationType
          : resolveLineAllocationType(line);

      return {
        trustAllocationId: createTrustId("tal"),
        tenantId: options.transaction.tenantId,
        trustAccountId: options.transaction.trustAccountId,
        trustTransactionId: options.transaction.trustTransactionId,
        clientId: line.clientId,
        matterId: line.matterId,
        amount: line.amount,
        effect: line.effect ?? defaultEffect,
        currency: options.transaction.currency,
        allocationType,
        allocationDate: options.transaction.transactionDate,
        createdByUserId: options.actorUserId,
        createdAt,
      };
    });
  }

  private requireTransaction(
    tenantId: string,
    trustTransactionId: string,
  ): TrustTransaction {
    const transaction = findTrustTransaction(
      this.ledgerRepository,
      tenantId,
      trustTransactionId,
    );
    if (!transaction) {
      throw new TrustAllocationError(
        TRUST_ALLOCATION_ERROR_CODES.TRUST_ALLOCATION_TRANSACTION_NOT_FOUND,
        "Trust transaction not found",
      );
    }

    if (transaction.tenantId !== tenantId) {
      throw new TrustAllocationError(
        TRUST_ALLOCATION_ERROR_CODES.TRUST_ALLOCATION_TENANT_MISMATCH,
        "Tenant scope mismatch",
      );
    }

    if (transaction.status !== "posted") {
      throw new TrustAllocationError(
        TRUST_ALLOCATION_ERROR_CODES.TRUST_ALLOCATION_TRANSACTION_NOT_POSTED,
        "Allocations require a posted transaction",
      );
    }

    return transaction;
  }

  private publishEvent(event: TrustAllocationDomainEvent): void {
    this.eventBus.publish(event);
  }

  private fail(
    operation: TrustAllocationRunRecord["operation"],
    startedAt: number,
    stages: TrustAllocationStageRecord[],
    error: unknown,
    tenantId: string,
    trustTransactionId: string,
  ): TrustAllocationServiceResult {
    const normalized = normalizeAllocationError(error);
    recordAllocationStage(
      stages,
      operation,
      "validation",
      startedAt,
      false,
      normalized.code,
    );
    const run = finalizeAllocationRun(operation, startedAt, stages, false, {
      tenantId,
      trustTransactionId,
      errorCode: normalized.code,
    });
    return { ok: false, error: normalized, run };
  }
}

function normalizeAllocationError(error: unknown): { code: string; message: string } {
  if (isTrustAllocationError(error)) {
    return { code: error.code, message: error.message };
  }
  return {
    code: TRUST_ALLOCATION_ERROR_CODES.TRUST_ALLOCATION_INVALID,
    message: error instanceof Error ? error.message : "Unknown allocation error",
  };
}

export function createTrustAllocationFixture(): {
  readonly ledgerRepository: InMemoryTrustLedgerRepository;
  readonly ledgerService: TrustLedgerService;
  readonly allocationRepository: InMemoryTrustAllocationRepository;
  readonly allocationService: TrustAllocationService;
  readonly eventBus: InMemoryTrustAllocationEventBus;
  readonly accountId: string;
} {
  const ledgerRepository = new InMemoryTrustLedgerRepositoryClass();
  const ledgerService = new TrustLedgerService({ repository: ledgerRepository });
  const allocationRepository = new InMemoryTrustAllocationRepositoryClass();
  const eventBus = new InMemoryTrustAllocationEventBus();
  const allocationService = new TrustAllocationService({
    allocationRepository,
    ledgerRepository,
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
    eventBus,
    accountId: account.trustAccountId,
  };
}
