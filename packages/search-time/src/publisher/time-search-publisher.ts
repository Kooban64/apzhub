/**
 * TimeSearchPublisher — Time → SearchIntegrationPublisher (R12-SEARCH-01).
 */

import type {
  SearchIntegrationPublisher,
  SearchPublicationResult,
  SearchEntityLifecycleState,
} from "@apzhub/search-integration";

import {
  toSearchIntegrationContext,
  type TimeSearchPublicationContext,
} from "../context/time-search-publication-context";
import {
  TimeSearchDiagnosticsStore,
  TimeSearchErrorTranslator,
  TimeSearchLogger,
  TimeSearchMetrics,
  type TimeSearchDiagnostics,
  type TimeSearchStatistics,
} from "../diagnostics/time-search-observability";
import { TimeSearchLifecycle } from "../lifecycle/time-search-lifecycle";
import {
  TimeSearchEntityMapper,
  type TimeSearchMappableEntity,
} from "../mapper/time-search-entity-mapper";
import { TIME_SEARCH_ENTITY_TYPES } from "../types/entity-types";
import { TimeSearchEntityValidator } from "../validator/time-search-entity-validator";

export type TimeSearchPublisherOptions = {
  readonly integrationPublisher: SearchIntegrationPublisher;
  readonly mapper?: TimeSearchEntityMapper;
  readonly validator?: TimeSearchEntityValidator;
  readonly lifecycle?: TimeSearchLifecycle;
  readonly metrics?: TimeSearchMetrics;
  readonly logger?: TimeSearchLogger;
  readonly diagnostics?: TimeSearchDiagnosticsStore;
  readonly errors?: TimeSearchErrorTranslator;
};

function failedResult(
  operation: SearchPublicationResult["operation"],
  context: TimeSearchPublicationContext,
  message: string,
  started: number,
): SearchPublicationResult {
  return {
    operation,
    ok: false,
    correlationId: context.correlationId,
    productId: "time",
    message,
    durationMs: Math.max(0, Date.now() - started),
    acceptedAt: new Date().toISOString(),
  };
}

export class TimeSearchPublisher {
  private readonly mapper: TimeSearchEntityMapper;
  private readonly validator: TimeSearchEntityValidator;
  private readonly lifecycleHelper: TimeSearchLifecycle;
  private readonly metrics: TimeSearchMetrics;
  private readonly logger: TimeSearchLogger;
  private readonly diagnosticsStore: TimeSearchDiagnosticsStore;
  private readonly errors: TimeSearchErrorTranslator;

  constructor(private readonly options: TimeSearchPublisherOptions) {
    this.mapper = options.mapper ?? new TimeSearchEntityMapper();
    this.validator = options.validator ?? new TimeSearchEntityValidator();
    this.lifecycleHelper = options.lifecycle ?? new TimeSearchLifecycle();
    this.metrics = options.metrics ?? new TimeSearchMetrics();
    this.logger = options.logger ?? new TimeSearchLogger();
    this.diagnosticsStore = options.diagnostics ?? new TimeSearchDiagnosticsStore();
    this.errors = options.errors ?? new TimeSearchErrorTranslator();
  }

  validate(
    context: TimeSearchPublicationContext,
    input: TimeSearchMappableEntity,
  ): SearchPublicationResult {
    const started = Date.now();
    try {
      const draft = this.mapper.map(context, input);
      const local = this.validator.validateDraft(context, draft);
      this.diagnosticsStore.touch(
        "validate",
        context.correlationId,
        input.entityType,
        local.issues,
      );
      if (!local.valid) {
        this.metrics.record("validate", false, input.entityType);
        this.logger.log("warn", "Time search validation failed", {
          correlationId: context.correlationId,
          operation: "validate",
          entityType: input.entityType,
          entityId: draft.entityId,
        });
        return {
          operation: "validate",
          ok: false,
          correlationId: context.correlationId,
          productId: "time",
          entityId: draft.entityId,
          issues: local.issues.map((i) => ({
            field: i.field,
            code: i.code,
            message: i.message,
          })),
          durationMs: Math.max(0, Date.now() - started),
          acceptedAt: new Date().toISOString(),
        };
      }
      const result = this.options.integrationPublisher.validate(
        toSearchIntegrationContext(context),
        draft,
      );
      this.metrics.record("validate", result.ok, input.entityType);
      return result;
    } catch (error) {
      const domain = this.errors.translate(error);
      this.metrics.record("validate", false, input.entityType);
      this.diagnosticsStore.touch("validate", context.correlationId, input.entityType, [
        { field: "entity", code: domain.classification, message: domain.message },
      ]);
      return failedResult("validate", context, domain.message, started);
    }
  }

  preview(
    context: TimeSearchPublicationContext,
    input: TimeSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("preview", context, input, (draft, ic) =>
      this.options.integrationPublisher.preview(ic, draft),
    );
  }

