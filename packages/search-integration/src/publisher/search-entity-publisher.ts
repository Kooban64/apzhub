/**
 * SearchEntityPublisher — core publication operations (APZSEARCH-009).
 */

import type { SearchIntegrationContext } from "../context/search-integration-context";
import type { CanonicalSearchEntityInput } from "../entity/canonical-search-entity";
import {
  SearchEntityLifecycle,
  type SearchEntityLifecycleState,
} from "../entity/lifecycle";
import { SearchEntityMapper, type SearchEntityDraft } from "../mapper/search-entity-mapper";
import { createSearchPublicationDiagnostics } from "../publication/diagnostics";
import { SearchPublicationErrorTranslator } from "../publication/error-translator";
import { SearchPublicationLogger } from "../publication/logger";
import { SearchPublicationMetrics } from "../publication/metrics";
import type { SearchPublicationResult } from "../publication/result";
import type { SearchPublicationSink } from "../sink/publication-sink";
import { SearchEntityValidator } from "../validator/search-entity-validator";
import { SEARCH_INTEGRATION_VERSION } from "../version";

export type SearchEntityPublisherOptions = {
  readonly sink: SearchPublicationSink;
  readonly validator?: SearchEntityValidator;
  readonly mapper?: SearchEntityMapper;
  readonly lifecycle?: SearchEntityLifecycle;
  readonly metrics?: SearchPublicationMetrics;
  readonly logger?: SearchPublicationLogger;
  readonly errors?: SearchPublicationErrorTranslator;
};

function resultBase(
  operation: SearchPublicationResult["operation"],
  context: SearchIntegrationContext,
  started: number,
  partial: Omit<
    SearchPublicationResult,
    "operation" | "correlationId" | "durationMs" | "acceptedAt"
  >,
): SearchPublicationResult {
  return {
    operation,
    correlationId: context.correlationId,
    durationMs: Math.max(0, Date.now() - started),
    acceptedAt: new Date().toISOString(),
    ...partial,
  };
}

export class SearchEntityPublisher {
  private readonly validator: SearchEntityValidator;
  private readonly mapper: SearchEntityMapper;
  private readonly lifecycleHelper: SearchEntityLifecycle;
  private readonly metrics: SearchPublicationMetrics;
  private readonly logger: SearchPublicationLogger;
  private readonly errors: SearchPublicationErrorTranslator;
  private lastOperation?: SearchPublicationResult["operation"];
  private lastCorrelationId?: string;

  constructor(private readonly options: SearchEntityPublisherOptions) {
    this.validator = options.validator ?? new SearchEntityValidator();
    this.mapper = options.mapper ?? new SearchEntityMapper(this.validator);
    this.lifecycleHelper = options.lifecycle ?? new SearchEntityLifecycle();
    this.metrics = options.metrics ?? new SearchPublicationMetrics();
    this.logger = options.logger ?? new SearchPublicationLogger();
    this.errors = options.errors ?? new SearchPublicationErrorTranslator();
  }

  validate(
    context: SearchIntegrationContext,
    input: CanonicalSearchEntityInput | SearchEntityDraft,
  ): SearchPublicationResult {
    const started = Date.now();
    this.touch("validate", context);
    const canonicalInput =
      "entityId" in input
        ? this.mapper.toInput(context, input)
        : input;
    const validation = this.validator.validate(context, canonicalInput);
    this.metrics.record("validate", validation.valid);
    this.logger.log(
      validation.valid ? "info" : "warn",
      validation.valid
        ? "Canonical search entity validated"
        : "Canonical search entity validation failed",
      {
        correlationId: context.correlationId,
        operation: "validate",
        entityId: canonicalInput.id,
        productId: context.productId,
      },
    );
    return resultBase("validate", context, started, {
      ok: validation.valid,
      entityId: canonicalInput.id,
      productId: context.productId,
      lifecycleState: validation.entity?.lifecycleState,
      entity: validation.entity,
      issues: validation.issues,
    });
  }

