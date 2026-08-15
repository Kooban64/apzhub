import {
  buildAdapterContext,
  createAdapterFactory,
  createInMemoryCapabilityRegistration,
  type AdapterFactory,
} from "@apzhub/integration-sdk/adapter";
import type { SecretProvider } from "@apzhub/integration-sdk/auth";
import { InMemorySecretProvider } from "@apzhub/integration-sdk/auth";

import { PaperlessAdapter, type PaperlessAdapterOptions } from "./paperless-adapter";
import {
  createPaperlessBootstrapConfiguration,
  type PaperlessBootstrapConfiguration,
} from "./paperless-bootstrap";
import type { PaperlessConfigurationInput } from "./paperless-config";

export interface CreatePaperlessAdapterInput {
  readonly paperless: PaperlessConfigurationInput;
  readonly tenantId: string;
  readonly connectionId?: string;
  readonly secretProvider?: SecretProvider;
  readonly apiToken?: string;
  readonly autoInitialise?: boolean;
  readonly adapterOptions?: PaperlessAdapterOptions;
  readonly clock?: { now(): string; nowMs(): number };
}

export interface CreatePaperlessAdapterResult {
  readonly adapter: PaperlessAdapter;
  readonly configuration: PaperlessBootstrapConfiguration;
  readonly factory: AdapterFactory;
}

export async function createPaperlessAdapter(
  input: CreatePaperlessAdapterInput,
): Promise<CreatePaperlessAdapterResult> {
  const configuration = createPaperlessBootstrapConfiguration({
    paperless: input.paperless,
    tenantId: input.tenantId,
    connectionId: input.connectionId,
  });
  let secretProvider = input.secretProvider;
  if (!secretProvider && input.apiToken) {
    secretProvider = new InMemorySecretProvider({
      secrets: { [configuration.paperless.apiTokenRef]: input.apiToken },
    });
  }
  const capabilityRegistration = createInMemoryCapabilityRegistration();
  const registration = capabilityRegistration.register(configuration.manifest);
  if (!registration.ok) throw new Error(registration.message);
  const factory = createAdapterFactory({ capabilityRegistration });
  const adapter = new PaperlessAdapter(
    buildAdapterContext({ configuration, secretProvider, clock: input.clock }),
    configuration,
    {
      ...input.adapterOptions,
      secretProvider: secretProvider ?? input.adapterOptions?.secretProvider,
    },
  );
  if (input.autoInitialise ?? true) {
    const result = await adapter.initialise();
    if (!result.ok) throw new Error(result.message);
  }
  return { adapter, configuration, factory };
}

export async function disposePaperlessAdapter(
  adapter: PaperlessAdapter,
  factory: AdapterFactory,
): Promise<void> {
  await factory.dispose(adapter);
}
