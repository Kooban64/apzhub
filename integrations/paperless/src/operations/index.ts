export type PaperlessOperationalHealthLevel = "healthy" | "degraded" | "unhealthy";

export function classifyPaperlessOperationalHealth(input: {
  readonly apiStatus: string;
  readonly authenticationStatus: string;
}): {
  readonly level: PaperlessOperationalHealthLevel;
  readonly reasons: readonly string[];
} {
  const reasons: string[] = [];
  if (
    input.authenticationStatus === "missing" ||
    input.authenticationStatus === "invalid"
  ) {
    reasons.push(`authentication:${input.authenticationStatus}`);
  }
  if (input.apiStatus === "unavailable") reasons.push("api:unavailable");
  if (input.apiStatus === "degraded") reasons.push("api:degraded");
  if (
    reasons.some(
      (reason) => reason.startsWith("authentication:") || reason === "api:unavailable",
    )
  ) {
    return { level: "unhealthy", reasons };
  }
  if (reasons.length > 0 || input.apiStatus === "not_tested") {
    return {
      level: "degraded",
      reasons: reasons.length ? reasons : ["api:not_tested"],
    };
  }
  return { level: "healthy", reasons: [] };
}

export function mapPaperlessOperationalHealthToSdkStatus(
  level: PaperlessOperationalHealthLevel,
): "healthy" | "degraded" | "unavailable" {
  return level === "unhealthy" ? "unavailable" : level;
}
