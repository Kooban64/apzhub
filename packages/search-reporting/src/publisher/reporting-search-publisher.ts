/**
 * ReportingSearchPublisher — Reporting → SearchIntegrationPublisher (APZSEARCH-014).
 */

import type {
  SearchIntegrationPublisher,
  SearchPublicationResult,
  SearchEntityLifecycleState,
} from "@apzhub/search-integration";

import {
  toSearchIntegrationContext,
  type ReportingSearchPublicationContext,
} from "../context/reporting-search-publication-context";
import {
  ReportingSearchDiagnosticsStore,
  ReportingSearchErrorTranslator,
  ReportingSearchLogger,
  ReportingSearchMetrics,
  type ReportingSearchDiagnostics,
  type ReportingSearchStatistics,
} from "../diagnostics/reporting-search-observability";
import { ReportingSearchLifecycle } from "../lifecycle/reporting-search-lifecycle";
import {
  ReportingSearchEntityMapper,
  type ReportingSearchMappableEntity,
} from "../mapper/reporting-search-entity-mapper";
import { REPORTING_SEARCH_ENTITY_TYPES } from "../types/entity-types";
import { ReportingSearchEntityValidator } from "../validator/reporting-search-entity-validator";

export type ReportingSearchPublisherOptions = {
  readonly integrationPublisher: SearchIntegrationPublisher;
  readonly mapper?: ReportingSearchEntityMapper;
  readonly validator?: ReportingSearchEntityValidator;
  readonly lifecycle?: ReportingSearchLifecycle;
  readonly metrics?: ReportingSearchMetrics;
  readonly logger?: ReportingSearchLogger;
  readonly diagnostics?: ReportingSearchDiagnosticsStore;
  readonly errors?: ReportingSearchErrorTranslator;
};

function failedResult(
  operation: SearchPublicationResult["operation"],
  context: ReportingSearchPublicationContext,
  message: string,
  started: number,
): SearchPublicationResult {
  return {
    operation,
    ok: false,
    correlationId: context.correlationId,
    productId: "reporting",
    message,
    durationMs: Math.max(0, Date.now() - started),
    acceptedAt: new Date().toISOString(),
  };
}

export class ReportingSearchPublisher {
  private readonly mapper: ReportingSearchEntityMapper;
  private readonly validator: ReportingSearchEntityValidator;
  private readonly lifecycleHelper: ReportingSearchLifecycle;
  private readonly metrics: ReportingSearchMetrics;
  private readonly logger: ReportingSearchLogger;
  private readonly diagnosticsStore: ReportingSearchDiagnosticsStore;
  private readonly errors: ReportingSearchErrorTranslator;

  constructor(private readonly options: ReportingSearchPublisherOptions) {
    this.mapper = options.mapper ?? new ReportingSearchEntityMapper();
    this.validator = options.validator ?? new ReportingSearchEntityValidator();
    this.lifecycleHelper =
      options.lifecycle ?? new ReportingSearchLifecycle();
    this.metrics = options.metrics ?? new ReportingSearchMetrics();
    this.logger = options.logger ?? new ReportingSearchLogger();
    this.diagnosticsStore =
      options.diagnostics ?? new ReportingSearchDiagnosticsStore();
    this.errors = options.errors ?? new ReportingSearchErrorTranslator();
  }

  validate(
    context: ReportingSearchPublicationContext,
    input: ReportingSearchMappableEntity,
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
        this.logger.log("warn", "Reporting search validation failed", {
          correlationId: context.correlationId,
          operation: "validate",
          entityType: input.entityType,
          entityId: draft.entityId,
        });
        return {
          operation: "validate",
          ok: false,
          correlationId: context.correlationId,
          productId: "reporting",
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
      this.diagnosticsStore.touch(
        "validate",
        context.correlationId,
        input.entityType,
        [{ field: "entity", code: domain.classification, message: domain.message }],
      );
      return failedResult("validate", context, domain.message, started);
    }
  }

  preview(
    context: ReportingSearchPublicationContext,
    input: ReportingSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("preview", context, input, (draft, ic) =>
      this.options.integrationPublisher.preview(ic, draft),
    );
  }

  publish(
    context: ReportingSearchPublicationContext,
    input: ReportingSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("publish", context, input, (draft, ic) =>
      this.options.integrationPublisher.publish(ic, draft),
    );
  }

  update(
    context: ReportingSearchPublicationContext,
    input: ReportingSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("update", context, input, (draft, ic) =>
      this.options.integrationPublisher.update(ic, draft),
    );
  }

  remove(
    context: ReportingSearchPublicationContext,
    entityType: ReportingSearchMappableEntity["entityType"],
    entityId: string,
  ): SearchPublicationResult {
    const started = Date.now();
    this.diagnosticsStore.touch(
      "remove",
      context.correlationId,
      entityType,
    );
    try {
      const result = this.options.integrationPublisher.remove(
        toSearchIntegrationContext(context),
        entityId,
      );
      this.metrics.record("remove", result.ok, entityType);
      this.logger.log(result.ok ? "info" : "error", "Reporting search remove", {
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
    context: ReportingSearchPublicationContext,
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
        reason ?? context.publicationReason,
      );
    } catch (error) {
      const domain = this.errors.translate(error);
      return failedResult("lifecycle", context, domain.message, started);
    }
  }

  diagnostics(
    context: ReportingSearchPublicationContext,
  ): ReportingSearchDiagnostics {
    this.diagnosticsStore.touch("diagnostics", context.correlationId);
    return this.diagnosticsStore.build(
      this.metrics.snapshot(),
      REPORTING_SEARCH_ENTITY_TYPES,
    );
  }

  statistics(
    _context: ReportingSearchPublicationContext,
  ): ReportingSearchStatistics {
    return this.metrics.snapshot();
  }

  getMapper(): ReportingSearchEntityMapper {
    return this.mapper;
  }

  getValidator(): ReportingSearchEntityValidator {
    return this.validator;
  }

  getLifecycle(): ReportingSearchLifecycle {
    return this.lifecycleHelper;
  }

  getLogger(): ReportingSearchLogger {
    return this.logger;
  }

  getMetrics(): ReportingSearchMetrics {
    return this.metrics;
  }

  getIntegrationPublisher(): SearchIntegrationPublisher {
    return this.options.integrationPublisher;
  }

  private runMapped(
    operation: "publish" | "update" | "preview",
    context: ReportingSearchPublicationContext,
    input: ReportingSearchMappableEntity,
    invoke: (
      draft: ReturnType<ReportingSearchEntityMapper["map"]>,
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
        this.logger.log("warn", `Reporting search ${operation} rejected`, {
          correlationId: context.correlationId,
          operation,
          entityType: input.entityType,
          entityId: draft.entityId,
        });
        return {
          operation,
          ok: false,
          correlationId: context.correlationId,
          productId: "reporting",
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
      this.logger.log(
        result.ok ? "info" : "error",
        `Reporting search ${operation}`,
        {
          correlationId: context.correlationId,
          operation,
          entityType: input.entityType,
          entityId: draft.entityId,
        },
      );
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
