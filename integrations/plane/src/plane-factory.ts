import {
  buildAdapterContext,
  createAdapterFactory,
  createInMemoryCapabilityRegistration,
  type AdapterFactory,
} from "@apzhub/integration-sdk/adapter";
import type { SecretProvider } from "@apzhub/integration-sdk/auth";
import { InMemorySecretProvider } from "@apzhub/integration-sdk/auth";

import { PlaneAdapter, type PlaneAdapterOptions } from "./plane-adapter";
import {
  createPlaneBootstrapConfiguration,
  type CreatePlaneBootstrapInput,
  type PlaneBootstrapConfiguration,
} from "./plane-bootstrap";
import type { PlaneConfigurationInput } from "./plane-config";

export interface CreatePlaneAdapterInput {
  readonly plane: PlaneConfigurationInput;
  readonly tenantId: string;
  readonly connectionId?: string;
  readonly secretProvider?: SecretProvider;
  readonly apiToken?: string;
  readonly autoInitialise?: boolean;
  readonly adapterOptions?: PlaneAdapterOptions;
  readonly clock?: { now(): string; nowMs(): number };
}

export interface CreatePlaneAdapterResult {
  readonly adapter: PlaneAdapter;
  readonly configuration: PlaneBootstrapConfiguration;
  readonly factory: AdapterFactory;
}

export async function createPlaneAdapter(
  input: CreatePlaneAdapterInput,
): Promise<CreatePlaneAdapterResult> {
  const bootstrapInput: CreatePlaneBootstrapInput = {
    plane: input.plane,
    tenantId: input.tenantId,
    connectionId: input.connectionId,
  };

  const configuration = createPlaneBootstrapConfiguration(bootstrapInput);

  let secretProvider = input.secretProvider;
  if (!secretProvider && input.apiToken) {
    secretProvider = new InMemorySecretProvider({
      secrets: { [configuration.plane.apiTokenRef]: input.apiToken },
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
  const adapter = new PlaneAdapter(context, configuration, {
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

export async function disposePlaneAdapter(
  adapter: PlaneAdapter,
  factory: AdapterFactory,
): Promise<void> {
  await factory.dispose(adapter);
}
