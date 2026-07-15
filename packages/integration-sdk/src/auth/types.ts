/** Vendor-neutral authentication modes supported at the SDK contract level. */
export type AuthenticationMode =
  | "api_token"
  | "bearer"
  | "basic"
  | "api_key_header"
  | "api_key_query"
  | "oauth2"
  | "session_cookie"
  | "custom";

export type CredentialSourceType =
  | "static"
  | "environment"
  | "platform_config"
  | "vault"
  | "tenant_scoped";

/** Static credential reference — secret values resolved via SecretProvider only. */
export interface AuthCredentialReference {
  readonly credentialRef: string;
  readonly authenticationMode: AuthenticationMode;
  readonly usernameRef?: string;
  readonly headerName?: string;
  readonly queryParam?: string;
  readonly customScheme?: string;
  readonly expiresAt?: string;
}

/** Safe resolved credential — never includes raw secret values. */
export interface ResolvedCredential {
  readonly authenticationMode: AuthenticationMode;
  readonly credentialSourceType: CredentialSourceType;
  readonly credentialRef: string;
  readonly secretPresent: boolean;
  readonly maskedPreview: string;
  readonly expiresAt?: string;
  readonly usernamePresent?: boolean;
}

export interface AuthenticationResult {
  readonly authenticated: boolean;
  readonly authenticationMode: AuthenticationMode;
  readonly credentialRef: string;
  readonly authenticatedAt: string;
  readonly expiresAt?: string;
}

export interface AuthenticateInput {
  readonly tenantId: string;
  readonly integrationId: string;
  readonly connectionId: string;
  readonly credential: AuthCredentialReference;
  readonly correlationId: string;
}

export interface AuthenticationProvider {
  authenticate(input: AuthenticateInput): Promise<import("../errors/result").SdkResult<AuthenticationResult>>;
  validateCredentialReference(
    credential: AuthCredentialReference,
    correlationId: string,
  ): Promise<import("../errors/result").SdkResult<ResolvedCredential>>;
}
