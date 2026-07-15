import {
  buildAdapterContext,
  createAdapterFactory,
  createInMemoryCapabilityRegistration,
  type AdapterFactory,
} from "@apzhub/integration-sdk/adapter";
import type { SecretProvider } from "@apzhub/integration-sdk/auth";
import { InMemorySecretProvider } from "@apzhub/integration-sdk/auth";

import { ZammadAdapter, type ZammadAdapterOptions } from "./zammad-adapter";
import {
  createZammadBootstrapConfiguration,
  type CreateZammadBootstrapInput,
  type ZammadBootstrapConfiguration,
} from "./zammad-bootstrap";
import type { ZammadConfigurationInput } from "./zammad-config";

export interface CreateZammadAdapterInput {
  readonly zammad: ZammadConfigurationInput;
  readonly tenantId: string;
  readonly connectionId?: string;
  readonly secretProvider?: SecretProvider;
  readonly apiToken?: string;
  readonly autoInitialise?: boolean;
  readonly adapterOptions?: ZammadAdapterOptions;
  readonly clock?: { now(): string; nowMs(): number };
  readonly engineVersionMin?: string;
  readonly engineVersionMax?: string;
  readonly edition?: "community" | "enterprise" | "unknown";
}

export interface CreateZammadAdapterResult {
  readonly adapter: ZammadAdapter;
  readonly configuration: ZammadBootstrapConfiguration;
  readonly factory: AdapterFactory;
}

export async function createZammadAdapter(
  input: CreateZammadAdapterInput,
): Promise<CreateZammadAdapterResult> {
  const bootstrapInput: CreateZammadBootstrapInput = {
    zammad: input.zammad,
    tenantId: input.tenantId,
    connectionId: input.connectionId,
    engineVersionMin: input.engineVersionMin,
    engineVersionMax: input.engineVersionMax,
    edition: input.edition,
  };

  const configuration = createZammadBootstrapConfiguration(bootstrapInput);

  let secretProvider = input.secretProvider;
  if (!secretProvider && input.apiToken) {
    secretProvider = new InMemorySecretProvider({
      secrets: { [configuration.zammad.apiTokenRef]: input.apiToken },
    });
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
  const adapter = new ZammadAdapter(context, configuration, {
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

export async function disposeZammadAdapter(
  adapter: ZammadAdapter,
  factory: AdapterFactory,
): Promise<void> {
  await factory.dispose(adapter);
}
