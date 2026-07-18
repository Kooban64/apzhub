/**
 * SupportSearchPublisher — Support → SearchIntegrationPublisher (APZSEARCH-011).
 */

import type {
  SearchIntegrationPublisher,
  SearchPublicationResult,
  SearchEntityLifecycleState,
} from "@apzhub/search-integration";

import {
  toSearchIntegrationContext,
  type SupportSearchPublicationContext,
} from "../context/support-search-publication-context";
import {
  SupportSearchDiagnosticsStore,
  SupportSearchErrorTranslator,
  SupportSearchLogger,
  SupportSearchMetrics,
  type SupportSearchDiagnostics,
  type SupportSearchStatistics,
} from "../diagnostics/support-search-observability";
import { SupportSearchLifecycle } from "../lifecycle/support-search-lifecycle";
import {
  SupportSearchEntityMapper,
  type SupportSearchMappableEntity,
} from "../mapper/support-search-entity-mapper";
import { SUPPORT_SEARCH_ENTITY_TYPES } from "../types/entity-types";
import { SupportSearchEntityValidator } from "../validator/support-search-entity-validator";

export type SupportSearchPublisherOptions = {
  readonly integrationPublisher: SearchIntegrationPublisher;
  readonly mapper?: SupportSearchEntityMapper;
  readonly validator?: SupportSearchEntityValidator;
  readonly lifecycle?: SupportSearchLifecycle;
  readonly metrics?: SupportSearchMetrics;
  readonly logger?: SupportSearchLogger;
  readonly diagnostics?: SupportSearchDiagnosticsStore;
  readonly errors?: SupportSearchErrorTranslator;
};

function failedResult(
  operation: SearchPublicationResult["operation"],
  context: SupportSearchPublicationContext,
  message: string,
  started: number,
): SearchPublicationResult {
  return {
    operation,
    ok: false,
    correlationId: context.correlationId,
    productId: "support",
    message,
    durationMs: Math.max(0, Date.now() - started),
    acceptedAt: new Date().toISOString(),
  };
}

export class SupportSearchPublisher {
  private readonly mapper: SupportSearchEntityMapper;
  private readonly validator: SupportSearchEntityValidator;
  private readonly lifecycleHelper: SupportSearchLifecycle;
  private readonly metrics: SupportSearchMetrics;
  private readonly logger: SupportSearchLogger;
  private readonly diagnosticsStore: SupportSearchDiagnosticsStore;
  private readonly errors: SupportSearchErrorTranslator;

  constructor(private readonly options: SupportSearchPublisherOptions) {
    this.mapper = options.mapper ?? new SupportSearchEntityMapper();
    this.validator = options.validator ?? new SupportSearchEntityValidator();
    this.lifecycleHelper = options.lifecycle ?? new SupportSearchLifecycle();
    this.metrics = options.metrics ?? new SupportSearchMetrics();
    this.logger = options.logger ?? new SupportSearchLogger();
    this.diagnosticsStore = options.diagnostics ?? new SupportSearchDiagnosticsStore();
    this.errors = options.errors ?? new SupportSearchErrorTranslator();
  }

  validate(
    context: SupportSearchPublicationContext,
    input: SupportSearchMappableEntity,
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
        this.logger.log("warn", "Support search validation failed", {
          correlationId: context.correlationId,
          operation: "validate",
          entityType: input.entityType,
          entityId: draft.entityId,
        });
        return {
          operation: "validate",
          ok: false,
          correlationId: context.correlationId,
          productId: "support",
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
    context: SupportSearchPublicationContext,
    input: SupportSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("preview", context, input, (draft, ic) =>
      this.options.integrationPublisher.preview(ic, draft),
    );
  }

  publish(
    context: SupportSearchPublicationContext,
    input: SupportSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("publish", context, input, (draft, ic) =>
      this.options.integrationPublisher.publish(ic, draft),
    );
  }

  update(
    context: SupportSearchPublicationContext,
    input: SupportSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("update", context, input, (draft, ic) =>
      this.options.integrationPublisher.update(ic, draft),
    );
  }

  remove(
    context: SupportSearchPublicationContext,
    entityType: SupportSearchMappableEntity["entityType"],
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
      this.logger.log(result.ok ? "info" : "error", "Support search remove", {
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
    context: SupportSearchPublicationContext,
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

  diagnostics(context: SupportSearchPublicationContext): SupportSearchDiagnostics {
    this.diagnosticsStore.touch("diagnostics", context.correlationId);
    return this.diagnosticsStore.build(
      this.metrics.snapshot(),
      SUPPORT_SEARCH_ENTITY_TYPES,
    );
  }

  statistics(_context: SupportSearchPublicationContext): SupportSearchStatistics {
    return this.metrics.snapshot();
  }

  getMapper(): SupportSearchEntityMapper {
    return this.mapper;
  }

  getValidator(): SupportSearchEntityValidator {
    return this.validator;
  }

  getLifecycle(): SupportSearchLifecycle {
    return this.lifecycleHelper;
  }

  getLogger(): SupportSearchLogger {
    return this.logger;
  }

  getMetrics(): SupportSearchMetrics {
    return this.metrics;
  }

  getIntegrationPublisher(): SearchIntegrationPublisher {
    return this.options.integrationPublisher;
  }

  private runMapped(
    operation: "publish" | "update" | "preview",
    context: SupportSearchPublicationContext,
    input: SupportSearchMappableEntity,
    invoke: (
      draft: ReturnType<SupportSearchEntityMapper["map"]>,
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
        this.logger.log("warn", `Support search ${operation} rejected`, {
          correlationId: context.correlationId,
          operation,
          entityType: input.entityType,
          entityId: draft.entityId,
        });
        return {
          operation,
          ok: false,
          correlationId: context.correlationId,
          productId: "support",
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
      this.logger.log(result.ok ? "info" : "error", `Support search ${operation}`, {
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
