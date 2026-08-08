import { SCM_EVENT_TYPES, type ScmEventPublisher } from "../contracts/events";
import type { ScmProviderId } from "../contracts/repository";
import { ScmEngine } from "../engine/scm-engine";
import type { RepositoryStore } from "../engine/repository-store";
import { createGitHubProvider } from "../providers/github";
import { createPlaceholderScmProviders } from "../providers/placeholders";
import { ScmProviderRegistry } from "../registry/provider-registry";

export interface CreatePlatformScmOptions {
  readonly publishEvent?: ScmEventPublisher;
  /** Default true — GitHub provider operates offline without api.github.com. */
  readonly githubOffline?: boolean;
  readonly includePlaceholders?: boolean;
  readonly webhookSecrets?: Readonly<Partial<Record<ScmProviderId, string>>>;
  readonly store?: RepositoryStore;
}

export interface PlatformScm {
  readonly engine: ScmEngine;
  readonly registry: ScmProviderRegistry;
}

/**
 * Bootstrap the Enterprise Source Control Platform.
 * Registers GitHub (active) + placeholder providers for future waves.
 */
export function createPlatformScm(options: CreatePlatformScmOptions = {}): PlatformScm {
  const registry = new ScmProviderRegistry();
  const github = createGitHubProvider({
    forceOffline: options.githubOffline ?? true,
  });
  registry.register(github);

  if (options.includePlaceholders !== false) {
    for (const placeholder of createPlaceholderScmProviders()) {
      registry.register(placeholder);
    }
  }

  const publishEvent: ScmEventPublisher = async (event) => {
    await options.publishEvent?.(event);
  };

  for (const descriptor of registry.list()) {
    void publishEvent({
      type: SCM_EVENT_TYPES.providerRegistered,
      occurredAt: new Date().toISOString(),
      tenantId: "platform",
      correlationId: "bootstrap",
      providerId: descriptor.providerId,
      payload: { status: descriptor.status, name: descriptor.name },
    });
  }

  const engine = new ScmEngine({
    registry,
    publishEvent,
    webhookSecrets: options.webhookSecrets,
    store: options.store,
  });

  return { engine, registry };
}
