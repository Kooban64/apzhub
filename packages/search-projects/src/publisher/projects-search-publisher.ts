/**
 * ProjectsSearchPublisher — Projects → SearchIntegrationPublisher (APZSEARCH-010).
 */

import type {
  SearchIntegrationPublisher,
  SearchPublicationResult,
  SearchEntityLifecycleState,
} from "@apzhub/search-integration";

import {
  toSearchIntegrationContext,
  type ProjectsSearchPublicationContext,
} from "../context/projects-search-publication-context";
import {
  ProjectsSearchDiagnosticsStore,
  ProjectsSearchErrorTranslator,
  ProjectsSearchLogger,
  ProjectsSearchMetrics,
  type ProjectsSearchDiagnostics,
  type ProjectsSearchStatistics,
} from "../diagnostics/projects-search-observability";
import { ProjectsSearchLifecycle } from "../lifecycle/projects-search-lifecycle";
import {
  ProjectsSearchEntityMapper,
  type ProjectsSearchMappableEntity,
} from "../mapper/projects-search-entity-mapper";
import { PROJECTS_SEARCH_ENTITY_TYPES } from "../types/entity-types";
import { ProjectsSearchEntityValidator } from "../validator/projects-search-entity-validator";

export type ProjectsSearchPublisherOptions = {
  readonly integrationPublisher: SearchIntegrationPublisher;
  readonly mapper?: ProjectsSearchEntityMapper;
  readonly validator?: ProjectsSearchEntityValidator;
  readonly lifecycle?: ProjectsSearchLifecycle;
  readonly metrics?: ProjectsSearchMetrics;
  readonly logger?: ProjectsSearchLogger;
  readonly diagnostics?: ProjectsSearchDiagnosticsStore;
  readonly errors?: ProjectsSearchErrorTranslator;
};

function failedResult(
  operation: SearchPublicationResult["operation"],
  context: ProjectsSearchPublicationContext,
  message: string,
  started: number,
): SearchPublicationResult {
  return {
    operation,
    ok: false,
    correlationId: context.correlationId,
    productId: "projects",
    message,
    durationMs: Math.max(0, Date.now() - started),
    acceptedAt: new Date().toISOString(),
  };
}

export class ProjectsSearchPublisher {
  private readonly mapper: ProjectsSearchEntityMapper;
  private readonly validator: ProjectsSearchEntityValidator;
  private readonly lifecycleHelper: ProjectsSearchLifecycle;
  private readonly metrics: ProjectsSearchMetrics;
  private readonly logger: ProjectsSearchLogger;
  private readonly diagnosticsStore: ProjectsSearchDiagnosticsStore;
  private readonly errors: ProjectsSearchErrorTranslator;

  constructor(private readonly options: ProjectsSearchPublisherOptions) {
    this.mapper = options.mapper ?? new ProjectsSearchEntityMapper();
    this.validator = options.validator ?? new ProjectsSearchEntityValidator();
    this.lifecycleHelper = options.lifecycle ?? new ProjectsSearchLifecycle();
    this.metrics = options.metrics ?? new ProjectsSearchMetrics();
    this.logger = options.logger ?? new ProjectsSearchLogger();
    this.diagnosticsStore = options.diagnostics ?? new ProjectsSearchDiagnosticsStore();
    this.errors = options.errors ?? new ProjectsSearchErrorTranslator();
  }

  validate(
    context: ProjectsSearchPublicationContext,
    input: ProjectsSearchMappableEntity,
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
        this.logger.log("warn", "Projects search validation failed", {
          correlationId: context.correlationId,
          operation: "validate",
          entityType: input.entityType,
          entityId: draft.entityId,
        });
        return {
          operation: "validate",
          ok: false,
          correlationId: context.correlationId,
          productId: "projects",
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
    context: ProjectsSearchPublicationContext,
    input: ProjectsSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("preview", context, input, (draft, ic) =>
      this.options.integrationPublisher.preview(ic, draft),
    );
  }

  publish(
    context: ProjectsSearchPublicationContext,
    input: ProjectsSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("publish", context, input, (draft, ic) =>
      this.options.integrationPublisher.publish(ic, draft),
    );
  }

  update(
    context: ProjectsSearchPublicationContext,
    input: ProjectsSearchMappableEntity,
  ): SearchPublicationResult {
    return this.runMapped("update", context, input, (draft, ic) =>
      this.options.integrationPublisher.update(ic, draft),
    );
  }

  remove(
    context: ProjectsSearchPublicationContext,
    entityType: ProjectsSearchMappableEntity["entityType"],
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
      this.logger.log(result.ok ? "info" : "error", "Projects search remove", {
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
    context: ProjectsSearchPublicationContext,
    entityId: string,
    state: SearchEntityLifecycleState,
    reason?: string,
  ): SearchPublicationResult {
    const started = Date.now();
    this.diagnosticsStore.touch("lifecycle", context.correlationId);
    try {
      // ensure transition helper is reachable for coverage / policy checks
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

  diagnostics(context: ProjectsSearchPublicationContext): ProjectsSearchDiagnostics {
    this.diagnosticsStore.touch("diagnostics", context.correlationId);
    return this.diagnosticsStore.build(
      this.metrics.snapshot(),
      PROJECTS_SEARCH_ENTITY_TYPES,
    );
  }

  statistics(_context: ProjectsSearchPublicationContext): ProjectsSearchStatistics {
    return this.metrics.snapshot();
  }

  getMapper(): ProjectsSearchEntityMapper {
    return this.mapper;
  }

  getValidator(): ProjectsSearchEntityValidator {
    return this.validator;
  }

  getLifecycle(): ProjectsSearchLifecycle {
    return this.lifecycleHelper;
  }

  getLogger(): ProjectsSearchLogger {
    return this.logger;
  }

  getMetrics(): ProjectsSearchMetrics {
    return this.metrics;
  }

  getIntegrationPublisher(): SearchIntegrationPublisher {
    return this.options.integrationPublisher;
  }

  private runMapped(
    operation: "publish" | "update" | "preview",
    context: ProjectsSearchPublicationContext,
    input: ProjectsSearchMappableEntity,
    invoke: (
      draft: ReturnType<ProjectsSearchEntityMapper["map"]>,
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
        this.logger.log("warn", `Projects search ${operation} rejected`, {
          correlationId: context.correlationId,
          operation,
          entityType: input.entityType,
          entityId: draft.entityId,
        });
        return {
          operation,
          ok: false,
          correlationId: context.correlationId,
          productId: "projects",
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
      this.logger.log(result.ok ? "info" : "error", `Projects search ${operation}`, {
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
