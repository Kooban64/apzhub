/**
 * Workflow Platform Services factories (APZWORKFLOW-002 / APZWORKFLOW-007).
 * Production: PostgreSQL — no silent in-memory / allow-all authz fallbacks.
 * Engine surface: inject a prebuilt engine bundle (never a silent mock adapter).
 */

import type { DatabaseExecutor } from "@apzhub/config";
import type { WorkflowPlatformGateway } from "@apzhub/workflow-contracts";
import {
  createPlatformWorkflowService,
  createWorkflowFoundation,
  type WorkflowFoundation,
} from "@apzhub/workflow-core";
import {
  createProductionWorkflowPersistence,
  createWorkflowPersistenceForTest,
  type WorkflowPersistenceBundle,
} from "@apzhub/workflow-persistence";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import {
  createWorkflowEngineServicesForTest,
  wrapWorkflowEngineGatewayWithPipeline,
  type WorkflowEngineServicesBundle,
} from "./create-workflow-engine-services";
import {
  createWorkflowPlatformServiceImpls,
  type WorkflowPlatformServiceImpls,
} from "./workflow-service-impls";

export type WorkflowPlatformServicesBundle = {
  readonly foundation: WorkflowFoundation;
  readonly persistence: WorkflowPersistenceBundle;
  readonly gatewaySurface: WorkflowPlatformGateway;
  readonly impls: WorkflowPlatformServiceImpls;
  readonly engine: WorkflowEngineServicesBundle;
  readonly readiness: {
    readonly workflowEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
    readonly executionEnabled: false;
    readonly engineEnabled: boolean;
    readonly engineProvider: WorkflowEngineServicesBundle["readiness"]["provider"];
  };
  wrapWithPipeline(pipeline: RequestPipeline): WorkflowPlatformGateway;
};

export type CreateWorkflowPlatformServicesInput = {
  readonly foundation?: WorkflowFoundation;
  readonly persistence?: WorkflowPersistenceBundle;
  /** Prebuilt engine bundle from createWorkflowEngineServicesForProduction/ForTest. */
  readonly engine?: WorkflowEngineServicesBundle;
  readonly now?: () => string;
  readonly id?: () => string;
};

export type CreateWorkflowPlatformServicesForProductionInput = {
  readonly postgresDb: DatabaseExecutor;
  /** Explicit engine bundle — omit for unavailable stubs (never a mock adapter). */
  readonly engine?: WorkflowEngineServicesBundle;
  readonly now?: () => string;
  readonly id?: () => string;
};

export type CreateWorkflowPlatformServicesForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly engine?: WorkflowEngineServicesBundle;
  readonly allowUnavailableEngine?: boolean;
  readonly now?: () => string;
  readonly id?: () => string;
};

export function wrapWorkflowPlatformGatewayWithPipeline(
  gateway: WorkflowPlatformGateway,
  pipeline: RequestPipeline,
): WorkflowPlatformGateway {
  return {
    workflows: wrapServiceWithPipeline(
      gateway.workflows,
      pipeline,
      "workflowWorkflows",
    ),
    versions: wrapServiceWithPipeline(gateway.versions, pipeline, "workflowVersions"),
    templates: wrapServiceWithPipeline(
      gateway.templates,
      pipeline,
      "workflowTemplates",
    ),
    categories: wrapServiceWithPipeline(
      gateway.categories,
      pipeline,
      "workflowCategories",
    ),
    folders: wrapServiceWithPipeline(gateway.folders, pipeline, "workflowFolders"),
    validation: wrapServiceWithPipeline(
      gateway.validation,
      pipeline,
      "workflowValidation",
    ),
    audit: wrapServiceWithPipeline(gateway.audit, pipeline, "workflowAudit"),
    engine: wrapWorkflowEngineGatewayWithPipeline(gateway.engine, pipeline),
  };
}

function resolveEngineBundle(input: {
  readonly engine?: WorkflowEngineServicesBundle;
  readonly allowUnavailableEngine?: boolean;
}): WorkflowEngineServicesBundle {
  if (input.engine) {
    return input.engine;
  }
  return createWorkflowEngineServicesForTest({
    allowUnavailableEngine: input.allowUnavailableEngine ?? true,
  });
}

function composeGateway(
  impls: WorkflowPlatformServiceImpls,
  engine: WorkflowEngineServicesBundle,
): WorkflowPlatformGateway {
  return {
    ...impls,
    engine: engine.gatewaySurface,
  };
}

