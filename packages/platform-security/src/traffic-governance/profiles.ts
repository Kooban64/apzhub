import type { TrafficPolicyLimits, TrafficPolicySource } from "./types";

export type EnvironmentProfile = "development" | "test" | "production";

export function resolveEnvironmentProfileMultiplier(
  profile: EnvironmentProfile,
): number {
  switch (profile) {
    case "development":
      return 10;
    case "test":
      return 100;
    case "production":
      return 1;
    default:
      return 1;
  }
}

export function applyEnvironmentProfileToLimits(
  limits: TrafficPolicyLimits,
  profile: EnvironmentProfile,
): { readonly limits: TrafficPolicyLimits; readonly source: TrafficPolicySource } {
  const multiplier = resolveEnvironmentProfileMultiplier(profile);
  if (multiplier === 1) {
    return { limits, source: "registry" };
  }

  return {
    limits: {
      ...limits,
      requestsPerMinute: Math.max(1, Math.floor(limits.requestsPerMinute * multiplier)),
    },
    source: "environment-profile",
  };
}

export function resolveActiveEnvironmentProfile(
  nodeEnv: string | undefined = process.env.NODE_ENV,
): EnvironmentProfile {
  if (nodeEnv === "production" || nodeEnv === "test" || nodeEnv === "development") {
    return nodeEnv;
  }
  return "development";
}
