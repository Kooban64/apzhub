/**
 * Platform Metrics Services factories (APZMETRICS-002).
 * Production: PostgreSQL — no silent in-memory / allow-all authz fallbacks.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import type { MetricsPlatformGateway } from "@apzhub/metrics-contracts";
import {
  createMetricsFoundation,
  createPlatformMetricsService,
  type MetricsFoundationRepos,
} from "@apzhub/metrics-core";
import {
  createMetricsPersistenceForTest,
  createProductionMetricsPersistence,
  type MetricsPersistenceBundle,
} from "@apzhub/metrics-persistence";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import {
  createMetricsPlatformServiceImpls,
  type MetricsPlatformServiceImpls,
} from "./metrics-service-impls";

export type MetricsPlatformServicesBundle = {
  readonly foundation: MetricsFoundationRepos;
  readonly persistence: MetricsPersistenceBundle;
  readonly gatewaySurface: MetricsPlatformGateway;
  readonly impls: MetricsPlatformServiceImpls;
  readonly readiness: {
    readonly metricsEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
    readonly formulaExecutionEnabled: false;
    readonly kpiExecutionEnabled: false;
    readonly providerIntegrationEnabled: false;
  };
  wrapWithPipeline(pipeline: RequestPipeline): MetricsPlatformGateway;
};

export type CreateMetricsPlatformServicesInput = {
  readonly foundation?: MetricsFoundationRepos;
  readonly persistence?: MetricsPersistenceBundle;
  readonly now?: () => string;
  readonly id?: () => string;
};

export type CreateMetricsPlatformServicesForProductionInput = {
  readonly postgresDb: DatabaseExecutor;
  readonly now?: () => string;
  readonly id?: () => string;
};

export type CreateMetricsPlatformServicesForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly now?: () => string;
  readonly id?: () => string;
};

export function wrapMetricsPlatformGatewayWithPipeline(
  gateway: MetricsPlatformGateway,
  pipeline: RequestPipeline,
): MetricsPlatformGateway {
  return {
    metrics: wrapServiceWithPipeline(gateway.metrics, pipeline, "metricsMetrics"),
    definitions: wrapServiceWithPipeline(
      gateway.definitions,
      pipeline,
      "metricsDefinitions",
    ),
    versions: wrapServiceWithPipeline(gateway.versions, pipeline, "metricsVersions"),
    categories: wrapServiceWithPipeline(
      gateway.categories,
      pipeline,
      "metricsCategories",
    ),
    groups: wrapServiceWithPipeline(gateway.groups, pipeline, "metricsGroups"),
    dimensions: wrapServiceWithPipeline(
      gateway.dimensions,
      pipeline,
      "metricsDimensions",
    ),
    labels: wrapServiceWithPipeline(gateway.labels, pipeline, "metricsLabels"),
    units: wrapServiceWithPipeline(gateway.units, pipeline, "metricsUnits"),
    formulas: wrapServiceWithPipeline(gateway.formulas, pipeline, "metricsFormulas"),
    aggregations: wrapServiceWithPipeline(
      gateway.aggregations,
      pipeline,
      "metricsAggregations",
    ),
    thresholds: wrapServiceWithPipeline(
      gateway.thresholds,
      pipeline,
      "metricsThresholds",
    ),
    owners: wrapServiceWithPipeline(gateway.owners, pipeline, "metricsOwners"),
    consumers: wrapServiceWithPipeline(gateway.consumers, pipeline, "metricsConsumers"),
    retentionPolicies: wrapServiceWithPipeline(
      gateway.retentionPolicies,
      pipeline,
      "metricsRetentionPolicies",
    ),
    classifications: wrapServiceWithPipeline(
      gateway.classifications,
      pipeline,
      "metricsClassifications",
    ),
    dependencies: wrapServiceWithPipeline(
      gateway.dependencies,
      pipeline,
      "metricsDependencies",
    ),
    kpis: wrapServiceWithPipeline(gateway.kpis, pipeline, "metricsKpis"),
    kpiGroups: wrapServiceWithPipeline(gateway.kpiGroups, pipeline, "metricsKpiGroups"),
    kpiTargets: wrapServiceWithPipeline(
      gateway.kpiTargets,
      pipeline,
      "metricsKpiTargets",
    ),
    relationships: wrapServiceWithPipeline(
      gateway.relationships,
      pipeline,
      "metricsRelationships",
    ),
    metadata: wrapServiceWithPipeline(gateway.metadata, pipeline, "metricsMetadata"),
    diagnostics: wrapServiceWithPipeline(
      gateway.diagnostics,
      pipeline,
      "metricsDiagnostics",
    ),
  };
}

function buildBundle(input: {
  readonly persistence: MetricsPersistenceBundle;
  readonly persistenceMode: "postgres" | "memory";
  readonly now?: () => string;
  readonly id?: () => string;
}): MetricsPlatformServicesBundle {
  createMetricsFoundation({ repos: input.persistence });
  let seq = 0;
  const now = input.now ?? (() => new Date().toISOString());
  const id = input.id ?? (() => `met_${Date.now().toString(36)}_${++seq}`);
  const domain = createPlatformMetricsService({
    repos: input.persistence,
    now,
    id,
    persistenceMode: input.persistenceMode,
  });
  const impls = createMetricsPlatformServiceImpls({ domain });
  const gatewaySurface = impls;

  return {
    foundation: input.persistence,
    persistence: input.persistence,
    gatewaySurface,
    impls,
    readiness: {
      metricsEnabled: true,
      persistenceMode: input.persistenceMode,
      formulaExecutionEnabled: false,
      kpiExecutionEnabled: false,
      providerIntegrationEnabled: false,
    },
    wrapWithPipeline: (pipeline) =>
      wrapMetricsPlatformGatewayWithPipeline(gatewaySurface, pipeline),
  };
}

export function createMetricsPlatformServices(
  input: CreateMetricsPlatformServicesInput & {
    readonly persistence: MetricsPersistenceBundle;
    readonly persistenceMode?: "postgres" | "memory";
  },
): MetricsPlatformServicesBundle {
  return buildBundle({
    persistence: input.persistence,
    persistenceMode: input.persistenceMode ?? "memory",
    now: input.now,
    id: input.id,
  });
}

export function createMetricsPlatformServicesForProduction(
  input: CreateMetricsPlatformServicesForProductionInput,
): MetricsPlatformServicesBundle {
  if (!input?.postgresDb) {
    throw new Error(
      "createMetricsPlatformServicesForProduction requires postgresDb — in-memory fallback is forbidden",
    );
  }
  const persistence = createProductionMetricsPersistence({
    db: input.postgresDb,
  });
  return buildBundle({
    persistence,
    persistenceMode: "postgres",
    now: input.now,
    id: input.id,
  });
}

export function createMetricsPlatformServicesForTest(
  input: CreateMetricsPlatformServicesForTestInput = {},
): MetricsPlatformServicesBundle {
  if (!input.postgresDb && !input.allowInMemoryPersistence) {
    throw new Error(
      "createMetricsPlatformServicesForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  const persistence = createMetricsPersistenceForTest({
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