function buildBundle(input: {
  readonly persistence: WorkflowPersistenceBundle;
  readonly persistenceMode: "postgres" | "memory";
  readonly engine?: WorkflowEngineServicesBundle;
  readonly allowUnavailableEngine?: boolean;
  readonly now?: () => string;
  readonly id?: () => string;
}): WorkflowPlatformServicesBundle {
  const foundation = createWorkflowFoundation({ repos: input.persistence });
  let seq = 0;
  const now = input.now ?? (() => new Date().toISOString());
  const id = input.id ?? (() => `wf_${Date.now().toString(36)}_${++seq}`);
  const domain = createPlatformWorkflowService({
    repos: input.persistence,
    now,
    id,
  });
  const impls = createWorkflowPlatformServiceImpls({ domain });
  const engine = resolveEngineBundle({
    engine: input.engine,
    allowUnavailableEngine: input.allowUnavailableEngine,
  });
  const gatewaySurface = composeGateway(impls, engine);

  return {
    foundation,
    persistence: input.persistence,
    gatewaySurface,
    impls,
    engine,
    readiness: {
      workflowEnabled: true,
      persistenceMode: input.persistenceMode,
      executionEnabled: false,
      engineEnabled: engine.readiness.engineEnabled,
      engineProvider: engine.readiness.provider,
    },
    wrapWithPipeline: (pipeline) =>
      wrapWorkflowPlatformGatewayWithPipeline(gatewaySurface, pipeline),
  };
}

/**
 * Compose workflow platform services from persistence (or foundation + persistence).
 */
export function createWorkflowPlatformServices(
  input: CreateWorkflowPlatformServicesInput & {
    readonly persistence: WorkflowPersistenceBundle;
    readonly persistenceMode?: "postgres" | "memory";
    readonly allowUnavailableEngine?: boolean;
  },
): WorkflowPlatformServicesBundle {
  if (input.foundation) {
    let seq = 0;
    const now = input.now ?? (() => new Date().toISOString());
    const id = input.id ?? (() => `wf_${Date.now().toString(36)}_${++seq}`);
    const domain = createPlatformWorkflowService({
      repos: input.persistence,
      now,
      id,
    });
    const impls = createWorkflowPlatformServiceImpls({ domain });
    const engine = resolveEngineBundle({
      engine: input.engine,
      allowUnavailableEngine: input.allowUnavailableEngine ?? true,
    });
    const gatewaySurface = composeGateway(impls, engine);
    return {
      foundation: input.foundation,
      persistence: input.persistence,
      gatewaySurface,
      impls,
      engine,
      readiness: {
        workflowEnabled: true,
        persistenceMode: input.persistenceMode ?? "memory",
        executionEnabled: false,
        engineEnabled: engine.readiness.engineEnabled,
        engineProvider: engine.readiness.provider,
      },
      wrapWithPipeline: (pipeline) =>
        wrapWorkflowPlatformGatewayWithPipeline(gatewaySurface, pipeline),
    };
  }
  return buildBundle({
    persistence: input.persistence,
    persistenceMode: input.persistenceMode ?? "memory",
    engine: input.engine,
    allowUnavailableEngine: input.allowUnavailableEngine,
    now: input.now,
    id: input.id,
  });
}

export function createWorkflowPlatformServicesForProduction(
  input: CreateWorkflowPlatformServicesForProductionInput,
): WorkflowPlatformServicesBundle {
  if (!input?.postgresDb) {
    throw new Error(
      "createWorkflowPlatformServicesForProduction requires postgresDb — in-memory fallback is forbidden",
    );
  }
  const persistence = createProductionWorkflowPersistence({
    db: input.postgresDb,
  });
  return buildBundle({
    persistence,
    persistenceMode: "postgres",
    engine: input.engine,
    now: input.now,
    id: input.id,
  });
}

export function createWorkflowPlatformServicesForTest(
  input: CreateWorkflowPlatformServicesForTestInput = {},
): WorkflowPlatformServicesBundle {
  if (!input.postgresDb && !input.allowInMemoryPersistence) {
    throw new Error(
      "createWorkflowPlatformServicesForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  const persistence = createWorkflowPersistenceForTest({
    postgresDb: input.postgresDb,
    allowInMemoryPersistence: input.allowInMemoryPersistence,
  });
  return buildBundle({
    persistence,
    persistenceMode: input.postgresDb ? "postgres" : "memory",
    engine: input.engine,
    allowUnavailableEngine: input.allowUnavailableEngine ?? true,
    now: input.now,
    id: input.id,
  });
}
