import type { GitHubActionsOperationalHealthLevel } from "./types";
import type { GitHubActionsCompatibilityMatrix } from "./types";
import type { GitHubActionsCapabilityCertification } from "./types";
import type { GitHubActionsFeatureDetectionResult } from "./types";

export interface ClassifyGitHubActionsOperationalHealthInput {
  readonly providerReachable: boolean;
  readonly authenticationValid: boolean;
  readonly circuitBreakerOpen: boolean;
  readonly compatibility: GitHubActionsCompatibilityMatrix;
  readonly capabilities: readonly GitHubActionsCapabilityCertification[];
  readonly featureDetection?: GitHubActionsFeatureDetectionResult;
  readonly configurationInvalid?: boolean;
  readonly rateLimitExhausted?: boolean;
}

/**
 * Classify adapter operational health.
 * HEALTHY | DEGRADED | LIMITED | UNAVAILABLE
 */
export function classifyGitHubActionsOperationalHealth(
  input: ClassifyGitHubActionsOperationalHealthInput,
): { level: GitHubActionsOperationalHealthLevel; reasons: readonly string[] } {
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

  if (input.rateLimitExhausted) {
    return { level: "LIMITED", reasons: ["rate_limit_exhausted"] };
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

  const optionalDegraded = input.capabilities.filter(
    (c) => c.optional && (!c.available || c.status === "degraded"),
  );

  if (
    optionalDegraded.length > 0 ||
    input.compatibility.compatibilityStatus === "unverified" ||
    input.compatibility.compatibilityStatus === "warning" ||
    input.featureDetection?.approvalsAvailable === false
  ) {
    if (optionalDegraded.length > 0) {
      reasons.push(
        ...optionalDegraded.map(
          (c) => `optional_capability_degraded:${c.capabilityId}`,
        ),
      );
    }
    if (input.featureDetection?.approvalsAvailable === false) {
      reasons.push("optional_capability_unavailable:approvals");
    }
    if (input.compatibility.compatibilityStatus === "unverified") {
      reasons.push("api_version_unverified");
    }
    if (input.compatibility.compatibilityStatus === "warning") {
      reasons.push(...input.compatibility.warnings);
    }
    return { level: "DEGRADED", reasons: [...new Set(reasons)] };
  }

  return { level: "HEALTHY", reasons: ["all_required_checks_passed"] };
}

export function mapOperationalHealthToSdkStatus(
  level: GitHubActionsOperationalHealthLevel,
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
