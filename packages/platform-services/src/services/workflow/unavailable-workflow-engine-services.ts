/**
 * Stub Workflow Engine facets when no n8n adapter is registered (APZWORKFLOW-007).
 */

import { PlatformServiceError } from "@apzhub/platform-service-contracts";
import type {
  WorkflowEngineGateway,
  WorkflowPlatformServiceContext,
} from "@apzhub/workflow-contracts";

function unavailable(
  ctx: WorkflowPlatformServiceContext,
  capability: string,
): Promise<never> {
  return Promise.reject(
    new PlatformServiceError({
      category: "configuration",
      code: "PROVIDER_CAPABILITY_UNSUPPORTED",
      message: `Workflow Engine capability "${capability}" is unavailable — register a certified engine adapter via createWorkflowEngineServicesForProduction`,
      correlationId: ctx.correlationId,
      retryable: false,
      details: { capability },
    }),
  );
}

/** Stub engine gateway when Platform Workflow SoR is enabled without an engine adapter. */
export function createUnavailableWorkflowEngineServices(): WorkflowEngineGateway {
  return {
    workflows: {
      list: (ctx) => unavailable(ctx, "workflows.list"),
      get: (ctx) => unavailable(ctx, "workflows.get"),
      create: (ctx) => unavailable(ctx, "workflows.create"),
      update: (ctx) => unavailable(ctx, "workflows.update"),
      delete: (ctx) => unavailable(ctx, "workflows.delete"),
      execute: (ctx) => unavailable(ctx, "workflows.execute"),
    },
    templates: {
      list: (ctx) => unavailable(ctx, "templates.list"),
      get: (ctx) => unavailable(ctx, "templates.get"),
    },
    tags: {
      list: (ctx) => unavailable(ctx, "tags.list"),
      get: (ctx) => unavailable(ctx, "tags.get"),
    },
    users: {
      list: (ctx) => unavailable(ctx, "users.list"),
      get: (ctx) => unavailable(ctx, "users.get"),
    },
    projects: {
      list: (ctx) => unavailable(ctx, "projects.list"),
      get: (ctx) => unavailable(ctx, "projects.get"),
    },
    capabilities: {
      get: (ctx) => unavailable(ctx, "capabilities"),
    },
    health: {
      get: (ctx) => unavailable(ctx, "health"),
    },
    diagnostics: {
      get: (ctx) => unavailable(ctx, "diagnostics"),
    },
    compatibility: {
      get: (ctx) => unavailable(ctx, "compatibility"),
    },
    connection: {
      validate: (ctx) => unavailable(ctx, "connection.validate"),
    },
  };
}
