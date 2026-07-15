import {
  buildAdapterContext,
  createAdapterFactory,
  createInMemoryCapabilityRegistration,
  type AdapterFactory,
} from "@apzhub/integration-sdk/adapter";
import type { SecretProvider } from "@apzhub/integration-sdk/auth";
import { InMemorySecretProvider } from "@apzhub/integration-sdk/auth";

import {
  GitHubActionsAdapter,
  type GitHubActionsAdapterOptions,
} from "./github-actions-adapter";
import {
  createGitHubActionsBootstrapConfiguration,
  type CreateGitHubActionsBootstrapInput,
  type GitHubActionsBootstrapConfiguration,
} from "./github-actions-bootstrap";
import type { GitHubActionsConfigurationInput } from "./github-actions-config";

export interface CreateGitHubActionsAdapterInput {
  readonly githubActions: GitHubActionsConfigurationInput;
  readonly tenantId: string;
  readonly connectionId?: string;
  readonly secretProvider?: SecretProvider;
  /** Convenience: materialise PAT into InMemorySecretProvider. */
  readonly personalAccessToken?: string;
  readonly autoInitialise?: boolean;
  readonly adapterOptions?: GitHubActionsAdapterOptions;
  readonly clock?: { now(): string; nowMs(): number };
}

export interface CreateGitHubActionsAdapterResult {
  readonly adapter: GitHubActionsAdapter;
  readonly configuration: GitHubActionsBootstrapConfiguration;
  readonly factory: AdapterFactory;
}

export async function createGitHubActionsAdapter(
  input: CreateGitHubActionsAdapterInput,
): Promise<CreateGitHubActionsAdapterResult> {
  const bootstrapInput: CreateGitHubActionsBootstrapInput = {
    githubActions: input.githubActions,
    tenantId: input.tenantId,
    connectionId: input.connectionId,
  };

  const configuration = createGitHubActionsBootstrapConfiguration(bootstrapInput);

  let secretProvider = input.secretProvider;
  if (!secretProvider && input.personalAccessToken) {
    const ref = configuration.githubActions.personalAccessTokenRef;
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
  const adapter = new GitHubActionsAdapter(context, configuration, {
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

export async function disposeGitHubActionsAdapter(
  adapter: GitHubActionsAdapter,
  factory: AdapterFactory,
): Promise<void> {
  await factory.dispose(adapter);
}
