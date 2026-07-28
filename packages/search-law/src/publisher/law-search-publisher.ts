/**
 * LawSearchPublisher — Law → SearchIntegrationPublisher (R12-SEARCH-02).
 */

import type {
  SearchIntegrationPublisher,
  SearchPublicationResult,
  SearchEntityLifecycleState,
} from "@apzhub/search-integration";

import {
  toSearchIntegrationContext,
  type LawSearchPublicationContext,
} from "../context/law-search-publication-context";
import {
  LawSearchDiagnosticsStore,
  LawSearchErrorTranslator,
  LawSearchLogger,
  LawSearchMetrics,
  type LawSearchDiagnostics,
  type LawSearchStatistics,
} from "../diagnostics/law-search-observability";
import { LawSearchLifecycle } from "../lifecycle/law-search-lifecycle";
import {
  LawSearchEntityMapper,
  type LawSearchMappableEntity,
} from "../mapper/law-search-entity-mapper";
import { LAW_SEARCH_ENTITY_TYPES } from "../types/entity-types";
import { LawSearchEntityValidator } from "../validator/law-search-entity-validator";

export type LawSearchPublisherOptions = {
  readonly integrationPublisher: SearchIntegrationPublisher;
  readonly mapper?: LawSearchEntityMapper;
  readonly validator?: LawSearchEntityValidator;
  readonly lifecycle?: LawSearchLifecycle;
  readonly metrics?: LawSearchMetrics;
  readonly logger?: LawSearchLogger;
  readonly diagnostics?: LawSearchDiagnosticsStore;
  readonly errors?: LawSearchErrorTranslator;
};

function failedResult(
  operation: SearchPublicationResult["operation"],
  context: LawSearchPublicationContext,
  message: string,
  started: number,
): SearchPublicationResult {
  return {
    operation,
    ok: false,
    correlationId: context.correlationId,
    productId: "law",
    message,
    durationMs: Math.max(0, Date.now() - started),
    acceptedAt: new Date().toISOString(),
  };
}

export class LawSearchPublisher {
  private readonly mapper: LawSearchEntityMapper;
  private readonly validator: LawSearchEntityValidator;
  private readonly lifecycleHelper: LawSearchLifecycle;
  private readonly metrics: LawSearchMetrics;
  private readonly logger: LawSearchLogger;
  private readonly diagnosticsStore: LawSearchDiagnosticsStore;
  private readonly errors: LawSearchErrorTranslator;

  constructor(private readonly options: LawSearchPublisherOptions) {
    this.mapper = options.mapper ?? new LawSearchEntityMapper();
    this.validator = options.validator ?? new LawSearchEntityValidator();
    this.lifecycleHelper = options.lifecycle ?? new LawSearchLifecycle();
    this.metrics = options.metrics ?? new LawSearchMetrics();
    this.logger = options.logger ?? new LawSearchLogger();
    this.diagnosticsStore = options.diagnostics ?? new LawSearchDiagnosticsStore();
    this.errors = options.errors ?? new LawSearchErrorTranslator();
  }

  validate(
    context: LawSearchPublicationContext,
    input: LawSearchMappableEntity,
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
        this.logger.log("warn", "Law search validation failed", {
          correlationId: context.correlationId,
          operation: "validate",
          entityType: input.entityType,
          entityId: draft.entityId,
        });
        return {
          operation: "validate",
          ok: false,
          correlationId: context.correlationId,
          productId: "law",
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
    context: LawSearchPublicationContext,
    input: LawSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("preview", context, input, (draft, ic) =>
      this.options.integrationPublisher.preview(ic, draft),
    );
  }

  publish(
    context: LawSearchPublicationContext,
    input: LawSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("publish", context, input, (draft, ic) =>
      this.options.integrationPublisher.publish(ic, draft),
    );
  }

  update(
    context: LawSearchPublicationContext,
    input: LawSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("update", context, input, (draft, ic) =>
      this.options.integrationPublisher.update(ic, draft),
    );
  }

  remove(
    context: LawSearchPublicationContext,
    entityType: LawSearchMappableEntity["entityType"],
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
      this.logger.log(result.ok ? "info" : "error", "Law search remove", {
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
    context: LawSearchPublicationContext,
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

  diagnostics(context: LawSearchPublicationContext): LawSearchDiagnostics {
    this.diagnosticsStore.touch("diagnostics", context.correlationId);
    return this.diagnosticsStore.build(
      this.metrics.snapshot(),
      LAW_SEARCH_ENTITY_TYPES,
    );
  }

  statistics(_context: LawSearchPublicationContext): LawSearchStatistics {
    return this.metrics.snapshot();
  }

  getMapper(): LawSearchEntityMapper {
    return this.mapper;
  }

  getValidator(): LawSearchEntityValidator {
    return this.validator;
  }

  getLifecycle(): LawSearchLifecycle {
    return this.lifecycleHelper;
  }

  getLogger(): LawSearchLogger {
    return this.logger;
  }

  getMetrics(): LawSearchMetrics {
    return this.metrics;
  }

  getIntegrationPublisher(): SearchIntegrationPublisher {
    return this.options.integrationPublisher;
  }

  private runMapped(
    operation: "publish" | "update" | "preview",
    context: LawSearchPublicationContext,
    input: LawSearchMappableEntity,
    invoke: (
      draft: ReturnType<LawSearchEntityMapper["map"]>,
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
        this.logger.log("warn", `Law search ${operation} rejected`, {
          correlationId: context.correlationId,
          operation,
          entityType: input.entityType,
          entityId: draft.entityId,
        });
        return {
          operation,
          ok: false,
          correlationId: context.correlationId,
          productId: "law",
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
      this.logger.log(result.ok ? "info" : "error", `Law search ${operation}`, {
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
