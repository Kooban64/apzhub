/**
 * Workflow Platform Services factories
 * (APZWORKFLOW-002 / 007 + APZHUB-PLATFORM-WORKFLOW-004).
 * Production: PostgreSQL SoR — no silent in-memory / allow-all authz fallbacks.
 * Runtime plane: in-memory registry MVP + injectable ops provider.
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
import { createInMemoryWorkflowRuntimeRegistry } from "./in-memory-workflow-runtime-registry";
import { createMockWorkflowOpsProvider } from "./n8n-ops-provider";
import {
  createWorkflowPlatformServiceImpls,
  type WorkflowPlatformServiceImpls,
} from "./workflow-service-impls";
import {
  createWorkflowRuntimeServiceImpls,
  type WorkflowRuntimeServiceImpls,
} from "./workflow-runtime-service-impls";
import type {
  WorkflowOpsProvider,
  WorkflowRuntimeRegistry,
} from "./workflow-runtime-types";

export type WorkflowPlatformServicesBundle = {
  readonly foundation: WorkflowFoundation;
  readonly persistence: WorkflowPersistenceBundle;
  readonly gatewaySurface: WorkflowPlatformGateway;
  readonly impls: WorkflowPlatformServiceImpls;
  readonly runtime: WorkflowRuntimeServiceImpls;
  readonly engine: WorkflowEngineServicesBundle;
  readonly readiness: {
    readonly workflowEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
    /** Provider execute plane — false while primary adapter remains read-only foundation. */
    readonly executionEnabled: false;
    readonly runtimePlaneEnabled: true;
    readonly providerExecuteSupported: boolean;
    readonly opsProviderId: string;
    readonly engineEnabled: boolean;
    readonly engineProvider: WorkflowEngineServicesBundle["readiness"]["provider"];
  };
  wrapWithPipeline(pipeline: RequestPipeline): WorkflowPlatformGateway;
};

export type CreateWorkflowPlatformServicesInput = {
  readonly foundation?: WorkflowFoundation;
  readonly persistence?: WorkflowPersistenceBundle;
  readonly engine?: WorkflowEngineServicesBundle;
  readonly ops?: WorkflowOpsProvider;
  readonly runtimeRegistry?: WorkflowRuntimeRegistry;
  readonly now?: () => string;
  readonly id?: () => string;
};

export type CreateWorkflowPlatformServicesForProductionInput = {
  readonly postgresDb: DatabaseExecutor;
  readonly engine?: WorkflowEngineServicesBundle;
  /** Inject provider ops (certified integration adapter via ops factory). */
  readonly ops?: WorkflowOpsProvider;
  readonly runtimeRegistry?: WorkflowRuntimeRegistry;
  readonly now?: () => string;
  readonly id?: () => string;
};

export type CreateWorkflowPlatformServicesForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly engine?: WorkflowEngineServicesBundle;
  readonly allowUnavailableEngine?: boolean;
  readonly ops?: WorkflowOpsProvider;
  readonly runtimeRegistry?: WorkflowRuntimeRegistry;
  readonly providerExecuteSupported?: boolean;
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
    runs: wrapServiceWithPipeline(gateway.runs, pipeline, "workflowRuns"),
    schedules: wrapServiceWithPipeline(
      gateway.schedules,
      pipeline,
      "workflowSchedules",
    ),
    tasks: wrapServiceWithPipeline(gateway.tasks, pipeline, "workflowTasks"),
    approvals: wrapServiceWithPipeline(
      gateway.approvals,
      pipeline,
      "workflowApprovals",
    ),
    notifications: wrapServiceWithPipeline(
      gateway.notifications,
      pipeline,
      "workflowNotifications",
    ),
    capabilities: wrapServiceWithPipeline(
      gateway.capabilities,
      pipeline,
      "workflowCapabilities",
    ),
    health: wrapServiceWithPipeline(gateway.health, pipeline, "workflowHealth"),
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

function resolveOps(input: {
  readonly ops?: WorkflowOpsProvider;
  readonly providerExecuteSupported?: boolean;
}): WorkflowOpsProvider {
  if (input.ops) return input.ops;
  return createMockWorkflowOpsProvider({
    providerExecuteSupported: input.providerExecuteSupported ?? false,
  });
}

function composeGateway(
  impls: WorkflowPlatformServiceImpls,
  engine: WorkflowEngineServicesBundle,
  runtime: WorkflowRuntimeServiceImpls,
): WorkflowPlatformGateway {
  return {
    workflows: runtime.workflows ?? impls.workflows,
    versions: impls.versions,
    templates: impls.templates,
    categories: impls.categories,
    folders: impls.folders,
    validation: impls.validation,
    audit: impls.audit,
    engine: engine.gatewaySurface,
    runs: runtime.runs,
    schedules: runtime.schedules,
    tasks: runtime.tasks,
    approvals: runtime.approvals,
    notifications: runtime.notifications,
    capabilities: runtime.capabilities,
    health: runtime.health,
  };
}

function buildBundle(input: {
  readonly foundation?: WorkflowFoundation;
  readonly persistence: WorkflowPersistenceBundle;
  readonly persistenceMode: "postgres" | "memory";
  readonly engine?: WorkflowEngineServicesBundle;
  readonly allowUnavailableEngine?: boolean;
  readonly ops?: WorkflowOpsProvider;
  readonly runtimeRegistry?: WorkflowRuntimeRegistry;
  readonly providerExecuteSupported?: boolean;
  readonly now?: () => string;
  readonly id?: () => string;
}): WorkflowPlatformServicesBundle {
  const foundation =
    input.foundation ?? createWorkflowFoundation({ repos: input.persistence });
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
  const ops = resolveOps({
    ops: input.ops,
    providerExecuteSupported: input.providerExecuteSupported,
  });
  const registry = input.runtimeRegistry ?? createInMemoryWorkflowRuntimeRegistry();
  const runtime = createWorkflowRuntimeServiceImpls({
    ops,
    registry,
    workflows: impls.workflows,
  });
  const gatewaySurface = composeGateway(impls, engine, runtime);

  return {
    foundation,
    persistence: input.persistence,
    gatewaySurface,
    impls,
    runtime,
    engine,
    readiness: {
      workflowEnabled: true,
      persistenceMode: input.persistenceMode,
      executionEnabled: false,
      runtimePlaneEnabled: true,
      providerExecuteSupported: ops.providerExecuteSupported,
      opsProviderId: ops.providerId,
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
    readonly providerExecuteSupported?: boolean;
  },
): WorkflowPlatformServicesBundle {
  return buildBundle({
    foundation: input.foundation,
    persistence: input.persistence,
    persistenceMode: input.persistenceMode ?? "memory",
    engine: input.engine,
    allowUnavailableEngine: input.allowUnavailableEngine ?? true,
    ops: input.ops,
    runtimeRegistry: input.runtimeRegistry,
    providerExecuteSupported: input.providerExecuteSupported,
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
    ops: input.ops,
    runtimeRegistry: input.runtimeRegistry,
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
    ops: input.ops,
    runtimeRegistry: input.runtimeRegistry,
    providerExecuteSupported: input.providerExecuteSupported,
    now: input.now,
    id: input.id,
  });
}
