import { secretProviderUnavailableError } from "../errors/codes";
import { sdkErr, sdkOk, type SdkResult } from "../errors/result";
import type { CredentialSourceType } from "./types";

export interface SecretLookupInput {
  readonly credentialRef: string;
  readonly usernameRef?: string;
  readonly tenantId: string;
  readonly correlationId: string;
}

export interface SecretMaterial {
  readonly sourceType: CredentialSourceType;
  readonly value: string;
  readonly username?: string;
}

/** Bridge for future Vault, platform config, and tenant-scoped secret stores. */
export interface SecretProvider {
  readonly providerId: string;
  resolve(input: SecretLookupInput): Promise<SdkResult<SecretMaterial>>;
}

export interface InMemorySecretProviderOptions {
  readonly providerId?: string;
  readonly sourceType?: CredentialSourceType;
  readonly secrets?: Readonly<Record<string, string>>;
  readonly usernames?: Readonly<Record<string, string>>;
}

/** Static in-memory secret provider for tests and local development only. */
export class InMemorySecretProvider implements SecretProvider {
  readonly providerId: string;
  private readonly sourceType: CredentialSourceType;
  private readonly secrets: Map<string, string>;
  private readonly usernames: Map<string, string>;

  constructor(options: InMemorySecretProviderOptions = {}) {
    this.providerId = options.providerId ?? "in-memory";
    this.sourceType = options.sourceType ?? "static";
    this.secrets = new Map(Object.entries(options.secrets ?? {}));
    this.usernames = new Map(Object.entries(options.usernames ?? {}));
  }

  setSecret(credentialRef: string, value: string, username?: string): void {
    this.secrets.set(credentialRef, value);
    if (username) {
      this.usernames.set(credentialRef, username);
    }
  }

  async resolve(input: SecretLookupInput): Promise<SdkResult<SecretMaterial>> {
    const value = this.secrets.get(input.credentialRef);

    if (!value) {
      return sdkErr(
        secretProviderUnavailableError(
          { correlationId: input.correlationId, details: { credentialRef: input.credentialRef } },
          `Secret not found for credential reference`,
        ),
      );
    }

    return sdkOk({
      sourceType: this.sourceType,
      value,
      username: input.usernameRef
        ? this.usernames.get(input.usernameRef)
        : this.usernames.get(input.credentialRef),
    });
  }
}

/** Placeholder for future Vault-compatible providers — always unavailable. */
export class PlaceholderVaultSecretProvider implements SecretProvider {
  readonly providerId = "vault-placeholder";

  async resolve(input: SecretLookupInput): Promise<SdkResult<SecretMaterial>> {
    return sdkErr(
      secretProviderUnavailableError(
        { correlationId: input.correlationId },
        "Vault secret provider is not implemented (placeholder)",
      ),
    );
  }
}
