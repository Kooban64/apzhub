import {
  createSearchAdapterFactory,
  type SearchAdapterFactory,
} from "@apzhub/integration-search-sdk";
import type { SecretProvider } from "@apzhub/integration-sdk/auth";
import { InMemorySecretProvider } from "@apzhub/integration-sdk/auth";

import {
  MeilisearchAdapter,
  type MeilisearchAdapterOptions,
} from "./meilisearch-adapter";
import {
  createMeilisearchBootstrapConfiguration,
  type CreateMeilisearchBootstrapInput,
  type MeilisearchBootstrapConfiguration,
} from "./meilisearch-bootstrap";
import type { MeilisearchConfigurationInput } from "./meilisearch-config";
import type { FetchFn } from "./internal/meilisearch-fetch";
import { buildMeilisearchAdapterContext } from "./meilisearch-context";

export interface CreateMeilisearchAdapterInput {
  readonly meilisearch: MeilisearchConfigurationInput;
  readonly tenantId: string;
  readonly connectionId?: string;
  readonly secretProvider?: SecretProvider;
  /** Convenience: materialise API key into InMemorySecretProvider. */
  readonly apiKey?: string;
  readonly autoInitialise?: boolean;
  readonly adapterOptions?: MeilisearchAdapterOptions;
  readonly fetchFn?: FetchFn;
  readonly clock?: { now(): string; nowMs(): number };
}

export interface CreateMeilisearchAdapterResult {
  readonly adapter: MeilisearchAdapter;
  readonly configuration: MeilisearchBootstrapConfiguration;
  readonly factory: SearchAdapterFactory;
}

export class MeilisearchAdapterFactory {
  private readonly searchFactory: SearchAdapterFactory;

  constructor(searchFactory?: SearchAdapterFactory) {
    this.searchFactory = searchFactory ?? createSearchAdapterFactory();
  }

  async create(
    input: CreateMeilisearchAdapterInput,
  ): Promise<CreateMeilisearchAdapterResult> {
    return createMeilisearchAdapter(input, this.searchFactory);
  }

  async dispose(adapter: MeilisearchAdapter): Promise<void> {
    await this.searchFactory.dispose(adapter);
  }

  getSearchAdapterFactory(): SearchAdapterFactory {
    return this.searchFactory;
  }
}

export async function createMeilisearchAdapter(
  input: CreateMeilisearchAdapterInput,
  searchFactory: SearchAdapterFactory = createSearchAdapterFactory(),
): Promise<CreateMeilisearchAdapterResult> {
  const bootstrapInput: CreateMeilisearchBootstrapInput = {
    meilisearch: input.meilisearch,
    tenantId: input.tenantId,
    connectionId: input.connectionId,
  };

  const configuration = createMeilisearchBootstrapConfiguration(bootstrapInput);

  let secretProvider = input.secretProvider;
  if (!secretProvider && input.apiKey && configuration.meilisearch.apiKeyRef) {
    secretProvider = new InMemorySecretProvider({
      secrets: { [configuration.meilisearch.apiKeyRef]: input.apiKey },
    });
  }

  const registration = searchFactory.validateRegistration(
    configuration.manifest,
    configuration.declaredSearchCapabilities,
  );
  if (!registration.ok) {
    throw new Error(
      registration.message +
        (registration.issues?.length ? `: ${registration.issues.join("; ")}` : ""),
    );
  }

  const context = buildMeilisearchAdapterContext({
    configuration,
    secretProvider,
    clock: input.clock,
    declaredSearchCapabilities: configuration.declaredSearchCapabilities,
  });

  const adapter = new MeilisearchAdapter(context, configuration, {
    ...input.adapterOptions,
    fetchFn: input.fetchFn ?? input.adapterOptions?.fetchFn,
    secretProvider: secretProvider ?? input.adapterOptions?.secretProvider,
  });

  if (input.autoInitialise ?? true) {
    const initResult = await adapter.initialise();
    if (!initResult.ok) {
      throw new Error(initResult.message);
    }
  }

  return { adapter, configuration, factory: searchFactory };
}

export async function disposeMeilisearchAdapter(
  adapter: MeilisearchAdapter,
  factory: SearchAdapterFactory = createSearchAdapterFactory(),
): Promise<void> {
  await factory.dispose(adapter);
}

export function createMeilisearchAdapterFactory(
  searchFactory?: SearchAdapterFactory,
): MeilisearchAdapterFactory {
  return new MeilisearchAdapterFactory(searchFactory);
}
