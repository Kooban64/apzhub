import type {
  PlaneCapabilityCertification,
  PlaneCompatibilityMatrix,
  PlaneFeatureDetectionResult,
  PlaneOperationalHealthLevel,
  PlaneReadinessResult,
} from "./types";

export interface ClassifyHealthInput {
  readonly providerReachable: boolean;
  readonly authenticationValid: boolean;
  readonly circuitBreakerOpen: boolean;
  readonly compatibility: PlaneCompatibilityMatrix;
  readonly capabilities: readonly PlaneCapabilityCertification[];
  readonly readiness?: PlaneReadinessResult;
  readonly featureDetection?: PlaneFeatureDetectionResult;
  readonly syncUnhealthy?: boolean;
  readonly webhookUnhealthy?: boolean;
}

export interface PlaneHealthClassification {
  readonly level: PlaneOperationalHealthLevel;
  readonly reasons: readonly string[];
}

/**
 * Standard health levels for Plane (and reusable by future adapters).
 */
export function classifyPlaneOperationalHealth(
  input: ClassifyHealthInput,
): PlaneHealthClassification {
  const reasons: string[] = [];

  if (!input.providerReachable) {
    reasons.push("provider_unreachable");
    return { level: "UNAVAILABLE", reasons };
  }

  if (input.circuitBreakerOpen) {
    reasons.push("circuit_breaker_open");
    return { level: "UNAVAILABLE", reasons };
  }

  if (!input.authenticationValid) {
    reasons.push("authentication_invalid");
    return { level: "UNAVAILABLE", reasons };
  }

  if (input.compatibility.compatibilityStatus === "incompatible") {
    reasons.push("provider_version_incompatible");
    return { level: "LIMITED", reasons };
  }

  const requiredUnavailable = input.capabilities.filter(
    (capability) => !capability.optional && !capability.available,
  );
  if (requiredUnavailable.length > 0) {
    reasons.push(
      ...requiredUnavailable.map(
        (capability) => `required_capability_unavailable:${capability.serviceId}`,
      ),
    );
    return { level: "LIMITED", reasons };
  }

  const optionalUnavailable = input.capabilities.filter(
    (capability) => capability.optional && !capability.available,
  );
  const degradedCaps = input.capabilities.filter((capability) => capability.degraded);

  if (input.syncUnhealthy) reasons.push("sync_unhealthy");
  if (input.webhookUnhealthy) reasons.push("webhook_unhealthy");
  if (optionalUnavailable.length > 0) {
    reasons.push(
      ...optionalUnavailable.map(
        (capability) => `optional_capability_unavailable:${capability.serviceId}`,
      ),
    );
  }
  if (degradedCaps.length > 0) {
    reasons.push(
      ...degradedCaps.map(
        (capability) => `capability_degraded:${capability.serviceId}`,
      ),
    );
  }
  if (input.compatibility.compatibilityStatus === "warning") {
    reasons.push("provider_version_at_maximum");
  }
  if (input.readiness && !input.readiness.ready) {
    reasons.push(
      ...input.readiness.warnings.map((warning) => `readiness_warning:${warning}`),
    );
  }

  if (
    reasons.length > 0 ||
    optionalUnavailable.length > 0 ||
    degradedCaps.length > 0 ||
    input.syncUnhealthy ||
    input.webhookUnhealthy
  ) {
    return { level: "DEGRADED", reasons: [...new Set(reasons)] };
  }

  return { level: "HEALTHY", reasons: [] };
}

export function mapOperationalHealthToSdkStatus(
  level: PlaneOperationalHealthLevel,
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
