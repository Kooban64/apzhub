import {
  buildAdapterContext,
  createAdapterFactory,
  createInMemoryCapabilityRegistration,
  type AdapterFactory,
} from "@apzhub/integration-sdk/adapter";
import type { SecretProvider } from "@apzhub/integration-sdk/auth";
import { InMemorySecretProvider } from "@apzhub/integration-sdk/auth";

import { N8nAdapter, type N8nAdapterOptions } from "./n8n-adapter";
import {
  createN8nBootstrapConfiguration,
  type CreateN8nBootstrapInput,
  type N8nBootstrapConfiguration,
} from "./n8n-bootstrap";
import type { N8nConfigurationInput } from "./n8n-config";

export interface CreateN8nAdapterInput {
  readonly n8n: N8nConfigurationInput;
  readonly tenantId: string;
  readonly connectionId?: string;
  readonly secretProvider?: SecretProvider;
  /** Convenience: materialise API key into InMemorySecretProvider. */
  readonly apiKey?: string;
  readonly personalAccessToken?: string;
  readonly basicUsername?: string;
  readonly basicPassword?: string;
  readonly autoInitialise?: boolean;
  readonly adapterOptions?: N8nAdapterOptions;
  readonly clock?: { now(): string; nowMs(): number };
}

export interface CreateN8nAdapterResult {
  readonly adapter: N8nAdapter;
  readonly configuration: N8nBootstrapConfiguration;
  readonly factory: AdapterFactory;
}

export async function createN8nAdapter(
  input: CreateN8nAdapterInput,
): Promise<CreateN8nAdapterResult> {
  const bootstrapInput: CreateN8nBootstrapInput = {
    n8n: input.n8n,
    tenantId: input.tenantId,
    connectionId: input.connectionId,
  };

  const configuration = createN8nBootstrapConfiguration(bootstrapInput);

  let secretProvider = input.secretProvider;
  if (!secretProvider) {
    const secrets: Record<string, string> = {};
    const apiRef =
      configuration.n8n.apiKeyRef ?? configuration.n8n.personalAccessTokenRef;
    const token = input.apiKey ?? input.personalAccessToken;
    if (apiRef && token) {
      secrets[apiRef] = token;
    }
    if (
      configuration.n8n.basicUsernameRef &&
      input.basicUsername &&
      configuration.n8n.basicPasswordRef &&
      input.basicPassword
    ) {
      secrets[configuration.n8n.basicUsernameRef] = input.basicUsername;
      secrets[configuration.n8n.basicPasswordRef] = input.basicPassword;
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
  const adapter = new N8nAdapter(context, configuration, {
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

export async function disposeN8nAdapter(
  adapter: N8nAdapter,
  factory: AdapterFactory,
): Promise<void> {
  await factory.dispose(adapter);
}
