import {
  buildAdapterContext,
  type AdapterContext,
  type BuildAdapterContextInput,
} from "./adapter-context";
import { IntegrationAdapterBase } from "./adapter-base";
import {
  createInMemoryCapabilityRegistration,
  type CapabilityRegistration,
  validateAdapterManifest,
} from "./capability-registration";
import type { CapabilityRegistrationResult } from "./capability-registration";
import type { AdapterBootstrapConfiguration } from "./manifest-types";
import { MockAdapter } from "./mock-adapter";

export type AdapterConstructor<T extends IntegrationAdapterBase> = new (
  context: AdapterContext,
  configuration: AdapterBootstrapConfiguration,
) => T;

export interface AdapterFactoryOptions {
  readonly capabilityRegistration?: CapabilityRegistration;
}

export interface CreateAdapterOptions extends BuildAdapterContextInput {
  readonly autoInitialise?: boolean;
}

export interface AdapterFactoryCreateResult<T extends IntegrationAdapterBase> {
  readonly adapter: T;
  readonly context: AdapterContext;
  readonly registration: CapabilityRegistrationResult;
}

export class AdapterFactory {
  private readonly capabilityRegistration: CapabilityRegistration;

  constructor(options: AdapterFactoryOptions = {}) {
    this.capabilityRegistration =
      options.capabilityRegistration ?? createInMemoryCapabilityRegistration();
  }

  validateRegistration(
    manifest: AdapterBootstrapConfiguration["manifest"],
  ): CapabilityRegistrationResult {
    return validateAdapterManifest(manifest);
  }

  async create<T extends IntegrationAdapterBase>(
    AdapterType: AdapterConstructor<T>,
    options: CreateAdapterOptions,
  ): Promise<AdapterFactoryCreateResult<T>> {
    const registration = this.capabilityRegistration.register(
      options.configuration.manifest,
    );
    if (!registration.ok) {
      throw new Error(registration.message);
    }

    const context = buildAdapterContext(options);
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
    options: CreateAdapterOptions,
  ): Promise<AdapterFactoryCreateResult<MockAdapter>> {
    return this.create(MockAdapter, options);
  }

  async dispose(adapter: IntegrationAdapterBase): Promise<void> {
    await adapter.dispose("shutdown");
  }

  getCapabilityRegistration(): CapabilityRegistration {
    return this.capabilityRegistration;
  }
}

export function createAdapterFactory(options?: AdapterFactoryOptions): AdapterFactory {
  return new AdapterFactory(options);
}
