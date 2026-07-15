import type { IntegrationRequestContext } from "../../types/context";
import type { EventMetrics } from "../metrics";
import {
  isEventError,
  pollingCancelledError,
  pollingLimitExceededError,
  pollingStallDetectedError,
} from "../errors";
import type { IntegrationSourceEvent } from "../source-event";
import type { PollingCheckpointStore } from "./checkpoint";
import { cursorsEqual, type PollingCursor } from "./cursor";
import {
  pollingCompleted,
  pollingFailed,
  type PollingExecutionResult,
} from "./results";
import type {
  PollingExecutionPolicy,
  PollingMode,
  PollingRunOptions,
  PollingSource,
} from "./types";

export interface PollingExecutionPipelineOptions {
  readonly source: PollingSource;
  readonly checkpointStore?: PollingCheckpointStore;
  readonly metrics?: EventMetrics;
  readonly defaultPolicy?: PollingExecutionPolicy;
  readonly now?: () => number;
}

export interface PollingExecutionPipeline {
  execute(
    context: IntegrationRequestContext,
    options: PollingRunOptions,
  ): Promise<PollingExecutionResult>;
}

const DEFAULT_POLICY: PollingExecutionPolicy = {
  limits: {
    maxPages: 100,
    maxRecords: 10_000,
    maxDurationMs: 60_000,
    maxDuplicatePages: 2,
  },
  requireCheckpointAck: true,
};

/**
 * Executes polling with page/record/duration limits, cancellation,
 * and stall/duplicate-page detection. Proposes checkpoints but does
 * NOT auto-commit before acknowledgement.
 */
export class DefaultPollingExecutionPipeline implements PollingExecutionPipeline {
  private readonly source: PollingSource;
  private readonly checkpointStore?: PollingCheckpointStore;
  private readonly metrics?: EventMetrics;
  private readonly defaultPolicy: PollingExecutionPolicy;
  private readonly now: () => number;

  constructor(options: PollingExecutionPipelineOptions) {
    this.source = options.source;
    this.checkpointStore = options.checkpointStore;
    this.metrics = options.metrics;
    this.defaultPolicy = options.defaultPolicy ?? DEFAULT_POLICY;
    this.now = options.now ?? (() => Date.now());
  }

