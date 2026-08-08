import { QI_EVENT_TYPES, type QiEventPublisher } from "../contracts/events";
import { QualityIntelligenceEngine } from "../engine/quality-intelligence-engine";
import { createDummyAiProvider } from "../providers/dummy-ai-provider";
import { createHistoricalProvider } from "../providers/historical-provider";
import { createPlaceholderIntelligenceProviders } from "../providers/placeholders";
import { createRulesProvider } from "../providers/rules-provider";
import { createStatisticalProvider } from "../providers/statistical-provider";
import { IntelligenceProviderRegistry } from "../registry/provider-registry";
import type { IntelligenceStore } from "../store/intelligence-store";

export interface CreatePlatformQualityIntelligenceOptions {
  readonly publishEvent?: QiEventPublisher;
  readonly includePlaceholders?: boolean;
  /** Inject durable IntelligenceStore (QX-PR-03). Defaults to in-memory. */
  readonly store?: IntelligenceStore;
}

export interface PlatformQualityIntelligence {
  readonly engine: QualityIntelligenceEngine;
  readonly registry: IntelligenceProviderRegistry;
}

/**
 * Bootstrap the Enterprise Quality Intelligence Platform.
 * Registers rules, statistical, historical, dummy_ai (active) + placeholder providers.
 */
export function createPlatformQualityIntelligence(
  options: CreatePlatformQualityIntelligenceOptions = {},
): PlatformQualityIntelligence {
  const registry = new IntelligenceProviderRegistry();

  registry.register(createRulesProvider());
  registry.register(createStatisticalProvider());
  registry.register(createHistoricalProvider());
  registry.register(createDummyAiProvider());

  if (options.includePlaceholders !== false) {
    for (const placeholder of createPlaceholderIntelligenceProviders()) {
      registry.register(placeholder);
    }
  }

  const publishEvent: QiEventPublisher = async (event) => {
    await options.publishEvent?.(event);
  };

  for (const descriptor of registry.list()) {
    void publishEvent({
      type: QI_EVENT_TYPES.providerRegistered,
      occurredAt: new Date().toISOString(),
      tenantId: "platform",
      correlationId: "bootstrap",
      providerId: descriptor.providerId,
      payload: {
        status: descriptor.status,
        name: descriptor.name,
        kind: descriptor.kind,
      },
    });
  }

  const engine = new QualityIntelligenceEngine({
    registry,
    publishEvent,
    store: options.store,
  });

  return { engine, registry };
}
