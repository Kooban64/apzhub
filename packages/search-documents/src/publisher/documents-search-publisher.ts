/**
 * DocumentsSearchPublisher — Documents → SearchIntegrationPublisher (APZSEARCH-012).
 */

import type {
  SearchIntegrationPublisher,
  SearchPublicationResult,
  SearchEntityLifecycleState,
} from "@apzhub/search-integration";

import {
  toSearchIntegrationContext,
  type DocumentsSearchPublicationContext,
} from "../context/documents-search-publication-context";
import {
  DocumentsSearchDiagnosticsStore,
  DocumentsSearchErrorTranslator,
  DocumentsSearchLogger,
  DocumentsSearchMetrics,
  type DocumentsSearchDiagnostics,
  type DocumentsSearchStatistics,
} from "../diagnostics/documents-search-observability";
import { DocumentsSearchLifecycle } from "../lifecycle/documents-search-lifecycle";
import {
  DocumentsSearchEntityMapper,
  type DocumentsSearchMappableEntity,
} from "../mapper/documents-search-entity-mapper";
import { DOCUMENTS_SEARCH_ENTITY_TYPES } from "../types/entity-types";
import { DocumentsSearchEntityValidator } from "../validator/documents-search-entity-validator";

export type DocumentsSearchPublisherOptions = {
  readonly integrationPublisher: SearchIntegrationPublisher;
  readonly mapper?: DocumentsSearchEntityMapper;
  readonly validator?: DocumentsSearchEntityValidator;
  readonly lifecycle?: DocumentsSearchLifecycle;
  readonly metrics?: DocumentsSearchMetrics;
  readonly logger?: DocumentsSearchLogger;
  readonly diagnostics?: DocumentsSearchDiagnosticsStore;
  readonly errors?: DocumentsSearchErrorTranslator;
};

function failedResult(
  operation: SearchPublicationResult["operation"],
  context: DocumentsSearchPublicationContext,
  message: string,
  started: number,
): SearchPublicationResult {
  return {
    operation,
    ok: false,
    correlationId: context.correlationId,
    productId: "documents",
    message,
    durationMs: Math.max(0, Date.now() - started),
    acceptedAt: new Date().toISOString(),
  };
}

export class DocumentsSearchPublisher {
  private readonly mapper: DocumentsSearchEntityMapper;
  private readonly validator: DocumentsSearchEntityValidator;
  private readonly lifecycleHelper: DocumentsSearchLifecycle;
  private readonly metrics: DocumentsSearchMetrics;
  private readonly logger: DocumentsSearchLogger;
  private readonly diagnosticsStore: DocumentsSearchDiagnosticsStore;
  private readonly errors: DocumentsSearchErrorTranslator;

  constructor(private readonly options: DocumentsSearchPublisherOptions) {
    this.mapper = options.mapper ?? new DocumentsSearchEntityMapper();
    this.validator = options.validator ?? new DocumentsSearchEntityValidator();
    this.lifecycleHelper = options.lifecycle ?? new DocumentsSearchLifecycle();
    this.metrics = options.metrics ?? new DocumentsSearchMetrics();
    this.logger = options.logger ?? new DocumentsSearchLogger();
    this.diagnosticsStore =
      options.diagnostics ?? new DocumentsSearchDiagnosticsStore();
    this.errors = options.errors ?? new DocumentsSearchErrorTranslator();
  }

  validate(
    context: DocumentsSearchPublicationContext,
    input: DocumentsSearchMappableEntity,
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
        this.logger.log("warn", "Documents search validation failed", {
          correlationId: context.correlationId,
          operation: "validate",
          entityType: input.entityType,
          entityId: draft.entityId,
        });
        return {
          operation: "validate",
          ok: false,
          correlationId: context.correlationId,
          productId: "documents",
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
    context: DocumentsSearchPublicationContext,
    input: DocumentsSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("preview", context, input, (draft, ic) =>
      this.options.integrationPublisher.preview(ic, draft),
    );
  }

  publish(
    context: DocumentsSearchPublicationContext,
    input: DocumentsSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("publish", context, input, (draft, ic) =>
      this.options.integrationPublisher.publish(ic, draft),
    );
  }

  update(
    context: DocumentsSearchPublicationContext,
    input: DocumentsSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("update", context, input, (draft, ic) =>
      this.options.integrationPublisher.update(ic, draft),
    );
  }

  remove(
    context: DocumentsSearchPublicationContext,
    entityType: DocumentsSearchMappableEntity["entityType"],
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
      this.logger.log(result.ok ? "info" : "error", "Documents search remove", {
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
    context: DocumentsSearchPublicationContext,
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

  diagnostics(context: DocumentsSearchPublicationContext): DocumentsSearchDiagnostics {
    this.diagnosticsStore.touch("diagnostics", context.correlationId);
    return this.diagnosticsStore.build(
      this.metrics.snapshot(),
      DOCUMENTS_SEARCH_ENTITY_TYPES,
    );
  }

  statistics(_context: DocumentsSearchPublicationContext): DocumentsSearchStatistics {
    return this.metrics.snapshot();
  }

  getMapper(): DocumentsSearchEntityMapper {
    return this.mapper;
  }

  getValidator(): DocumentsSearchEntityValidator {
    return this.validator;
  }

  getLifecycle(): DocumentsSearchLifecycle {
    return this.lifecycleHelper;
  }

  getLogger(): DocumentsSearchLogger {
    return this.logger;
  }

  getMetrics(): DocumentsSearchMetrics {
    return this.metrics;
  }

  getIntegrationPublisher(): SearchIntegrationPublisher {
    return this.options.integrationPublisher;
  }

  private runMapped(
    operation: "publish" | "update" | "preview",
    context: DocumentsSearchPublicationContext,
    input: DocumentsSearchMappableEntity,
    invoke: (
      draft: ReturnType<DocumentsSearchEntityMapper["map"]>,
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
        this.logger.log("warn", `Documents search ${operation} rejected`, {
          correlationId: context.correlationId,
          operation,
          entityType: input.entityType,
          entityId: draft.entityId,
        });
        return {
          operation,
          ok: false,
          correlationId: context.correlationId,
          productId: "documents",
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
      this.logger.log(result.ok ? "info" : "error", `Documents search ${operation}`, {
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
