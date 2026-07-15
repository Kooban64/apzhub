import type { AdapterConfigurationValidationResult } from "@apzhub/integration-sdk/adapter";

import type {
  ZammadCapabilityCertification,
  ZammadCompatibilityMatrix,
  ZammadFeatureDetectionResult,
  ZammadOperationalHealthLevel,
  ZammadReadinessCheckResult,
  ZammadReadinessResult,
} from "./types";
import { classifyZammadOperationalHealth } from "./health-classification";

export interface EvaluateZammadReadinessInput {
  readonly checkedAt: string;
  readonly configurationValidation: AdapterConfigurationValidationResult;
  readonly authenticationValid: boolean;
  readonly providerReachable: boolean;
  readonly capabilitiesRegistered: boolean;
  readonly registeredCapabilityCount: number;
  readonly compatibility: ZammadCompatibilityMatrix;
  readonly coreSupportAvailable: boolean;
  readonly articleServiceAvailable: boolean;
  readonly syncServiceAvailable: boolean;
  readonly webhookServiceAvailable: boolean;
  readonly diagnosticsAvailable: boolean;
  readonly metricsAvailable: boolean;
  readonly loggerAvailable: boolean;
  readonly capabilities: readonly ZammadCapabilityCertification[];
  readonly circuitBreakerOpen: boolean;
  readonly syncUnhealthy?: boolean;
  readonly webhookUnhealthy?: boolean;
  readonly featureDetection?: ZammadFeatureDetectionResult;
}

/**
 * Evaluate structured readiness checks for Zammad operational certification.
 */
