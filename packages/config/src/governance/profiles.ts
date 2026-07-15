import type { EnvironmentProfile, ValidationTier } from "./types";

export function resolveEnvironmentProfile(
  nodeEnv: string | undefined = process.env.NODE_ENV,
): EnvironmentProfile {
  if (nodeEnv === "production" || nodeEnv === "test" || nodeEnv === "development") {
    return nodeEnv;
  }
  return "development";
}

export function resolveValidationTier(profile: EnvironmentProfile): ValidationTier {
  return profile === "development" ? "permissive" : "strict";
}

export const ENV_PROFILE_RULES: Record<
  EnvironmentProfile,
  {
    readonly abortStartupOnFailure: boolean;
    readonly warnOnDevRegistration: boolean;
    readonly requireStrongSecrets: boolean;
  }
> = {
  development: {
    abortStartupOnFailure: false,
    warnOnDevRegistration: false,
    requireStrongSecrets: false,
  },
  test: {
    abortStartupOnFailure: true,
    warnOnDevRegistration: false,
    requireStrongSecrets: true,
  },
  production: {
    abortStartupOnFailure: true,
    warnOnDevRegistration: true,
    requireStrongSecrets: true,
  },
};
