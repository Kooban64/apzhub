import type { AuthenticationMode, CredentialSourceType } from "./types";

export interface AuthenticationDiagnostics {
  readonly configured: boolean;
  readonly credentialSourceType?: CredentialSourceType;
  readonly authenticationMode?: AuthenticationMode;
  readonly secretPresent: boolean;
  readonly credentialRef?: string;
  readonly maskedPreview?: string;
  readonly warnings: readonly string[];
  readonly recommendations: readonly string[];
}

export interface BuildAuthenticationDiagnosticsInput {
  readonly configured: boolean;
  readonly authenticationMode?: AuthenticationMode;
  readonly credentialSourceType?: CredentialSourceType;
  readonly secretPresent: boolean;
  readonly credentialRef?: string;
  readonly maskedPreview?: string;
}

export function buildAuthenticationDiagnostics(
  input: BuildAuthenticationDiagnosticsInput,
): AuthenticationDiagnostics {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (!input.configured) {
    warnings.push("Authentication is not configured");
    recommendations.push("Register connection credentials via SecretProvider");
  }

  if (input.configured && !input.secretPresent) {
    warnings.push("Credential reference configured but secret is missing");
    recommendations.push("Verify credentialRef resolves via SecretProvider");
  }

  if (
    input.authenticationMode === "oauth2" ||
    input.authenticationMode === "session_cookie"
  ) {
    warnings.push(
      `${input.authenticationMode} flows are not implemented in OSS-100-02`,
    );
    recommendations.push("Use static credential modes until OAuth support lands");
  }

  return {
    configured: input.configured,
    credentialSourceType: input.credentialSourceType,
    authenticationMode: input.authenticationMode,
    secretPresent: input.secretPresent,
    credentialRef: input.credentialRef,
    maskedPreview: input.maskedPreview,
    warnings,
    recommendations,
  };
}
