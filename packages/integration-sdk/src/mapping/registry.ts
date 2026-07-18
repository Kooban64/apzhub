import {
  mappingDuplicateProviderError,
  mappingProviderNotFoundError,
  mappingValidationError,
} from "./errors";
import { createMappingMetrics, type DefaultMappingMetrics } from "./metrics";
import type {
  MappingDiagnostics,
  MappingProvider,
  MappingProviderDiagnostics,
  MappingRegistryRegisterOptions,
} from "./types";
import { validateMappingProvider } from "./validation";

export interface MappingRegistry {
  register(provider: MappingProvider, options?: MappingRegistryRegisterOptions): void;
  get(id: string): MappingProvider | undefined;
  require(id: string): MappingProvider;
  list(): readonly MappingProvider[];
  has(id: string): boolean;
  getDiagnostics(): MappingDiagnostics;
  getMetrics(): DefaultMappingMetrics;
  /** Capability discovery — providers that support the entity type. */
  findByEntityType(entityType: string): readonly MappingProvider[];
  clear(): void;
}

export interface MappingRegistryOptions {
  readonly metrics?: DefaultMappingMetrics;
  readonly clock?: () => string;
  readonly validateOnRegister?: boolean;
}

export class InMemoryMappingRegistry implements MappingRegistry {
  private readonly providers = new Map<string, MappingProvider>();
  private readonly metrics: DefaultMappingMetrics;
  private readonly clock: () => string;
  private readonly validateOnRegister: boolean;

  constructor(options: MappingRegistryOptions = {}) {
    this.metrics = options.metrics ?? createMappingMetrics();
    this.clock = options.clock ?? (() => new Date().toISOString());
    this.validateOnRegister = options.validateOnRegister ?? true;
  }

  register(
    provider: MappingProvider,
    options: MappingRegistryRegisterOptions = {},
  ): void {
    if (this.validateOnRegister) {
      const validation = validateMappingProvider(provider);
      if (!validation.valid) {
        throw mappingValidationError(
          {
            correlationId: "mapping-registry",
            details: { errors: validation.errors.join("; "), providerId: provider.id },
          },
          validation.errors[0] ?? "Invalid mapping provider",
        );
      }
    }

    if (this.providers.has(provider.id) && !options.force) {
      throw mappingDuplicateProviderError(
        { correlationId: "mapping-registry" },
        provider.id,
      );
    }

    this.providers.set(provider.id, provider);
  }

  get(id: string): MappingProvider | undefined {
    return this.providers.get(id);
  }

  require(id: string): MappingProvider {
    const provider = this.providers.get(id);
    if (!provider) {
      throw mappingProviderNotFoundError({ correlationId: "mapping-registry" }, id);
    }
    return provider;
  }

  list(): readonly MappingProvider[] {
    return [...this.providers.values()];
  }

  has(id: string): boolean {
    return this.providers.has(id);
  }

  findByEntityType(entityType: string): readonly MappingProvider[] {
    return this.list().filter((provider) =>
      provider.capabilities.entityTypes.includes(entityType),
    );
  }

  getMetrics(): DefaultMappingMetrics {
    return this.metrics;
  }

  getDiagnostics(): MappingDiagnostics {
    const providers = this.list();
    const providerDiagnostics: MappingProviderDiagnostics[] = providers.map(
      (provider) => {
        const definitions = provider.listDefinitions();
        return {
          id: provider.id,
          integrationSlug: provider.integrationSlug,
          entityTypes: [...provider.capabilities.entityTypes],
          profiles: [...provider.capabilities.profiles],
          directions: [...provider.capabilities.directions],
          definitionCount: definitions.length,
          capabilities: provider.capabilities,
        };
      },
    );

    const entityTypes = new Set<string>();
    let totalDefinitions = 0;
    for (const provider of providers) {
      totalDefinitions += provider.listDefinitions().length;
      for (const entityType of provider.capabilities.entityTypes) {
        entityTypes.add(entityType);
      }
    }

    const snapshot = this.metrics.getSnapshot();

    return {
      providerCount: providers.length,
      providers: providerDiagnostics,
      totalDefinitions,
      supportedEntityTypes: [...entityTypes].sort(),
      executionCount: snapshot.executionsTotal,
      failureCount: snapshot.failuresTotal,
      averageLatencyMs: snapshot.averageLatencyMs,
      capturedAt: this.clock(),
    };
  }

  clear(): void {
    this.providers.clear();
    this.metrics.reset();
  }
}

export function createMappingRegistry(
  options?: MappingRegistryOptions,
): InMemoryMappingRegistry {
  return new InMemoryMappingRegistry(options);
}
