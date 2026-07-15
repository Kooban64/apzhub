import type { ZammadReferenceAdapterComplianceResult } from "./types";

export interface AssessZammadReferenceComplianceInput {
  readonly packageStructureOk: boolean;
  readonly factoryPatternOk: boolean;
  readonly adapterLifecycleOk: boolean;
  readonly operationRunnerOk: boolean;
  readonly restClientBoundaryOk: boolean;
  readonly internalApiTypesPrivate: boolean;
  readonly canonicalDtoUseOk: boolean;
  readonly capabilityRegistrationOk: boolean;
  readonly diagnosticsOk: boolean;
  readonly metricsOk: boolean;
  readonly loggingOk: boolean;
  readonly errorTranslationOk: boolean;
  readonly mockInfrastructureOk: boolean;
  readonly testCoverageOk: boolean;
  readonly documentationOk: boolean;
  readonly versioningOk: boolean;
  readonly forbiddenDependencyRulesOk: boolean;
  readonly documentedDeviations?: readonly string[];
}

/**
 * Assess Zammad against docs/architecture/REFERENCE-ADAPTER-STANDARD.md.
 * Does not weaken the standard — deviations must be corrected or documented.
 */
export function assessZammadReferenceAdapterCompliance(
  input: AssessZammadReferenceComplianceInput,
): ZammadReferenceAdapterComplianceResult {
  const checks = [
    {
      id: "package_structure",
      ok: input.packageStructureOk,
      required: true,
      message: "Package structure matches Reference Adapter layout",
    },
    {
      id: "factory_pattern",
      ok: input.factoryPatternOk,
      required: true,
      message: "Factory pattern present",
    },
    {
      id: "adapter_lifecycle",
      ok: input.adapterLifecycleOk,
      required: true,
      message: "Adapter lifecycle via IntegrationAdapterBase",
    },
    {
      id: "operation_runner",
      ok: input.operationRunnerOk,
      required: true,
      message: "ZammadOperationRunner used for provider operations",
    },
    {
      id: "rest_client_boundaries",
      ok: input.restClientBoundaryOk,
      required: true,
      message: "REST client remains internal",
    },
    {
      id: "internal_api_types",
      ok: input.internalApiTypesPrivate,
      required: true,
      message: "Zammad API types are not exported publicly",
    },
    {
      id: "canonical_dto_use",
      ok: input.canonicalDtoUseOk,
      required: true,
      message: "Canonical DTOs used at service boundaries",
    },
    {
      id: "capability_registration",
      ok: input.capabilityRegistrationOk,
      required: true,
      message: "Capabilities registered through SDK framework",
    },
    {
      id: "diagnostics",
      ok: input.diagnosticsOk,
      required: true,
      message: "Secret-free diagnostics available",
    },
    {
      id: "metrics",
      ok: input.metricsOk,
      required: false,
      message: "Metrics contracts available",
    },
    {
      id: "logging",
      ok: input.loggingOk,
      required: true,
      message: "IntegrationLogger available",
    },
    {
      id: "error_translation",
      ok: input.errorTranslationOk,
      required: true,
      message: "Vendor errors translated — no raw backend leakage",
    },
    {
      id: "mock_infrastructure",
      ok: input.mockInfrastructureOk,
      required: true,
      message: "Mock Zammad environment available for tests",
    },
    {
      id: "test_coverage",
      ok: input.testCoverageOk,
      required: true,
      message: "Operational and domain tests present",
    },
    {
      id: "documentation",
      ok: input.documentationOk,
      required: true,
      message: "Adapter and operations documentation present",
    },
    {
      id: "versioning",
      ok: input.versioningOk,
      required: true,
      message: "Package versioning follows repository policy",
    },
    {
      id: "forbidden_dependencies",
      ok: input.forbiddenDependencyRulesOk,
      required: true,
      message: "No platform-services, gateway, mapping-store, routes, or Plane reuse",
    },
  ] as const;

  const requiredFailures = checks.filter((c) => c.required && !c.ok);
  const optionalFailures = checks.filter((c) => !c.required && !c.ok);
  const deviations = [
    ...requiredFailures.map((c) => `required_fail:${c.id}`),
    ...optionalFailures.map((c) => `optional_fail:${c.id}`),
    ...(input.documentedDeviations ?? []),
  ];

  if (requiredFailures.length > 0) {
    return {
      compliant: false,
      outcome: "fail",
      checks: [...checks],
      deviations,
    };
  }

  if (optionalFailures.length > 0 || (input.documentedDeviations?.length ?? 0) > 0) {
    return {
      compliant: true,
      outcome: "pass_with_limitations",
      checks: [...checks],
      deviations,
    };
  }

  return {
    compliant: true,
    outcome: "pass",
    checks: [...checks],
    deviations: [],
  };
}

/** Default compliance assessment for a correctly wired Zammad adapter at OSS-102-07. */
export function defaultZammadReferenceCompliance(): ZammadReferenceAdapterComplianceResult {
  return assessZammadReferenceAdapterCompliance({
    packageStructureOk: true,
    factoryPatternOk: true,
    adapterLifecycleOk: true,
    operationRunnerOk: true,
    restClientBoundaryOk: true,
    internalApiTypesPrivate: true,
    canonicalDtoUseOk: true,
    capabilityRegistrationOk: true,
    diagnosticsOk: true,
    metricsOk: true,
    loggingOk: true,
    errorTranslationOk: true,
    mockInfrastructureOk: true,
    testCoverageOk: true,
    documentationOk: true,
    versioningOk: true,
    forbiddenDependencyRulesOk: true,
    documentedDeviations: [
      "Persistent sync state deferred — in-memory only (documented limitation)",
      "Webhook ingress and Platform Event Bus deferred to later milestones",
      "Binary attachment transfer deferred — metadata only",
    ],
  });
}
