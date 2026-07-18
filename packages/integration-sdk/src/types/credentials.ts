export type IntegrationCredentialKind =
  "bearer" | "api-key" | "basic" | "oauth" | "forward-auth";

/** Credential reference — values resolved via Vault or @apzhub/config, never logged. */
export interface IntegrationCredentials {
  readonly kind: IntegrationCredentialKind;
  readonly credentialRef: string;
  readonly expiresAt?: string;
}