  async execute(
    context: IntegrationRequestContext,
    options: PollingRunOptions,
  ): Promise<PollingExecutionResult> {
    const started = this.now();
    const policy = options.policy ?? this.defaultPolicy;
    const limits = { ...DEFAULT_POLICY.limits, ...policy.limits };
    const mode: PollingMode = options.mode;
    const correlationId = options.correlationId ?? context.correlationId;

    const allRecords: unknown[] = [];
    const allEvents: IntegrationSourceEvent[] = [];
    let cursor = options.cursor;
    let pagesProcessed = 0;
    let duplicatePagesDetected = 0;
    let previousPageToken: string | undefined;
    let stalled = false;
    let cancelled = false;
    let limitHit: string | undefined;
    let lastCursor: PollingCursor | undefined = cursor;

    try {
      while (true) {
        if (options.signal?.aborted) {
          cancelled = true;
          break;
        }

        const elapsed = this.now() - started;
        if (limits.maxDurationMs !== undefined && elapsed >= limits.maxDurationMs) {
          limitHit = "duration";
          break;
        }

        if (limits.maxPages !== undefined && pagesProcessed >= limits.maxPages) {
          limitHit = "pages";
          break;
        }

        if (limits.maxRecords !== undefined && allRecords.length >= limits.maxRecords) {
          limitHit = "records";
          break;
        }

        const page = await this.source.poll(context, {
          mode,
          cursor,
          pageSize: options.pageSize,
          since: options.since,
          signal: options.signal,
        });

        pagesProcessed += 1;

        if (
          page.pageToken !== undefined &&
          previousPageToken !== undefined &&
          page.pageToken === previousPageToken
        ) {
          duplicatePagesDetected += 1;
          if (
            limits.maxDuplicatePages !== undefined &&
            duplicatePagesDetected >= limits.maxDuplicatePages
          ) {
            stalled = true;
            break;
          }
        } else {
          duplicatePagesDetected = 0;
        }
        previousPageToken = page.pageToken;

        if (
          cursorsEqual(cursor, page.nextCursor) &&
          !page.exhausted &&
          page.records.length === 0
        ) {
          stalled = true;
          break;
        }

        const remaining =
          limits.maxRecords !== undefined
            ? limits.maxRecords - allRecords.length
            : page.records.length;
        const slice = page.records.slice(0, Math.max(0, remaining));
        allRecords.push(...slice);
        if (page.events) {
          allEvents.push(...page.events);
        }

        lastCursor = page.nextCursor ?? cursor;
        cursor = page.nextCursor;

        if (page.exhausted || !page.nextCursor) {
          break;
        }

        if (limits.maxRecords !== undefined && allRecords.length >= limits.maxRecords) {
          limitHit = "records";
          break;
        }
      }

      const durationMs = this.now() - started;
      const diagnostics = {
        pagesProcessed,
        recordsProcessed: allRecords.length,
        durationMs,
        stalled,
        cancelled,
        duplicatePagesDetected,
        limitHit,
      };

      let proposedCheckpoint;
      if (this.checkpointStore && lastCursor && policy.requireCheckpointAck !== false) {
        proposedCheckpoint = await this.checkpointStore.propose({
          sourceId: this.source.definition.id,
          cursor: lastCursor,
          recordsProcessed: allRecords.length,
          correlationId,
        });
      }

      if (cancelled) {
        const result = pollingFailed({
          outcome: "cancelled",
          mode,
          records: allRecords,
          events: allEvents,
          cursor: lastCursor,
          proposedCheckpoint,
          diagnostics: {
            ...diagnostics,
            error: pollingCancelledError({ correlationId }),
          },
          error: pollingCancelledError({ correlationId }),
        });
        this.metrics?.recordPollingExecution({
          outcome: result.outcome,
          success: false,
          durationMs,
          recordsProcessed: allRecords.length,
        });
        return result;
      }

      if (stalled) {
        const error = pollingStallDetectedError({ correlationId });
        const result = pollingFailed({
          outcome: "stalled",
          mode,
          records: allRecords,
          events: allEvents,
          cursor: lastCursor,
          proposedCheckpoint,
          diagnostics: { ...diagnostics, error },
          error,
        });
        this.metrics?.recordPollingExecution({
          outcome: result.outcome,
          success: false,
          durationMs,
          recordsProcessed: allRecords.length,
        });
        return result;
      }

      if (limitHit) {
        const error = pollingLimitExceededError({ correlationId }, limitHit);
        const result = pollingFailed({
          outcome: "limit_exceeded",
          mode,
          records: allRecords,
          events: allEvents,
          cursor: lastCursor,
          proposedCheckpoint,
          diagnostics: { ...diagnostics, error },
          error,
        });
        this.metrics?.recordPollingExecution({
          outcome: result.outcome,
          success: false,
          durationMs,
          recordsProcessed: allRecords.length,
        });
        return result;
      }

      const result = pollingCompleted({
        mode,
        records: allRecords,
        events: allEvents,
        cursor: lastCursor,
        proposedCheckpoint,
        diagnostics,
      });
      this.metrics?.recordPollingExecution({
        outcome: result.outcome,
        success: true,
        durationMs,
        recordsProcessed: allRecords.length,
      });
      return result;
    } catch (error) {
      const durationMs = this.now() - started;
      const eventError = isEventError(error)
        ? error
        : pollingStallDetectedError({
            correlationId,
            details: {
              message: error instanceof Error ? error.message : "polling_failed",
            },
          });
      const result = pollingFailed({
        outcome: "failed",
        mode,
        records: allRecords,
        events: allEvents,
        cursor: lastCursor,
        diagnostics: {
          pagesProcessed,
          recordsProcessed: allRecords.length,
          durationMs,
          stalled,
          cancelled,
          duplicatePagesDetected,
          error: eventError,
        },
        error: eventError,
      });
      this.metrics?.recordPollingExecution({
        outcome: result.outcome,
        success: false,
        durationMs,
        recordsProcessed: allRecords.length,
      });
      return result;
    }
  }
}

export function createPollingExecutionPipeline(
  options: PollingExecutionPipelineOptions,
): DefaultPollingExecutionPipeline {
  return new DefaultPollingExecutionPipeline(options);
}
