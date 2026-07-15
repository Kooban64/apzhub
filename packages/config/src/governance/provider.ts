import { platformEnvSchema, type PlatformEnv } from "./schema";
import {
  ensureEnvironmentValid,
  getConfigurationDiagnostics,
  validatePlatformEnvironment,
} from "./validation";

export class PlatformConfigurationProvider {
  private cached: PlatformEnv | null = null;

  constructor(
    private readonly env: NodeJS.ProcessEnv = process.env,
    private readonly overrides: Record<string, string | undefined> = {},
  ) {}

  resetCache(): void {
    this.cached = null;
  }

  getValues(): PlatformEnv {
    if (this.cached) return this.cached;
    const merged = { ...this.env, ...this.overrides };
    const parsed = platformEnvSchema.safeParse(merged);
    if (!parsed.success) {
      throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
    }
    this.cached = parsed.data;
    return this.cached;
  }

  validate() {
    return validatePlatformEnvironment({
      env: { ...this.env, ...this.overrides },
    });
  }

  getDiagnostics() {
    return getConfigurationDiagnostics({
      env: this.env,
      overrides: this.overrides,
    });
  }

  ensureValid(options?: { readonly abortProcess?: boolean }) {
    return ensureEnvironmentValid({
      env: { ...this.env, ...this.overrides },
      abortProcess: options?.abortProcess,
    });
  }
}

let sharedProvider: PlatformConfigurationProvider | undefined;

export function getSharedConfigurationProvider(): PlatformConfigurationProvider {
  if (!sharedProvider) {
    sharedProvider = new PlatformConfigurationProvider();
  }
  return sharedProvider;
}

export function resetSharedConfigurationProvider(): void {
  sharedProvider = undefined;
}
