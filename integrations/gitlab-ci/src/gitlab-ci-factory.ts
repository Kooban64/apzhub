import {
  buildAdapterContext,
  createAdapterFactory,
  createInMemoryCapabilityRegistration,
  type AdapterFactory,
} from "@apzhub/integration-sdk/adapter";
import type { SecretProvider } from "@apzhub/integration-sdk/auth";
import { InMemorySecretProvider } from "@apzhub/integration-sdk/auth";

import { GitLabCiAdapter, type GitLabCiAdapterOptions } from "./gitlab-ci-adapter";
import {
  createGitLabCiBootstrapConfiguration,
  type CreateGitLabCiBootstrapInput,
  type GitLabCiBootstrapConfiguration,
} from "./gitlab-ci-bootstrap";
import type { GitLabCiConfigurationInput } from "./gitlab-ci-config";

export interface CreateGitLabCiAdapterInput {
  readonly gitlabCi: GitLabCiConfigurationInput;
  readonly tenantId: string;
  readonly connectionId?: string;
  readonly secretProvider?: SecretProvider;
  /** Convenience: materialise PAT into InMemorySecretProvider. */
  readonly personalAccessToken?: string;
  readonly autoInitialise?: boolean;
  readonly adapterOptions?: GitLabCiAdapterOptions;
  readonly clock?: { now(): string; nowMs(): number };
}

export interface CreateGitLabCiAdapterResult {
  readonly adapter: GitLabCiAdapter;
  readonly configuration: GitLabCiBootstrapConfiguration;
  readonly factory: AdapterFactory;
}

export async function createGitLabCiAdapter(
  input: CreateGitLabCiAdapterInput,
): Promise<CreateGitLabCiAdapterResult> {
  const bootstrapInput: CreateGitLabCiBootstrapInput = {
    gitlabCi: input.gitlabCi,
    tenantId: input.tenantId,
    connectionId: input.connectionId,
  };

  const configuration = createGitLabCiBootstrapConfiguration(bootstrapInput);

  let secretProvider = input.secretProvider;
  if (!secretProvider && input.personalAccessToken) {
    const ref = configuration.gitlabCi.personalAccessTokenRef;
    if (ref) {
      secretProvider = new InMemorySecretProvider({
        secrets: { [ref]: input.personalAccessToken },
      });
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
  const adapter = new GitLabCiAdapter(context, configuration, {
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

export async function disposeGitLabCiAdapter(
  adapter: GitLabCiAdapter,
  factory: AdapterFactory,
): Promise<void> {
  await factory.dispose(adapter);
}
