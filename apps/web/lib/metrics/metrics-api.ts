/**
 * Module-level Platform Metrics client accessor (APZMETRICS-003).
 */

import { createHttpMetricsClient, type MetricsClient } from "./metrics-client";
import { createMockMetricsClient } from "./mock-metrics-client";
import type { MetricsClientRequestOptions } from "./metrics-types";

let metricsClient: MetricsClient =
  typeof process !== "undefined" && process.env.NODE_ENV === "test"
    ? createMockMetricsClient()
    : createHttpMetricsClient();

export function setMetricsClient(client: MetricsClient): void {
  metricsClient = client;
}

export function getMetricsClient(): MetricsClient {
  return metricsClient;
}

export function resetMetricsClient(): void {
  metricsClient = createMockMetricsClient();
}

type ListQuery = { readonly limit?: number };

export function listMetrics(query?: ListQuery, options?: MetricsClientRequestOptions) {
  return getMetricsClient().metrics.list(query, options);
}
export function getMetric(id: string, options?: MetricsClientRequestOptions) {
  return getMetricsClient().metrics.get(id, options);
}
export function createMetric(
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().metrics.create(input, options);
}
export function updateMetric(
  id: string,
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().metrics.update(id, input, options);
}

export function listDefinitions(
  query?: ListQuery,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().definitions.list(query, options);
}
export function getDefinition(id: string, options?: MetricsClientRequestOptions) {
  return getMetricsClient().definitions.get(id, options);
}
export function createDefinition(
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().definitions.create(input, options);
}
export function updateDefinition(
  id: string,
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().definitions.update(id, input, options);
}

export function listVersions(query?: ListQuery, options?: MetricsClientRequestOptions) {
  return getMetricsClient().versions.list(query, options);
}
export function getVersion(id: string, options?: MetricsClientRequestOptions) {
  return getMetricsClient().versions.get(id, options);
}
export function createVersion(
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().versions.create(input, options);
}
export function updateVersion(
  id: string,
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().versions.update(id, input, options);
}

export function listCategories(
  query?: ListQuery,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().categories.list(query, options);
}
export function getCategory(id: string, options?: MetricsClientRequestOptions) {
  return getMetricsClient().categories.get(id, options);
}
export function createCategory(
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().categories.create(input, options);
}
export function updateCategory(
  id: string,
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().categories.update(id, input, options);
}

export function listGroups(query?: ListQuery, options?: MetricsClientRequestOptions) {
  return getMetricsClient().groups.list(query, options);
}
export function getGroup(id: string, options?: MetricsClientRequestOptions) {
  return getMetricsClient().groups.get(id, options);
}
export function createGroup(
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().groups.create(input, options);
}
export function updateGroup(
  id: string,
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().groups.update(id, input, options);
}

export function listDimensions(
  query?: ListQuery,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().dimensions.list(query, options);
}
export function getDimension(id: string, options?: MetricsClientRequestOptions) {
  return getMetricsClient().dimensions.get(id, options);
}
export function createDimension(
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().dimensions.create(input, options);
}
export function updateDimension(
  id: string,
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().dimensions.update(id, input, options);
}

export function listLabels(query?: ListQuery, options?: MetricsClientRequestOptions) {
  return getMetricsClient().labels.list(query, options);
}
export function getLabel(id: string, options?: MetricsClientRequestOptions) {
  return getMetricsClient().labels.get(id, options);
}
export function createLabel(
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().labels.create(input, options);
}
export function updateLabel(
  id: string,
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().labels.update(id, input, options);
}

export function listUnits(query?: ListQuery, options?: MetricsClientRequestOptions) {
  return getMetricsClient().units.list(query, options);
}
export function getUnit(id: string, options?: MetricsClientRequestOptions) {
  return getMetricsClient().units.get(id, options);
}
export function createUnit(
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().units.create(input, options);
}
export function updateUnit(
  id: string,
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().units.update(id, input, options);
}

export function listFormulas(query?: ListQuery, options?: MetricsClientRequestOptions) {
  return getMetricsClient().formulas.list(query, options);
}
export function getFormula(id: string, options?: MetricsClientRequestOptions) {
  return getMetricsClient().formulas.get(id, options);
}
export function createFormula(
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().formulas.create(input, options);
}
export function updateFormula(
  id: string,
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().formulas.update(id, input, options);
}

export function listAggregations(
  query?: ListQuery,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().aggregations.list(query, options);
}
export function getAggregation(id: string, options?: MetricsClientRequestOptions) {
  return getMetricsClient().aggregations.get(id, options);
}
export function createAggregation(
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().aggregations.create(input, options);
}
export function updateAggregation(
  id: string,
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().aggregations.update(id, input, options);
}

