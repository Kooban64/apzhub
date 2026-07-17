/**
 * Observability Platform Services factories (APZOBSERVE-002).
 * Production: PostgreSQL — no silent in-memory / allow-all authz fallbacks.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import type { ObservePlatformGateway } from "@apzhub/observe-contracts";
import {
  createObserveFoundation,
  createPlatformObserveService,
  type ObserveFoundationRepos,
} from "@apzhub/observe-core";
import {
  createObservePersistenceForTest,
  createProductionObservePersistence,
  type ObservePersistenceBundle,
} from "@apzhub/observe-persistence";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import {
  createObservePlatformServiceImpls,
  type ObservePlatformServiceImpls,
} from "./observe-service-impls";

export type ObservePlatformServicesBundle = {
  readonly foundation: ObserveFoundationRepos;
  readonly persistence: ObservePersistenceBundle;
  readonly gatewaySurface: ObservePlatformGateway;
  readonly impls: ObservePlatformServiceImpls;
  readonly readiness: {
    readonly observeEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
    readonly providerExecutionEnabled: false;
  };
  wrapWithPipeline(pipeline: RequestPipeline): ObservePlatformGateway;
};

export type CreateObservePlatformServicesInput = {
  readonly foundation?: ObserveFoundationRepos;
  readonly persistence?: ObservePersistenceBundle;
  readonly now?: () => string;
  readonly id?: () => string;
};

export type CreateObservePlatformServicesForProductionInput = {
  readonly postgresDb: DatabaseExecutor;
  readonly now?: () => string;
  readonly id?: () => string;
};

export type CreateObservePlatformServicesForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly now?: () => string;
  readonly id?: () => string;
};

export function wrapObservePlatformGatewayWithPipeline(
  gateway: ObservePlatformGateway,
  pipeline: RequestPipeline,
): ObservePlatformGateway {
  return {
    healthChecks: wrapServiceWithPipeline(
      gateway.healthChecks,
      pipeline,
      "observeHealthChecks",
    ),
    readinessChecks: wrapServiceWithPipeline(
      gateway.readinessChecks,
      pipeline,
      "observeReadinessChecks",
    ),
    livenessChecks: wrapServiceWithPipeline(
      gateway.livenessChecks,
      pipeline,
      "observeLivenessChecks",
    ),
    serviceHealth: wrapServiceWithPipeline(
      gateway.serviceHealth,
      pipeline,
      "observeServiceHealth",
    ),
    serviceStatus: wrapServiceWithPipeline(
      gateway.serviceStatus,
      pipeline,
      "observeServiceStatus",
    ),
    componentStatus: wrapServiceWithPipeline(
      gateway.componentStatus,
      pipeline,
      "observeComponentStatus",
    ),
    metricDefinitions: wrapServiceWithPipeline(
      gateway.metricDefinitions,
      pipeline,
      "observeMetricDefinitions",
    ),
    metricSamples: wrapServiceWithPipeline(
      gateway.metricSamples,
      pipeline,
      "observeMetricSamples",
    ),
    alertDefinitions: wrapServiceWithPipeline(
      gateway.alertDefinitions,
      pipeline,
      "observeAlertDefinitions",
    ),
    alertStates: wrapServiceWithPipeline(
      gateway.alertStates,
      pipeline,
      "observeAlertStates",
    ),
    dashboardDefinitions: wrapServiceWithPipeline(
      gateway.dashboardDefinitions,
      pipeline,
      "observeDashboardDefinitions",
    ),
    logSources: wrapServiceWithPipeline(
      gateway.logSources,
      pipeline,
      "observeLogSources",
    ),
    traceDefinitions: wrapServiceWithPipeline(
      gateway.traceDefinitions,
      pipeline,
      "observeTraceDefinitions",
    ),
    traceSpans: wrapServiceWithPipeline(
      gateway.traceSpans,
      pipeline,
      "observeTraceSpans",
    ),
    incidentReferences: wrapServiceWithPipeline(
      gateway.incidentReferences,
      pipeline,
      "observeIncidentReferences",
    ),
    maintenanceWindows: wrapServiceWithPipeline(
      gateway.maintenanceWindows,
      pipeline,
      "observeMaintenanceWindows",
    ),
    healthSummaries: wrapServiceWithPipeline(
      gateway.healthSummaries,
      pipeline,
      "observeHealthSummaries",
    ),
    metadata: wrapServiceWithPipeline(
      gateway.metadata,
      pipeline,
      "observeMetadata",
    ),
    diagnostics: wrapServiceWithPipeline(
      gateway.diagnostics,
      pipeline,
      "observeDiagnostics",
    ),
  };
}

function buildBundle(input: {
  readonly persistence: ObservePersistenceBundle;
  readonly persistenceMode: "postgres" | "memory";
  readonly now?: () => string;
  readonly id?: () => string;
}): ObservePlatformServicesBundle {
  createObserveFoundation({ repos: input.persistence });
  let seq = 0;
  const now = input.now ?? (() => new Date().toISOString());
  const id =
    input.id ?? (() => `obs_${Date.now().toString(36)}_${++seq}`);
  const domain = createPlatformObserveService({
    repos: input.persistence,
    now,
    id,
    persistenceMode: input.persistenceMode,
  });
  const impls = createObservePlatformServiceImpls({ domain });
  const gatewaySurface = impls;

  return {
    foundation: input.persistence,
    persistence: input.persistence,
    gatewaySurface,
    impls,
    readiness: {
      observeEnabled: true,
      persistenceMode: input.persistenceMode,
      providerExecutionEnabled: false,
    },
    wrapWithPipeline: (pipeline) =>
      wrapObservePlatformGatewayWithPipeline(gatewaySurface, pipeline),
  };
}

export function createObservePlatformServices(
  input: CreateObservePlatformServicesInput & {
    readonly persistence: ObservePersistenceBundle;
    readonly persistenceMode?: "postgres" | "memory";
  },
): ObservePlatformServicesBundle {
  return buildBundle({
    persistence: input.persistence,
    persistenceMode: input.persistenceMode ?? "memory",
    now: input.now,
    id: input.id,
  });
}

export function createObservePlatformServicesForProduction(
  input: CreateObservePlatformServicesForProductionInput,
): ObservePlatformServicesBundle {
  if (!input?.postgresDb) {
    throw new Error(
      "createObservePlatformServicesForProduction requires postgresDb — in-memory fallback is forbidden",
    );
  }
  const persistence = createProductionObservePersistence({
    db: input.postgresDb,
  });
  return buildBundle({
    persistence,
    persistenceMode: "postgres",
    now: input.now,
    id: input.id,
  });
}

export function createObservePlatformServicesForTest(
  input: CreateObservePlatformServicesForTestInput = {},
): ObservePlatformServicesBundle {
  if (!input.postgresDb && !input.allowInMemoryPersistence) {
    throw new Error(
      "createObservePlatformServicesForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  const persistence = createObservePersistenceForTest({
    postgresDb: input.postgresDb,
    allowInMemoryPersistence: input.allowInMemoryPersistence,
  });
  return buildBundle({
    persistence,
    persistenceMode: input.postgresDb ? "postgres" : "memory",
    now: input.now,
    id: input.id,
  });
}
