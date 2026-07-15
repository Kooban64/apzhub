import { buildSecretDiagnostics } from "./secrets";
import type { SecretDiagnostic } from "./types";

/**
 * Future secret manager abstraction.
 * Vault integration is deferred to PCv2-04 — environment variables remain authoritative.
 */
export interface SecretVaultProvider {
  readonly name: string;
  getSecret(key: string): Promise<string | undefined>;
  listConfiguredKeys(): Promise<readonly string[]>;
}

export interface EnvironmentSecretProvider {
  readonly name: "environment";
  getSecret(key: string): string | undefined;
  getSecretDiagnostics(): readonly SecretDiagnostic[];
}

export class ProcessEnvironmentSecretProvider implements EnvironmentSecretProvider {
  readonly name = "environment" as const;

  constructor(private readonly env: NodeJS.ProcessEnv = process.env) {}

  getSecret(key: string): string | undefined {
    return this.env[key];
  }

  getSecretDiagnostics(): readonly SecretDiagnostic[] {
    return buildSecretDiagnostics(this.env);
  }
}

export function createEnvironmentSecretProvider(
  env: NodeJS.ProcessEnv = process.env,
): EnvironmentSecretProvider {
  return new ProcessEnvironmentSecretProvider(env);
}
