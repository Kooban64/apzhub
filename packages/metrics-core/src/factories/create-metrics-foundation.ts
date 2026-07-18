/**
 * Platform Metrics foundation composition (APZMETRICS-001).
 * Wires validators + lifecycle with explicit repository ports — NO silent memory.
 */

import {
  assertMetricsLifecycleTransition,
  canTransitionMetricsLifecycle,
  listAllowedMetricsLifecycleTransitions,
} from "../lifecycle/transitions";
import type { MetricsFoundationRepos } from "../ports/repository-ports";
import { MetricsDomainError } from "../ports/repository-ports";
import {
  assertNoCredentialPayload,
  validateKPI,
  validateMetric,
  validateMetricDefinition,
  validateMetricDependency,
  validateMetricFormula,
  validateMetricRetentionPolicy,
  validateMetricThreshold,
} from "../validation/validate-metrics";

export type CreateMetricsFoundationInput = {
  readonly repos: MetricsFoundationRepos;
};

export type MetricsFoundation = {
  readonly repos: MetricsFoundationRepos;
  readonly validateMetric: typeof validateMetric;
  readonly validateMetricDefinition: typeof validateMetricDefinition;
  readonly validateKPI: typeof validateKPI;
  readonly validateMetricDependency: typeof validateMetricDependency;
  readonly validateMetricFormula: typeof validateMetricFormula;
  readonly validateMetricThreshold: typeof validateMetricThreshold;
  readonly validateMetricRetentionPolicy: typeof validateMetricRetentionPolicy;
  readonly assertNoCredentialPayload: typeof assertNoCredentialPayload;
  readonly canTransitionLifecycle: typeof canTransitionMetricsLifecycle;
  readonly assertLifecycleTransition: typeof assertMetricsLifecycleTransition;
  readonly listAllowedLifecycleTransitions: typeof listAllowedMetricsLifecycleTransitions;
};

const REQUIRED_REPOS: (keyof MetricsFoundationRepos)[] = [
  "metrics",
  "definitions",
  "versions",
  "categories",
  "groups",
  "dimensions",
  "labels",
  "units",
  "formulas",
  "aggregations",
  "thresholds",
  "owners",
  "consumers",
  "retentionPolicies",
  "classifications",
  "dependencies",
  "kpis",
  "kpiGroups",
  "kpiTargets",
  "relationships",
  "metadata",
];

function assertRepos(repos: MetricsFoundationRepos): void {
  for (const key of REQUIRED_REPOS) {
    if (repos[key] == null) {
      throw new MetricsDomainError(
        "missing_repository",
        `createMetricsFoundation requires explicit repos.${key} — silent in-memory defaults are forbidden`,
        { key },
      );
    }
  }
}

export function createMetricsFoundation(
  input: CreateMetricsFoundationInput,
): MetricsFoundation {
  if (!input?.repos) {
    throw new MetricsDomainError(
      "missing_repos",
      "createMetricsFoundation requires explicit repos — silent in-memory defaults are forbidden",
    );
  }
  assertRepos(input.repos);
  return {
    repos: input.repos,
    validateMetric,
    validateMetricDefinition,
    validateKPI,
    validateMetricDependency,
    validateMetricFormula,
    validateMetricThreshold,
    validateMetricRetentionPolicy,
    assertNoCredentialPayload,
    canTransitionLifecycle: canTransitionMetricsLifecycle,
    assertLifecycleTransition: assertMetricsLifecycleTransition,
    listAllowedLifecycleTransitions: listAllowedMetricsLifecycleTransitions,
  };
}
