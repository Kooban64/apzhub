/**
 * Workflow Platform Services — thin gateway facets (APZWORKFLOW-002).
 * Business logic remains in @apzhub/workflow-core.
 */

import {
  PlatformServiceError,
  isPlatformServiceError,
  type PlatformServiceErrorCategory,
  type PlatformServiceErrorCode,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import type {
  PlatformWorkflowService,
  WorkflowPlatformGateway,
  WorkflowRequestContext,
} from "@apzhub/workflow-contracts";
import { WorkflowDomainError } from "@apzhub/workflow-core";

function toWorkflowCtx(ctx: ServiceRequestContext): WorkflowRequestContext {
  return {
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    correlationId: ctx.correlationId,
    organisationId: ctx.organisationId,
    permissions: ctx.permissions,
  };
}

export function mapWorkflowDomainError(
  error: WorkflowDomainError,
  correlationId: string,
): PlatformServiceError {
  let category: PlatformServiceErrorCategory = "business_rule";
  let code: PlatformServiceErrorCode = "BUSINESS_RULE_VIOLATION";

  if (
    error.code === "validation_error" ||
    error.code === "reference_error" ||
    error.code === "missing_repos" ||
    error.code === "missing_repository"
  ) {
    category = "validation";
    code = "VALIDATION_FAILED";
  } else if (error.code === "not_found") {
    category = "not_found";
    code = "NOT_FOUND";
  } else if (error.code === "duplicate" || error.code === "conflict") {
    category = "conflict";
    code = "CONFLICT";
  } else if (error.code === "invalid_lifecycle_transition") {
    category = "business_rule";
    code = "BUSINESS_RULE_VIOLATION";
  } else if (error.code === "forbidden") {
    category = "authorization";
    code = "FORBIDDEN";
  }

  return new PlatformServiceError({
    category,
    code,
    message: error.message,
    correlationId,
    retryable: false,
    details: {
      classification: error.code,
      ...(error.details ?? {}),
    },
  });
}

function mapUnknownError(error: unknown, correlationId: string): PlatformServiceError {
  if (isPlatformServiceError(error)) return error;
  if (error instanceof WorkflowDomainError) {
    return mapWorkflowDomainError(error, correlationId);
  }
  const message =
    error instanceof Error ? error.message : "Unexpected workflow service error";
  // Never leak pg / drizzle internals to callers.
  if (/drizzle|postgres|pg_|relation |"platform_workflow|ECONNREFUSED/i.test(message)) {
    return new PlatformServiceError({
      category: "integration",
      code: "PROVIDER_UNAVAILABLE",
      message: "Workflow persistence operation failed",
      correlationId,
      retryable: true,
    });
  }
  return new PlatformServiceError({
    category: "system",
    code: "INTERNAL_ERROR",
    message: "Unexpected workflow service error",
    correlationId,
    retryable: false,
  });
}

async function withWorkflowErrorMapping<T>(
  ctx: ServiceRequestContext,
  invoke: () => Promise<T>,
): Promise<T> {
  try {
    return await invoke();
  } catch (error) {
    throw mapUnknownError(error, ctx.correlationId);
  }
}

/**
 * SoR facets only — engine + runtime composed separately
 * (APZWORKFLOW-007 / APZHUB-PLATFORM-WORKFLOW-004).
 */
export type WorkflowPlatformServiceImpls = Omit<
  WorkflowPlatformGateway,
  | "engine"
  | "runs"
  | "schedules"
  | "tasks"
  | "approvals"
  | "notifications"
  | "capabilities"
  | "health"
>;

/**
 * Thin wrappers: map ServiceRequestContext → WorkflowRequestContext and translate errors.
 */
export function createWorkflowPlatformServiceImpls(input: {
  readonly domain: PlatformWorkflowService;
}): WorkflowPlatformServiceImpls {
  const domain = input.domain;

  return {
    workflows: {
      create: (ctx, createInput) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.createWorkflow(toWorkflowCtx(ctx), createInput),
        ),
      get: (ctx, workflowId) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.getWorkflow(toWorkflowCtx(ctx), workflowId),
        ),
      update: (ctx, updateInput) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.updateWorkflow(toWorkflowCtx(ctx), updateInput),
        ),
      delete: (ctx, workflowId) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.deleteWorkflow(toWorkflowCtx(ctx), workflowId),
        ),
      find: (ctx, findInput) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.findWorkflows(toWorkflowCtx(ctx), findInput),
        ),
      publish: (ctx, workflowId) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.publishWorkflow(toWorkflowCtx(ctx), workflowId),
        ),
      archive: (ctx, workflowId) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.archiveWorkflow(toWorkflowCtx(ctx), workflowId),
        ),
      restore: (ctx, workflowId) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.restoreWorkflow(toWorkflowCtx(ctx), workflowId),
        ),
      transition: (ctx, transitionInput) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.transitionLifecycle(toWorkflowCtx(ctx), transitionInput),
        ),
    },
    versions: {
      create: (ctx, createInput) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.createVersion(toWorkflowCtx(ctx), createInput),
        ),
      get: (ctx, versionId) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.getVersion(toWorkflowCtx(ctx), versionId),
        ),
      list: (ctx, workflowId) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.listVersions(toWorkflowCtx(ctx), workflowId),
        ),
    },
    templates: {
      create: (ctx, createInput) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.createTemplate(toWorkflowCtx(ctx), createInput),
        ),
      get: (ctx, templateId) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.getTemplate(toWorkflowCtx(ctx), templateId),
        ),
      update: (ctx, updateInput) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.updateTemplate(toWorkflowCtx(ctx), updateInput),
        ),
      delete: (ctx, templateId) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.deleteTemplate(toWorkflowCtx(ctx), templateId),
        ),
      list: (ctx) =>
        withWorkflowErrorMapping(ctx, () => domain.listTemplates(toWorkflowCtx(ctx))),
    },
    categories: {
      create: (ctx, createInput) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.createCategory(toWorkflowCtx(ctx), createInput),
        ),
      get: (ctx, categoryId) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.getCategory(toWorkflowCtx(ctx), categoryId),
        ),
      list: (ctx) =>
        withWorkflowErrorMapping(ctx, () => domain.listCategories(toWorkflowCtx(ctx))),
    },
    folders: {
      create: (ctx, createInput) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.createFolder(toWorkflowCtx(ctx), createInput),
        ),
      get: (ctx, folderId) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.getFolder(toWorkflowCtx(ctx), folderId),
        ),
      list: (ctx) =>
        withWorkflowErrorMapping(ctx, () => domain.listFolders(toWorkflowCtx(ctx))),
    },
    validation: {
      validate: (ctx, validateInput) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.validateWorkflow(toWorkflowCtx(ctx), validateInput),
        ),
    },
    audit: {
      list: (ctx, workflowId) =>
        withWorkflowErrorMapping(ctx, () =>
          domain.listAudit(toWorkflowCtx(ctx), workflowId),
        ),
    },
  };
}
