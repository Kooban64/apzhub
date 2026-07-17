/**
 * Observability Platform foundation composition (APZOBSERVE-001).
 * Wires validators + lifecycle with explicit repository ports — NO silent memory.
 */

import {
  assertObserveAlertStateTransition,
  assertObserveHealthTransition,
  assertObserveMetadataTransition,
  canTransitionObserveAlertState,
  canTransitionObserveHealth,
  canTransitionObserveMetadata,
  listAllowedObserveHealthTransitions,
} from "../lifecycle/transitions";
import type { ObserveFoundationRepos } from "../ports/repository-ports";
import { ObserveDomainError } from "../ports/repository-ports";
import {
  assertNoCredentialPayload,
  validateAlertDefinition,
  validateHealthCheck,
  validateMetricDefinition,
  validateServiceHealth,
} from "../validation/validate-observe";

export type CreateObserveFoundationInput = {
  readonly repos: ObserveFoundationRepos;
};

export type ObserveFoundation = {
  readonly repos: ObserveFoundationRepos;
  readonly validateHealthCheck: typeof validateHealthCheck;
  readonly validateServiceHealth: typeof validateServiceHealth;
  readonly validateMetricDefinition: typeof validateMetricDefinition;
  readonly validateAlertDefinition: typeof validateAlertDefinition;
  readonly assertNoCredentialPayload: typeof assertNoCredentialPayload;
  readonly canTransitionHealth: typeof canTransitionObserveHealth;
  readonly assertHealthTransition: typeof assertObserveHealthTransition;
  readonly listAllowedHealthTransitions: typeof listAllowedObserveHealthTransitions;
  readonly canTransitionAlertState: typeof canTransitionObserveAlertState;
  readonly assertAlertStateTransition: typeof assertObserveAlertStateTransition;
  readonly canTransitionMetadata: typeof canTransitionObserveMetadata;
  readonly assertMetadataTransition: typeof assertObserveMetadataTransition;
};

const REQUIRED_REPOS: (keyof ObserveFoundationRepos)[] = [
  "healthChecks",
  "readinessChecks",
  "livenessChecks",
  "serviceHealth",
  "serviceStatuses",
  "componentStatuses",
  "metricDefinitions",
  "metricSamples",
  "alertDefinitions",
  "alertStates",
  "dashboards",
  "logSources",
  "traceDefinitions",
  "traceSpans",
  "incidentReferences",
  "maintenanceWindows",
  "healthSummaries",
  "diagnostics",
  "metadata",
];

function assertRepos(repos: ObserveFoundationRepos): void {
  for (const key of REQUIRED_REPOS) {
    if (repos[key] == null) {
      throw new ObserveDomainError(
        "missing_repository",
        `createObserveFoundation requires explicit repos.${key} — silent in-memory defaults are forbidden`,
        { key },
      );
    }
  }
}

export function createObserveFoundation(
  input: CreateObserveFoundationInput,
): ObserveFoundation {
  if (!input?.repos) {
    throw new ObserveDomainError(
      "missing_repos",
      "createObserveFoundation requires explicit repos — silent in-memory defaults are forbidden",
    );
  }
  assertRepos(input.repos);
  return {
    repos: input.repos,
    validateHealthCheck,
    validateServiceHealth,
    validateMetricDefinition,
    validateAlertDefinition,
    assertNoCredentialPayload,
    canTransitionHealth: canTransitionObserveHealth,
    assertHealthTransition: assertObserveHealthTransition,
    listAllowedHealthTransitions: listAllowedObserveHealthTransitions,
    canTransitionAlertState: canTransitionObserveAlertState,
    assertAlertStateTransition: assertObserveAlertStateTransition,
    canTransitionMetadata: canTransitionObserveMetadata,
    assertMetadataTransition: assertObserveMetadataTransition,
  };
}
