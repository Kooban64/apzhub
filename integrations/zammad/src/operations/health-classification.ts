import type {
  ZammadCapabilityCertification,
  ZammadCompatibilityMatrix,
  ZammadFeatureDetectionResult,
  ZammadOperationalHealthLevel,
} from "./types";
import { ZAMMAD_OPTIONAL_CAPABILITIES } from "./compatibility-matrix";

export interface ClassifyZammadOperationalHealthInput {
  readonly providerReachable: boolean;
  readonly authenticationValid: boolean;
  readonly circuitBreakerOpen: boolean;
  readonly compatibility: ZammadCompatibilityMatrix;
  readonly capabilities: readonly ZammadCapabilityCertification[];
  readonly featureDetection?: ZammadFeatureDetectionResult;
  readonly syncUnhealthy?: boolean;
  readonly webhookUnhealthy?: boolean;
  readonly configurationInvalid?: boolean;
}

/**
 * Classify adapter operational health.
 *
 * - HEALTHY: core required capabilities available; no blocking incompatibilities
 * - DEGRADED: usable with optional capability gaps (e.g. webhooks)
 * - LIMITED: required capability gaps or unverified/warning compatibility that restricts safe use
 * - UNAVAILABLE: auth/connectivity/circuit/configuration/version block continued operation
 */
export function classifyZammadOperationalHealth(
  input: ClassifyZammadOperationalHealthInput,
): { level: ZammadOperationalHealthLevel; reasons: readonly string[] } {
  const reasons: string[] = [];

  if (input.configurationInvalid) {
    return { level: "UNAVAILABLE", reasons: ["configuration_invalid"] };
  }

  if (!input.authenticationValid) {
    return { level: "UNAVAILABLE", reasons: ["authentication_invalid"] };
  }

  if (!input.providerReachable) {
    return { level: "UNAVAILABLE", reasons: ["provider_unreachable"] };
  }

  if (input.circuitBreakerOpen) {
    return { level: "UNAVAILABLE", reasons: ["circuit_breaker_open"] };
  }

  if (input.compatibility.blockingIncompatibilities.length > 0) {
    return {
      level: "UNAVAILABLE",
      reasons: [
        "blocking_version_incompatibility",
        ...input.compatibility.blockingIncompatibilities,
      ],
    };
  }

  const requiredUnavailable = input.capabilities.filter(
    (c) => !c.optional && (!c.available || c.status === "unavailable"),
  );
  if (requiredUnavailable.length > 0) {
    reasons.push(
      ...requiredUnavailable.map(
        (c) => `required_capability_unavailable:${c.capabilityId}`,
      ),
    );
    return { level: "LIMITED", reasons };
  }

  if (input.syncUnhealthy) {
    reasons.push("synchronisation_unhealthy");
    return { level: "LIMITED", reasons };
  }

  const optionalUnavailable = new Set(
    input.featureDetection?.unavailableCapabilities.filter((id) =>
      (ZAMMAD_OPTIONAL_CAPABILITIES as readonly string[]).includes(id),
    ) ?? [],
  );
  if (input.webhookUnhealthy) {
    optionalUnavailable.add("webhooks");
  }

  const degradedCaps = input.capabilities.filter(
    (c) =>
      c.optional &&
      (c.degraded || !c.available || optionalUnavailable.has(c.capabilityId)),
  );

  if (
    degradedCaps.length > 0 ||
    optionalUnavailable.size > 0 ||
    input.compatibility.compatibilityStatus === "unverified" ||
    input.compatibility.compatibilityStatus === "warning"
  ) {
    if (degradedCaps.length > 0) {
      reasons.push(
        ...degradedCaps.map((c) => `optional_capability_degraded:${c.capabilityId}`),
      );
    }
    for (const id of optionalUnavailable) {
      if (!reasons.some((r) => r.includes(id))) {
        reasons.push(`optional_capability_unavailable:${id}`);
      }
    }
    if (input.compatibility.compatibilityStatus === "unverified") {
      reasons.push("provider_version_unverified");
    }
    if (input.compatibility.compatibilityStatus === "warning") {
      reasons.push(...input.compatibility.warnings);
    }
    return { level: "DEGRADED", reasons: [...new Set(reasons)] };
  }

  return { level: "HEALTHY", reasons: ["all_required_checks_passed"] };
}

/** Map operational health to Integration SDK adapter health status strings. */
export function mapOperationalHealthToSdkStatus(
  level: ZammadOperationalHealthLevel,
): "healthy" | "degraded" | "unavailable" {
  switch (level) {
    case "HEALTHY":
      return "healthy";
    case "DEGRADED":
    case "LIMITED":
      return "degraded";
    case "UNAVAILABLE":
      return "unavailable";
  }
}