  preview(
    context: SearchIntegrationContext,
    input: CanonicalSearchEntityInput | SearchEntityDraft,
  ): SearchPublicationResult {
    const started = Date.now();
    this.touch("preview", context);
    try {
      const entity =
        "entityId" in input
          ? this.mapper.map(context, input)
          : this.validator.assertValid(context, input);
      const metadata = this.mapper.toSearchMetadata(entity);
      this.metrics.record("preview", true);
      this.logger.log("info", "Canonical search entity previewed", {
        correlationId: context.correlationId,
        operation: "preview",
        entityId: entity.id,
        productId: context.productId,
      });
      return resultBase("preview", context, started, {
        ok: true,
        entityId: entity.id,
        productId: context.productId,
        lifecycleState: entity.lifecycleState,
        entity,
        previewMetadata: metadata,
        message: `preview for ${entity.entityType}`,
      });
    } catch (error) {
      this.metrics.record("preview", false);
      const domain = this.errors.translate(error);
      this.logger.log("error", domain.message, {
        correlationId: context.correlationId,
        operation: "preview",
        productId: context.productId,
      });
      const issues = domain.details?.["issues"];
      return resultBase("preview", context, started, {
        ok: false,
        productId: context.productId,
        message: domain.message,
        issues: Array.isArray(issues)
          ? (issues as SearchPublicationResult["issues"])
          : undefined,
      });
    }
  }

  publish(
    context: SearchIntegrationContext,
    input: CanonicalSearchEntityInput | SearchEntityDraft,
  ): SearchPublicationResult {
    return this.write("publish", context, input, "published");
  }

  update(
    context: SearchIntegrationContext,
    input: CanonicalSearchEntityInput | SearchEntityDraft,
  ): SearchPublicationResult {
    return this.write("update", context, input, "updated");
  }

  remove(
    context: SearchIntegrationContext,
    entityId: string,
  ): SearchPublicationResult {
    const started = Date.now();
    this.touch("remove", context);
    try {
      const existing = this.options.sink.get(entityId);
      if (!existing) {
        throw new Error(`Search entity not found: ${entityId}`);
      }
      if (existing.tenantId !== context.tenantId) {
        throw new Error("tenant mismatch on remove");
      }
      if (existing.productId !== context.productId) {
        throw new Error("product mismatch on remove");
      }
      this.lifecycleHelper.assertTransition(existing.lifecycleState, "removed");
      const removed = this.options.sink.remove(entityId);
      this.metrics.record("remove", true);
      this.logger.log("info", "Canonical search entity removed", {
        correlationId: context.correlationId,
        operation: "remove",
        entityId,
        productId: context.productId,
      });
      return resultBase("remove", context, started, {
        ok: true,
        entityId,
        productId: context.productId,
        lifecycleState: "removed",
        entity: removed ?? undefined,
      });
    } catch (error) {
      this.metrics.record("remove", false);
      const domain = this.errors.translate(error, "not_found");
      this.logger.log("error", domain.message, {
        correlationId: context.correlationId,
        operation: "remove",
        entityId,
        productId: context.productId,
      });
      return resultBase("remove", context, started, {
        ok: false,
        entityId,
        productId: context.productId,
        message: domain.message,
      });
    }
  }

  lifecycle(
    context: SearchIntegrationContext,
    entityId: string,
    state: SearchEntityLifecycleState,
    reason?: string,
  ): SearchPublicationResult {
    const started = Date.now();
    this.touch("lifecycle", context);
    try {
      const existing = this.options.sink.get(entityId);
      if (!existing) {
        throw new Error(`Search entity not found: ${entityId}`);
      }
      if (existing.tenantId !== context.tenantId) {
        throw new Error("tenant mismatch on lifecycle");
      }
      this.lifecycleHelper.assertTransition(existing.lifecycleState, state);
      const next = this.options.sink.setLifecycle(entityId, state, reason);
      this.logger.log("info", "Canonical search entity lifecycle updated", {
        correlationId: context.correlationId,
        operation: "lifecycle",
        entityId,
        productId: context.productId,
      });
      return resultBase("lifecycle", context, started, {
        ok: true,
        entityId,
        productId: context.productId,
        lifecycleState: state,
        entity: next ?? undefined,
        message: reason,
      });
    } catch (error) {
      const domain = this.errors.translate(error, "conflict");
      this.logger.log("error", domain.message, {
        correlationId: context.correlationId,
        operation: "lifecycle",
        entityId,
        productId: context.productId,
      });
      return resultBase("lifecycle", context, started, {
        ok: false,
        entityId,
        productId: context.productId,
        message: domain.message,
      });
    }
  }

