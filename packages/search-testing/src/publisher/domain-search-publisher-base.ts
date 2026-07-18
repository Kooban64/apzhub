/**
 * Shared validate/publish/update/preview/remove pipeline for specialised publishers.
 */

import type {
  SearchEntityDraft,
  SearchIntegrationPublisher,
  SearchPublicationResult,
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
} from "../diagnostics/testing-search-observability";
import type { TestingSearchMappableEntity } from "../mapper/shared";
import type { TestingSearchEntityType } from "../types/entity-types";
import { TestingSearchEntityValidator } from "../validator/testing-search-entity-validator";
import type {
  TestingDomainSearchPublisher,
  TestingSearchDomainId,
} from "./publication-contract";

export type DomainSearchPublisherDeps = {
  readonly integrationPublisher: SearchIntegrationPublisher;
  readonly validator: TestingSearchEntityValidator;
  readonly metrics: TestingSearchMetrics;
  readonly logger: TestingSearchLogger;
  readonly diagnostics: TestingSearchDiagnostics;
  readonly errors: TestingSearchErrorTranslator;
};

export function failedPublicationResult(
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

export abstract class DomainSearchPublisherBase implements TestingDomainSearchPublisher {
  abstract readonly domain: TestingSearchDomainId;
  abstract readonly entityTypes: readonly TestingSearchEntityType[];

  protected constructor(protected readonly deps: DomainSearchPublisherDeps) {}

  accepts(entityType: TestingSearchEntityType): boolean {
    return (this.entityTypes as readonly string[]).includes(entityType);
  }

  /** Domain-owned mapping — subclasses must not rely on the facade. */
  protected abstract mapEntity(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchEntityDraft;

  validate(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchPublicationResult {
    const started = Date.now();
    try {
      this.assertAccepted(input.entityType);
      const draft = this.mapEntity(context, input);
      const local = this.deps.validator.validateDraft(context, draft);
      this.deps.diagnostics.touch(
        "validate",
        context.correlationId,
        input.entityType,
        local.issues,
      );
      if (!local.valid) {
        this.deps.metrics.record("validate", false, input.entityType);
        this.deps.logger.log("warn", "Testing search validation failed", {
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
      const result = this.deps.integrationPublisher.validate(
        toSearchIntegrationContext(context),
        draft,
      );
      this.deps.metrics.record("validate", result.ok, input.entityType);
      return result;
    } catch (error) {
      const domain = this.deps.errors.translate(error);
      this.deps.metrics.record("validate", false, input.entityType);
      this.deps.diagnostics.touch("validate", context.correlationId, input.entityType, [
        { field: "entity", code: domain.classification, message: domain.message },
      ]);
      return failedPublicationResult("validate", context, domain.message, started);
    }
  }

  preview(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("preview", context, input, (draft, ic) =>
      this.deps.integrationPublisher.preview(ic, draft),
    );
  }

  publish(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("publish", context, input, (draft, ic) =>
      this.deps.integrationPublisher.publish(ic, draft),
    );
  }

  update(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("update", context, input, (draft, ic) =>
      this.deps.integrationPublisher.update(ic, draft),
    );
  }

  remove(
    context: TestingSearchPublicationContext,
    entityType: TestingSearchEntityType,
    entityId: string,
  ): SearchPublicationResult {
    const started = Date.now();
    this.deps.diagnostics.touch("remove", context.correlationId, entityType);
    try {
      this.assertAccepted(entityType);
      const result = this.deps.integrationPublisher.remove(
        toSearchIntegrationContext(context),
        entityId,
      );
      this.deps.metrics.record("remove", result.ok, entityType);
      this.deps.logger.log(result.ok ? "info" : "error", "Testing search remove", {
        correlationId: context.correlationId,
        operation: "remove",
        entityType,
        entityId,
      });
      return result;
    } catch (error) {
      const domain = this.deps.errors.translate(error);
      this.deps.metrics.record("remove", false, entityType);
      return failedPublicationResult("remove", context, domain.message, started);
    }
  }

  protected assertAccepted(entityType: TestingSearchEntityType): void {
    if (!this.accepts(entityType)) {
      throw new Error(
        `${this.domain} publisher does not accept entity type: ${entityType}`,
      );
    }
  }

  private runMapped(
    operation: "publish" | "update" | "preview",
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
    invoke: (
      draft: SearchEntityDraft,
      ic: ReturnType<typeof toSearchIntegrationContext>,
    ) => SearchPublicationResult,
  ): SearchPublicationResult {
    const started = Date.now();
    try {
      this.assertAccepted(input.entityType);
      const draft = this.mapEntity(context, input);
      const local = this.deps.validator.validateDraft(context, draft);
      this.deps.diagnostics.touch(
        operation,
        context.correlationId,
        input.entityType,
        local.issues,
      );
      if (!local.valid) {
        this.deps.metrics.record(operation, false, input.entityType);
        this.deps.logger.log("warn", `Testing search ${operation} rejected`, {
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
      this.deps.metrics.record(operation, result.ok, input.entityType);
      this.deps.logger.log(
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
      const domain = this.deps.errors.translate(error);
      this.deps.metrics.record(operation, false, input.entityType);
      this.deps.logger.log("error", domain.message, {
        correlationId: context.correlationId,
        operation,
        entityType: input.entityType,
      });
      return failedPublicationResult(operation, context, domain.message, started);
    }
  }
}
