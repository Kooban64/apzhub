/**
 * Workflow Engine Platform Services — thin gateway facets (APZWORKFLOW-007).
 * Delegates to certified n8n adapter.core / adapter.operations — no mapping / business logic.
 */

import {
  N8nNotSupportedError,
  mapOperationalHealthToSdkStatus,
  type N8nAdapter,
} from "@apzhub/integration-n8n";
import {
  PlatformServiceError,
  isPlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import type { WorkflowEngineGateway } from "@apzhub/workflow-contracts";

import { toIntegrationContext } from "../../context/to-integration-context";
import { mapProviderError } from "../../errors/map-provider-error";

function mapEngineError(error: unknown, correlationId: string): never {
  if (isPlatformServiceError(error)) {
    throw error;
  }
  if (error instanceof N8nNotSupportedError) {
    throw new PlatformServiceError({
      category: "configuration",
      code: "PROVIDER_CAPABILITY_UNSUPPORTED",
      message: error.message,
      correlationId,
      retryable: false,
      details: { classification: "NOT_SUPPORTED" },
    });
  }
  mapProviderError(error, correlationId);
}

async function withEngineErrorMapping<T>(
  ctx: ServiceRequestContext,
  invoke: () => Promise<T>,
): Promise<T> {
  try {
    return await invoke();
  } catch (error) {
    mapEngineError(error, ctx.correlationId);
  }
}

function rejectNotSupported(
  ctx: ServiceRequestContext,
  operation: string,
): Promise<never> {
  return withEngineErrorMapping(ctx, async () => {
    throw new N8nNotSupportedError(operation);
  });
}

/**
 * Thin wrappers over N8nAdapter — Platform Services are the only consumer.
 */
export function createWorkflowEngineServiceImpls(input: {
  readonly adapter: N8nAdapter;
}): WorkflowEngineGateway {
  const adapter = input.adapter;
  const core = adapter.core;
  const operations = adapter.operations;

  return {
    workflows: {
      list: (ctx, query) =>
        withEngineErrorMapping(ctx, () =>
          core.listWorkflows(toIntegrationContext(ctx), query),
        ),
      get: (ctx, workflowId) =>
        withEngineErrorMapping(ctx, () =>
          core.getWorkflow(toIntegrationContext(ctx), workflowId),
        ),
      create: (ctx) => rejectNotSupported(ctx, "workflows.create"),
      update: (ctx) => rejectNotSupported(ctx, "workflows.update"),
      delete: (ctx) => rejectNotSupported(ctx, "workflows.delete"),
      execute: (ctx) => rejectNotSupported(ctx, "workflows.execute"),
    },
    templates: {
      list: (ctx) =>
        withEngineErrorMapping(ctx, () =>
          core.listWorkflowTemplates(toIntegrationContext(ctx)),
        ),
      get: (ctx, templateId) =>
        withEngineErrorMapping(ctx, () =>
          core.getWorkflowTemplate(toIntegrationContext(ctx), templateId),
        ),
    },
    tags: {
      list: (ctx) =>
        withEngineErrorMapping(ctx, () => core.listTags(toIntegrationContext(ctx))),
      get: (ctx, tagId) =>
        withEngineErrorMapping(ctx, () =>
          core.getTag(toIntegrationContext(ctx), tagId),
        ),
    },
    users: {
      list: (ctx) =>
        withEngineErrorMapping(ctx, () => core.listUsers(toIntegrationContext(ctx))),
      get: (ctx, userId) =>
        withEngineErrorMapping(ctx, () =>
          core.getUser(toIntegrationContext(ctx), userId),
        ),
    },
    projects: {
      list: (ctx) =>
        withEngineErrorMapping(ctx, () => core.listProjects(toIntegrationContext(ctx))),
      get: (ctx, projectId) =>
        withEngineErrorMapping(ctx, () =>
          core.getProject(toIntegrationContext(ctx), projectId),
        ),
    },
    capabilities: {
      get: (ctx) =>
        withEngineErrorMapping(ctx, async () => {
          const snapshot = core.getCapabilities();
          return {
            services: snapshot.services.map((service) => ({
              serviceId: service.serviceId,
              support: service.support,
              implemented: service.implemented,
              operations: [...service.operations],
              notes: service.notes,
            })),
            unsupportedOperations: [...snapshot.unsupportedOperations],
          };
        }),
    },
    health: {
      get: (ctx) =>
        withEngineErrorMapping(ctx, async () => {
          const classified = operations.classifyHealth();
          return {
            level: classified.level,
            reasons: classified.reasons,
            sdkStatus: mapOperationalHealthToSdkStatus(classified.level),
          };
        }),
    },
    diagnostics: {
      get: (ctx) =>
        withEngineErrorMapping(ctx, async () => {
          const snapshot = adapter.getRuntimeDiagnosticsSnapshot();
          return {
            adapterVersion: snapshot.adapterVersion,
            healthLevel: snapshot.healthLevel,
            reasons: snapshot.reasons,
            apiStatus: snapshot.apiStatus,
            authenticationStatus: snapshot.authenticationStatus,
            authMode: snapshot.authMode,
            lastLatencyMs: snapshot.lastLatencyMs,
            coreServiceCount: snapshot.coreServiceCount,
            compatibilityStatus: snapshot.compatibility.compatibilityStatus,
          };
        }),
    },
    compatibility: {
      get: (ctx) =>
        withEngineErrorMapping(ctx, async () => {
          const matrix = core.getCompatibility();
          return {
            compatibilityStatus: matrix.compatibilityStatus,
            supportedApi: matrix.supportedApi,
            adapterVersion: matrix.adapterVersion,
            unsupportedOperations: [...matrix.unsupportedOperations],
            notes: [...matrix.notes],
          };
        }),
    },
    connection: {
      validate: (ctx) =>
        withEngineErrorMapping(ctx, async () => {
          const result = await adapter.testConnection(toIntegrationContext(ctx));
          return {
            ok: result.ok,
            message: result.message,
          };
        }),
    },
  };
}

export { mapEngineError };
