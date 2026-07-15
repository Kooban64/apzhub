import { authenticationFailedError } from "../errors/codes";
import { sdkErr, sdkOk, type SdkResult } from "../errors/result";
import type { CredentialResolver } from "./credential-resolver";
import type {
  AuthenticateInput,
  AuthenticationProvider,
  AuthenticationResult,
  AuthCredentialReference,
  ResolvedCredential,
} from "./types";

export interface DefaultAuthenticationProviderOptions {
  readonly credentialResolver: CredentialResolver;
  readonly clock?: Clock;
}

export interface Clock {
  now(): string;
}

export const systemClock: Clock = {
  now: () => new Date().toISOString(),
};

export class DefaultAuthenticationProvider implements AuthenticationProvider {
  private readonly credentialResolver: CredentialResolver;
  private readonly clock: Clock;

  constructor(options: DefaultAuthenticationProviderOptions) {
    this.credentialResolver = options.credentialResolver;
    this.clock = options.clock ?? systemClock;
  }

  async validateCredentialReference(
    credential: AuthCredentialReference,
    correlationId: string,
  ): Promise<SdkResult<ResolvedCredential>> {
    return this.credentialResolver.resolve({
      tenantId: "validation-only",
      credential,
      correlationId,
    });
  }

  async authenticate(
    input: AuthenticateInput,
  ): Promise<SdkResult<AuthenticationResult>> {
    const resolved = await this.credentialResolver.resolve({
      tenantId: input.tenantId,
      credential: input.credential,
      correlationId: input.correlationId,
    });

    if (!resolved.ok) {
      return sdkErr(
        authenticationFailedError(
          {
            correlationId: input.correlationId,
            details: {
              connectionId: input.connectionId,
              integrationId: input.integrationId,
            },
          },
          resolved.error.message,
        ),
      );
    }

    if (!resolved.value.secretPresent) {
      return sdkErr(
        authenticationFailedError(
          { correlationId: input.correlationId },
          "Credential secret is not present",
        ),
      );
    }

    return sdkOk({
      authenticated: true,
      authenticationMode: input.credential.authenticationMode,
      credentialRef: input.credential.credentialRef,
      authenticatedAt: this.clock.now(),
      expiresAt: input.credential.expiresAt,
    });
  }
}
