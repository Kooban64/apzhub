import { randomUUID } from "node:crypto";

import {
  AUTOMATION_EVENT_TYPES,
  type AutomationDomainEvent,
  type AutomationEventPublisher,
} from "../contracts/events";
import type { AutomationEvidenceSink } from "../contracts/evidence";
import { defaultInMemoryEvidenceSink } from "../contracts/evidence";
import type {
  AutomationExecutionRecord,
  AutomationExecutionRequest,
  ExecutionLifecycleState,
} from "../contracts/execution";
import { TERMINAL_EXECUTION_STATES } from "../contracts/execution";
import { assertTransition } from "../lifecycle/transitions";
import type { ProviderRegistry } from "../registry/provider-registry";
import { InMemoryExecutionStore, type ExecutionStore } from "./execution-store";

function nowIso(): string {
  return new Date().toISOString();
}

function stateEventType(state: ExecutionLifecycleState): AutomationDomainEvent["type"] {
  switch (state) {
    case "queued":
      return AUTOMATION_EVENT_TYPES.executionQueued;
    case "preparing":
      return AUTOMATION_EVENT_TYPES.executionPreparing;
    case "running":
      return AUTOMATION_EVENT_TYPES.executionStarted;
    case "retrying":
      return AUTOMATION_EVENT_TYPES.executionRetrying;
    case "completed":
      return AUTOMATION_EVENT_TYPES.executionCompleted;
    case "failed":
      return AUTOMATION_EVENT_TYPES.executionFailed;
    case "cancelled":
      return AUTOMATION_EVENT_TYPES.executionCancelled;
    case "timed_out":
      return AUTOMATION_EVENT_TYPES.executionTimedOut;
    case "interrupted":
      return AUTOMATION_EVENT_TYPES.executionInterrupted;
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

export interface AutomationEngineOptions {
  readonly registry: ProviderRegistry;
  readonly store?: ExecutionStore;
  readonly publishEvent?: AutomationEventPublisher;
  readonly evidenceSink?: AutomationEvidenceSink;
}

/**
 * Provider-neutral Automation Engine.
 * Never imports Playwright or any concrete runner.
 */
export class AutomationEngine {
  private readonly registry: ProviderRegistry;
  private readonly store: ExecutionStore;
  private readonly publishEvent: AutomationEventPublisher;
  private readonly evidenceSink: AutomationEvidenceSink;
  private readonly abortControllers = new Map<string, AbortController>();

  constructor(options: AutomationEngineOptions) {
    this.registry = options.registry;
    this.store = options.store ?? new InMemoryExecutionStore();
    this.publishEvent = options.publishEvent ?? (() => undefined);
    this.evidenceSink = options.evidenceSink ?? defaultInMemoryEvidenceSink;
  }

  listProviders() {
    return this.registry.list();
  }

  async getExecution(
    executionId: string,
  ): Promise<AutomationExecutionRecord | undefined> {
    return this.store.get(executionId);
  }

  async listExecutions(
    tenantId?: string,
  ): Promise<readonly AutomationExecutionRecord[]> {
    return this.store.list(tenantId);
  }

  async enqueue(
    request: AutomationExecutionRequest,
  ): Promise<AutomationExecutionRecord> {
    const provider = this.registry.require(request.providerId);
    if (provider.descriptor.status === "placeholder") {
      throw new Error(
        `Provider ${request.providerId} is a placeholder and cannot execute in APZQEP-161`,
      );
    }
    if (provider.descriptor.status !== "active") {
      throw new Error(`Provider ${request.providerId} is not active`);
    }

    const executionId = request.executionId ?? randomUUID();
    const createdAt = nowIso();
    const maxAttempts = Math.max(1, (request.options?.retries ?? 0) + 1);
    const record: AutomationExecutionRecord = {
      executionId,
      tenantId: request.tenantId,
      projectId: request.projectId,
      providerId: request.providerId,
      correlationId: request.correlationId,
      requestedBy: request.requestedBy,
      target: request.target,
      options: {
        workers: 1,
        retries: 0,
        timeoutMs: 120_000,
        parallel: false,
        collectScreenshots: true,
        collectVideos: false,
        collectTraces: true,
        collectNetworkLogs: false,
        collectConsole: true,
        dryRun: false,
        ...request.options,
      },
      state: "queued",
      attempt: 0,
      maxAttempts,
      createdAt,
      updatedAt: createdAt,
      artifacts: [],
      timing: { queuedAt: createdAt },
      evidenceRefs: [],
    };

    await this.store.save(record);
    await this.emit(record);
    return record;
  }

  async run(executionId: string): Promise<AutomationExecutionRecord> {
    let record = await this.require(executionId);
    if (TERMINAL_EXECUTION_STATES.includes(record.state)) {
      return record;
    }

    const provider = this.registry.require(record.providerId);
    const controller = new AbortController();
    this.abortControllers.set(executionId, controller);

    const timeoutMs = record.options.timeoutMs ?? 120_000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      while (record.attempt < record.maxAttempts) {
        record = await this.transition(record, "preparing", {
          attempt: record.attempt + 1,
        });
        const context = {
          executionId: record.executionId,
          tenantId: record.tenantId,
          correlationId: record.correlationId,
          attempt: record.attempt,
          target: record.target,
          options: record.options,
          signal: controller.signal,
        };

        await provider.prepare(context);
        record = await this.transition(record, "running");

        const startedAt = nowIso();
        const result = await provider.execute(context);
        const finishedAt = nowIso();

        if (controller.signal.aborted) {
          record = await this.transition(record, "timed_out", {
            errorMessage: "Execution timed out or aborted",
            timing: {
              ...record.timing,
              startedAt,
              finishedAt,
              durationMs: Date.parse(finishedAt) - Date.parse(startedAt),
            },
          });
          break;
        }

        if (result.ok) {
          const evidenceRefs = await this.evidenceSink({
            executionId: record.executionId,
            tenantId: record.tenantId,
            correlationId: record.correlationId,
            providerId: record.providerId,
            artifacts: result.artifacts,
            logs: [],
            timing: result.timing ?? {
              startedAt,
              finishedAt,
              durationMs: Date.parse(finishedAt) - Date.parse(startedAt),
            },
            metadata: {
              summary: result.summary,
              provider: record.providerId,
            },
          });

          record = await this.transition(record, "completed", {
            artifacts: result.artifacts,
            evidenceRefs,
            resultSummary: result.summary,
            timing: {
              ...record.timing,
              startedAt: result.timing?.startedAt ?? startedAt,
              finishedAt: result.timing?.finishedAt ?? finishedAt,
              durationMs:
                result.timing?.durationMs ??
                Date.parse(finishedAt) - Date.parse(startedAt),
            },
          });

          await this.publishEvent({
            type: AUTOMATION_EVENT_TYPES.evidencePublished,
            occurredAt: nowIso(),
            executionId: record.executionId,
            tenantId: record.tenantId,
            correlationId: record.correlationId,
            providerId: record.providerId,
            state: record.state,
            payload: { evidenceCount: evidenceRefs.length },
          });
          break;
        }

        const canRetry = record.attempt < record.maxAttempts;
        if (canRetry) {
          record = await this.transition(record, "retrying", {
            errorMessage: result.errorMessage ?? result.summary,
            artifacts: [...record.artifacts, ...result.artifacts],
          });
          continue;
        }

        record = await this.transition(record, "failed", {
          errorMessage: result.errorMessage ?? result.summary,
          artifacts: [...record.artifacts, ...result.artifacts],
          resultSummary: result.summary,
          timing: {
            ...record.timing,
            startedAt,
            finishedAt,
            durationMs: Date.parse(finishedAt) - Date.parse(startedAt),
          },
        });
        break;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (controller.signal.aborted) {
        record = await this.transition(await this.require(executionId), "timed_out", {
          errorMessage: message,
        });
      } else {
        record = await this.transition(await this.require(executionId), "failed", {
          errorMessage: message,
        });
      }
    } finally {
      clearTimeout(timeout);
      this.abortControllers.delete(executionId);
    }

    return this.require(executionId);
  }

  async enqueueAndRun(
    request: AutomationExecutionRequest,
  ): Promise<AutomationExecutionRecord> {
    const queued = await this.enqueue(request);
    return this.run(queued.executionId);
  }

  async cancel(executionId: string): Promise<AutomationExecutionRecord> {
    const record = await this.require(executionId);
    if (TERMINAL_EXECUTION_STATES.includes(record.state)) {
      return record;
    }
    this.abortControllers.get(executionId)?.abort();
    const provider = this.registry.get(record.providerId);
    await provider?.cancel?.({
      executionId: record.executionId,
      tenantId: record.tenantId,
      correlationId: record.correlationId,
      attempt: record.attempt,
      target: record.target,
      options: record.options,
    });
    return this.transition(record, "cancelled", {
      errorMessage: "Cancelled by operator",
    });
  }

  private async require(executionId: string): Promise<AutomationExecutionRecord> {
    const record = await this.store.get(executionId);
    if (!record) {
      throw new Error(`Unknown execution: ${executionId}`);
    }
    return record;
  }

  private async transition(
    record: AutomationExecutionRecord,
    to: ExecutionLifecycleState,
    patch: Partial<AutomationExecutionRecord> = {},
  ): Promise<AutomationExecutionRecord> {
    assertTransition(record.state, to);
    const next: AutomationExecutionRecord = {
      ...record,
      ...patch,
      state: to,
      attempt: patch.attempt ?? record.attempt,
      updatedAt: nowIso(),
      artifacts: patch.artifacts ?? record.artifacts,
      timing: patch.timing ?? record.timing,
      evidenceRefs: patch.evidenceRefs ?? record.evidenceRefs,
    };
    await this.store.save(next);
    void this.emit(next);
    return next;
  }

  private async emit(record: AutomationExecutionRecord): Promise<void> {
    await this.publishEvent({
      type: stateEventType(record.state),
      occurredAt: nowIso(),
      executionId: record.executionId,
      tenantId: record.tenantId,
      correlationId: record.correlationId,
      providerId: record.providerId,
      state: record.state,
      attempt: record.attempt,
    });
  }
}
