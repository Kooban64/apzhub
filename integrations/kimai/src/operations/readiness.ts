import type { AdapterConfigurationValidationResult } from "@apzhub/integration-sdk/adapter";

import type {
  KimaiCapabilityCertification,
  KimaiCompatibilityMatrix,
  KimaiReadinessCheckResult,
  KimaiReadinessResult,
} from "./types";

export interface EvaluateKimaiReadinessInput {
  readonly checkedAt: string;
  readonly configurationValidation: AdapterConfigurationValidationResult;
  readonly authenticationValid: boolean;
  readonly providerReachable: boolean;
  readonly capabilitiesRegistered: boolean;
  readonly registeredCapabilityCount: number;
  readonly compatibility: KimaiCompatibilityMatrix;
  readonly metricsAvailable: boolean;
  readonly loggerAvailable: boolean;
  readonly capabilities: readonly KimaiCapabilityCertification[];
  readonly circuitBreakerOpen: boolean;
}

/**
 * Structured operational readiness — required checks block readiness;
 * optional gaps become warnings only.
 */
export function evaluateKimaiReadiness(
  input: EvaluateKimaiReadinessInput,
): KimaiReadinessResult {
  const checks: KimaiReadinessCheckResult[] = [
    {
      id: "configuration",
      ok: input.configurationValidation.ok,
      required: true,
      message: input.configurationValidation.ok
        ? "Kimai configuration valid"
        : (input.configurationValidation.message ?? "Kimai configuration invalid"),
      details: {
        issueCount: input.configurationValidation.issues?.length ?? 0,
      },
    },
    {
      id: "authentication",
      ok: input.authenticationValid,
      required: true,
      message: input.authenticationValid
        ? "Authentication material present"
        : "Authentication material missing or invalid",
    },
    {
      id: "connectivity",
      ok: input.providerReachable,
      required: true,
      message: input.providerReachable
        ? "Provider connectivity verified"
        : "Provider connectivity not verified or unavailable",
    },
    {
      id: "capability_registration",
      ok: input.capabilitiesRegistered && input.registeredCapabilityCount > 0,
      required: true,
      message: input.capabilitiesRegistered
        ? `Registered ${input.registeredCapabilityCount} foundation capabilities`
        : "Capability registration incomplete",
      details: { registeredCapabilityCount: input.registeredCapabilityCount },
    },
    {
      id: "provider_compatibility",
      ok:
        input.compatibility.compatibilityStatus === "compatible" ||
        input.compatibility.compatibilityStatus === "warning" ||
        input.compatibility.compatibilityStatus === "not_checked",
      required: true,
      message:
        input.compatibility.compatibilityStatus === "incompatible"
          ? "Kimai version incompatible with declared CE range"
          : `Compatibility status: ${input.compatibility.compatibilityStatus}`,
    },
    {
      id: "metrics",
      ok: input.metricsAvailable,
      required: false,
      message: input.metricsAvailable
        ? "Adapter metrics available"
        : "Adapter metrics unavailable",
    },
    {
      id: "logging",
      ok: input.loggerAvailable,
      required: false,
      message: input.loggerAvailable
        ? "Adapter logging available"
        : "Adapter logging unavailable",
    },
    {
      id: "circuit_breaker",
      ok: !input.circuitBreakerOpen,
      required: true,
      message: input.circuitBreakerOpen
        ? "Circuit breaker is open"
        : "Circuit breaker closed",
    },
    {
      id: "required_capabilities",
      ok: input.capabilities
        .filter((c) => !c.optional)
        .every((c) => c.availability === "available" || c.availability === "degraded"),
      required: true,
      message: "Required foundation capabilities assessed",
      details: {
        requiredCount: input.capabilities.filter((c) => !c.optional).length,
      },
    },
  ];

  const blockingFailures = checks
    .filter((c) => c.required && !c.ok)
    .map((c) => `${c.id}:${c.message}`);
  const warnings = [
    ...checks.filter((c) => !c.required && !c.ok).map((c) => `${c.id}:${c.message}`),
    ...input.compatibility.reasons,
  ];

  const ready = blockingFailures.length === 0;
  const classification = !ready
    ? "not_ready"
    : warnings.length > 0
      ? "ready_with_warnings"
      : "ready";

  return {
    ready,
    classification,
    checkedAt: input.checkedAt,
    checks,
    warnings,
    blockingFailures,
  };
}
