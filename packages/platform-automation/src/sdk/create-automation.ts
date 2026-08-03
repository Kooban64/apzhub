import { AutomationEngine } from "../engine/automation-engine";
import type { AutomationEventPublisher } from "../contracts/events";
import type { AutomationEvidenceSink } from "../contracts/evidence";
import { createPlaceholderProviders } from "../providers/placeholders";
import { createPlaywrightProvider } from "../providers/playwright";
import { ProviderRegistry } from "../registry/provider-registry";
import { AUTOMATION_EVENT_TYPES } from "../contracts/events";

export interface CreatePlatformAutomationOptions {
  readonly publishEvent?: AutomationEventPublisher;
  readonly evidenceSink?: AutomationEvidenceSink;
  /** Default true in tests — force Playwright dry-run. */
  readonly playwrightDryRun?: boolean;
  readonly includePlaceholders?: boolean;
}

export interface PlatformAutomation {
  readonly engine: AutomationEngine;
  readonly registry: ProviderRegistry;
}

/**
 * Bootstrap the Enterprise Automation Foundation.
 * Registers Playwright (active) + placeholder providers for future waves.
 */
export function createPlatformAutomation(
  options: CreatePlatformAutomationOptions = {},
): PlatformAutomation {
  const registry = new ProviderRegistry();
  const playwright = createPlaywrightProvider({
    forceDryRun: options.playwrightDryRun ?? false,
  });
  registry.register(playwright);

  if (options.includePlaceholders !== false) {
    for (const placeholder of createPlaceholderProviders()) {
      registry.register(placeholder);
    }
  }

  const publishEvent: AutomationEventPublisher = async (event) => {
    await options.publishEvent?.(event);
  };

  // Emit provider registration events for Playwright + placeholders
  for (const descriptor of registry.list()) {
    void publishEvent({
      type: AUTOMATION_EVENT_TYPES.providerRegistered,
      occurredAt: new Date().toISOString(),
      executionId: "registry",
      tenantId: "platform",
      correlationId: "bootstrap",
      providerId: descriptor.providerId,
      state: "queued",
      payload: { status: descriptor.status, name: descriptor.name },
    });
  }

  const engine = new AutomationEngine({
    registry,
    publishEvent,
    evidenceSink: options.evidenceSink,
  });

  return { engine, registry };
}
