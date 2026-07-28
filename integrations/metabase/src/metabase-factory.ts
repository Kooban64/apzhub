import {
  buildAdapterContext,
  createAdapterFactory,
  createInMemoryCapabilityRegistration,
  type AdapterFactory,
} from "@apzhub/integration-sdk/adapter";
import type { SecretProvider } from "@apzhub/integration-sdk/auth";
import { InMemorySecretProvider } from "@apzhub/integration-sdk/auth";

import { MetabaseAdapter, type MetabaseAdapterOptions } from "./metabase-adapter";
import {
  createMetabaseBootstrapConfiguration,
  type CreateMetabaseBootstrapInput,
  type MetabaseBootstrapConfiguration,
} from "./metabase-bootstrap";
import type { MetabaseConfigurationInput } from "./metabase-config";

export interface CreateMetabaseAdapterInput {
  readonly metabase: MetabaseConfigurationInput;
  readonly tenantId: string;
  readonly connectionId?: string;
  readonly secretProvider?: SecretProvider;
  /** Convenience: materialise API key into InMemorySecretProvider. */
  readonly apiKey?: string;
  readonly username?: string;
  readonly password?: string;
  readonly autoInitialise?: boolean;
  readonly adapterOptions?: MetabaseAdapterOptions;
  readonly clock?: { now(): string; nowMs(): number };
}

export interface CreateMetabaseAdapterResult {
  readonly adapter: MetabaseAdapter;
  readonly configuration: MetabaseBootstrapConfiguration;
  readonly factory: AdapterFactory;
}

/** Provider registration entrypoint — Integration SDK factory + capability registry. */
export async function createMetabaseAdapter(
  input: CreateMetabaseAdapterInput,
): Promise<CreateMetabaseAdapterResult> {
  const bootstrapInput: CreateMetabaseBootstrapInput = {
    metabase: input.metabase,
    tenantId: input.tenantId,
    connectionId: input.connectionId,
  };

  const configuration = createMetabaseBootstrapConfiguration(bootstrapInput);

  let secretProvider = input.secretProvider;
  if (!secretProvider) {
    const secrets: Record<string, string> = {};
    if (configuration.metabase.apiKeyRef && input.apiKey) {
      secrets[configuration.metabase.apiKeyRef] = input.apiKey;
    }
    if (
      configuration.metabase.usernameRef &&
      input.username &&
      configuration.metabase.passwordRef &&
      input.password
    ) {
      secrets[configuration.metabase.usernameRef] = input.username;
      secrets[configuration.metabase.passwordRef] = input.password;
    }
    if (Object.keys(secrets).length > 0) {
      secretProvider = new InMemorySecretProvider({ secrets });
    }
  }

  const capabilityRegistration = createInMemoryCapabilityRegistration();
  const registration = capabilityRegistration.register(configuration.manifest);
  if (!registration.ok) {
    throw new Error(registration.message);
  }

  const context = buildAdapterContext({
    configuration,
    secretProvider,
    clock: input.clock,
  });

  const factory = createAdapterFactory({ capabilityRegistration });
  const adapter = new MetabaseAdapter(context, configuration, {
    ...input.adapterOptions,
    secretProvider: secretProvider ?? input.adapterOptions?.secretProvider,
  });

  if (input.autoInitialise ?? true) {
    const initResult = await adapter.initialise();
    if (!initResult.ok) {
      throw new Error(initResult.message);
    }
  }

  return { adapter, configuration, factory };
}

export async function disposeMetabaseAdapter(
  adapter: MetabaseAdapter,
  factory: AdapterFactory,
): Promise<void> {
  await factory.dispose(adapter);
}
