import type { KimaiOperationalHealthLevel } from "./types";

export function mapOperationalHealthToSdkStatus(
  level: KimaiOperationalHealthLevel,
): "healthy" | "degraded" | "unavailable" {
  if (level === "HEALTHY") return "healthy";
  if (level === "UNAVAILABLE") return "unavailable";
  return "degraded";
}

export function classifyKimaiOperationalHealth(input: {
  readonly apiStatus: string;
  readonly authenticationStatus: string;
  readonly compatibilityStatus?: string;
  readonly circuitBreakerOpen?: boolean;
}): {
  readonly level: KimaiOperationalHealthLevel;
  readonly reasons: readonly string[];
} {
  const reasons: string[] = [];

  if (input.circuitBreakerOpen) {
    reasons.push("circuit_breaker:open");
  }
  if (
    input.authenticationStatus === "missing" ||
    input.authenticationStatus === "invalid"
  ) {
    reasons.push(`authentication:${input.authenticationStatus}`);
  }
  if (input.apiStatus === "unavailable") {
    reasons.push("api:unavailable");
  }
  if (input.apiStatus === "degraded") {
    reasons.push("api:degraded");
  }
  if (input.compatibilityStatus === "incompatible") {
    reasons.push("compatibility:incompatible");
  }

  if (
    reasons.some(
      (r) =>
        r.startsWith("authentication:") ||
        r === "api:unavailable" ||
        r === "circuit_breaker:open",
    )
  ) {
    return { level: "UNAVAILABLE", reasons };
  }

  if (input.compatibilityStatus === "incompatible") {
    return { level: "LIMITED", reasons };
  }

  if (reasons.length > 0 || input.apiStatus === "not_tested") {
    return {
      level: "DEGRADED",
      reasons: reasons.length > 0 ? reasons : ["api:not_tested"],
    };
  }

  return { level: "HEALTHY", reasons: [] };
}
