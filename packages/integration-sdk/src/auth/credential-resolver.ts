import {
  invalidCredentialsError,
  missingCredentialsError,
  unsupportedAuthenticationModeError,
} from "../errors/codes";
import { sdkErr, sdkOk, type SdkResult } from "../errors/result";
import { maskCredentialRef, maskSecretValue } from "./masking";
import { isAuthenticationMode, isImplementedAuthenticationMode } from "./modes";
import type { SecretProvider } from "./secret-provider";
import type {
  AuthCredentialReference,
  CredentialSourceType,
  ResolvedCredential,
} from "./types";

export interface CredentialResolveInput {
  readonly tenantId: string;
  readonly credential: AuthCredentialReference;
  readonly correlationId: string;
}

export interface CredentialResolver {
  resolve(input: CredentialResolveInput): Promise<SdkResult<ResolvedCredential>>;
}

export interface DefaultCredentialResolverOptions {
  readonly secretProvider: SecretProvider;
}

function validateCredentialReference(
  credential: AuthCredentialReference,
  correlationId: string,
): SdkResult<void> {
  if (!credential.credentialRef.trim()) {
    return sdkErr(
      missingCredentialsError({ correlationId }, "credentialRef is required"),
    );
  }

  if (!isAuthenticationMode(credential.authenticationMode)) {
    return sdkErr(
      unsupportedAuthenticationModeError(
        { correlationId },
        String(credential.authenticationMode),
      ),
    );
  }

  if (!isImplementedAuthenticationMode(credential.authenticationMode)) {
    return sdkErr(
      unsupportedAuthenticationModeError(
        { correlationId },
        credential.authenticationMode,
      ),
    );
  }

  if (
    credential.authenticationMode === "api_key_header" &&
    !credential.headerName?.trim()
  ) {
    return sdkErr(
      invalidCredentialsError(
        { correlationId, details: { field: "headerName" } },
        "headerName is required for api_key_header authentication",
      ),
    );
  }

  if (
    credential.authenticationMode === "api_key_query" &&
    !credential.queryParam?.trim()
  ) {
    return sdkErr(
      invalidCredentialsError(
        { correlationId, details: { field: "queryParam" } },
        "queryParam is required for api_key_query authentication",
      ),
    );
  }

  if (credential.authenticationMode === "basic" && !credential.usernameRef?.trim()) {
    return sdkErr(
      invalidCredentialsError(
        { correlationId, details: { field: "usernameRef" } },
        "usernameRef is required for basic authentication",
      ),
    );
  }

  if (credential.authenticationMode === "custom" && !credential.customScheme?.trim()) {
    return sdkErr(
      invalidCredentialsError(
        { correlationId, details: { field: "customScheme" } },
        "customScheme is required for custom authentication",
      ),
    );
  }

  return sdkOk(undefined);
}

export class DefaultCredentialResolver implements CredentialResolver {
  private readonly secretProvider: SecretProvider;

  constructor(options: DefaultCredentialResolverOptions) {
    this.secretProvider = options.secretProvider;
  }

  async resolve(input: CredentialResolveInput): Promise<SdkResult<ResolvedCredential>> {
    const validation = validateCredentialReference(
      input.credential,
      input.correlationId,
    );
    if (!validation.ok) {
      return validation;
    }

    const secretResult = await this.secretProvider.resolve({
      credentialRef: input.credential.credentialRef,
      usernameRef: input.credential.usernameRef,
      tenantId: input.tenantId,
      correlationId: input.correlationId,
    });

    if (!secretResult.ok) {
      return sdkErr({
        ...secretResult.error,
        category: "authentication",
        code: secretResult.error.code.startsWith("integration.auth")
          ? secretResult.error.code
          : "integration.auth.missing_credentials",
      });
    }

    const material = secretResult.value;

    if (!material.value.trim()) {
      return sdkErr(
        invalidCredentialsError(
          { correlationId: input.correlationId },
          "Resolved credential value is empty",
        ),
      );
    }

    const resolved: ResolvedCredential = {
      authenticationMode: input.credential.authenticationMode,
      credentialSourceType: material.sourceType,
      credentialRef: input.credential.credentialRef,
      secretPresent: true,
      maskedPreview: maskSecretValue(material.value),
      expiresAt: input.credential.expiresAt,
      usernamePresent:
        input.credential.authenticationMode === "basic"
          ? Boolean(material.username?.trim())
          : undefined,
    };

    return sdkOk(resolved);
  }
}

export function createResolvedCredentialPreview(
  credential: AuthCredentialReference,
  sourceType: CredentialSourceType,
  secretPresent: boolean,
): ResolvedCredential {
  return {
    authenticationMode: credential.authenticationMode,
    credentialSourceType: sourceType,
    credentialRef: credential.credentialRef,
    secretPresent,
    maskedPreview: secretPresent
      ? maskCredentialRef(credential.credentialRef)
      : "(missing)",
    expiresAt: credential.expiresAt,
  };
}