  publish(
    context: TimeSearchPublicationContext,
    input: TimeSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("publish", context, input, (draft, ic) =>
      this.options.integrationPublisher.publish(ic, draft),
    );
  }

  update(
    context: TimeSearchPublicationContext,
    input: TimeSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("update", context, input, (draft, ic) =>
      this.options.integrationPublisher.update(ic, draft),
    );
  }

  remove(
    context: TimeSearchPublicationContext,
    entityType: TimeSearchMappableEntity["entityType"],
    entityId: string,
  ): SearchPublicationResult {
    const started = Date.now();
    this.diagnosticsStore.touch("remove", context.correlationId, entityType);
    try {
      const result = this.options.integrationPublisher.remove(
        toSearchIntegrationContext(context),
        entityId,
      );
      this.metrics.record("remove", result.ok, entityType);
      this.logger.log(result.ok ? "info" : "error", "Time search remove", {
        correlationId: context.correlationId,
        operation: "remove",
        entityType,
        entityId,
      });
      return result;
    } catch (error) {
      const domain = this.errors.translate(error);
      this.metrics.record("remove", false, entityType);
      return failedResult("remove", context, domain.message, started);
    }
  }

  lifecycle(
    context: TimeSearchPublicationContext,
    entityId: string,
    state: SearchEntityLifecycleState,
    reason?: string,
  ): SearchPublicationResult {
    const started = Date.now();
    this.diagnosticsStore.touch("lifecycle", context.correlationId);
    try {
      void this.lifecycleHelper.canTransition("published", state);
      return this.options.integrationPublisher.lifecycle(
        toSearchIntegrationContext(context),
        entityId,
        state,
        reason,
      );
    } catch (error) {
      const domain = this.errors.translate(error);
      return failedResult("lifecycle", context, domain.message, started);
    }
  }

  diagnostics(context: TimeSearchPublicationContext): TimeSearchDiagnostics {
    this.diagnosticsStore.touch("diagnostics", context.correlationId);
    return this.diagnosticsStore.build(
      this.metrics.snapshot(),
      TIME_SEARCH_ENTITY_TYPES,
    );
  }

  statistics(_context: TimeSearchPublicationContext): TimeSearchStatistics {
    return this.metrics.snapshot();
  }

  getMapper(): TimeSearchEntityMapper {
    return this.mapper;
  }

  getValidator(): TimeSearchEntityValidator {
    return this.validator;
  }

  getLifecycle(): TimeSearchLifecycle {
    return this.lifecycleHelper;
  }

  getLogger(): TimeSearchLogger {
    return this.logger;
  }

  getMetrics(): TimeSearchMetrics {
    return this.metrics;
  }

  getIntegrationPublisher(): SearchIntegrationPublisher {
    return this.options.integrationPublisher;
  }

  private runMapped(
    operation: "publish" | "update" | "preview",
    context: TimeSearchPublicationContext,
    input: TimeSearchMappableEntity,
    invoke: (
      draft: ReturnType<TimeSearchEntityMapper["map"]>,
      ic: ReturnType<typeof toSearchIntegrationContext>,
    ) => SearchPublicationResult,
  ): SearchPublicationResult {
    const started = Date.now();
    try {
      const draft = this.mapper.map(context, input);
      const local = this.validator.validateDraft(context, draft);
      this.diagnosticsStore.touch(
        operation,
        context.correlationId,
        input.entityType,
        local.issues,
      );
      if (!local.valid) {
        this.metrics.record(operation, false, input.entityType);
        this.logger.log("warn", `Time search ${operation} rejected`, {
          correlationId: context.correlationId,
          operation,
          entityType: input.entityType,
          entityId: draft.entityId,
        });
        return {
          operation,
          ok: false,
          correlationId: context.correlationId,
          productId: "time",
          entityId: draft.entityId,
          issues: local.issues.map((i) => ({
            field: i.field,
            code: i.code,
            message: i.message,
          })),
          durationMs: Math.max(0, Date.now() - started),
          acceptedAt: new Date().toISOString(),
        };
      }
      const result = invoke(draft, toSearchIntegrationContext(context));
      this.metrics.record(operation, result.ok, input.entityType);
      this.logger.log(result.ok ? "info" : "error", `Time search ${operation}`, {
        correlationId: context.correlationId,
        operation,
        entityType: input.entityType,
        entityId: draft.entityId,
      });
      return result;
    } catch (error) {
      const domain = this.errors.translate(error);
      this.metrics.record(operation, false, input.entityType);
      this.logger.log("error", domain.message, {
        correlationId: context.correlationId,
        operation,
        entityType: input.entityType,
      });
      return failedResult(operation, context, domain.message, started);
    }
  }
}
