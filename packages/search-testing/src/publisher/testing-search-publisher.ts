/**
 * TestingSearchPublisher — Testing → SearchIntegrationPublisher (APZSEARCH-013).
 */

import type {
  SearchIntegrationPublisher,
  SearchPublicationResult,
  SearchEntityLifecycleState,
} from "@apzhub/search-integration";

import {
  toSearchIntegrationContext,
  type TestingSearchPublicationContext,
} from "../context/testing-search-publication-context";
import {
  TestingSearchDiagnostics,
  TestingSearchErrorTranslator,
  TestingSearchLogger,
  TestingSearchMetrics,
  type TestingSearchDiagnosticsSnapshot,
  type TestingSearchStatistics,
} from "../diagnostics/testing-search-observability";
import { TestingSearchLifecycle } from "../lifecycle/testing-search-lifecycle";
import {
  TestingSearchEntityMapper,
  type TestingSearchMappableEntity,
} from "../mapper/testing-search-entity-mapper";
import { TESTING_SEARCH_ENTITY_TYPES } from "../types/entity-types";
import { TestingSearchEntityValidator } from "../validator/testing-search-entity-validator";

export type TestingSearchPublisherOptions = {
  readonly integrationPublisher: SearchIntegrationPublisher;
  readonly mapper?: TestingSearchEntityMapper;
  readonly validator?: TestingSearchEntityValidator;
  readonly lifecycle?: TestingSearchLifecycle;
  readonly metrics?: TestingSearchMetrics;
  readonly logger?: TestingSearchLogger;
  readonly diagnostics?: TestingSearchDiagnostics;
  readonly errors?: TestingSearchErrorTranslator;
};

function failedResult(
  operation: SearchPublicationResult["operation"],
  context: TestingSearchPublicationContext,
  message: string,
  started: number,
): SearchPublicationResult {
  return {
    operation,
    ok: false,
    correlationId: context.correlationId,
    productId: "testing",
    message,
    durationMs: Math.max(0, Date.now() - started),
    acceptedAt: new Date().toISOString(),
  };
}

export class TestingSearchPublisher {
  private readonly mapper: TestingSearchEntityMapper;
  private readonly validator: TestingSearchEntityValidator;
  private readonly lifecycleHelper: TestingSearchLifecycle;
  private readonly metrics: TestingSearchMetrics;
  private readonly logger: TestingSearchLogger;
  private readonly diagnosticsStore: TestingSearchDiagnostics;
  private readonly errors: TestingSearchErrorTranslator;

  constructor(private readonly options: TestingSearchPublisherOptions) {
    this.mapper = options.mapper ?? new TestingSearchEntityMapper();
    this.validator = options.validator ?? new TestingSearchEntityValidator();
    this.lifecycleHelper =
      options.lifecycle ?? new TestingSearchLifecycle();
    this.metrics = options.metrics ?? new TestingSearchMetrics();
    this.logger = options.logger ?? new TestingSearchLogger();
    this.diagnosticsStore =
      options.diagnostics ?? new TestingSearchDiagnostics();
    this.errors = options.errors ?? new TestingSearchErrorTranslator();
  }

  validate(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
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
        this.logger.log("warn", "Testing search validation failed", {
          correlationId: context.correlationId,
          operation: "validate",
          entityType: input.entityType,
          entityId: draft.entityId,
        });
        return {
          operation: "validate",
          ok: false,
          correlationId: context.correlationId,
          productId: "testing",
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
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("preview", context, input, (draft, ic) =>
      this.options.integrationPublisher.preview(ic, draft),
    );
  }

  publish(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("publish", context, input, (draft, ic) =>
      this.options.integrationPublisher.publish(ic, draft),
    );
  }

  update(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("update", context, input, (draft, ic) =>
      this.options.integrationPublisher.update(ic, draft),
    );
  }

  remove(
    context: TestingSearchPublicationContext,
    entityType: TestingSearchMappableEntity["entityType"],
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
      this.logger.log(result.ok ? "info" : "error", "Testing search remove", {
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
    context: TestingSearchPublicationContext,
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
    context: TestingSearchPublicationContext,
  ): TestingSearchDiagnosticsSnapshot {
    this.diagnosticsStore.touch("diagnostics", context.correlationId);
    return this.diagnosticsStore.build(
      this.metrics.snapshot(),
      TESTING_SEARCH_ENTITY_TYPES,
    );
  }

  statistics(
    _context: TestingSearchPublicationContext,
  ): TestingSearchStatistics {
    return this.metrics.snapshot();
  }

  getMapper(): TestingSearchEntityMapper {
    return this.mapper;
  }

  getValidator(): TestingSearchEntityValidator {
    return this.validator;
  }

  getLifecycle(): TestingSearchLifecycle {
    return this.lifecycleHelper;
  }

  getLogger(): TestingSearchLogger {
    return this.logger;
  }

  getMetrics(): TestingSearchMetrics {
    return this.metrics;
  }

  getIntegrationPublisher(): SearchIntegrationPublisher {
    return this.options.integrationPublisher;
  }

  private runMapped(
    operation: "publish" | "update" | "preview",
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
    invoke: (
      draft: ReturnType<TestingSearchEntityMapper["map"]>,
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
        this.logger.log("warn", `Testing search ${operation} rejected`, {
          correlationId: context.correlationId,
          operation,
          entityType: input.entityType,
          entityId: draft.entityId,
        });
        return {
          operation,
          ok: false,
          correlationId: context.correlationId,
          productId: "testing",
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
        `Testing search ${operation}`,
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
