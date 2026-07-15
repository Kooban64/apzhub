import type { AdapterConfigurationValidationResult } from "@apzhub/integration-sdk/adapter";

import type { PlaneCompatibilityMatrix } from "./types";
import type {
  PlaneOperationalHealthLevel,
  PlaneReadinessCheckResult,
  PlaneReadinessResult,
} from "./types";
import { classifyPlaneOperationalHealth } from "./health-classification";
import type { PlaneCapabilityCertification } from "./types";

export interface EvaluateReadinessInput {
  readonly checkedAt: string;
  readonly configurationValidation: AdapterConfigurationValidationResult;
  readonly authenticationValid: boolean;
  readonly providerReachable: boolean;
  readonly capabilitiesRegistered: boolean;
  readonly registeredCapabilityCount: number;
  readonly compatibility: PlaneCompatibilityMatrix;
  readonly syncServiceAvailable: boolean;
  readonly webhookServiceAvailable: boolean;
  readonly metricsAvailable: boolean;
  readonly loggerAvailable: boolean;
  readonly capabilities: readonly PlaneCapabilityCertification[];
  readonly circuitBreakerOpen: boolean;
  readonly syncUnhealthy?: boolean;
  readonly webhookUnhealthy?: boolean;
}

/**
 * Structured operational readiness validation — required checks block readiness;
 * optional gaps become warnings only.
 */
export function evaluatePlaneReadiness(input: EvaluateReadinessInput): PlaneReadinessResult {
  const checks: PlaneReadinessCheckResult[] = [
    {
      id: "configuration",
      ok: input.configurationValidation.ok,
      required: true,
      message: input.configurationValidation.ok
        ? "Plane configuration valid"
        : (input.configurationValidation.message ?? "Plane configuration invalid"),
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
        ? `Registered ${input.registeredCapabilityCount} core capabilities`
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
          ? "Provider version incompatible"
          : `Provider compatibility: ${input.compatibility.compatibilityStatus}`,
      details: {
        detected: input.compatibility.detectedPlaneVersion ?? "unknown",
        min: input.compatibility.supportedVersionRange.min,
        max: input.compatibility.supportedVersionRange.max,
      },
    },
    {
      id: "sync_configuration",
      ok: input.syncServiceAvailable,
      required: true,
      message: input.syncServiceAvailable
        ? "Synchronisation service available"
        : "Synchronisation service unavailable",
    },
    {
      id: "webhook_configuration",
      ok: input.webhookServiceAvailable,
      required: false,
      message: input.webhookServiceAvailable
        ? "Webhook service available"
        : "Webhook service unavailable (optional)",
    },
    {
      id: "metrics_availability",
      ok: input.metricsAvailable,
      required: true,
      message: input.metricsAvailable ? "Metrics provider available" : "Metrics provider missing",
    },
    {
      id: "logger_availability",
      ok: input.loggerAvailable,
      required: true,
      message: input.loggerAvailable ? "Logger available" : "Logger missing",
    },
  ];

  const blockingIssues = checks
    .filter((check) => check.required && !check.ok)
    .map((check) => `${check.id}:${check.message}`);

  const warnings = [
    ...checks.filter((check) => !check.required && !check.ok).map((check) => check.message),
    ...input.compatibility.reasons.filter((reason) => reason !== "provider_version_not_detected"),
  ];

  const health = classifyPlaneOperationalHealth({
    providerReachable: input.providerReachable,
    authenticationValid: input.authenticationValid,
    circuitBreakerOpen: input.circuitBreakerOpen,
    compatibility: input.compatibility,
    capabilities: input.capabilities,
    syncUnhealthy: input.syncUnhealthy,
    webhookUnhealthy: input.webhookUnhealthy,
  });

  const overallHealth: PlaneOperationalHealthLevel =
    blockingIssues.length > 0 && health.level === "HEALTHY" ? "LIMITED" : health.level;

  return {
    ready: blockingIssues.length === 0,
    overallHealth,
    checkedAt: input.checkedAt,
    checks,
    blockingIssues,
    warnings: [...new Set(warnings)],
  };
}
