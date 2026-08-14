import { AutomationEngine } from "../engine/automation-engine";
import type { AutomationEventPublisher } from "../contracts/events";
import type { AutomationEvidenceSink } from "../contracts/evidence";
import type { ExecutionStore } from "../engine/execution-store";
import { createMatrixProviders } from "../providers/matrix-providers";
import { ProviderRegistry } from "../registry/provider-registry";
import { AUTOMATION_EVENT_TYPES } from "../contracts/events";

export interface CreatePlatformAutomationOptions {
  readonly publishEvent?: AutomationEventPublisher;
  readonly evidenceSink?: AutomationEvidenceSink;
  /** Default true in tests — force Playwright dry-run. */
  readonly playwrightDryRun?: boolean;
  /**
   * @deprecated F3 deepen — all matrix providers are active; flag ignored.
   */
  readonly includePlaceholders?: boolean;
  /** Production SoR — inject Postgres-backed store (QX-PR-01). */
  readonly store?: ExecutionStore;
}

export interface PlatformAutomation {
  readonly engine: AutomationEngine;
  readonly registry: ProviderRegistry;
}

/**
 * Bootstrap the Enterprise Automation Foundation.
 * F3 deepen: full provider evidence matrix — Playwright live + report ingest for
 * Vitest, a11y, security, code quality, performance, and automation families.
 */
export function createPlatformAutomation(
  options: CreatePlatformAutomationOptions = {},
): PlatformAutomation {
  const registry = new ProviderRegistry();
  for (const provider of createMatrixProviders({
    playwrightDryRun: options.playwrightDryRun ?? false,
  })) {
    registry.register(provider);
  }

  const publishEvent: AutomationEventPublisher = async (event) => {
    await options.publishEvent?.(event);
  };

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
    store: options.store,
  });

  return { engine, registry };
}