export function listThresholds(
  query?: ListQuery,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().thresholds.list(query, options);
}
export function getThreshold(id: string, options?: MetricsClientRequestOptions) {
  return getMetricsClient().thresholds.get(id, options);
}
export function createThreshold(
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().thresholds.create(input, options);
}
export function updateThreshold(
  id: string,
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().thresholds.update(id, input, options);
}

export function listOwners(query?: ListQuery, options?: MetricsClientRequestOptions) {
  return getMetricsClient().owners.list(query, options);
}
export function getOwner(id: string, options?: MetricsClientRequestOptions) {
  return getMetricsClient().owners.get(id, options);
}
export function createOwner(
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().owners.create(input, options);
}
export function updateOwner(
  id: string,
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().owners.update(id, input, options);
}

export function listConsumers(
  query?: ListQuery,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().consumers.list(query, options);
}
export function getConsumer(id: string, options?: MetricsClientRequestOptions) {
  return getMetricsClient().consumers.get(id, options);
}
export function createConsumer(
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().consumers.create(input, options);
}
export function updateConsumer(
  id: string,
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().consumers.update(id, input, options);
}

export function listRetentionPolicies(
  query?: ListQuery,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().retentionPolicies.list(query, options);
}
export function getRetentionPolicy(id: string, options?: MetricsClientRequestOptions) {
  return getMetricsClient().retentionPolicies.get(id, options);
}
export function createRetentionPolicy(
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().retentionPolicies.create(input, options);
}
export function updateRetentionPolicy(
  id: string,
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().retentionPolicies.update(id, input, options);
}

export function listClassifications(
  query?: ListQuery,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().classifications.list(query, options);
}
export function getClassification(id: string, options?: MetricsClientRequestOptions) {
  return getMetricsClient().classifications.get(id, options);
}
export function createClassification(
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().classifications.create(input, options);
}
export function updateClassification(
  id: string,
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().classifications.update(id, input, options);
}

export function listDependencies(
  query?: ListQuery,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().dependencies.list(query, options);
}
export function getDependency(id: string, options?: MetricsClientRequestOptions) {
  return getMetricsClient().dependencies.get(id, options);
}
export function createDependency(
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().dependencies.create(input, options);
}
export function updateDependency(
  id: string,
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().dependencies.update(id, input, options);
}

export function listKPIs(query?: ListQuery, options?: MetricsClientRequestOptions) {
  return getMetricsClient().kpis.list(query, options);
}
export function getKPI(id: string, options?: MetricsClientRequestOptions) {
  return getMetricsClient().kpis.get(id, options);
}
export function createKPI(
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().kpis.create(input, options);
}
export function updateKPI(
  id: string,
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().kpis.update(id, input, options);
}

export function listKPIGroups(
  query?: ListQuery,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().kpiGroups.list(query, options);
}
export function getKPIGroup(id: string, options?: MetricsClientRequestOptions) {
  return getMetricsClient().kpiGroups.get(id, options);
}
export function createKPIGroup(
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().kpiGroups.create(input, options);
}
export function updateKPIGroup(
  id: string,
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().kpiGroups.update(id, input, options);
}

export function listKPITargets(
  query?: ListQuery,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().kpiTargets.list(query, options);
}
export function getKPITarget(id: string, options?: MetricsClientRequestOptions) {
  return getMetricsClient().kpiTargets.get(id, options);
}
export function createKPITarget(
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().kpiTargets.create(input, options);
}
export function updateKPITarget(
  id: string,
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().kpiTargets.update(id, input, options);
}

export function listRelationships(
  query?: ListQuery,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().relationships.list(query, options);
}
export function getRelationship(id: string, options?: MetricsClientRequestOptions) {
  return getMetricsClient().relationships.get(id, options);
}
export function createRelationship(
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().relationships.create(input, options);
}
export function updateRelationship(
  id: string,
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().relationships.update(id, input, options);
}

export function listMetadata(query?: ListQuery, options?: MetricsClientRequestOptions) {
  return getMetricsClient().metadata.list(query, options);
}
export function getMetadata(id: string, options?: MetricsClientRequestOptions) {
  return getMetricsClient().metadata.get(id, options);
}
export function createMetadata(
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().metadata.create(input, options);
}
export function updateMetadata(
  id: string,
  input: Record<string, unknown>,
  options?: MetricsClientRequestOptions,
) {
  return getMetricsClient().metadata.update(id, input, options);
}

export function getMetricsDiagnostics(options?: MetricsClientRequestOptions) {
  return getMetricsClient().diagnostics.health(options);
}
export function getMetricsHealth(options?: MetricsClientRequestOptions) {
  return getMetricsClient().getHealth(options);
}
export function getMetricsReadiness(options?: MetricsClientRequestOptions) {
  return getMetricsClient().getReadiness(options);
}
export function getMetricsCapabilities(options?: MetricsClientRequestOptions) {
  return getMetricsClient().getCapabilities(options);
}