export function evaluateZammadReadiness(
  input: EvaluateZammadReadinessInput,
): ZammadReadinessResult {
  const checks: ZammadReadinessCheckResult[] = [
    {
      id: "configuration",
      ok: input.configurationValidation.ok,
      required: true,
      message: input.configurationValidation.ok
        ? "Configuration is valid"
        : "Configuration validation failed",
      remediationHint: input.configurationValidation.ok
        ? undefined
        : "Verify baseUrl, apiToken, timeout, and retry settings without logging secrets",
      details: {
        issueCount: input.configurationValidation.issues?.length ?? 0,
      },
    },
    {
      id: "authentication",
      ok: input.authenticationValid,
      required: true,
      message: input.authenticationValid
        ? "Authentication ready"
        : "Authentication not ready",
      remediationHint: input.authenticationValid
        ? undefined
        : "Confirm API token presence via secret provider; do not log token values",
    },
    {
      id: "connectivity",
      ok: input.providerReachable,
      required: true,
      message: input.providerReachable
        ? "Zammad API reachable"
        : "Zammad API unreachable",
      remediationHint: input.providerReachable
        ? undefined
        : "Check network connectivity, TLS, and base URL /api/v1 reachability",
    },
    {
      id: "version_compatibility",
      ok:
        input.compatibility.compatibilityStatus === "compatible" ||
        input.compatibility.compatibilityStatus === "unverified" ||
        input.compatibility.compatibilityStatus === "warning",
      required: true,
      message: `Compatibility status: ${input.compatibility.compatibilityStatus}`,
      remediationHint:
        input.compatibility.blockingIncompatibilities.length > 0
          ? "Upgrade Zammad to the supported range 6.3.0–6.5.x"
          : input.compatibility.compatibilityStatus === "unverified"
            ? "Detected version is newer than verified — proceed with caution"
            : undefined,
      details: {
        detectedVersion: input.compatibility.detectedZammadVersion ?? "unknown",
        blocking: input.compatibility.blockingIncompatibilities.length > 0,
      },
    },
    {
      id: "capability_registration",
      ok: input.capabilitiesRegistered && input.registeredCapabilityCount > 0,
      required: true,
      message: `${input.registeredCapabilityCount} capabilities registered`,
      remediationHint:
        input.capabilitiesRegistered && input.registeredCapabilityCount > 0
          ? undefined
          : "Ensure adapter bootstrap registers required Support capabilities",
    },
    {
      id: "core_support_readiness",
      ok: input.coreSupportAvailable,
      required: true,
      message: input.coreSupportAvailable
        ? "Core support services available"
        : "Core support services unavailable",
      remediationHint: input.coreSupportAvailable
        ? undefined
        : "Verify support, organisations, groups, and users services are wired",
    },
    {
      id: "article_service_readiness",
      ok: input.articleServiceAvailable,
      required: true,
      message: input.articleServiceAvailable
        ? "Article service available"
        : "Article service unavailable",
      remediationHint: input.articleServiceAvailable
        ? undefined
        : "Verify articles service is registered on adapter.core",
    },
    {
      id: "sync_configuration",
      ok: input.syncServiceAvailable && !input.syncUnhealthy,
      required: true,
      message:
        input.syncServiceAvailable && !input.syncUnhealthy
          ? "Synchronisation ready (in-memory)"
          : "Synchronisation not ready",
      remediationHint:
        input.syncServiceAvailable && !input.syncUnhealthy
          ? undefined
          : "Inspect sync diagnostics; persistent state remains unsupported",
      details: {
        persistentState: false,
      },
    },
    {
      id: "webhook_configuration",
      ok: input.webhookServiceAvailable && !input.webhookUnhealthy,
      required: false,
      message:
        input.webhookServiceAvailable && !input.webhookUnhealthy
          ? "Webhook management ready"
          : "Webhook management degraded or unavailable",
      remediationHint:
        input.webhookServiceAvailable && !input.webhookUnhealthy
          ? undefined
          : "Optional: verify webhook API permissions; ingress remains unsupported",
      details: {
        ingressSupported: false,
      },
    },
    {
      id: "diagnostics_availability",
      ok: input.diagnosticsAvailable,
      required: true,
      message: input.diagnosticsAvailable
        ? "Diagnostics available"
        : "Diagnostics unavailable",
      remediationHint: input.diagnosticsAvailable
        ? undefined
        : "Ensure diagnostics collector is configured on the adapter context",
    },
    {
      id: "logger_availability",
      ok: input.loggerAvailable,
      required: true,
      message: input.loggerAvailable ? "Logger available" : "Logger unavailable",
      remediationHint: input.loggerAvailable
        ? undefined
        : "Provide IntegrationLogger on AdapterContext",
    },
    {
      id: "metrics_availability",
      ok: input.metricsAvailable,
      required: false,
      message: input.metricsAvailable ? "Metrics available" : "Metrics unavailable",
      remediationHint: input.metricsAvailable
        ? undefined
        : "Optional: provide metrics provider for latency and error summaries",
    },
  ];

  // Blocking incompatibilities fail version_compatibility regardless of warning status
  if (input.compatibility.blockingIncompatibilities.length > 0) {
    const idx = checks.findIndex((c) => c.id === "version_compatibility");
    if (idx >= 0) {
      checks[idx] = {
        ...checks[idx]!,
        ok: false,
        message: "Blocking version incompatibility",
        remediationHint: "Upgrade Zammad to supported range 6.3.0–6.5.x",
      };
    }
  }

  const blockingIssues = checks
    .filter((c) => c.required && !c.ok)
    .map((c) => `${c.id}: ${c.message}`);
  const warnings = checks
    .filter((c) => !c.required && !c.ok)
    .map((c) => `${c.id}: ${c.message}`);

  const health = classifyZammadOperationalHealth({
    providerReachable: input.providerReachable,
    authenticationValid: input.authenticationValid,
    circuitBreakerOpen: input.circuitBreakerOpen,
    compatibility: input.compatibility,
    capabilities: input.capabilities,
    featureDetection: input.featureDetection,
    syncUnhealthy: input.syncUnhealthy,
    webhookUnhealthy: input.webhookUnhealthy,
    configurationInvalid: !input.configurationValidation.ok,
  });

  let overallHealth: ZammadOperationalHealthLevel = health.level;
  if (blockingIssues.length > 0 && overallHealth === "HEALTHY") {
    overallHealth = "LIMITED";
  }

  return {
    ready: blockingIssues.length === 0,
    overallHealth,
    checkedAt: input.checkedAt,
    checks,
    blockingIssues,
    warnings,
  };
}
