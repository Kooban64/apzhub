import {
  buildAdapterContext,
  createAdapterFactory,
  createInMemoryCapabilityRegistration,
  type AdapterFactory,
} from "@apzhub/integration-sdk/adapter";
import type { SecretProvider } from "@apzhub/integration-sdk/auth";
import { InMemorySecretProvider } from "@apzhub/integration-sdk/auth";

import { KimaiAdapter, type KimaiAdapterOptions } from "./kimai-adapter";
import {
  createKimaiBootstrapConfiguration,
  type CreateKimaiBootstrapInput,
  type KimaiBootstrapConfiguration,
} from "./kimai-bootstrap";
import type { KimaiConfigurationInput } from "./kimai-config";

export interface CreateKimaiAdapterInput {
  readonly kimai: KimaiConfigurationInput;
  readonly tenantId: string;
  readonly connectionId?: string;
  readonly secretProvider?: SecretProvider;
  /** Convenience: materialise Bearer token into InMemorySecretProvider. */
  readonly apiToken?: string;
  readonly apiUser?: string;
  readonly apiPassword?: string;
  readonly autoInitialise?: boolean;
  readonly adapterOptions?: KimaiAdapterOptions;
  readonly clock?: { now(): string; nowMs(): number };
}

export interface CreateKimaiAdapterResult {
  readonly adapter: KimaiAdapter;
  readonly configuration: KimaiBootstrapConfiguration;
  readonly factory: AdapterFactory;
}

export async function createKimaiAdapter(
  input: CreateKimaiAdapterInput,
): Promise<CreateKimaiAdapterResult> {
  const bootstrapInput: CreateKimaiBootstrapInput = {
    kimai: input.kimai,
    tenantId: input.tenantId,
    connectionId: input.connectionId,
  };

  const configuration = createKimaiBootstrapConfiguration(bootstrapInput);

  let secretProvider = input.secretProvider;
  if (!secretProvider) {
    const secrets: Record<string, string> = {};
    if (configuration.kimai.apiTokenRef && input.apiToken) {
      secrets[configuration.kimai.apiTokenRef] = input.apiToken;
    }
    if (
      configuration.kimai.apiUserRef &&
      input.apiUser &&
      configuration.kimai.apiPasswordRef &&
      input.apiPassword
    ) {
      secrets[configuration.kimai.apiUserRef] = input.apiUser;
      secrets[configuration.kimai.apiPasswordRef] = input.apiPassword;
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
  const adapter = new KimaiAdapter(context, configuration, {
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

export async function disposeKimaiAdapter(
  adapter: KimaiAdapter,
  factory: AdapterFactory,
): Promise<void> {
  await factory.dispose(adapter);
}