  diagnostics(context: SearchIntegrationContext): SearchPublicationResult {
    const started = Date.now();
    this.touch("diagnostics", context);
    const diag = createSearchPublicationDiagnostics({
      frameworkVersion: SEARCH_INTEGRATION_VERSION,
      sinkKind: this.options.sink.kind,
      entityCount: this.options.sink.count(),
      lastOperation: this.lastOperation,
      lastCorrelationId: this.lastCorrelationId,
    });
    return resultBase("diagnostics", context, started, {
      ok: true,
      productId: context.productId,
      message: JSON.stringify(diag),
    });
  }

  statistics(context: SearchIntegrationContext): SearchPublicationResult {
    const started = Date.now();
    this.touch("statistics", context);
    const stats = this.metrics.snapshot(this.options.sink.count());
    return resultBase("statistics", context, started, {
      ok: true,
      productId: context.productId,
      message: JSON.stringify(stats),
    });
  }

  getMetrics(): SearchPublicationMetrics {
    return this.metrics;
  }

  getLogger(): SearchPublicationLogger {
    return this.logger;
  }

  getSink(): SearchPublicationSink {
    return this.options.sink;
  }

  private write(
    operation: "publish" | "update",
    context: SearchIntegrationContext,
    input: CanonicalSearchEntityInput | SearchEntityDraft,
    targetState: SearchEntityLifecycleState,
  ): SearchPublicationResult {
    const started = Date.now();
    this.touch(operation, context);
    try {
      const entity =
        "entityId" in input
          ? this.mapper.map(context, input)
          : this.validator.assertValid(context, input);

      const existing = this.options.sink.get(entity.id);
      if (operation === "publish" && existing && existing.lifecycleState !== "removed") {
        throw new Error(`Search entity already published: ${entity.id}`);
      }
      if (operation === "update" && (!existing || existing.lifecycleState === "removed")) {
        throw new Error(`Search entity not found: ${entity.id}`);
      }
      if (existing && existing.lifecycleState !== "removed") {
        this.lifecycleHelper.assertTransition(existing.lifecycleState, targetState);
      } else if (operation === "publish") {
        this.lifecycleHelper.assertTransition(
          entity.lifecycleState === "validated" || entity.lifecycleState === "draft"
            ? entity.lifecycleState
            : "validated",
          targetState,
        );
      }

      const stored = this.options.sink.upsert({
        ...entity,
        lifecycleState: targetState,
        updatedAt: new Date().toISOString(),
        version:
          operation === "update" && existing
            ? String(Number(existing.version || "1") + 1)
            : entity.version,
      });

      this.metrics.record(operation, true);
      this.logger.log(
        "info",
        operation === "publish"
          ? "Canonical search entity published"
          : "Canonical search entity updated",
        {
          correlationId: context.correlationId,
          operation,
          entityId: stored.id,
          productId: context.productId,
        },
      );
      return resultBase(operation, context, started, {
        ok: true,
        entityId: stored.id,
        productId: context.productId,
        lifecycleState: stored.lifecycleState,
        entity: stored,
        previewMetadata: this.mapper.toSearchMetadata(stored),
      });
    } catch (error) {
      this.metrics.record(operation, false);
      const domain = this.errors.translate(error);
      this.logger.log("error", domain.message, {
        correlationId: context.correlationId,
        operation,
        productId: context.productId,
      });
      return resultBase(operation, context, started, {
        ok: false,
        productId: context.productId,
        message: domain.message,
      });
    }
  }

  private touch(
    operation: SearchPublicationResult["operation"],
    context: SearchIntegrationContext,
  ): void {
    this.lastOperation = operation;
    this.lastCorrelationId = context.correlationId;
  }
}
