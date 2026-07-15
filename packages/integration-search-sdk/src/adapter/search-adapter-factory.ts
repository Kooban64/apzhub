/**
 * Search adapter factory — composes integration-sdk factory patterns with search registration.
 */

import type { AdapterBootstrapConfiguration } from "@apzhub/integration-sdk";
import {
  SearchCapabilityRegistration,
  createSearchCapabilityRegistration,
  DEFAULT_DECLARED_SEARCH_CAPABILITIES,
  type SearchIntegrationCapabilityId,
  type SearchCapabilityRegistrationResult,
} from "../capabilities";
import { SearchIntegrationAdapterBase } from "./search-adapter-base";
import {
  buildSearchAdapterContext,
  type BuildSearchAdapterContextInput,
  type SearchAdapterContext,
} from "./search-adapter-context";
import { MockSearchIntegrationAdapter } from "../testing/mock-search-adapter";

export type SearchAdapterConstructor<T extends SearchIntegrationAdapterBase> = new (
  context: SearchAdapterContext,
  configuration: AdapterBootstrapConfiguration,
) => T;

export interface SearchAdapterFactoryOptions {
  readonly searchCapabilityRegistration?: SearchCapabilityRegistration;
}

export interface CreateSearchAdapterOptions extends BuildSearchAdapterContextInput {
  readonly autoInitialise?: boolean;
  readonly declaredSearchCapabilities?: readonly SearchIntegrationCapabilityId[];
}

export interface SearchAdapterFactoryCreateResult<T extends SearchIntegrationAdapterBase> {
  readonly adapter: T;
  readonly context: SearchAdapterContext;
  readonly registration: SearchCapabilityRegistrationResult;
}

export class SearchAdapterFactory {
  private readonly searchCapabilityRegistration: SearchCapabilityRegistration;

  constructor(options: SearchAdapterFactoryOptions = {}) {
    this.searchCapabilityRegistration =
      options.searchCapabilityRegistration ?? createSearchCapabilityRegistration();
  }

  validateRegistration(
    manifest: AdapterBootstrapConfiguration["manifest"],
    searchCapabilities: readonly SearchIntegrationCapabilityId[] = DEFAULT_DECLARED_SEARCH_CAPABILITIES,
  ): SearchCapabilityRegistrationResult {
    return createSearchCapabilityRegistration().register(manifest, searchCapabilities);
  }

  async create<T extends SearchIntegrationAdapterBase>(
    AdapterType: SearchAdapterConstructor<T>,
    options: CreateSearchAdapterOptions,
  ): Promise<SearchAdapterFactoryCreateResult<T>> {
    const declaredSearchCapabilities =
      options.declaredSearchCapabilities ?? DEFAULT_DECLARED_SEARCH_CAPABILITIES;

    const registration = this.searchCapabilityRegistration.register(
      options.configuration.manifest,
      declaredSearchCapabilities,
    );
    if (!registration.ok) {
      throw new Error(registration.message + (registration.issues?.length
        ? `: ${registration.issues.join("; ")}`
        : ""));
    }

    const context = buildSearchAdapterContext({
      ...options,
      declaredSearchCapabilities,
      searchCapabilityRegistration: this.searchCapabilityRegistration,
    });

    const adapter = new AdapterType(context, options.configuration);

    if (options.autoInitialise ?? true) {
      const initResult = await adapter.initialise();
      if (!initResult.ok) {
        throw new Error(initResult.message);
      }
    }

    return { adapter, context, registration };
  }

  createMockAdapter(
    options: CreateSearchAdapterOptions,
  ): Promise<SearchAdapterFactoryCreateResult<MockSearchIntegrationAdapter>> {
    return this.create(MockSearchIntegrationAdapter, options);
  }

  async dispose(adapter: SearchIntegrationAdapterBase): Promise<void> {
    await adapter.dispose("shutdown");
  }

  getSearchCapabilityRegistration(): SearchCapabilityRegistration {
    return this.searchCapabilityRegistration;
  }
}

export function createSearchAdapterFactory(
  options?: SearchAdapterFactoryOptions,
): SearchAdapterFactory {
  return new SearchAdapterFactory(options);
}
