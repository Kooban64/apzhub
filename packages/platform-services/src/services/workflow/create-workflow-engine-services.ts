/**
 * Workflow Engine Platform Services factories (APZWORKFLOW-007).
 * Production requires an explicit certified n8n adapter — no silent mock fallback.
 */

import type { N8nAdapter } from "@apzhub/integration-n8n";
import type { WorkflowEngineGateway } from "@apzhub/workflow-contracts";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import { createUnavailableWorkflowEngineServices } from "./unavailable-workflow-engine-services";
import { createWorkflowEngineServiceImpls } from "./workflow-engine-service-impls";

export type WorkflowEngineServicesBundle = {
  readonly gatewaySurface: WorkflowEngineGateway;
  readonly adapter: N8nAdapter | null;
  readonly readiness: {
    readonly engineEnabled: boolean;
    readonly provider: "n8n" | "none";
    readonly executionEnabled: false;
    readonly mutationsEnabled: false;
  };
  wrapWithPipeline(pipeline: RequestPipeline): WorkflowEngineGateway;
};

export function wrapWorkflowEngineGatewayWithPipeline(
  gateway: WorkflowEngineGateway,
  pipeline: RequestPipeline,
): WorkflowEngineGateway {
  return {
    workflows: wrapServiceWithPipeline(
      gateway.workflows,
      pipeline,
      "workflowEngineWorkflows",
    ),
    templates: wrapServiceWithPipeline(
      gateway.templates,
      pipeline,
      "workflowEngineTemplates",
    ),
    tags: wrapServiceWithPipeline(gateway.tags, pipeline, "workflowEngineTags"),
    users: wrapServiceWithPipeline(gateway.users, pipeline, "workflowEngineUsers"),
    projects: wrapServiceWithPipeline(
      gateway.projects,
      pipeline,
      "workflowEngineProjects",
    ),
    capabilities: wrapServiceWithPipeline(
      gateway.capabilities,
      pipeline,
      "workflowEngineCapabilities",
    ),
    health: wrapServiceWithPipeline(gateway.health, pipeline, "workflowEngineHealth"),
    diagnostics: wrapServiceWithPipeline(
      gateway.diagnostics,
      pipeline,
      "workflowEngineDiagnostics",
    ),
    compatibility: wrapServiceWithPipeline(
      gateway.compatibility,
      pipeline,
      "workflowEngineCompatibility",
    ),
    connection: wrapServiceWithPipeline(
      gateway.connection,
      pipeline,
      "workflowEngineConnection",
    ),
  };
}

export type CreateWorkflowEngineServicesForProductionInput = {
  readonly adapter: N8nAdapter;
};

export type CreateWorkflowEngineServicesForTestInput = {
  readonly adapter?: N8nAdapter;
  /** When true and adapter omitted, returns unavailable stubs (test-only). */
  readonly allowUnavailableEngine?: boolean;
};

/**
 * Production engine wiring — requires an explicit initialised N8nAdapter.
 */
export function createWorkflowEngineServicesForProduction(
  input: CreateWorkflowEngineServicesForProductionInput,
): WorkflowEngineServicesBundle {
  if (!input?.adapter) {
    throw new Error(
      "createWorkflowEngineServicesForProduction requires adapter — mock/in-memory fallback is forbidden",
    );
  }
  const gatewaySurface = createWorkflowEngineServiceImpls({
    adapter: input.adapter,
  });
  return {
    gatewaySurface,
    adapter: input.adapter,
    readiness: {
      engineEnabled: true,
      provider: "n8n",
      executionEnabled: false,
      mutationsEnabled: false,
    },
    wrapWithPipeline: (pipeline) =>
      wrapWorkflowEngineGatewayWithPipeline(gatewaySurface, pipeline),
  };
}

/**
 * Test engine wiring — mock adapter only; never use in production paths.
 */
export function createWorkflowEngineServicesForTest(
  input: CreateWorkflowEngineServicesForTestInput = {},
): WorkflowEngineServicesBundle {
  if (input.adapter) {
    return createWorkflowEngineServicesForProduction({ adapter: input.adapter });
  }
  if (!input.allowUnavailableEngine) {
    throw new Error(
      "createWorkflowEngineServicesForTest requires adapter or allowUnavailableEngine: true",
    );
  }
  const gatewaySurface = createUnavailableWorkflowEngineServices();
  return {
    gatewaySurface,
    adapter: null,
    readiness: {
      engineEnabled: false,
      provider: "none",
      executionEnabled: false,
      mutationsEnabled: false,
    },
    wrapWithPipeline: (pipeline) =>
      wrapWorkflowEngineGatewayWithPipeline(gatewaySurface, pipeline),
  };
}
